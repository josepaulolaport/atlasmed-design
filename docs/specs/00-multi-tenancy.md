# Spec: Multi-Tenancy (Spec 0001)

**Domain:** Multi-Tenancy — Organization Boundaries  
**Status:** Deferred — implement before onboarding second organization  
**Priority:** Not blocking MVP — single-tenant launch first  
**Last Updated:** 2026-06-10  
**Related:** [Spec 00 — Platform Foundation](./00-platform-foundation.md), [Spec 10 — Market Segmentation](./10-market-segmentation.md)

---

## Overview

Atlasmed will serve multiple independent pharmaceutical/commercial organizations as isolated tenants. Today the system is effectively single-tenant: all data is globally accessible to any authenticated user (within RBAC scope). Multi-tenancy adds an **organization boundary** as the outermost authorization layer — before role, before territory, and before market segment checks.

Every piece of data in the system (users, clinics, doctors, visits, products, presentations, campaigns, audit logs) belongs to exactly one organization. Cross-organization data access is impossible by design.

> **Deferred for MVP:** Atlasmed launches as a single-tenant product. This spec is implemented when the second client is onboarded. Until then, the system operates as a single-org platform — all data implicitly belongs to one default organization.
>
> **Migration note:** To minimize future migration pain, new Prisma models added during MVP development SHOULD include an `organizationId String?` nullable column from the start. This column is ignored by all queries until multi-tenancy ships, at which point it is backfilled and made required. This is optional but strongly recommended for the most-accessed models (`Visit`, `Clinic`, `Doctor`, `User`, `FrequencyTarget`, `FollowUpAction`).

---

## User Stories

**US-MT-01 — Organization Isolation**  
As an admin, I want my organization's data to be completely isolated from other organizations, so that there is no risk of data leakage between tenants.

**US-MT-02 — Organization Setup**  
As a super-admin or onboarding operator, I want to create a new organization and seed it with an initial admin user, so that onboarding a new tenant is a self-contained operation.

**US-MT-03 — Multi-Org User**  
As a user who belongs to multiple organizations (e.g. a consultant), I want to switch between organizations within the same session, so that I do not need separate accounts.

**US-MT-04 — Org-Scoped Invitations**  
As an admin, I want invitations to be tied to my organization, so that users I invite automatically land in my org without any extra configuration.

**US-MT-05 — Org Context in Auth**  
As an authenticated user, I want every API call to carry my active organization context, so that all data filters are automatically applied.

**US-MT-06 — Org Management**  
As a super-admin, I want to activate, deactivate, and manage organizations, so that I can control which tenants are live on the platform.

---

## Requirements & Acceptance Criteria

### Organization Entity

**AC-MT-01**  
WHEN an organization is created THEN the system SHALL require: `name` (unique), `slug` (unique, URL-safe), `status` (`active | inactive | suspended`), `tier` (future billing), and the initial admin user reference.

**AC-MT-02**  
WHEN an organization is deactivated THEN all its users SHALL be blocked from accessing any resources until the organization is reactivated. Existing data SHALL be preserved.

---

### Organization Membership

**AC-MT-03**  
WHEN a user is invited THEN the invitation SHALL be scoped to a specific organization. Accepting the invitation creates an `OrganizationMembership` with `role` and `status`.

**AC-MT-04**  
WHEN a user belongs to multiple organizations THEN they SHALL have independent roles and statuses per organization.

**AC-MT-05**  
WHEN a user is removed from an organization THEN their membership SHALL be marked `inactive` (soft remove). Their account remains. They retain access to other organizations they belong to.

---

### Active Organization in Session

**AC-MT-06**  
WHEN a user with a single organization logs in THEN their `activeOrgId` SHALL be automatically set to that organization's ID.

**AC-MT-07**  
WHEN a user belongs to multiple organizations THEN they SHALL be prompted to select an active organization after login (or the system SHALL remember their last selected org).

**AC-MT-08**  
WHEN a user switches organizations THEN the session's `activeOrgId` SHALL be updated and all subsequent requests SHALL be scoped to the new organization.

**AC-MT-09**  
WHEN the session carries `activeOrgId` THEN every protected endpoint SHALL inject the org ID as an implicit filter on all queries without requiring callers to pass it explicitly.

---

### Data Scoping

**AC-MT-10**  
Every table that contains organization-scoped data SHALL have an `organizationId` column (non-nullable) indexed for query performance.

**AC-MT-11**  
WHEN any list query is executed for an org-scoped resource THEN the backend SHALL always apply `WHERE organizationId = :activeOrgId` as the outermost filter — before role, territory, or segment filters.

