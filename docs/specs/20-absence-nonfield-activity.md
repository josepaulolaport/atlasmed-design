# Spec: Absence & Non-Field Activity

**Domain:** Absence & Non-Field Activity Tracking  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 08 — Profile & Settings](./08-profile-settings.md) (work hours model), [Spec 15 — Agenda Planning](./15-agenda-planning.md) (capacity blocking), [Spec 21 — Requests & Approvals](./21-requests-approvals.md) (approval-required absence types), [Spec 23 — Coverage & Execution Dashboard](./23-coverage-execution-dashboard.md) (absence reflected in coverage metrics), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. The `User` model (F-005) exists and the BullMQ queue infrastructure (F-010) is in place for scheduling absence reminders. Approval-required absences will use Spec 21. Absence types requiring approval leverage the existing `UserTerritoryAssignment` manager relationship for reviewer routing.

---

## Overview

Field performance metrics must be interpreted in the context of a representative's actual availability. A representative with four days of medical leave should not be compared to one with a full working month on the same raw visit count. This module allows representatives and managers to register planned and unplanned absence periods and non-field activities (training, internal meetings, conferences) so that productivity metrics can be normalized correctly and agenda planning can prevent scheduling visits on unavailable days.

---

## User Stories

**US-ABS-01 — Register My Absence**  
As a field representative, I want to register an absence period (vacation, medical leave, etc.) so that my manager and the dashboards reflect my actual availability.

**US-ABS-02 — Manager Registers Team Absence**  
As a manager, I want to register absence for any representative in my scope, so that team-level metrics are accurate.

**US-ABS-03 — Prevent Scheduling on Absence Days**  
As a field representative, I want the agenda to warn me if I try to plan a visit on a day I have registered as unavailable, so that I do not create unrealistic plans.

**US-ABS-04 — Normalize Productivity Metrics**  
As a manager, I want coverage and productivity metrics to account for registered absence, so that performance comparisons are fair and accurate.

**US-ABS-05 — Approve Absences (if configured)**  
As a manager, I want to approve or reject absence requests that require authorization, so that the workflow is formal and auditable.

---

## Requirements & Acceptance Criteria

### Creating an Absence or Non-Field Activity Record

**AC-ABS-01**  
WHEN a representative or manager creates an absence record THEN the system SHALL require: type, start date, end date, and optionally an observation. Duration SHALL be computed automatically from dates and work hours (Spec 08).

**AC-ABS-02**  
WHEN an absence type is set to "requires approval" in configuration THEN the system SHALL route the record through the approval workflow (Spec 21) before it takes effect.

**AC-ABS-03**  
WHEN an absence type does not require approval THEN the record SHALL take effect immediately upon creation.

---

### Absence and Non-Field Activity Types

| Code | Label | Affects Capacity | Requires Approval |
|------|-------|-----------------|-------------------|
| `vacation` | Férias | Yes | Yes (configurable) |
| `medical_leave` | Licença médica | Yes | No |
| `maternity_leave` | Licença maternidade | Yes | No |
| `training` | Treinamento | Yes | No |
| `internal_meeting` | Reunião interna | Partial | No |
| `conference` | Congresso / evento | Partial | No |
| `travel_day` | Dia de viagem | Partial | No |
| `manager_accompaniment` | Acompanhamento com gestor | No (field activity) | No |
| `administrative` | Atividade administrativa | Partial | No |
| `other` | Outro | Configurable | Configurable |

**AC-ABS-04**  
WHEN the type is `other` THEN the representative SHALL be required to provide a description.

---

### Agenda Integration

**AC-ABS-05**  
WHEN a representative has an approved absence record on a given day THEN the system SHALL display a visual indicator on that day in the agenda (grey background or "Ausência" badge).

**AC-ABS-06**  
WHEN a representative tries to plan a visit on an absence day THEN the system SHALL display a warning "Ausência registrada neste dia" and ask to confirm or cancel.

---

### Capacity Normalization

**AC-ABS-07**  
WHEN productivity metrics are computed (Spec 23 — Coverage & Execution Dashboard) THEN the system SHALL subtract absence days from the representative's available working days for the period.

**AC-ABS-08**  
WHEN the effective available days are computed THEN the system SHALL use: `available_days = working_days_in_period − absence_days − partial_days_equivalent`.

---

### Manager View

**AC-ABS-09**  
WHEN a manager views their team's absence calendar THEN the system SHALL show a month-view with each representative's absence periods highlighted.

**AC-ABS-10**  
WHEN a manager approves an absence THEN the system SHALL record `approvedBy`, `approvedAt`, and update the absence status to `approved`.

**AC-ABS-11**  
WHEN a manager rejects an absence THEN the system SHALL record a rejection reason and notify the representative.

---

## Design

### Data Models

```typescript
type AbsenceType =
  | 'vacation' | 'medical_leave' | 'maternity_leave'
  | 'training' | 'internal_meeting' | 'conference'
  | 'travel_day' | 'manager_accompaniment' | 'administrative' | 'other';

type AbsenceStatus = 'pending_approval' | 'approved' | 'rejected' | 'cancelled';

interface AbsenceRecord {
  id: string;
  representativeId: string;
  type: AbsenceType;
  description?: string;            // required for 'other'
  startDate: Date;
  endDate: Date;
  durationDays: number;            // computed
  affectsCapacity: 'full' | 'partial' | 'none';
  status: AbsenceStatus;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Absence overlaps an already-planned visit | System lists conflicting visits and asks whether to cancel them |
| Retroactive absence entered for past dates | Allowed; productivity metrics recalculated for the affected period |
| Manager approval not configured | Records take effect immediately (no approval step) |
| Absence cancelled | Agenda restored; previously blocked days become available again |

### Open Questions

1. Should partial-day absences (e.g. morning only) be supported?
2. Does manager accompaniment count as a field activity (generating a visit record) or only as a non-field entry?
3. Should absences sync to an HR system, or is this CRM-internal only?
4. Is there a maximum consecutive absence days before automatic escalation?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-73](https://linear.app/atlasmed/issue/ATLAS-73/) | Parent | Spec 20: Absence Management | Backlog |
| [ATLAS-74](https://linear.app/atlasmed/issue/ATLAS-74/) | [BE] | Absence Management — model & approval routing | Backlog |
| [ATLAS-75](https://linear.app/atlasmed/issue/ATLAS-75/) | [MOB] | Absence Management — Flutter request form & calendar block | Backlog |
| [ATLAS-162](https://linear.app/atlasmed/issue/ATLAS-162/) | [WE] | Absence Management — manager team calendar & approval queue | Backlog |
| [ATLAS-176](https://linear.app/atlasmed/issue/ATLAS-176/) | [DESIGN] | Spec 20: Absence Management — manager calendar & approval UI | Backlog |
