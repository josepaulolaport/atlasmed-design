# Spec: Market Segmentation & Visibility

**Domain:** Market Segmentation  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Foundational:** Yes — all other domain specs depend on this spec for their authorization model.  
**Implementation Prerequisites:** [F-101 Territory entity](./00-platform-foundation.md#territory-entity-requirements) (territory must be a proper entity before the second axis is added). Multi-tenancy (Spec 00-multi-tenancy) is **deferred for MVP** — this spec runs single-tenant; `organizationId` is nullable and ignored until multi-tenancy ships.  
**Related:** [Spec 00-platform-foundation](./00-platform-foundation.md) (existing scope system — F-008)

---

## Overview

Market segmentation is the **second access-control axis** of the Atlasmed CRM. It defines which business area, medical specialty group, therapeutic vertical, or commercial division each user, customer, product, and material belongs to. Territory answers *where* a user operates; market segment answers *which business market* they operate in.

Examples of market segments: Ortopedia, Dermatologia, Cirurgia Plástica, Cardiologia, Pediatria, Ginecologia, Estética, or any division the company defines.

Without market segmentation, all users in the same territory see all records. With it, a Dermatology representative and an Orthopedics representative can operate in the same city without seeing each other's customers, visits, products, or materials.

> **Implementation note:** Market segment visibility MUST be enforced server-side in every scoped query. Frontend filtering is a UX enhancement only. The backend is the source of truth.

### Relationship to the Existing Scope System

The current platform (F-008 in Spec 00) already has a territory-based scope system:

```
ScopeContext {
  isGlobal: boolean          // ADMIN only
  territoryIds: string[]
  clinicIds: string[]        // derived from territory
  managedUserIds: string[]   // MANAGER only
}
```

Market segmentation extends this system with a **second filter dimension**. It does NOT replace territory scoping. The two axes are ANDed:

```
Access granted = record_in_territory(scope) AND record_in_segment(user.segmentIds)
```

**Implementation approach:** The existing `ScopeContext` must be extended to include `segmentIds`:

```typescript
// Extended ScopeContext (after this spec is implemented):
ScopeContext {
  isGlobal: boolean
  organizationId?: string    // nullable until multi-tenancy ships (Spec 00-multi-tenancy, deferred)
  territoryIds: string[]
  clinicIds: string[]
  managedUserIds: string[]
  segmentIds: string[]       // ADDED by this spec
  isOperationallyActive: boolean
}
```

All existing scope-enforcement calls (`assertResourceInScope(scope, "clinic", clinicId)`) must be extended to also check segment overlap. The segment filter is added to the same scope resolution service — no separate middleware chain needed.

### Implementation Sequencing

This spec **cannot begin** until:
1. `Territory` entity exists as a proper model (F-101)
2. `clinicSegments`, `doctorSegments`, `productSegments`, `materialSegments` junction tables are added to the Prisma schema

> Multi-tenancy (Spec 00-multi-tenancy) is deferred for MVP. This spec proceeds single-tenant. `MarketSegment.organizationId` is added as `String?` nullable now for future forward-compatibility; it is not read or enforced until multi-tenancy ships.
3. The existing `ScopeContext` type in `packages/access` is extended with `segmentIds`

All currently implemented API endpoints (`/clinics`, `/doctors`, `/registry-suggestions`) will require updates to apply the segment filter after this spec is deployed.

---

## User Stories

**US-SEG-01 — Segment-Scoped Visibility**  
As a field representative, I want to see only the customers, products, presentations, and visits that belong to my assigned market segments, so that my workspace is focused on my area of responsibility.

**US-SEG-02 — Multi-Segment User**  
As a field representative assigned to multiple market segments, I want to see records from all my segments in a unified view, so that I can work across verticals without switching accounts.

**US-SEG-03 — Manager Segment Scope**  
As a manager, I want my dashboards and team views to be scoped to my assigned market segments (and those of my reports), so that I do not see data outside my area of oversight.

**US-SEG-04 — Admin Global View with Segment Filter**  
As an admin, I want to see data across all market segments and filter by segment, so that I can analyze cross-segment performance and manage the platform globally.

**US-SEG-05 — Segment-Aware Customer Records**  
As a field representative, I want doctors and clinics to be tagged with their relevant market segments, so that the system correctly scopes visibility when a customer belongs to multiple verticals.

**US-SEG-06 — Segment-Aware Products and Materials**  
As a field representative, I want the product list and CLM library to show only items relevant to my assigned segments, so that I am not distracted by materials intended for other teams.

**US-SEG-07 — Segment Management**  
As an admin, I want to create, activate, and deactivate market segments and manage user-segment assignments, so that I can evolve the segmentation model over time without losing historical data.

---

## Requirements & Acceptance Criteria

### Segment Entity Management

**AC-SEG-01**  
WHEN an admin creates a market segment THEN the system SHALL require: name (unique), description, and status (active/inactive). Creation date and update date SHALL be set automatically.

**AC-SEG-02**  
WHEN an admin deactivates a segment THEN the system SHALL prevent new records from being assigned to it but SHALL preserve all existing segment references on historical records unchanged.

**AC-SEG-03**  
WHEN an admin lists market segments THEN the system SHALL display all segments with name, status, user count, customer count, and creation date.

---

### User–Segment Assignment

**AC-SEG-04**  
WHEN an admin assigns a user to a market segment THEN the user's scoped queries SHALL include records tagged with that segment.

**AC-SEG-05**  
WHEN a user is assigned to multiple segments THEN their visibility SHALL be the UNION of records from all their segments.

**AC-SEG-06**  
WHEN a user is removed from a segment THEN they SHALL immediately lose visibility of records exclusively in that segment (no grace period for non-admin users).

**AC-SEG-07**  
WHEN an admin user accesses the system THEN they SHALL have global visibility by default but SHALL be able to filter their view by one or more market segments.

---

### Record–Segment Assignment

**AC-SEG-08**  
WHEN a doctor, clinic, product, presentation material, visit, or campaign record is created THEN the system SHALL require at least one market segment assignment.

**AC-SEG-09**  
WHEN a record belongs to multiple segments THEN any user assigned to at least one of those segments SHALL be able to access the record (additive visibility).

**AC-SEG-10**  
WHEN a user queries any list (clinics, doctors, products, presentations, visits, follow-ups, orders) THEN the backend SHALL apply a segment filter as `record.segments INTERSECT user.segments IS NOT EMPTY`.

**AC-SEG-11**  
WHEN a user attempts to access a record whose segments do not overlap with the user's segments THEN the system SHALL return a 403 Forbidden response. The frontend SHALL treat this as "not found" to avoid revealing existence of the record.

---

### Visit Scoping

**AC-SEG-12**  
WHEN a visit record is created THEN the system SHALL inherit the market segments from the customer (clinic or doctor) at the time of the visit and store them on the visit record.

**AC-SEG-13**  
WHEN a user queries visit history THEN the backend SHALL apply the segment filter to the inherited visit segments.

---

### Two-Dimensional Authorization Rule

**AC-SEG-14**  
For all non-admin users, access to any CRM record SHALL be granted only when BOTH conditions are met:
1. The record is within the user's territory or assigned customer scope (territory axis).
2. The record belongs to at least one of the user's assigned market segments (segment axis).

**AC-SEG-15**  
WHEN only one condition is met (e.g. record is in territory but wrong segment, or correct segment but outside territory) THEN access SHALL be denied.

---

### Product and Material Promotion Scoping

**AC-SEG-16**  
WHEN a representative opens the product selection screen during visit registration THEN the system SHALL display only products whose segments intersect with the representative's assigned segments AND the customer's segments.

**AC-SEG-17**  
WHEN a representative opens the CLM library THEN the system SHALL display only materials assigned to at least one of the representative's market segments.

---

### Dashboard and Reporting Scoping

**AC-SEG-18**  
WHEN a manager opens a dashboard THEN all metrics SHALL be computed only over customers, visits, and representatives within the manager's segment and territory scope.

**AC-SEG-19**  
WHEN an admin views cross-segment analytics THEN the system SHALL provide a segment filter that allows comparison of KPIs across segments.

---

## Design

### Segment Scope in the Authorization Layer

Every protected API endpoint that returns a list of records SHALL apply the following implicit filter (pseudocode):

```
WHERE records.segment_ids && current_user.segment_ids  -- PostgreSQL array overlap
  AND (territory_filter OR is_admin)
```

This filter must be applied at the data layer (ORM/query builder), not only in application logic, to prevent accidental bypass via direct queries or future feature additions.

### Segment Assignment Cardinality

| Entity | Segments |
|--------|----------|
| User | many-to-many |
| Clinic | many-to-many |
| Doctor | many-to-many |
| Product | many-to-many |
| Presentation Material | many-to-many |
| Visit | stored snapshot at creation time (many-to-many) |
| Campaign | many-to-many |
| Follow-up Action | inherited from visit/customer |

### Data Models

```typescript
interface MarketSegment {
  id: string;
  name: string;                // unique, e.g. "Dermatologia"
  description: string;
  status: 'active' | 'inactive';
  organizationId?: string;     // nullable for MVP; backfilled and made required when multi-tenancy ships
  createdAt: Date;
  updatedAt: Date;
}

interface UserSegmentAssignment {
  userId: string;
  segmentId: string;
  assignedAt: Date;
  assignedBy: string;          // admin user ID
}

// Junction tables on segment-aware entities:
// clinic_segments (clinicId, segmentId)
// doctor_segments (doctorId, segmentId)
// product_segments (productId, segmentId)
// material_segments (materialId, segmentId)
// visit_segments (visitId, segmentId)   -- snapshot, not live FK

// Authorization context passed on every request:
interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';   // matches platform RBAC (Spec 00 F-007)
  segmentIds: string[];        // user's active segments
  territoryIds: string[];      // user's active territories
  isGlobalAdmin: boolean;
}
```

### Admin UI Requirements

| Action | Who |
|--------|-----|
| Create / edit / deactivate segment | Admin |
| Assign user to segment | Admin |
| Remove user from segment | Admin |
| Assign segment to clinic/doctor | Admin or authorized manager |
| Assign segment to product/material | ADMIN only |
| View all segments and their assignments | Admin |
| Filter own dashboard by segment | Manager, Admin |

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| User with no segments assigned | System returns empty lists everywhere; UI shows onboarding prompt to contact admin |
| Record with no segments assigned | Blocked by backend validation at creation time; cannot be queried by non-admins |
| Admin removes a segment entirely | Soft-delete only; historical records retain the reference but it shows as "(Removido)" |
| Segment deactivated mid-session | User's active session retains access until token refresh; new queries apply the updated assignment |
| Record's segment updated after visit was logged | Visit retains the segment snapshot from time of creation; does not change retroactively |

### Integration Points

Every other spec in this system references market segmentation implicitly. The following specs have the most direct integration:

| Spec | Integration |
|------|-------------|
| 04 Client Management | Customer list and detail scoped by segment |
| 05 Territory Map | Map pins and route scoped by segment |
| 06 Orders | Product catalog and clinic list scoped by segment |
| 07 Presentations | CLM library scoped by segment |
| 11 Visit Lifecycle | Visit records carry segment snapshot |
| 12 Product Promotion | Product selection and comment types scoped by segment |
| 13 Presentation Observability | Session records scoped by segment |
| 15 Agenda Planning | Planned visits scoped by segment |
| 23 Coverage Dashboard | All metrics grouped and filtered by segment |
| 24 Manager Coaching | Team metrics scoped by manager's segments |
| 25 Admin Analytics | Cross-segment analysis |

### Open Questions

1. Are there segments that span multiple organizations (for holding companies or distributors), or is the scope always single-company?
2. Can a manager belong to a segment that differs from their direct reports? (e.g. a manager oversees Orthopedics reps but is also assigned to Dermatology for analytics)
3. Should segment names be localized (e.g. "Ortopedia" in pt-BR, "Orthopedics" in en-US)?
4. Is there an "unrestricted" segment concept for shared resources (e.g. institutional presentations visible to all segments)?
5. How are segment assignments made for newly imported customers (via CRM migration or external data sync)?
