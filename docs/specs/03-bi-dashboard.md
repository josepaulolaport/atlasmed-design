# Spec: BI / Performance Dashboard

**Domain:** BI / Performance Dashboard (Desempenho)  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 06 — Orders](./06-orders.md) (revenue/order KPIs), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md) (product mix metrics), [Spec 17 — Cadastro Health](./17-cadastro-health.md) (data quality card), [Spec 23 — Coverage Dashboard](./23-coverage-execution-dashboard.md), [Spec 24 — Manager Coaching](./24-manager-coaching.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| BI / Performance Dashboard | ❌ **Not started** | No Visit or analytics model exists yet |
| All drill-down screens | ❌ **Not started** | Depends on Spec 11 (visits), Spec 23 (coverage) |
| **Prerequisites** | — | Spec 10 → Spec 11 → Spec 12 → this spec; Spec 06 required for revenue/conversion KPIs (multi-tenancy deferred for MVP — see Spec 00-multi-tenancy) |

> This spec describes the **rep's personal mobile BI dashboard** (Desempenho tab). It shows the rep's own performance: their own visits, conversion, territory coverage, and data quality. It is **not** the same as Spec 23 (Coverage & Execution Dashboard).
>
> **Spec 03 vs Spec 23:**
> - **Spec 03** = rep's personal view (mobile); answers "How am I performing?"; audience = field rep
> - **Spec 23** = manager's team coverage view (web + mobile); answers "How is my team performing?"; audience = manager
>
> Both specs consume the same underlying visit/frequency/coverage APIs. Spec 23 does not replace Spec 03.
>
> A web analytics placeholder exists at `/dashboard` (F-018) but has no content. The metrics defined here require Visit, FrequencyTarget, and Coverage data models to exist first.

---

## Overview

The Performance Dashboard (Desempenho) is the app's primary analytics surface. It gives field representatives a consolidated view of their commercial performance, visit activity, territory coverage, conversion funnel, and data quality — all adjustable by time period. Each summary card is tappable and navigates to a dedicated drill-down screen. A separate metric drill-down component (`BIDrilldownScreen`) provides day-level charts and exportable data tables for the four main KPIs.

---

## User Stories

**US-BI-01 — Commercial Overview**  
As a field representative, I want to see my revenue, order count, and average ticket for the selected period, so that I know how my sales are performing at a glance.

**US-BI-02 — Visit Goal Tracking**  
As a field representative, I want to see my visit progress against my target with a daily chart and a projection, so that I can gauge whether I am on pace to hit my goal.

**US-BI-03 — Territory Coverage**  
As a field representative, I want to see how many of my territory clinics are active, at-risk, or untouched, so that I know where to focus my effort.

**US-BI-04 — Conversion Funnel**  
As a field representative, I want to see how many of my visits converted to sales, so that I can evaluate the quality of my interactions.

**US-BI-05 — Data Quality**  
As a field representative, I want to know how complete my CRM records are, so that I can prioritize filling in missing data.

**US-BI-06 — Period Filtering**  
As a field representative, I want to switch the dashboard between weekly, monthly, and quarterly views, so that I can compare performance across different time horizons.

**US-BI-07 — Drill into Metrics**  
As a field representative, I want to tap any summary card and see a detailed chart with daily breakdowns, so that I can investigate trends and anomalies.

**US-BI-08 — Export Metric Data**  
As a field representative, I want to export a metric drill-down as a CSV file, so that I can share it with my manager or process it in a spreadsheet.

---

## Requirements & Acceptance Criteria

### Main Dashboard

**AC-BI-01**  
WHEN the user opens the Desempenho section THEN the system SHALL display the main dashboard with all summary cards and a data freshness indicator.

**AC-BI-02**  
WHEN the user changes the period filter (Semana / Mês / Trimestre) THEN the system SHALL reload all cards for the selected period and update all metric values and comparisons.

**AC-BI-03**  
WHEN data was last fetched THEN the system SHALL display "Atualizado há X minutos" and indicate online/offline connectivity.

---

### Commercial Summary Card

**AC-BI-04**  
WHEN the commercial card is displayed THEN the system SHALL show: accumulated revenue (R$) with % change vs prior period, order count with absolute change, and average ticket (R$) with % change.

**AC-BI-05**  
WHEN the user taps the revenue, orders, or ticket sub-metric THEN the system SHALL navigate to the commercial drill-down screen focused on that metric.

---

### Visit Goal Progress Card

**AC-BI-06**  
WHEN the visit goal card is displayed THEN the system SHALL show: visits completed vs target, pace vs expected (% above/below), projected total at current rate, days remaining in period, and a daily bar chart with a goal-line overlay.

**AC-BI-07**  
WHEN the user taps "Ver atividade" THEN the system SHALL navigate to the activity detail drill-down.

---

### Recent Activity Preview

**AC-BI-08**  
WHEN the recent activity section is displayed THEN the system SHALL show the last 4 activity items with type icon, entity name, and relative time.

**AC-BI-09**  
WHEN the user taps "Ver todas" THEN the system SHALL navigate to the full Activity Log screen.

---

### Territory Overview Card

**AC-BI-10**  
WHEN the territory card is displayed THEN the system SHALL show clinic counts broken down by status: Ativas, Em risco, and Nunca compraram, each with an absolute count and percentage.

**AC-BI-11**  
WHEN the territory card is displayed THEN the system SHALL show a coverage banner: "X de Y clínicas visitadas (Z%)".

**AC-BI-12**  
WHEN the user taps a territory status row THEN the system SHALL navigate to the clinic status drill-down filtered to that status.

---

### Conversion Funnel Card

**AC-BI-13**  
WHEN the conversion card is displayed THEN the system SHALL show: total visits, interest rate (%), and conversion rate (%) with an info tooltip explaining how conversion is calculated.

**AC-BI-14**  
WHEN the user taps the conversion card THEN the system SHALL navigate to the conversion detail drill-down.

---

### Data Quality Card

**AC-BI-15**  
WHEN the data quality card is displayed THEN the system SHALL show a completeness percentage, the count of complete records, and the count of incomplete records.

**AC-BI-16**  
WHEN the user taps "Corrigir cadastros" THEN the system SHALL navigate to the data quality detail screen.

---

### Commercial Drill-down (`ComercialDetailScreen`)

**AC-BI-17**  
WHEN the commercial drill-down opens THEN the system SHALL display metric tabs: Receita, Pedidos, Ticket.

**AC-BI-18**  
WHEN a metric tab is selected THEN the system SHALL display a chart for that metric with controls for: period, granularity (dia/semana), and chart mode (aggregate vs cumulative).

**AC-BI-19**  
WHEN the user scrubs the chart THEN the system SHALL display the exact value for the selected data point.

**AC-BI-20**  
WHEN the drill-down includes events THEN the system SHALL render them on the events timeline below the chart.

---

### Activity Detail Drill-down (`AtividadeDetailScreen`)

**AC-BI-21**  
WHEN the activity drill-down opens THEN the system SHALL display visit activity metrics with daily charts.

**AC-BI-22**  
WHEN the user taps a KPI sub-metric (follow-ups, new clinics) THEN the system SHALL navigate to the corresponding filtered sub-list screen (`AtvKpiListScreen`).

---

### Territory Detail Drill-down (`TerritoryDetailScreen`)

**AC-BI-23**  
WHEN the territory drill-down opens THEN the system SHALL display a coverage hero and clinic lists grouped as visited and not visited.

**AC-BI-24**  
WHEN the territory drill-down is displayed THEN the system SHALL show a category breakdown of clinic types.

---

### Clinic Status Drill-down (`ClinicStatusScreen`)

**AC-BI-25**  
WHEN the clinic status screen opens THEN the system SHALL display the full funnel with clinic rows per status, each row tappable to go to the clinic detail.

---

### Conversion Drill-down (`ConversionDetailScreen`)

**AC-BI-26**  
WHEN the conversion drill-down opens THEN the system SHALL display a funnel visualization, a visits list, and search + sort controls.

---

### Data Quality Drill-down

**AC-BI-27**  
WHEN the data quality drill-down opens THEN the system SHALL list all clinics and doctors with incomplete records.

**AC-BI-28**  
WHEN the user taps an incomplete record THEN the system SHALL open the per-entity field editor where missing fields are highlighted and editable via the Edit Suggestion flow.

---

### BI Metric Drill-down (`BIDrilldownScreen`)

Available for: sales (R$), visits, orders, conversion.

**AC-BI-29**  
WHEN the metric drill-down opens THEN the system SHALL display: date range picker (Hoje / 7 dias / 30 dias / Trimestre / YTD), hero KPI card with growth %, summary stats (avg/day, peak, trend), an interactive chart with Linha / Barra toggle, a composition breakdown with share bars, and an expandable detailed data table.

**AC-BI-30**  
WHEN the user selects a date range THEN the system SHALL reload all values and the chart for that range.

**AC-BI-31**  
WHEN the user toggles the chart type THEN the system SHALL switch between line and bar chart representations of the same data.

**AC-BI-32**  
WHEN the user taps the export button THEN the system SHALL export the detailed data table (currently visible date range) as a CSV file.

---

## Design

### Screen Hierarchy

```
MainDashboard
├── ComercialDetailScreen (Receita / Pedidos / Ticket tabs)
│   └── OrderQuickViewScreen (order timeline overlay)
├── AtividadeDetailScreen
│   └── AtvKpiListScreen (follow-ups / new clinics)
├── TerritoryDetailScreen
├── ClinicStatusScreen → ClinicDetailScreen
├── ConversionDetailScreen
├── DataQualityDetailScreen
│   └── IncompleteDetailScreen → EditSuggestionModal
└── BIDrilldownScreen (sales | visits | orders | conversion)
```

### Data Models

```typescript
type DashboardPeriod = 'week' | 'month' | 'quarter';

interface CommercialSummary {
  revenue: number;
  revenueGrowth: number;       // % vs prior period
  orderCount: number;
  orderCountDelta: number;     // absolute change
  avgTicket: number;
  avgTicketGrowth: number;
}

interface VisitGoal {
  completed: number;
  target: number;
  pace: number;               // % above/below expected pace
  projection: number;         // projected total at current rate
  daysRemaining: number;
  dailyBars: DailyBar[];
  dailyGoalLine: number;
}

interface DailyBar {
  date: Date;
  value: number;
}

interface TerritoryOverview {
  active: number;
  atRisk: number;
  neverBought: number;
  total: number;
  visitedCount: number;
}

interface ConversionFunnel {
  visits: number;
  // interestRate: % of visit records that include at least one product promotion (demonstração, entrega, interesse).
  // Denominator = total effective visits in period.
  interestRate: number;
  // conversionRate: % of effective visits followed by an order within 30 days (Spec 06 cross-join).
  // Card hidden / shows "—" when Spec 06 (Orders) is not yet deployed.
  conversionRate: number;
}

interface DataQualitySummary {
  completenessPercent: number;
  filledCount: number;
  incompleteCount: number;
}

interface MetricDrilldown {
  metricId: 'sales' | 'visits' | 'orders' | 'conversion';
  dateRange: DateRange;
  total: number;
  growthPercent: number;
  avgPerDay: number;
  peak: number;
  trend: 'up' | 'down' | 'stable';
  chartData: DailyBar[];
  composition: CompositionItem[];
  tableRows: TableRow[];
}

interface CompositionItem {
  label: string;
  value: number;
  sharePercent: number;
}

interface TableRow {
  date: Date;
  value: number;
}

type DateRange = 'today' | '7d' | '30d' | 'quarter' | 'ytd';
```

### Chart Requirements

- Mobile charts: `fl_chart` (Flutter). Web charts: Recharts. See Spec 32 key packages.
- Line chart: smooth bezier curve, dot on each data point, tooltip on press/scrub.
- Bar chart: grouped or stacked depending on metric, tap to see value.
- Goal line overlay: dashed horizontal line at the daily target value.
- All charts must handle empty data gracefully (placeholder / no-data state).

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| API returns no data for period | Show "Sem dados para este período" empty state per card |
| Offline | Show last-cached values with a "Dados offline" banner |
| Partial data (period still in progress) | Show partial bar/line up to current date |
| Chart scrub on mobile | Respond to pan gesture, not just tap |
| CSV export fails | Toast error with retry option |

### Performance Considerations

- Main dashboard cards should load independently (skeleton per card, not full-page spinner).
- Chart data should be paginated or limited to the selected date range (avoid loading 365 days of daily data by default).
- Cache the last successful response to support offline viewing.

### Market Segmentation Note

All dashboard metrics in this spec are computed over records within the user's authorized territory AND segments (see Spec 10, AC-SEG-14). A period filter dropdown SHALL include a segment filter when the user is assigned to multiple segments, allowing them to view metrics per segment or aggregated across all their segments.

### Visit Lifecycle Note

The visit counts displayed in this spec (visit goal progress, activity detail) SHALL count only **effective** visits toward the representative's target, as defined in [Spec 11 — Visit Lifecycle & Frequency Targets](./11-visit-lifecycle-frequency.md), AC-VL-08. Ineffective visits appear in activity logs but are not included in goal progress.

### Open Questions

1. Are KPIs defined and calculated server-side or client-side?
2. Is there a manager view that shows team aggregates alongside personal metrics?
3. What is the data refresh cadence (pull-to-refresh, polling, WebSocket)?
4. Are territory coverage percentages based on visit frequency or order frequency?
5. ~~What constitutes a "conversion"?~~ **Resolved:** A conversion is an order placed within **30 days** of an effective visit to that clinic/doctor. The funnel uses effective visit count as the denominator. Spec 06 (Orders) is required for this metric to work.

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-96](https://linear.app/atlasmed/issue/ATLAS-96/) | Parent | Spec 03: BI / Performance Dashboard | Backlog |
| [ATLAS-97](https://linear.app/atlasmed/issue/ATLAS-97/) | [BE] | BI Dashboard — performance aggregation API | Backlog |
| [ATLAS-98](https://linear.app/atlasmed/issue/ATLAS-98/) | [MOB] | BI Dashboard — Flutter performance charts | Backlog |
