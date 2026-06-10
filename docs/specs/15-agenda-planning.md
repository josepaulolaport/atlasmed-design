# Spec: Agenda Planning

**Domain:** Agenda Planning  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle & Frequency Targets](./11-visit-lifecycle-frequency.md), [Spec 14 — Pre-Visit Intelligence](./14-pre-visit-intelligence.md) (quick action), [Spec 20 — Absence & Non-Field Activity](./20-absence-nonfield-activity.md) (capacity blocking), [Spec 30 — Follow-Up Actions](./30-followup-actions.md), [Spec 32 — Mobile Architecture](./32-mobile-architecture.md) (agenda_items Drift table, offline-first), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. Requires the `Visit` model with `status: planned` (Spec 11). The frequency target model (Spec 11) powers the "unplanned customer suggestions." Mobile-only UI; web manager view is secondary.

---

## Overview

The Agenda Planning module gives field representatives a calendar and list-based interface to plan daily and weekly field activities. It is distinct from the Territory Map's route planning (which focuses on spatial navigation during execution): the agenda is the planning layer used before the day starts. Representatives can schedule planned visits, view unplanned high-priority customers, manage visit status, and understand their coverage gaps for the period.

Managers can inspect the agenda of their reports to verify that planning is aligned with territory, market segment, and frequency priorities.

---

## User Stories

**US-AG-01 — Plan a Daily Schedule**  
As a field representative, I want to add planned visits to specific days, so that I have an organized schedule before my workday begins.

**US-AG-02 — View Week at a Glance**  
As a field representative, I want to see my week with planned and completed visits per day, so that I can balance my workload.

**US-AG-03 — Identify Unplanned Priority Customers**  
As a field representative, I want to see high-priority customers that I have not yet scheduled this week, so that I do not miss strategic accounts.

**US-AG-04 — Filter Agenda**  
As a field representative, I want to filter my agenda by market segment, customer type, specialty, and frequency status, so that I can focus my planning on specific criteria.

**US-AG-05 — Track Visit Status in Agenda**  
As a field representative, I want to see the status of each agenda item (planned / effective / ineffective / cancelled) inline, so that I know the execution state of my day at a glance.

**US-AG-06 — Manager Inspects Team Agenda**  
As a manager, I want to see any representative's agenda (within my scope), so that I can assess whether their planning reflects the right priorities.

**US-AG-07 — Respect Segment Scope**  
As a field representative, I want the agenda to only show customers I am authorized to visit based on my territory and market segments, so that I cannot accidentally plan a visit outside my scope.

---

## Requirements & Acceptance Criteria

### Agenda Views

**AC-AG-01**  
WHEN the user opens the Agenda THEN the system SHALL display a day view (default: today) with a week-strip navigator at the top.

**AC-AG-02**  
WHEN the user taps a different day in the week strip THEN the system SHALL show the agenda for that day.

**AC-AG-03**  
WHEN a day is displayed THEN the system SHALL show all planned, executed, and cancelled visits for that day, grouped by time block (morning / afternoon / unscheduled).

**AC-AG-04**  
WHEN a visit card is displayed in the agenda THEN the system SHALL show: customer name, type (clinic/doctor), time (if scheduled), market segment chip, visit status, and a quick-action row (Ver pré-visita, Ver perfil, Iniciar navegação).

---

### Planning a Visit

**AC-AG-05**  
WHEN the user taps "+ Planejar visita" THEN the system SHALL open a planning form with: customer search (segment + territory scoped), date, optional time, optional notes, market segment (pre-filled from customer).

**AC-AG-06**  
WHEN a customer is selected THEN the system SHALL display their frequency progress inline to inform the scheduling decision.

**AC-AG-07**  
WHEN the user saves a planned visit THEN the system SHALL create a visit record with `status: planned` (see Spec 11) and add it to the agenda.

**AC-AG-08**  
WHEN the user tries to plan a visit for a customer outside their territory or segment THEN the system SHALL block the action with an error message.

---

### Unplanned Customer Suggestions

**AC-AG-09**  
WHEN the user views any day or week THEN the system SHALL display a "Clientes não planejados" section showing customers that:
- Are in the user's territory and segments
- Have no planned or executed visits in the current week
- Are behind or overdue on frequency target, OR are high priority

**AC-AG-10**  
WHEN an unplanned customer card is tapped THEN the system SHALL offer: "Planejar visita para hoje", "Planejar visita para outro dia", "Ver perfil".

