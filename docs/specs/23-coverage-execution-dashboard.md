# Spec: Coverage & Execution Dashboard

**Domain:** Coverage & Execution Dashboard  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle & Frequency Targets](./11-visit-lifecycle-frequency.md), [Spec 20 — Absence & Non-Field Activity](./20-absence-nonfield-activity.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. Requires Visit (Spec 11) and FrequencyTarget models to compute any metrics. The manager hierarchy (`managerId` on User model, F-009) is already in place for team-scoped queries. This dashboard is accessible from both web and mobile.

> **Relationship to Spec 03 (BI Dashboard) — resolved:**
> - **Spec 03** = rep's personal mobile BI (Desempenho tab); answers "How am I performing?"; audience = field rep
> - **Spec 23** = manager's team coverage view (web primary + mobile); answers "How is my team performing?"; audience = manager
>
> These are **separate, complementary** dashboards that consume the same underlying APIs. Spec 23 does **not** replace Spec 03.

---

## Overview

The Coverage & Execution Dashboard shows how well representatives and managers are covering their assigned customer base. It replaces the simple visit count from Spec 03 with a structured view of planned vs completed, effective vs ineffective, frequency gap analysis, and productivity metrics — all normalized by actual availability (accounting for absence). It supports both individual representative self-assessment and manager-level team oversight.

---

## User Stories

**US-COV-01 — Representative Coverage View**  
As a field representative, I want to see how many of my customers have been visited, are behind target, or have not been visited recently, so that I know where to focus.

**US-COV-02 — Manager Team Coverage**  
As a manager, I want to compare execution across my team, identify underperforming representatives, and drill into specific customers or segments, so that I can coach effectively.

**US-COV-03 — Identify Not-Visited Customers**  
As a manager, I want a list of customers not visited in the selected period or in too many days, so that I can detect abandonment risk.

**US-COV-04 — Productivity Metrics (Normalized)**  
As a manager, I want productivity metrics to reflect a representative's actual available days (minus absence), so that comparisons are fair.

**US-COV-05 — Segment Coverage Comparison**  
As a manager, I want to compare coverage across market segments, so that I can identify if one vertical is underperforming.

**US-COV-06 — Period Flexibility**  
As a manager, I want to configure the period (today, this week, this month, this quarter, custom range, or rolling N days), so that the dashboard is useful throughout the month, not just at the end.

---

## Requirements & Acceptance Criteria

### Period Filter

**AC-COV-01**  
WHEN the dashboard loads THEN the system SHALL default to "Este mês" and allow switching to: Hoje, Esta semana, Este trimestre, Personalizado (date picker), and rolling "Últimos X dias".

**AC-COV-02**  
WHEN a custom date range is applied THEN all dashboard metrics SHALL recalculate for that range.

---

### Representative-Level Metrics

**AC-COV-03**  
WHEN the representative view is displayed THEN the system SHALL show:
- Total customers in scope (territory + segments)
- Visited (at least one effective visit in period)
- Not visited in period
- Behind frequency target
- Effective visit count
- Ineffective visit count
- Effective visit rate (effective / total executed)
- Planned visits not executed
- Follow-up completion rate
- Productivity: effective visits per available working day

**AC-COV-04**  
WHEN computing "available working days" THEN the system SHALL subtract approved absence days and non-field activity days (Spec 20) from total working days in the period.

---

### Not-Visited Indicators

**AC-COV-05**  
WHEN the "Não visitados" section is displayed THEN the system SHALL list customers not visited in the selected period, sortable by: days since last visit, frequency status, priority.

**AC-COV-06**  
WHEN a customer has not been visited for more than a configurable threshold (default: 60 days) THEN the system SHALL flag them as "Risco de abandono".

---

### Manager Team View

**AC-COV-07**  
WHEN a manager opens the team view THEN the system SHALL display a summary row per representative showing: name, effective visits, planned not executed, behind-target customers, effective rate, and follow-up completion rate.

**AC-COV-08**  
WHEN the manager taps a representative's row THEN the system SHALL navigate to that representative's detailed coverage view.

**AC-COV-09**  
WHEN the manager applies a segment filter THEN all metrics SHALL update to reflect only that segment.

---

### Segment Coverage Comparison

**AC-COV-10**  
WHEN the segment comparison view is displayed THEN the system SHALL show one row per segment (within the manager's scope) with: total customers, visited, coverage %, effective visit rate, behind-target count.

---

### Market Segment Scoping

**AC-COV-11**  
All dashboard data SHALL apply the two-dimensional authorization rule (Spec 10). A manager only sees data for representatives, customers, and segments within their authorized scope.

---

## Design

### Dashboard Layout (Manager View)

```
┌─────────────────────────────────────────────┐
│ Cobertura & Execução                [Filtros]│
│ Este mês · [Todos os segmentos ▼]            │
├─────────────────────────────────────────────┤
│ RESUMO DA EQUIPE                            │
│ 142 clientes · 88 visitados (62%)           │
│ 54 visitas efetivas · 12 ineficazes         │
│ 18 clientes em risco de abandono            │
├─────────────────────────────────────────────┤
│ REPRESENTANTE       EFETIVAS  META  TAXA    │
│ Rafael Melo         22/30      80%  82%     │
│ Ana Lima            18/30      73%  78%     │
│ Pedro Costa         10/30      42%  55% ⚠  │
├─────────────────────────────────────────────┤
│ POR SEGMENTO        VISITADOS  COBERTURA    │
│ Dermatologia        32/50       64%         │
│ Ortopedia           56/92       61%         │
├─────────────────────────────────────────────┤
│ CLIENTES NÃO VISITADOS (54)                 │
│ Clinica X · 78 dias · Em risco de abandono │
│ Dr. João  · 45 dias · Atrás na meta        │
└─────────────────────────────────────────────┘
```

### Data Models

```typescript
interface CoverageMetrics {
  period: DateRange;
  segmentIds: string[];
  representativeId?: string;

  totalCustomers: number;
  visitedCustomers: number;
  notVisitedCustomers: number;
  behindTargetCustomers: number;
  abandonmentRiskCustomers: number;

  effectiveVisits: number;
  ineffectiveVisits: number;
  plannedNotExecuted: number;
  effectiveRate: number;                  // %

  availableWorkingDays: number;
  absenceDays: number;
  effectiveVisitsPerAvailableDay: number;

  followUpsPending: number;
  followUpsOverdue: number;
  followUpCompletionRate: number;
}

interface NotVisitedCustomer {
  entityId: string;
  entityName: string;
  entityType: 'clinic' | 'doctor';
  segmentIds: string[];
  daysSinceLastEffectiveVisit: number;
  frequencyStatus: 'behind' | 'overdue' | 'no_target';
  isAbandonmentRisk: boolean;
  representativeId: string;
}
```

### Open Questions

1. Should the "abandonment risk" threshold (default 60 days) be configurable per segment or globally?
2. ~~Should this replace or extend Spec 03?~~ **Resolved:** Extend — Spec 23 is the manager's team view; Spec 03 is the rep's personal view. Both exist. See overview note.
3. Can representatives see each other's metrics, or only their own?
4. Is there a drill-through from "not visited" list to the agenda to immediately plan a visit?
