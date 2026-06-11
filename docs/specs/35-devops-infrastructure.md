# Spec 35 — DevOps & Infrastructure

## Overview

This spec covers everything needed to take the Atlasmed monorepo from local development to production: containerisation, CI/CD pipelines, environment management, server provisioning, database operations, mobile app store deployment, monitoring, and backup. Three environments are maintained: **development** (preview branches), **staging** (pre-release validation), and **production** (live).

---

## 1. Environments

| Environment | Purpose | Trigger |
|------------|---------|---------|
| **Development / Preview** | Per-PR or per-branch ephemeral deployments | Push to any feature branch |
| **Staging** | Full pre-release validation, mirrors production | Merge to `develop` / `main` staging branch |
| **Production** | Live traffic | Manual promotion from staging (or tagged release) |

Each environment has its own:
- `.env` file (never committed — managed via secrets store)
- Database schema (separate Postgres instance or database within one instance)
- Redis instance
- Subdomain: `app.atlasmed.com.br` (prod), `staging.atlasmed.com.br`, `dev.atlasmed.com.br`

---

## 2. Containerisation

### 2.1 Dockerfiles

**`apps/api/Dockerfile`** (Bun + ElysiaJS)
```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bunx prisma generate
RUN bun run build   # produces /app/dist/index.js

FROM oven/bun:1-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma
EXPOSE 3000
CMD ["bun", "dist/index.js"]
```

**`apps/web/Dockerfile`** (Next.js)
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
```

### 2.2 Docker Compose Files

Three compose files, layered via `extends`:

**`docker-compose.yml`** — base service definitions (local dev, no TLS)
```yaml
services:
  api:
    build: ./apps/api
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [redis]

  web:
    build: ./apps/web
    ports: ["3001:3001"]
    env_file: .env

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

  worker:
    build: ./apps/api
    command: bun run worker
    env_file: .env
    depends_on: [redis, api]

volumes:
  redis_data:
```

**`docker-compose.staging.yml`** — overrides for staging (Nginx, external DB URL)

**`docker-compose.prod.yml`** — overrides for production (Nginx, resource limits, restart policies)

### 2.3 Nginx Reverse Proxy

Single Nginx container handles TLS termination (Let's Encrypt via Certbot) and routes:
- `api.atlasmed.com.br` → api:3000
- `app.atlasmed.com.br` → web:3001
- `/healthz` → health check passthrough

---

## 3. CI/CD Pipelines

> **Recommended platform:** GitHub Actions (co-located with the repository, no extra tooling).
> ⚠️ Open decision — see Section 10.

### 3.1 Monorepo Path Filtering

Workflows use `on.push.paths` to avoid rebuilding unchanged apps:

```
apps/api/**      → triggers api-ci.yml
apps/web/**      → triggers web-ci.yml
apps/mobile/**   → triggers mobile-ci.yml
packages/**      → triggers both api-ci.yml and web-ci.yml
```

### 3.2 API Pipeline (`api-ci.yml`)

```
on: push (paths: apps/api/**, packages/**)

jobs:
  lint-typecheck:
    - bun run lint
    - bun run typecheck

  test:
    - services: postgres:16, redis:7
    - bunx prisma migrate deploy
    - bun test

  build:
    - bun run build
    - docker build + push to registry

  deploy-staging:
    needs: [build]
    if: branch == 'develop'
    - SSH to staging VPS
    - docker compose -f docker-compose.staging.yml pull && up -d

  deploy-production:
    needs: [build]
    if: tag matches 'v*.*.*'
    - Requires manual approval (GitHub Environments protection rule)
    - SSH to prod VPS
    - docker compose -f docker-compose.prod.yml pull && up -d
    - bunx prisma migrate deploy (run once against prod DB)
```

### 3.3 Web Pipeline (`web-ci.yml`)

Same structure as API. Additional steps:
- `next build` with `NEXT_PUBLIC_*` env vars injected
- Bundle size check (fail if > threshold)

### 3.4 Mobile Pipeline (`mobile-ci.yml`)

See Section 7 for full mobile pipeline details.

### 3.5 Database Migration Pipeline

Migrations run as a separate job before the app container is swapped, using a short-lived migration container:
```
docker run --rm --env-file .env.prod api-image \
  bunx prisma migrate deploy
```
This guarantees schema is up to date before traffic hits the new container.

### 3.6 Preview Deployments (Dev Environment)

Each PR spins up a short-lived preview stack on the dev server:
- Unique subdomain: `pr-{number}.dev.atlasmed.com.br`
- Destroyed on PR merge/close via a `teardown.yml` workflow

---

## 4. Infrastructure Provisioning

> **Recommended providers:** Hetzner (VPS) · DigitalOcean (Managed DB) · AWS S3 (file storage).
> ⚠️ Open decision — see Section 10.

### 4.1 Servers

| Server | Spec | Purpose |
|--------|------|---------|
| `prod-1` | 4 vCPU / 8 GB RAM | Production (api + web + nginx + redis + worker) |
| `staging-1` | 2 vCPU / 4 GB RAM | Staging + Dev preview |

### 4.2 DNS

| Record | Target |
|--------|--------|
| `app.atlasmed.com.br` | prod-1 IP |
| `api.atlasmed.com.br` | prod-1 IP |
| `staging.atlasmed.com.br` | staging-1 IP |
| `*.dev.atlasmed.com.br` | staging-1 IP (wildcard for PR previews) |

### 4.3 SSL

Certbot + Let's Encrypt. Auto-renewal via cron. Wildcard cert for `*.dev.atlasmed.com.br` via DNS-01 challenge.

### 4.4 Firewall Rules

- Allow: 22 (SSH, restricted to CI IP + developer IPs), 80, 443
- Block: all other inbound ports
- Redis (6379) and Postgres (5432) never exposed externally

---

## 5. Database & Redis

### 5.1 PostgreSQL

**Recommended: Managed PostgreSQL** (Supabase, Neon, or provider-native managed DB). Benefits:
- Automated backups and point-in-time recovery
- No manual tuning or failover configuration
- Connection pooling (PgBouncer) included

If self-hosted: Postgres 16 on a dedicated volume, daily `pg_dump` to S3.

**Per-environment databases:**
```
atlasmed_production
atlasmed_staging
atlasmed_dev      (shared dev, per-PR prefixed schemas are ideal but optional for MVP)
```

### 5.2 Redis

Redis 7 running in Docker on each VPS (non-persistent for BullMQ, persistent for sessions). Two separate logical databases:
- `DB 0` — BullMQ job queues
- `DB 1` — Session storage

### 5.3 Migration Strategy

- All migrations via `prisma migrate deploy` (never `migrate dev` in CI/production)
- Migrations must be backward-compatible (additive only) to allow zero-downtime deploys
- A `prisma migrate status` check is added to the pipeline health gate

---

## 6. Secrets & Environment Management

### 6.1 Secret Categories

| Category | Examples | Storage |
|---------|---------|---------|
| Database | `DATABASE_URL`, `DIRECT_URL` | GitHub Environment Secrets |
| Auth | `JWT_SECRET`, `REFRESH_SECRET` | GitHub Environment Secrets |
| External services | `S3_ACCESS_KEY`, `FCM_SERVER_KEY`, `SMTP_PASSWORD` | GitHub Environment Secrets |
| Mobile signing | iOS certificates, Android keystore | GitHub Encrypted Secrets |
| Infrastructure | VPS SSH keys | GitHub Environment Secrets |

### 6.2 `.env` Convention

```
.env              # gitignored — local dev values
.env.example      # committed — all variable names, empty values, with comments
.env.staging      # never committed — injected by CI
.env.production   # never committed — injected by CI
```

### 6.3 Secret Rotation

- Rotate JWT secrets without downtime: both old and new secrets accepted for one token TTL cycle
- Database password rotation: update secret, redeploy, verify

---

## 7. Mobile App Deployment

### 7.1 Tooling

- **Fastlane** for build automation and store delivery
- **`fastlane match`** for iOS certificate and provisioning profile management (stored encrypted in a private Git repo)
- **`flutter build`** command invoked by Fastlane

### 7.2 iOS Pipeline

**Prerequisites:**
- Apple Developer Program membership
- App created in App Store Connect (Bundle ID: `com.atlasmed.app`)
- `match` certificates repo set up (private GitHub repo)

```
Pipeline triggers: push to develop (→ TestFlight internal) | tag v*.*.* (→ TestFlight external / App Store)

Steps:
1. Install Flutter (pinned version via flutter-action)
2. Install Ruby + Fastlane
3. fastlane match (fetch certificates from match repo)
4. flutter build ios --release --no-codesign
5. fastlane gym (Xcode build + archive + sign)
6. fastlane pilot (upload .ipa to TestFlight)
7. Notify Slack/email on success or failure
```

**App Store submission** (manual promotion from TestFlight after QA approval).

### 7.3 Android Pipeline

**Prerequisites:**
- Google Play Console account
- App created (Package: `com.atlasmed.app`)
- Keystore file generated and stored as GitHub Encrypted Secret
- Google Play API service account JSON stored as secret

```
Pipeline triggers: push to develop (→ internal track) | tag v*.*.* (→ alpha track)

Steps:
1. Install Flutter (pinned version)
2. Install Ruby + Fastlane
3. Decode keystore from base64 secret
4. flutter build appbundle --release (signed via key.properties)
5. fastlane supply (upload .aab to Google Play)
6. Notify on completion
```

### 7.4 Version Bumping

A `bump_version.yml` workflow automatically increments `pubspec.yaml` version and `build_number` on every deploy, tagged with the commit SHA for traceability.

### 7.5 Code Signing Strategy

| Asset | Storage |
|-------|---------|
| iOS distribution certificate | `fastlane match` encrypted repo |
| iOS provisioning profile | `fastlane match` encrypted repo |
| Android keystore `.jks` | GitHub Encrypted Secret (base64) |
| `key.properties` | Generated at build time from secrets |

---

## 8. Monitoring & Observability

| Concern | Tool | Notes |
|---------|------|-------|
| Uptime monitoring | BetterUptime / UptimeRobot | Ping `/healthz` every 60 s |
| Error tracking | Sentry | `@sentry/nextjs` + `@sentry/bun` |
| Log aggregation | Loki + Grafana (self-hosted) or Logtail | Docker log driver → log collector |
| APM | OpenTelemetry (future) | Health check + metrics endpoints already in codebase |
| Alerting | Sentry + uptime monitor → Slack / email | PagerDuty for production P0 incidents |

The existing `/healthz` endpoint (Spec 00) serves as the primary liveness probe. Readiness probe checks DB connectivity and Redis ping.

---

## 9. Backup & Disaster Recovery

### 9.1 Database Backups

- **Managed DB**: daily automated snapshots (7-day retention) + point-in-time recovery (48 h)
- **Self-hosted**: `pg_dump` cron job → gzip → upload to S3 bucket with 30-day lifecycle policy

### 9.2 Recovery Targets

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 2 hours |
| RPO (Recovery Point Objective) | < 24 hours |

### 9.3 Runbooks

Document and test the following scenarios before production go-live:
- Full DB restore from backup
- Roll back a bad deploy (previous Docker image tag)
- Secret rotation under traffic
- VPS replacement (re-provision from scratch using the provisioning script)

---

## 10. Open Decisions

| Decision | Recommendation | Notes |
|---------|---------------|-------|
| Cloud provider | Hetzner (VPS) + S3-compatible object storage | Low cost, GDPR-friendly EU data residency |
| Managed DB provider | Neon (serverless PG) or DigitalOcean Managed PG | Neon offers a generous free tier for staging |
| CI/CD platform | GitHub Actions | Already on GitHub; no extra cost for public/small teams |
| Container registry | GitHub Container Registry (ghcr.io) | Free with GitHub, co-located with CI |
| Log aggregation | Logtail (cloud, easy) vs. Loki/Grafana (self-hosted) | Logtail for MVP simplicity |

---

## 11. Acceptance Criteria

- `bun test` passes on every PR before merge.
- A push to `develop` automatically deploys to staging within 10 minutes.
- A production deploy requires a passing staging build + manual approval gate.
- iOS and Android builds produce signed artifacts uploadable to their respective stores.
- All secrets are stored in GitHub Encrypted Secrets — none in committed files.
- SSL certificates are valid and auto-renewing on all environments.
- `/healthz` returns `200` within 500 ms on all environments.
- DB backup runs nightly and a restore has been tested before production go-live.

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-201](https://linear.app/atlasmed/issue/ATLAS-201/) | PARENT | DevOps & Infrastructure — CI/CD, Deployment & Monitoring | Backlog |
| [ATLAS-202](https://linear.app/atlasmed/issue/ATLAS-202/) | DEVOPS | CI/CD — GitHub Actions pipelines for API and Web (lint, test, build, deploy) | Backlog |
| [ATLAS-203](https://linear.app/atlasmed/issue/ATLAS-203/) | DEVOPS | CI/CD — Flutter mobile pipeline (iOS + Android build triggers) | Backlog |
| [ATLAS-204](https://linear.app/atlasmed/issue/ATLAS-204/) | DEVOPS | Docker — Dockerfiles + Compose for dev, staging and production | Backlog |
| [ATLAS-205](https://linear.app/atlasmed/issue/ATLAS-205/) | DEVOPS | Infrastructure — VPS provisioning, Nginx reverse proxy & SSL | Backlog |
| [ATLAS-206](https://linear.app/atlasmed/issue/ATLAS-206/) | DEVOPS | Infrastructure — DNS, firewall rules & environment subdomains | Backlog |
| [ATLAS-207](https://linear.app/atlasmed/issue/ATLAS-207/) | DEVOPS | Database — managed PostgreSQL provisioning & migration automation | Backlog |
| [ATLAS-208](https://linear.app/atlasmed/issue/ATLAS-208/) | DEVOPS | Secrets & environment management — GitHub Secrets strategy & .env conventions | Backlog |
| [ATLAS-209](https://linear.app/atlasmed/issue/ATLAS-209/) | DEVOPS | Mobile — iOS code signing, Fastlane match & TestFlight delivery | Backlog |
| [ATLAS-210](https://linear.app/atlasmed/issue/ATLAS-210/) | DEVOPS | Mobile — Android keystore, Fastlane supply & Google Play delivery | Backlog |
| [ATLAS-211](https://linear.app/atlasmed/issue/ATLAS-211/) | DEVOPS | Monitoring — Sentry error tracking, uptime monitoring & alerting | Backlog |
| [ATLAS-212](https://linear.app/atlasmed/issue/ATLAS-212/) | DEVOPS | Backup & DR — database backup strategy & tested restore runbook | Backlog |