---

### Filters

**AC-AG-11**  
WHEN the filter panel is open THEN the system SHALL offer: market segment, customer type (clinic/doctor), specialty, frequency status (on target / behind / overdue / no target), visit status.

**AC-AG-12**  
WHEN filters are active THEN the system SHALL display a filter badge and allow clearing all filters in one tap.

---

### Manager View

**AC-AG-13**  
WHEN a manager opens the team agenda view THEN the system SHALL show a representative selector and display the selected representative's agenda with the same layout.

**AC-AG-14**  
WHEN a manager views a representative's agenda THEN the manager SHALL be able to see but not edit the planned visits.

**AC-AG-16**  
The manager agenda view is **read-only in V1**. A manager cannot create, reschedule, or cancel planned visits on behalf of a representative. This restriction applies even if the manager is in the same territory as the representative. Editing agenda on behalf of a rep is a V2 feature.

---

### Market Segment Scoping

**AC-AG-15**  
All customer results in the planning search, unplanned customer suggestions, and agenda displays SHALL apply the two-dimensional authorization rule (see Spec 10). A representative cannot plan or see visits for customers outside their territory and segment scope.

---

## Design

### Screen Layout

```
┌──────────────────────────────────────────┐
│ Agenda                        [+] [⚙]    │
├──────────────────────────────────────────┤
│  [Dom] [Seg▲] [Ter] [Qua] [Qui] [Sex][Sáb]│  ← week strip with visit counts
├──────────────────────────────────────────┤
│  Terça-feira, 10 jun                     │
│  4 visitas planejadas                    │
├──────────────────────────────────────────┤
│  MANHÃ                                   │
│  ○ 09:00 · Clínica São Lucas  [Ortop]    │
│  ○ 11:00 · Dr. Carlos Melo    [Derma]    │
├──────────────────────────────────────────┤
│  TARDE                                   │
│  ✓ 14:00 · Clínica Vita       [Derma]   │  ← effective
│  ✗ 16:00 · Dr. Ana Pereira    [Ortop]   │  ← ineffective
├──────────────────────────────────────────┤
│  CLIENTES NÃO PLANEJADOS (3)             │
│  ▲ Clínica Central · 0/2 este mês       │
│  ▲ Dr. Fábio Lima  · Vencida há 12d     │
└──────────────────────────────────────────┘
```

### Data Models

```typescript
interface AgendaItem {
  id: string;
  visitId: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  entityName: string;
  segmentIds: string[];
  date: Date;
  scheduledTime?: string;      // "HH:MM"
  timeBlock: 'morning' | 'afternoon' | 'unscheduled';
  visitStatus: VisitStatus;
  frequencyProgress?: FrequencyProgress;
}

interface AgendaDay {
  date: Date;
  items: AgendaItem[];
  unplannedSuggestions: UnplannedCustomer[];
  totals: {
    planned: number;
    effective: number;
    ineffective: number;
    cancelled: number;
  };
}

interface UnplannedCustomer {
  entityId: string;
  entityType: 'clinic' | 'doctor';
  entityName: string;
  segmentIds: string[];
  frequencyProgress: FrequencyProgress;
  priorityReason: 'frequency_behind' | 'frequency_overdue' | 'high_priority';
}
```

### Integration with Territory Map

The agenda and map are complementary:
- Agenda → plan → Route planning in map (tap "Iniciar navegação" on an agenda item)
- Map → execute → visit logged → agenda item auto-updated to `effective` or `ineffective`

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Planning a visit for a day with absence registered (Spec 20) | System warns "Ausência registrada neste dia" and asks to confirm |
| Duplicate planned visit same day same customer | System warns "Já existe visita planejada para este cliente hoje" |
| Planned visit not executed by end of day | Status remains `planned`; flagged as "Não executada" in manager view |
| Offline planning | Visit record created locally; synced when reconnected (Spec 22) |
| Manager tries to plan a visit on behalf of a rep | Manager can view but cannot create planned visits for others in V1 |

### Open Questions

1. Should the agenda support time-blocked scheduling (specific hours) or date-only planning?
2. Is there a daily visit limit configurable per representative or per segment?
3. Should the agenda integrate with native calendar apps (iOS Calendar, Google Calendar)? — **Deferred to V2; not in MVP scope.**
4. Can a planned visit be moved to a different day by drag-and-drop?
5. Should the "unplanned customer suggestions" rank be customizable per manager?
