# Spec: Platform Foundation (Current System)

**Domain:** Platform Foundation — Architecture Reference  
**Status:** Largely Implemented (see per-feature status below)  
**Last Updated:** 2026-06-10  
**Type:** Reference spec — describes the existing codebase state, not a planned feature  

---

## Overview

This spec captures the current implemented state of the Atlasmed platform. It is the authoritative reference for understanding what already exists before reading any other spec. All other specs assume this foundation and build upon it.

**Vision:** AI-powered healthcare relationship and intelligence platform for pharmaceutical/commercial teams — CRM, territory management, workflow automation, analytics, and a governed AI assistant.

**Current maturity:** Strong identity/access foundation + early healthcare CRM. Most of the product vision (tenancy, visits, workflows, AI, analytics, mobile field app) is **not yet implemented**.

---

## Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Monorepo tooling | Bun workspaces + Turbo |
| API server | Elysia (Bun runtime) — `apps/api` |
| Web app | Next.js 16, Tailwind 4, Radix UI — `apps/web` |
| Mobile app | Flutter app (Spec 32) — `apps/mobile` |
| Database | PostgreSQL (via Prisma ORM) |
| Cache / queues | Redis + BullMQ |
| Shared packages | `packages/access`, `packages/database`, `packages/config`, `packages/observability`, `packages/ui` (placeholder) |

### API

- All domain routes mounted at `/api/v1`
- OpenAPI/Swagger documentation at `/api/v1/docs`
- Unversioned health endpoints at `/health/*`
- Structured error handling, global CORS, security headers
- Environment validation via `packages/config`

### Authorization Model (Current)

The current authorization system has **two layers**:

1. **RBAC roles** — coarse-grained permissions per subject type  
2. **Instance-level grants** — stored per `(user, resource, resourceId, action)` for fine-grained overrides  

Both layers are evaluated via CASL and merged at request time.

**Roles:**

| Role | Capabilities |
|------|-------------|
| `ADMIN` | Full manage on all subjects; global scope |
| `MANAGER` | Read/update users, clinics, doctors (scoped); manage invites; review registry suggestions |
| `USER` | Read/update clinics & doctors in scope; no user management |

**CASL subjects (registered today):** `USER`, `CLINIC`, `DOCTOR`, `VISIT` (RBAC only, no domain), `TERRITORY` (RBAC only, no domain), `INVITATION`, `REGISTRY_INGESTION`, `REGISTRY_SUGGESTION`

**Scope resolution (F-008):**  
For non-admin users, all clinic and doctor queries are filtered by a `ScopeContext`:
- `ADMIN` → global (all records)
- `USER` → clinics in their assigned territory IDs
- `MANAGER` → clinics in territories of all direct reports

The `ScopeContext` is computed from `UserTerritoryAssignment` records and cached in Redis. There is **no Territory entity** — territory IDs are strings stored in assignments and on clinics.

