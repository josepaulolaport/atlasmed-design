# Feature Specifications Index

This document indexes all feature specification files for the Atlasmed CRM — current state, planned features, and architectural decisions.

Spec files live in [`docs/specs/`](../specs/). Each file follows the [spec-driven development](../../.agents/skills/spec-driven-development/SKILL.md) format: User Stories → Acceptance Criteria (EARS format) → Design (components, data models, error handling).

---

## How to Read This Index

1. **Start with `00-platform-foundation`** — understand what is already implemented before reading any other spec
2. **Then `32-mobile-architecture`** — if working on mobile, read this before any mobile spec
3. **Then Spec 10 (Market Segmentation)** — the second access-control axis all field features depend on
4. **Then the feature specs** in dependency order (see Recommended Implementation Sequence below)

> **Multi-tenancy note:** `00-multi-tenancy` is **deferred** — the system launches as single-tenant. It will be implemented before onboarding a second client. Until then, all queries operate without org boundary.

**Status legend:**
- ✅ Implemented — feature exists in codebase today
- ⚠️ Partial — some parts implemented, gaps documented
- ❌ Not started — fully planned, no implementation yet
- 📐 Principle — cross-cutting engineering guideline, no single feature

---

## Foundation & Architecture

| Spec | Title | Status | Notes |
|------|-------|--------|-------|
| [00-platform-foundation](../specs/00-platform-foundation.md) | Platform Foundation (Current System) | ✅ Largely implemented | Auth, users, clinics/doctors, registry, web shell |
| [32-mobile-architecture](../specs/32-mobile-architecture.md) | Mobile App Architecture | ❌ Not started | Flutter, Riverpod, GoRouter, Drift, offline-first |
| [31-notifications](../specs/31-notifications.md) | Notifications Infrastructure | ❌ Not started | FCM push, in-app inbox, badge |
| [10-market-segmentation](../specs/10-market-segmentation.md) | Market Segmentation & Visibility | ❌ Not started — **P1** | Second auth axis |
| [29-ai-data-layer](../specs/29-ai-data-layer.md) | AI-Ready Structured Data Layer | 📐 Active principle | Apply during all new development |
| [00-multi-tenancy](../specs/00-multi-tenancy.md) | Multi-Tenancy | ❌ Deferred | Implement before onboarding second organization |

---

## Original MVP Specs (from design prototype)

| Spec | Domain | Status | Key Screens |
|------|--------|--------|-------------|
| [01-authentication](../specs/01-authentication.md) | Authentication | ⚠️ Web ✅ · Mobile ❌ | Splash, Login, 2FA, Sessions |
| [02-app-shell-navigation](../specs/02-app-shell-navigation.md) | App Shell & Navigation | ⚠️ Web ✅ · Mobile ❌ | Drawer, Top Bar, Theme |
| [03-bi-dashboard](../specs/03-bi-dashboard.md) | BI / Performance Dashboard | ❌ Not started | Dashboard, drill-downs |
| [04-client-management](../specs/04-client-management.md) | Client Management (Explorar) | ⚠️ Basic CRUD ✅ · Visits/notes ❌ | Clinic/Doctor list + detail |
| [05-territory-map](../specs/05-territory-map.md) | Territory Map (Mapa) | ❌ Not started | Map, route, visit log, follow-ups |
| [06-orders](../specs/06-orders.md) | Orders (Pedidos) | ❌ Not started | Order list, checkout, tracking |
| [07-presentations](../specs/07-presentations.md) | Presentations (Apresentações) | ❌ Not started | Material library, PDF/PPTX viewer |
| [08-profile-settings](../specs/08-profile-settings.md) | Profile & Settings (Perfil) | ⚠️ Profile/2FA ✅ · Work hours/notifications ❌ | Profile, security, settings |
| [09-activity-log](../specs/09-activity-log.md) | Activity Log | ❌ Not started | Full log, filters, export |

---

## New Feature Specs