**AC-MT-12**  
Cross-organization queries SHALL be forbidden for all non-super-admin roles. Attempting to access a resource from a different organization SHALL return 403 Forbidden (not 404, to avoid enumeration via response time).

---

### Org-Scoped Resources

The following tables MUST have `organizationId` added (migration required):

| Table | Migration note |
|-------|---------------|
| `User` | `organizationId` per membership (via `OrganizationMembership`) |
| `Clinic` | Direct `organizationId` column |
| `Doctor` | Direct `organizationId` column |
| `DoctorClinicAssociation` | Derived from clinic `organizationId` (no separate column needed) |
| `UserTerritoryAssignment` | Derived from user's org membership |
| `IngestionRun` | Direct `organizationId` column |
| `IngestionSuggestion` | Derived from clinic `organizationId` |
| All future tables | Must include `organizationId` from creation |

---

### Backward Compatibility (Migration)

**AC-MT-13**  
WHEN multi-tenancy is deployed to a system with existing data THEN the system SHALL create a default organization (e.g. `"Atlasmed Default"`) and assign all existing records to it automatically.

**AC-MT-14**  
WHEN the first admin user logs in after the multi-tenancy migration THEN they SHALL be automatically enrolled in the default organization with `ADMIN` role.

---

## Design

### New Data Models

```typescript
type OrgStatus = 'active' | 'inactive' | 'suspended';
type OrgTier = 'trial' | 'starter' | 'professional' | 'enterprise';

interface Organization {
  id: string;
  name: string;
  slug: string;               // unique, URL-safe
  status: OrgStatus;
  tier: OrgTier;
  settings: OrgSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface OrgSettings {
  defaultLocale: string;      // e.g. 'pt-BR'
  timezone: string;           // e.g. 'America/Sao_Paulo'
  allowedAuthMethods: ('password' | 'sso')[];
  requiredMfa: boolean;
}

interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  status: 'active' | 'inactive';
  joinedAt: Date;
  invitationId?: string;
}

// Extended session / auth context:
interface AuthContext {
  userId: string;
  activeOrgId: string;           // ADDED
  role: 'ADMIN' | 'MANAGER' | 'USER';
  segmentIds: string[];          // Spec 10 (future)
  territoryIds: string[];
  isGlobalAdmin: boolean;        // super-admin only, not org admin
}
```

### Request Middleware Stack (updated order)

```
1. Authenticate (JWT validation)
2. Resolve active org from session
3. Resolve role within active org (OrganizationMembership.role)
4. Resolve territory scope (within org)
5. Resolve market segment scope (within org — Spec 10)
6. Check CASL ability for action+subject
7. Execute handler with org-scoped query context
```

### API Changes Required

- All entity creation endpoints: inject `organizationId` from auth context (never from request body)
- All list endpoints: apply org filter implicitly
- New endpoints:
  - `POST /organizations` — super-admin: create org
  - `GET /organizations` — super-admin: list orgs
  - `POST /organizations/:id/activate|deactivate` — super-admin
  - `GET /session/org` — get active org details
  - `POST /session/org` — switch active org (multi-org users)
  - `GET /session/orgs` — list user's orgs

### Web App Changes Required

- Org switcher in nav header (shows only for multi-org users)
- Org context displayed in profile
- Org-scoped invite flow (org ID tied to invitation)
- Admin org management page (super-admin only)

---

## Implementation Sequence

This feature MUST be implemented before:
- Territory entity (F-101) — territories are org-scoped
- Market Segmentation (Spec 10) — segments are org-scoped
- Any feature that references `organizationId` on new tables

Recommended implementation order within this spec:
1. `Organization` + `OrganizationMembership` models and migrations
2. Default org creation + existing data migration
3. Auth context updated to carry `activeOrgId`
4. Middleware stack updated with org filter injection
5. All existing API endpoints patched with org-scoped queries
6. New org management endpoints
7. Web: org switcher + invite flow update

---

## Open Questions

1. Are there super-admin users who manage multiple tenants via the same interface, or is tenancy fully isolated (separate deployments)?
2. Should organizations have their own custom domain (e.g. `company.atlasmed.com`)?
3. Is there a trial/freemium model requiring automatic org creation during sign-up?
4. Should org settings (locale, timezone, auth methods, required MFA) be manageable by org admins or only by super-admins?
5. Are audit logs org-scoped (each org sees only their own) or globally visible to super-admins across all orgs?
