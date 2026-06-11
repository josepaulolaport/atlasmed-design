# Spec: Activity Log

**Domain:** Activity Log (Histórico de Atividades)  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 27 — Customer Timeline](./27-customer-timeline.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Activity Log (all screens) | ❌ **Not started** | No Visit model; the RBAC `VISIT` subject exists but has no domain module |
| CSV export | ❌ **Not started** | — |
| **Prerequisites** | — | Spec 11 (Visit model) → this spec |

> The `AuditLog` system (F-010) exists for system events. This spec's Activity Log is a **field representative's personal view** of their own visits and actions — rep-only in V1. Manager team activity visibility is in Spec 23 (Coverage & Execution Dashboard). This spec is backed by the `Visit`, `FollowUpAction`, `Order`, and `ProductPromotion` models.

---

## Overview

The Activity Log is a full-screen chronological journal of everything a field representative has done: visits, calls, orders, presentations delivered, follow-ups completed, and emails sent. It is reachable from the BI Dashboard ("Ver atividade") and from the Profile screen ("Ver tudo" on recent activity). The screen doubles as an audit trail and a searchable reference for past interactions.

---

## User Stories

**US-ACTLOG-01 — Browse All Activity**  
As a field representative, I want to see a chronological list of all my activities, so that I have a complete record of what I have done.

**US-ACTLOG-02 — Filter by Activity Type**  
As a field representative, I want to filter the log by type (visits, calls, orders, etc.), so that I can focus on a specific kind of work.

**US-ACTLOG-03 — Filter by Date Range**  
As a field representative, I want to filter activities by date range (today, 7 days, 30 days, all), so that I can review a specific period quickly.

**US-ACTLOG-04 — Search Activities**  
As a field representative, I want to search the activity log by client name, note content, or activity title, so that I can find a specific interaction without scrolling.

**US-ACTLOG-05 — Export Activity History**  
As a field representative, I want to export my activity log as a CSV file, so that I can share it with my manager or process it externally.

**US-ACTLOG-06 — Understand Summary at a Glance**  
As a field representative, I want to see summary stats (total, positive outcomes, pending) that update as I filter, so that I understand the scope of what I am looking at.

---

## Requirements & Acceptance Criteria

### Screen Entry & Header

**AC-ACTLOG-01**  
WHEN the user opens the activity log THEN the system SHALL display a header with a back button and the title "Histórico completo".

**AC-ACTLOG-02**  
WHEN the activity log loads THEN the system SHALL display three summary stats — total activity count, positive-outcome count, and pending-item count — above the filter controls.

**AC-ACTLOG-03**  
WHEN the user applies any filter or search THEN the system SHALL recalculate and update the summary stats to reflect only the filtered set.

---

### Sort

**AC-ACTLOG-04**  
WHEN the user views the activity log THEN the system SHALL default to "Mais recente primeiro" order.

**AC-ACTLOG-05**  
WHEN the user taps the sort toggle THEN the system SHALL switch between "Mais recente primeiro" and "Mais antigo primeiro".

---

### Search

**AC-ACTLOG-06**  
WHEN the user types in the search bar THEN the system SHALL filter the list in real time, matching against activity type, client/entity name, title, note content, and consultant name.

**AC-ACTLOG-07**  
WHEN the search bar is cleared THEN the system SHALL restore the full filtered list (respecting any active type/date filters).

---

### Type Filters

**AC-ACTLOG-08**  
WHEN the user views the filter pills THEN the system SHALL display: Todas, Visitas, Ligações, Pedidos, Apresentações, Follow-ups, E-mails — each with a count badge showing how many items match that type within the active date range.

**AC-ACTLOG-09**  
WHEN the user selects a type pill THEN the system SHALL filter the list to show only activities of that type.

**AC-ACTLOG-10**  
WHEN the user selects "Todas" THEN the system SHALL remove the type filter and show all activity types.

---

### Date Filters

**AC-ACTLOG-11**  
WHEN the user views the date filter pills THEN the system SHALL display: Hoje, 7 dias, 30 dias, Tudo.

**AC-ACTLOG-12**  
WHEN the user selects a date pill THEN the system SHALL filter to activities within that window and update the type-pill counts accordingly.

---

### Activity List

**AC-ACTLOG-13**  
WHEN activities are displayed THEN the system SHALL group them by day with a date header (e.g. "Hoje", "Ontem", "Segunda, 8 jun").

**AC-ACTLOG-14**  
WHEN displaying an activity row THEN the system SHALL show: type icon (color-coded), entity name, activity title, time, relative time, duration (where applicable), outcome badge, and a one-line note excerpt.

**AC-ACTLOG-15**  
WHEN no activities match the current search and filters THEN the system SHALL display an empty state with a calendar icon, a "Nenhuma atividade encontrada" message, and a suggestion to adjust filters.

---

### Export

**AC-ACTLOG-16**  
WHEN the user taps the export button THEN the system SHALL display a "Exportando histórico…" toast and begin generating a CSV file containing all currently filtered activities.

**AC-ACTLOG-17**  
WHEN the export is complete THEN the system SHALL display a "Histórico exportado ✓" toast and trigger the platform's native share/save sheet for the CSV file.

**AC-ACTLOG-18**  
IF the filtered activity list is empty THEN the system SHALL disable the export button.

---

## Design

### Screen Layout

```
┌─────────────────────────────┐
│ ← Histórico completo   [↓]  │  (top bar + export)
├─────────────────────────────┤
│  [142 atividades] [87 pos.] [12 pendentes]  │  (summary stats)
├─────────────────────────────┤
│  [↕ Mais recente]           │  (sort toggle)
│  [🔍 Buscar atividade…]     │  (search)
│  [Todas][Visitas][Ligações]…│  (type pills)
│  [Hoje][7 dias][30 dias][Tudo]│ (date pills)
├─────────────────────────────┤
│  Hoje                       │
│  • Visit row                │
│  • Call row                 │
│  Ontem                      │
│  • Order row                │
│  …                          │
└─────────────────────────────┘
```

### Data Models

```typescript
type ActivityType =
  | 'visit'
  | 'call'
  | 'order'
  | 'presentation'
  | 'followup'
  | 'email';

type OutcomeType =
  | 'positive'
  | 'mixed'
  | 'negative'
  | 'neutral'
  | 'pending';

interface Activity {
  id: string;
  type: ActivityType;
  entityId: string;           // clinic or doctor ID
  entityName: string;
  entityType: 'clinic' | 'doctor';
  title: string;              // e.g. "Visita · Reunião agendada"
  occurredAt: Date;
  durationMinutes?: number;
  outcome?: OutcomeType;
  note?: string;
  consultantName: string;
  orderValue?: number;        // for orders
  sampleTags?: string[];      // for visits with samples
  withWhom?: string;          // contact name at entity
}
```

### Export CSV Schema

| Column | Source Field |
|--------|-------------|
| Data | `occurredAt` (ISO date) |
| Hora | `occurredAt` (time) |
| Tipo | `type` (localized label) |
| Cliente | `entityName` |
| Título | `title` |
| Duração (min) | `durationMinutes` |
| Resultado | `outcome` (localized label) |
| Valor (R$) | `orderValue` |
| Nota | `note` |
| Consultor | `consultantName` |

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| No activities in system | Full empty state with onboarding prompt |
| Export fails (no storage permission) | Toast: "Erro ao exportar. Verifique as permissões." |
| Very large dataset (1000+ activities) | Paginate or virtualize list; export in background |
| Search returns no results | Per-search empty state without hiding filters |

### Market Segmentation Note

All activity log queries apply the two-dimensional authorization rule (Spec 10, AC-SEG-14). The activity log SHALL include a segment filter when the user is assigned to multiple segments. When a user exports activity data (CSV), the export is scoped to their authorized data only — they cannot export records from segments or territories outside their scope.

### Visit Lifecycle Note

Activity types in this spec map to the richer visit status model in [Spec 11](./11-visit-lifecycle-frequency.md):
- "Visita realizada" = `status: effective`
- Ineffective visits appear in the log with their `IneffectiveReason`
- Planned visits that were never executed are visible as "Planejada · Não executada"

### Relationship to Customer Timeline

The Activity Log (this spec) is the representative's personal view of all their activities. The Customer Timeline ([Spec 27](./27-customer-timeline.md)) is a per-customer view of all interactions from all representatives. Both are derived from the same underlying records but serve different navigation contexts.

### Open Questions

1. Should tapping an activity row navigate to the related entity detail (clinic/doctor)?
2. Is the export scope the full history or only the currently filtered set?
3. Are activity records editable after creation, or read-only?
4. ~~Should managers see activity logs for their entire team from this screen?~~ **Resolved:** No — the Activity Log is rep-only in V1. It shows the authenticated user's own activity. Manager team activity visibility is handled by Spec 23 (Coverage & Execution Dashboard).

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-99](https://linear.app/atlasmed/issue/ATLAS-99/) | Parent | Spec 09: Activity Log | Backlog |
| [ATLAS-100](https://linear.app/atlasmed/issue/ATLAS-100/) | [BE] | Activity Log — model & capture middleware | Backlog |
| [ATLAS-101](https://linear.app/atlasmed/issue/ATLAS-101/) | [WE] | Activity Log — manager team activity view | Backlog |
| [ATLAS-102](https://linear.app/atlasmed/issue/ATLAS-102/) | [MOB] | Activity Log — rep activity feed | Backlog |
| [ATLAS-179](https://linear.app/atlasmed/issue/ATLAS-179/) | [DESIGN] | Spec 09: Activity Log — rep & team activity feed UI | Backlog |
