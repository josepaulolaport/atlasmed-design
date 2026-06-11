# Spec: Visit Lifecycle & Frequency Targets

**Domain:** Visit Lifecycle & Frequency Targets  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 04 — Client Management](./04-client-management.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. The RBAC `VISIT` subject exists in the current system but has no domain module, API endpoints, or data model. Prerequisite chain: F-101 (territory entity) → Spec 10 → **this spec** (multi-tenancy deferred for MVP — see Spec 00-multi-tenancy). This is the core field execution model that most other new specs depend on.

---

## Overview

This spec defines the complete lifecycle of a visit and the frequency target model. The current design prototype treats all visits as equivalent records with an outcome chip. Production requires a richer model: a visit can be planned ahead of time, attempted but not completed (the doctor was unavailable), effectively completed (the intended interaction occurred), or ineffective (the representative was present but the interaction did not take place as intended). Frequency targets define how often each customer should be visited within a configurable time window, making execution intentional and measurable.

---

## User Stories

### Visit Lifecycle

**US-VL-01 — Plan a Visit**  
As a field representative, I want to create a planned visit on a specific date for a customer on my agenda, so that my schedule is organized before the workday.

**US-VL-02 — Record an Effective Visit**  
As a field representative, I want to mark a visit as effective and fill in what happened, so that the CRM reflects a real, completed interaction with the customer.

**US-VL-03 — Record an Attempted (Ineffective) Visit**  
As a field representative, I want to record that I went to a clinic but the doctor was unavailable, so that my effort is logged without falsely counting it as a completed visit.

**US-VL-04 — Provide a Reason for Ineffective Visits**  
As a field representative, I want to select a standardized reason when a visit is ineffective, so that managers have structured data to identify systemic access problems.

**US-VL-05 — View Full Visit Lifecycle History**  
As a field representative, I want to see for any past visit when it was planned, when it happened, its outcome type, and who registered it, so that I have a complete audit trail.

### Frequency Targets

**US-VF-01 — Set a Visit Frequency Target**  
As a manager, I want to assign a visit frequency target to each customer (e.g. 2 visits/month), so that the field team has clear execution expectations.

**US-VF-02 — See Frequency Progress**  
As a field representative, I want to see "1/2 this month" on a customer's card, so that I know at a glance whether a customer needs a visit.

**US-VF-03 — Identify Frequency Gaps**  
As a manager, I want to filter my territory by customers who are behind their frequency target, so that I can coach representatives and prioritize coverage.

**US-VF-04 — Influence Agenda Planning**  
As a field representative, I want customers behind frequency target to be highlighted in my agenda suggestions, so that I naturally prioritize them when planning my week.

---

## Requirements & Acceptance Criteria

### Visit Lifecycle States

```
planned → [cancelled | executing]
                         ↓
              [effective | ineffective]
```

> **Note on "executed":** `executed` is a **UI action/transition label**, not a stored database status. The `VisitStatus` type (see Data Models) contains only `planned | effective | ineffective | cancelled`. When a rep "executes" a visit, the system opens a classification form; the visit is only saved once the rep selects `effective` or `ineffective`. The intermediate state while the form is open is held in client-side state only.

**AC-VL-01**  
WHEN a visit is created from the agenda or map THEN the system SHALL set its status to `planned` with the scheduled date and customer.

**AC-VL-02**  
WHEN a representative marks a planned visit as executed THEN the system SHALL open the visit classification form and require the representative to choose `effective` or `ineffective` before saving.

**AC-VL-03**  
WHEN a representative registers a spontaneous (unplanned) visit THEN the system SHALL open the classification form immediately, creating the visit record with status `effective` or `ineffective` only upon submission.

**AC-VL-04**  
WHEN a visit is classified as `ineffective` THEN the system SHALL require the representative to select a reason from the standardized list.

**AC-VL-05**  
WHEN a representative cancels a planned visit THEN the system SHALL set its status to `cancelled` and optionally request a cancellation reason.

---

### Ineffective Visit Reasons

The system SHALL support the following standardized reasons (admin-configurable):

| Reason Code | Label |
|------------|-------|
| `prof_absent` | Profissional ausente |
| `prof_vacation` | Profissional de férias |
| `schedule_changed` | Agenda alterada |
| `clinic_closed` | Clínica fechada |
| `wrong_address` | Endereço incorreto |
| `prof_refused` | Profissional não recebeu |
| `conference` | Congresso / evento |
| `medical_leave` | Licença médica |
| `maternity_leave` | Licença maternidade |
| `rep_unavailable` | Representante indisponível |
| `other` | Outro (requer texto livre) |

**AC-VL-06**  
WHEN the reason `other` is selected THEN the system SHALL require a free-text observation of at least 10 characters.

---

### Visit Detail Screen (enhanced)

**AC-VL-07**  
WHEN a visit detail is displayed THEN the system SHALL show the full lifecycle: planned date (if applicable), execution date, visit outcome type (effective / ineffective), ineffective reason (if applicable), registering user, duration, products promoted, notes, and follow-up actions created.

**AC-VL-08**  
WHEN a visit was registered as effective THEN the system SHALL mark it as counting toward the customer's frequency target.

**AC-VL-09**  
WHEN a visit was registered as ineffective THEN the system SHALL mark it as activity (visible in logs) but SHALL NOT count it toward the customer's frequency target. There is no override — only effective visits count. This rule is fixed and cannot be changed per segment or by admin config.

---

### Frequency Target Model

**AC-VF-01**  
WHEN a manager or admin creates a frequency target for a customer THEN the system SHALL require: customer reference, target count (positive integer), and time window (`monthly` / `quarterly` / `custom_days`).

**AC-VF-02**  
WHEN a frequency target has a time window of `custom_days` THEN the system SHALL require a positive integer for the number of rolling days.

**AC-VF-03**  
WHEN multiple targets exist for a customer THEN only the most recently activated target SHALL be considered current.

**AC-VF-04**  
WHEN the system displays a customer card or profile THEN it SHALL show the current frequency progress in the format: "X / Y visits this [period]" or "Last visited X days ago" depending on configuration.

**AC-VF-05**  
WHEN the representative views a customer whose last effective visit exceeds the frequency target window THEN the system SHALL display a visual alert (e.g. amber badge or "overdue" chip).

**AC-VF-06**  
WHEN a manager views a territory or segment list THEN they SHALL be able to filter by frequency status: on target / behind / overdue / no target assigned.

**AC-VF-07**  
WHEN an effective visit is recorded for a customer THEN the system SHALL immediately recalculate the frequency progress for that customer.

---

### Market Segment Scoping

**AC-VL-10**  
All visit records SHALL carry a market segment snapshot (inherited from the customer at creation time). See [Spec 10 — Market Segmentation](./10-market-segmentation.md), AC-SEG-12.

**AC-VL-11**  
WHEN a user queries visit history THEN the backend SHALL apply the two-dimensional authorization rule (territory + segment).

---

## Design

### Visit Status State Machine

```
                    ┌──────────────┐
                    │   planned    │
                    └──────┬───────┘
              [execute]    │    [cancel]
            ┌──────────────┼──────────────┐
            ▼                             ▼
     ┌─────────────┐              ┌──────────────┐
     │  effective  │              │  cancelled   │
     └─────────────┘              └──────────────┘
            │ OR
            ▼
     ┌─────────────┐
     │ ineffective │ (+ reason)
     └─────────────┘
```

### Data Models

```typescript
type VisitStatus = 'planned' | 'effective' | 'ineffective' | 'cancelled';

type IneffectiveReason =
  | 'prof_absent'
  | 'prof_vacation'
  | 'schedule_changed'
  | 'clinic_closed'
  | 'wrong_address'
  | 'prof_refused'
  | 'conference'
  | 'medical_leave'
  | 'maternity_leave'
  | 'rep_unavailable'
  | 'other';

interface Visit {
  id: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  entityName: string;
  segmentIds: string[];             // snapshot at creation time
  status: VisitStatus;
  plannedDate?: Date;               // set when status = planned
  executedAt?: Date;                // set when status = effective | ineffective
  cancelledAt?: Date;
  ineffectiveReason?: IneffectiveReason;
  ineffectiveNote?: string;         // required when reason = 'other'
  cancellationReason?: string;
  durationMinutes?: number;
  consultantId: string;
  outcome?: 'positive' | 'mixed' | 'neutral';  // for effective visits
  note?: string;
  locationVerified: boolean;
  promotedProductIds: string[];
  followUpIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

type FrequencyWindow = 'monthly' | 'quarterly' | 'custom_days';

interface FrequencyTarget {
  id: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  segmentId?: string;               // null = applies to all segments
  targetCount: number;
  window: FrequencyWindow;
  customDays?: number;              // only when window = custom_days
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

interface FrequencyProgress {
  entityId: string;
  segmentId?: string;
  target: FrequencyTarget;
  effectiveVisitsInWindow: number;
  progressLabel: string;            // e.g. "1/2 este mês"
  status: 'on_target' | 'behind' | 'overdue' | 'no_target';
  lastEffectiveVisitDate?: Date;
  daysSinceLastEffectiveVisit?: number;
}
```

### Frequency Progress Calculation

```
effectiveVisitsInWindow = COUNT(visits)
  WHERE entityId = customer.id
    AND status = 'effective'
    AND executedAt >= windowStart(target.window, target.customDays)
    AND segmentIds && user.segmentIds

status:
  IF target IS NULL → 'no_target'
  IF effectiveVisitsInWindow >= target.targetCount → 'on_target'
  IF daysSinceLastEffectiveVisit > (window_days * 1.5) → 'overdue'
  ELSE → 'behind'
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Marking visit effective after >24h from execution | Allowed; system flags with "Registrado fora do horário" note |
| Duplicate visit registered same day same customer | System warns "Já existe visita registrada hoje" and asks to confirm or view existing |
| Customer has no frequency target | Progress indicator shows "Sem meta definida" |
| Frequency target changed mid-period | New target applies to future calculations; historical counts are not retroactively adjusted |
| Offline visit registration | Visit saved locally as pending; status transitions apply normally on sync (see Spec 22 — Offline Sync) |

### Open Questions

1. Can frequency targets be set per market segment separately (e.g. this doctor needs 2 Dermatology visits/month and 1 Orthopedics visit/month)?
2. Should the system support a "covisit" (two representatives visiting the same customer on the same day as a single event)?
3. Who has permission to edit a visit record after it has been saved — the registering rep, their manager, or admin only?
4. ~~Should ineffective visits count toward a partial credit?~~ **Resolved:** No. Only effective visits count. No partial credit, no override. See AC-VL-09.
5. Is there a visit correction request flow that ties into Spec 21 (Requests & Approvals)?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-54](https://linear.app/atlasmed/issue/ATLAS-54/) | Parent | Spec 11: Visit Lifecycle & Frequency Targets | Backlog |
| [ATLAS-55](https://linear.app/atlasmed/issue/ATLAS-55/) | [BE] | Visit Lifecycle — Visit model, state machine & frequency API | Backlog |
| [ATLAS-56](https://linear.app/atlasmed/issue/ATLAS-56/) | [MOB] | Visit Lifecycle — Flutter visit registration flow | Backlog |