> **Territory entity (F-101):** The full Territory entity requirements are defined in the [appendix of this spec](#territory-entity-requirements). References to "Spec 0003" in older documents refer to the territory ADR — this is F-101 in the current numbering, *not* the BI Dashboard (Spec 03).

> **Note:** Market segmentation (Spec 10) extends this authorization model with a second axis. It is not yet implemented. See the dependency note in Spec 10.

---

## Implemented Features

### F-001: Platform Foundation

Health and operational endpoints:
- `GET /health/live` — liveness
- `GET /health/ready` — readiness (DB + Redis)
- `GET /health` — detailed health (admin-only)
- `GET /health/metrics` — Prometheus (when enabled)

Infrastructure:
- Docker Compose (PostgreSQL, Redis, observability stack)
- CI pipelines for API, web, mobile

---

### F-002 / F-003 / F-004 / F-006: Authentication & Session Management

**Implemented APIs (`/api/v1/access`):**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Login with email/username/phone + password |
| POST | `/login/2fa/verify` | Complete TOTP 2FA login |
| POST | `/refresh` | Rotate JWT via HttpOnly cookie |
| POST | `/logout` | Revoke current session |
| GET | `/sessions` | List device sessions |
| DELETE | `/sessions/:id` | Revoke session |
| POST | `/sessions/revoke-others` | Revoke all other sessions |
| POST | `/register` | Accept invite + create account |
| GET | `/invite/:token` | Validate invite token |
| POST | `/password-reset/request` | Request password reset email |
| POST | `/password-reset/confirm` | Reset with token |
| PATCH | `/password` | Authenticated password change |
| POST | `/2fa/setup` | Generate TOTP secret + QR |
| POST | `/2fa/confirm` | Confirm TOTP setup |
| POST | `/2fa/disable` | Disable 2FA |

**Security model:**
- JWT access token (short-lived) + HttpOnly refresh cookie
- Refresh token rotation with **reuse detection** (invalidates session chain)
- Argon2 password hashing + password history
- Rate limiting on login + failed-attempt lockout
- Token version invalidation on password change
- Optional TOTP 2FA at login

**Session model:** Tracks device type, browser, OS, IP, geo hints, fingerprint. Flags suspicious activity.

**Web UI:** `/login`, `/login/2fa`, `/sessions`, `/forgot-password`, `/reset-password`, `/profile`, `/security/*`

**Gaps:**
- SSO/OIDC (Google, Entra, Okta) — planned as F-109
- 2FA recovery codes
- Mobile/API token flows for Flutter (flutter_secure_storage + dio)

---

### F-003: Invitation-Based Registration

Registration is invitation-only (no open signup). Flow:
1. Admin/Manager sends invite with role assignment
2. Invitee validates token → registers → PENDING → ACTIVE

**Invitation states:** `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`

**APIs:** `POST /invite`, `GET /invites`, `DELETE /invites/:id`, `POST /invites/:id/resend`

**Notifications:** Resend email + Twilio WhatsApp/SMS (graceful degradation without credentials)

**Web UI:** `/users/invite`, `/users/invites`, `/register`

---

### F-005: Profile & Identity Verification

**Model fields:** email, username, phone, first/last name, avatar, status (`ACTIVE | INACTIVE | SUSPENDED | PENDING`), 2FA flags, managerId, metadata

**APIs:** `GET/PATCH /profile`, email/phone verification and change flows

---

### F-007: RBAC & Instance Permissions

**APIs:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/roles` | List roles |
| GET | `/capabilities` | Current user's computed capabilities |
| GET | `/users/:id/capabilities` | Target user's grants |
| POST | `/users/:id/permissions` | Grant instance permission |
| DELETE | `/users/:id/permissions` | Revoke instance permission |

**Instance grants:** stored as `(resource, resourceId, action, conditions?, expiresAt?)` in the `permissions` table

---

### F-008: Scope Resolution (Territory-Based)

**APIs:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/:id/assignments` | Manager + territory assignments |
| PATCH | `/users/:id/manager` | Assign/remove manager |
| POST | `/users/:id/territories` | Assign territory |
| DELETE | `/users/:id/territories/:territoryId` | Revoke territory |

**Current limitation:** `territoryId` is a plain string. There is no `Territory` table — this is the gap addressed by F-101 (Spec 0003).

---

### F-009: User Management

**APIs:** `GET /users`, `POST /users/:id/activate|deactivate|suspend|unsuspend`, `PATCH /users/:id/role`

**Web UI:** `/users` with invite, role, permission, assignment dialogs

---

### F-010: Audit Logging & Compliance

Full `AuditLog` model with eventType, severity, actor, resource, IP, sessionId, outcome.

**Implemented event types:** User auth/lifecycle, sessions, permissions, 2FA, registry ingestion, doctor-clinic actions, data access/export.

**Background jobs (BullMQ):**

| Job | Schedule |
|-----|----------|
| cleanup-expired-sessions | Every 6h |
| cleanup-expired-invites | Every 12h |
| cleanup-expired-password-resets | Every 12h |
| cleanup-expired-verification-tokens | Every 6h |
| cleanup-expired-permissions | Daily 3am |
| cleanup-old-audit-logs | Daily 2am |
| export-audit-logs-siem | Every 15min (optional) |

---

### F-011: Notifications Infrastructure (Partial)

- BullMQ notification queue foundation
- Resend email client + React Email templates (invite, password reset)
- Twilio SMS/WhatsApp client

**Not yet implemented:** in-app notifications, push, task alerts, notification preferences/history

---

### F-013 / F-014 / F-015: Healthcare CRM (Clinics, Doctors, Associations)

**Clinic API (`/api/v1/clinics`):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clinics` | List (paginated, search, scope-filtered) |
| POST | `/clinics` | Create clinic |
| GET | `/clinics/:id` | Get detail |
| PATCH | `/clinics/:id` | Update |
| DELETE | `/clinics/:id` | Soft delete |
| GET | `/clinics/:id/doctors` | List associated doctors |
| POST | `/clinics/:id/doctors/:doctorId/confirm` | Confirm registry association |
| POST | `/clinics/:id/doctors/:doctorId/associate` | Manual association |
| DELETE | `/clinics/:id/doctors/:doctorId` | End association |

**Doctor API (`/api/v1/doctors`):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/doctors` | List (search, filter by clinicId) |
| POST | `/doctors` | Create |
| GET | `/doctors/:id` | Get detail |
| PATCH | `/doctors/:id` | Update + clinic reassignment |
| DELETE | `/doctors/:id` | Soft delete |

**Data models:** `Clinic` (name, address, territoryId, registry provenance fields, deletedAt), `Doctor` (firstName, lastName, specialty, registry provenance fields), `DoctorClinicAssociation` (dual-track: sourceActive + confirmedAt/endedAt)

**Doctor-Clinic dual-track model:** Separates registry-sourced associations from user-confirmed CRM relationships. Confirms can be done independently of source state.

**Web UI:** `/clinics` (list), `/clinics/[id]` (detail with doctors), `/doctors` (list — **no doctor detail page yet**)

**Gaps:**
- No doctor detail page in web (API exists)
- No visits, notes, follow-ups on clinic/doctor detail
- No market segment assignment on entities
- No org scoping (single tenant today)

---

### F-016 / F-017: Registry Ingestion & Suggestions

**Purpose:** Sync external healthcare registry snapshots non-destructively. Destructive changes (clinic removals, association endings) produce reviewable suggestions rather than auto-deleting.

**Ingestion API:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/registry-ingestion/run` | Run full ingestion |
| POST | `/registry-ingestion/demo` | Reset mock + replay fixtures |
| GET | `/registry-ingestion/runs` | List runs |

**Suggestion types:** `CLINIC_REMOVAL`, `CLINIC_REACTIVATION`, `DOCTOR_CLINIC_REMOVAL`

**Suggestion review API:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/registry-suggestions` | List (scope-filtered) |
| POST | `/registry-suggestions/:id/approve` | Approve |
| POST | `/registry-suggestions/:id/reject` | Reject |

**Current source:** MockRegistrySourceAdapter (JSON fixtures) — no real registry adapter yet. Real-world adapters for CNES, AMB, and CFM are defined in [Spec 33 — Data Ingestion](./33-data-ingestion.md).

> **Relationship to Spec 21 (Requests & Approvals):** The registry suggestions workflow is the **existing implementation** of the broader approval concept. When Spec 21 is built, the registry suggestions workflow will become one of its `requestType` instances (type: `data_correction` or `CLINIC_REMOVAL`). The existing `IngestionSuggestion` table and review API should be unified with the Spec 21 approval engine over time.

---

### F-018: Web Application Shell

**Stack:** Next.js 16, Tailwind 4, Radix UI, React Hook Form, Zod, Axios

**Implemented navigation (role-gated):**

| Route | Who |
|-------|-----|
| `/dashboard` | All authenticated |
| `/profile`, `/security/*` | All authenticated |
| `/sessions` | All authenticated |
| `/users` | ADMIN, MANAGER |
| `/clinics`, `/clinics/[id]` | All with read CLINIC |
| `/doctors` | All with read DOCTOR |
| `/registry-suggestions` | MANAGER+ |
| `/registry-ingestion` | ADMIN |
| `/health` | ADMIN |

**Auth flow:** Protected routes with auth context bootstrap, silent refresh on load, redirect on auth failure.

**Shared UI components:** Button, Input, Select, Dialog, Table, Dropdown, Avatar, Badge, Card, Toast

**Gaps:**
- No org switcher (needed for multi-tenancy)
- No mobile-responsive nav (hamburger placeholder)
- No analytics content
- No visit, task, notification, or campaign screens

---

### F-019: Mobile Application

**Status:** Flutter stub only. CI configured. No production features.

**Architecture decision: Flutter.** The app is built with Flutter/Dart. See Spec 32 (Mobile Architecture) for stack decisions. The Flutter stub (F-019) is the starting point.

All specs in `docs/specs/01–32` that reference mobile screens describe the **Flutter mobile app** (Spec 32) building on the existing `apps/api` endpoints.

---

## Implemented Data Models

```
User, Role, Session, Invitation, PasswordReset, VerificationToken,
Permission, AuditLog, UserTerritoryAssignment,
Clinic, Doctor, DoctorClinicAssociation,
IngestionRun, IngestionSuggestion
```

---

## Missing Data Models (Planned)

```
Organization, OrganizationMembership,           ← Spec 00-multi-tenancy
Territory,                                       ← Spec 0003
MarketSegment, UserSegmentAssignment,            ← Spec 10
Visit,                                           ← Spec 11
Product, ProductPromotion, StructuredComment,    ← Spec 12
PresentationMaterial, PresentationSession,       ← Spec 07, Spec 13
PresentationEvent,                              ← Spec 13
FrequencyTarget, AgendaItem,                    ← Spec 11, Spec 15
SurveyVersion, SurveyResult,                    ← Spec 16
CadastroHealth,                                 ← Spec 17
ConsentRecord, CommunicationPreferences,        ← Spec 18
SampleItem, RepresentativeInventory,            ← Spec 19
AbsenceRecord,                                  ← Spec 20
ApprovalRequest,                                ← Spec 21
Campaign,                                       ← Spec 26
TimelineEvent,                                  ← Spec 27
FollowUpAction,                                 ← Spec 30
Notification, DeviceRegistration,               ← Spec 31 / F-105
AIConversation, AIToolCall                      ← F-107
```

---

## Current Permission Matrix

| Action | ADMIN | MANAGER | USER |
|--------|-------|---------|------|
| Manage users | ✅ | Scoped read/create/update | ❌ |
| Manage invitations | ✅ | ✅ | ❌ |
| Create clinics/doctors | ✅ | ❌ | ❌ |
| Read/update clinics/doctors | ✅ | ✅ (scoped) | ✅ (scoped) |
| Delete clinics/doctors | ✅ | ❌ | ❌ |
| Run registry ingestion | ✅ | ❌ | ❌ |
| Review registry suggestions | ✅ | ✅ (scoped) | ❌ |
| View health dashboard | ✅ | ❌ | ❌ |
| Manage territories (entity) | ✅ | Read only | ❌ |

---

## Planned Features (Not Yet Implemented)

| Ref | Feature | Priority | Spec |
|-----|---------|----------|------|
| F-100 / Spec 0001 | Multi-tenancy | **Deferred — implement before second client onboards** | [00-multi-tenancy.md](./00-multi-tenancy.md) |
| F-101 | Territory entity & full management (see ADR 0003) | P1 — independent of F-100 for MVP | [Appendix in this spec](#territory-entity-requirements) |
| F-102 | Healthcare CRM completion (doctor detail, notes, visits) | P1 | Specs 04, 11 |
| F-103 | Visits & field activities | P2 | Spec 11 |
| F-104 | Tasks & workflow automation | P2 | Specs 21, 30 |
| F-105 | Notifications platform (FCM push + in-app inbox + badge) | P2 | Spec 31 |
| F-106 | Analytics & reporting | P2 | Specs 03, 23–25 |
| F-107 | AI assistant | P3 | — |
| F-108 | External portal roles | P3 | — |
| F-109 | SSO / enterprise auth | P2 | — |
| F-010 (mobile) | Mobile field app (Flutter) | P2 — after visits API | Specs 01–09, 11–22, 30 |

---

## Territory Entity Requirements {#territory-entity-requirements}

The current system stores `territoryId` as a bare string on `Clinic` and in `UserTerritoryAssignment`. The full territory entity (F-101) needs:

- `Territory` model: `id`, `name`, `organizationId` (after multi-tenancy), `parentId?` (hierarchical), `boundaries?` (GeoJSON), `isActive`, `createdAt`
- Territory CRUD API under `/api/v1/territories`
- Link `Clinic.territoryId` as a proper FK to `Territory.id`
- Territory-based filtering migrated from string comparison to relational join
- Scope cache invalidation on territory hierarchy changes
- Permissions: ADMIN can create/manage; MANAGER can read; USER can read their assigned

---

## Key Architectural Decisions

1. **Modular monolith** — domain modules in `apps/api/src/modules/*` (ADR 0001)
2. **Repository pattern** — ORM isolated behind module repositories
3. **Shared contracts in `packages/access`** — schemas, permissions, scope, errors
4. **Dual-track registry model** — source truth vs CRM-confirmed state (never auto-delete)
5. **Scope-based access** — territory IDs → clinic IDs (not org-scoped yet)
6. **Suggestion-gated destructive changes** — registry never auto-deletes CRM data
7. **Refresh token rotation with reuse detection** — invalidates full session chain on theft
8. **CASL for authorization** — role abilities + instance grants merged at request time

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-137](https://linear.app/atlasmed/issue/ATLAS-137/) | Parent | Platform Foundation — Core Implementation (F-001 to F-018) | Done |
| [ATLAS-138](https://linear.app/atlasmed/issue/ATLAS-138/) | [BE] | Authentication API — login, JWT sessions, refresh rotation, logout | Done |
| [ATLAS-139](https://linear.app/atlasmed/issue/ATLAS-139/) | [BE] | Two-factor authentication — TOTP setup, verify, disable | Done |
| [ATLAS-140](https://linear.app/atlasmed/issue/ATLAS-140/) | [BE] | User management — invite, list, roles, RBAC permissions, territory scope | Done |
| [ATLAS-141](https://linear.app/atlasmed/issue/ATLAS-141/) | [BE] | Security infrastructure — rate limiting, session security, audit log, SIEM | Done |
| [ATLAS-142](https://linear.app/atlasmed/issue/ATLAS-142/) | [BE] | Infrastructure services — Redis, BullMQ, email, SMS, metrics, health | Done |
| [ATLAS-143](https://linear.app/atlasmed/issue/ATLAS-143/) | [BE] | Clinic CRUD API — list, get, create, update, soft delete, territory scope | Done |
| [ATLAS-144](https://linear.app/atlasmed/issue/ATLAS-144/) | [BE] | Doctor CRUD API — list, get, create, update, soft delete | Done |
| [ATLAS-145](https://linear.app/atlasmed/issue/ATLAS-145/) | [BE] | Registry ingestion framework — run pipeline, mock adapter, suggestions workflow | Done |
| [ATLAS-146](https://linear.app/atlasmed/issue/ATLAS-146/) | [WE] | Web app shell — Next.js 16, protected routes, auth context, role-gated nav | Done |
| [ATLAS-147](https://linear.app/atlasmed/issue/ATLAS-147/) | [WE] | Web auth UI — login, 2FA, register, forgot/reset password, verification | Done |
| [ATLAS-148](https://linear.app/atlasmed/issue/ATLAS-148/) | [WE] | Web user admin — users, invites, sessions, security, profile | Done |
| [ATLAS-149](https://linear.app/atlasmed/issue/ATLAS-149/) | [WE] | Web clinic & doctor UI — clinics list+detail, doctors list, registry suggestions | Done |