### Visit & Field Execution

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [11-visit-lifecycle-frequency](../specs/11-visit-lifecycle-frequency.md) | Visit Lifecycle & Frequency Targets | ❌ | Spec 10, F-101 |
| [15-agenda-planning](../specs/15-agenda-planning.md) | Agenda Planning | ❌ | Spec 11 |
| [14-pre-visit-intelligence](../specs/14-pre-visit-intelligence.md) | Pre-Visit Intelligence & Next Objective | ❌ | Specs 11, 12, 18, 30 |
| [20-absence-nonfield-activity](../specs/20-absence-nonfield-activity.md) | Absence & Non-Field Activity | ❌ | Specs 11, 15 |
| [28-visit-quality-score](../specs/28-visit-quality-score.md) | Visit Quality Score | ❌ | Specs 11, 12, 13 |
| [30-followup-actions](../specs/30-followup-actions.md) | Follow-Up Actions | ❌ | Spec 11 |

### Product & Presentation

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [12-product-promotion](../specs/12-product-promotion.md) | Product Promotion (Portfolio + Visits + Comments) | ❌ | Spec 11 |
| [13-presentation-observability](../specs/13-presentation-observability.md) | Presentation Observability | ❌ | Specs 07, 12 |

### Customer Data & Compliance

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [16-customer-segmentation-surveys](../specs/16-customer-segmentation-surveys.md) | Customer Segmentation Surveys | ❌ | Spec 10 |
| [17-cadastro-health](../specs/17-cadastro-health.md) | Cadastro Health | ❌ | Specs 04, 10, 21 |
| [18-consent-communication](../specs/18-consent-communication.md) | Consent & Communication Management (LGPD) | ❌ | Spec 04 |
| [27-customer-timeline](../specs/27-customer-timeline.md) | Customer Timeline | ❌ | Specs 11, 12, 18, 30 |

### Field Resources

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [19-sample-gift-management](../specs/19-sample-gift-management.md) | Sample & Gift Management | ❌ | Specs 11, 12 |

### Platform Infrastructure

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [21-requests-approvals](../specs/21-requests-approvals.md) | Requests & Approval Workflows | ⚠️ Registry suggestions ✅ · Full model ❌ | Spec 10 |
| [22-offline-sync](../specs/22-offline-sync.md) | Offline Sync | ❌ | Spec 32 (mobile arch), all mobile specs |

### Manager & Analytics

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [23-coverage-execution-dashboard](../specs/23-coverage-execution-dashboard.md) | Coverage & Execution Dashboard | ❌ | Specs 10, 11, 20 |
| [24-manager-coaching](../specs/24-manager-coaching.md) | Manager Coaching Dashboard | ❌ | Specs 11, 12, 13, 16, 23, 28 |
| [25-admin-marketing-analytics](../specs/25-admin-marketing-analytics.md) | Admin & Marketing Analytics | ❌ | Specs 12, 13, 16, 17, 18 |

### Campaigns

| Spec | Domain | Status | Depends on |
|------|--------|--------|-----------|
| [26-medical-campaigns](../specs/26-medical-campaigns.md) | Medical Promotion Campaigns | ❌ | Specs 10, 12, 18 |

---

## Recommended Implementation Sequence

```
Layer 0 (foundation — start here):
  00-platform-foundation (read first — largely done)
  32-mobile-architecture (Flutter app scaffold — concurrent with backend)
  31-notifications       (FCM + inbox — needed by many features)
  10-market-segmentation (access control axis 2)

Layer 1 (core CRM enrichment):
  F-101 Territory entity (see 00-platform-foundation appendix)
  04 Doctor detail page (API exists, web page missing)
  18-consent-communication   (LGPD — do early)
  17-cadastro-health
  21-requests-approvals (full model, extends registry suggestions)

Layer 2 (field execution core):
  11-visit-lifecycle-frequency
  30-followup-actions
  12-product-promotion
  15-agenda-planning

Layer 3 (field execution depth):
  07-presentations (PDF/PPTX upload + viewer)
  19-sample-gift-management
  20-absence-nonfield-activity
  16-customer-segmentation-surveys
  22-offline-sync (requires Spec 32 scaffold first)

Layer 4 (intelligence):
  13-presentation-observability
  14-pre-visit-intelligence
  28-visit-quality-score
  27-customer-timeline

Layer 5 (analytics & management):
  03-bi-dashboard
  09-activity-log
  05-territory-map
  06-orders
  23-coverage-execution-dashboard
  24-manager-coaching
  25-admin-marketing-analytics
  26-medical-campaigns

Deferred (when second client is onboarded):
  00-multi-tenancy
```
