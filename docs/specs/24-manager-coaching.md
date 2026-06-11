# Spec: Manager Coaching Dashboard

**Domain:** Manager Coaching Dashboard  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10

> **Implementation status:** Not started. Highest dependency depth — requires Spec 11, 12, 13, 16, 23, 28 to all be in place before meaningful data exists. Recommend building the data models first; the coaching dashboard UI is the last layer.  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 13 — Presentation Observability](./13-presentation-observability.md), [Spec 23 — Coverage Dashboard](./23-coverage-execution-dashboard.md), [Spec 28 — Visit Quality Score](./28-visit-quality-score.md)

---

## Overview

The Manager Coaching Dashboard helps managers understand *how* their team is working, not just *how much*. While the Coverage & Execution Dashboard (Spec 23) tracks quantity (visits completed, targets met), this dashboard surfaces quality signals: which representatives are skipping product promotion, which presentations are being rushed, which have poor next-visit objectives, and where coaching conversations are most needed. All metrics respect market segment and territory scope.

---

## User Stories

**US-COACH-01 — Identify Coaching Priorities**  
As a manager, I want a ranked view of my team's coaching needs, so that I know which representative to focus on this week.

**US-COACH-02 — Drill Into a Representative's Behavior**  
As a manager, I want to drill into a representative's visits, product promotions, and presentation quality to see specific patterns, so that coaching conversations are grounded in data.

**US-COACH-03 — Spot Recurring Patterns**  
As a manager, I want to see which representatives consistently skip product promotions, rush presentations, or fail to set next-visit objectives, so that I can distinguish one-off issues from habits.

**US-COACH-04 — Monitor Presentation Execution**  
As a manager, I want to see presentation completion rates and quality scores per representative and product, so that I know whether CLM materials are being used correctly.

**US-COACH-05 — Track Segmentation Coverage**  
As a manager, I want to see which customers in my segment have not been segmented yet, so that I can assign the work to my team.

---

## Requirements & Acceptance Criteria

### Team Coaching Overview

**AC-COACH-01**  
WHEN a manager opens the coaching dashboard THEN the system SHALL display a ranked list of representatives ordered by coaching priority score (lowest performing first), with period filter and segment filter.

**AC-COACH-02**  
WHEN a representative row is displayed THEN the system SHALL show: effective visit rate, product promotion rate (visits with ≥1 product promoted), presentation completion rate, average visit quality score, follow-up completion rate, and a coaching priority badge (high / medium / low need).

---

### Representative Drill-Down

**AC-COACH-03**  
WHEN a manager taps a representative THEN the system SHALL show their coaching detail page with sections:
- Visitas: effective vs ineffective breakdown, top ineffective reasons
- Promoção de produtos: products promoted vs not promoted, interest levels, top objections from structured comments
- Apresentações: completion rate, avg quality score, top skipped slides
- Follow-ups: completion rate, overdue count
- Objetivos de próxima visita: % of visits with an objective set
- Segmentação de clientes: customers not yet segmented in this period

**AC-COACH-04**  
WHEN the manager is on the drill-down page THEN the system SHALL allow navigation to specific visit records to see full detail.

---

### Presentation Execution Analysis

**AC-COACH-05**  
WHEN the presentation section is displayed THEN the system SHALL show per representative and per presentation: sessions count, completed sessions %, avg quality score, most skipped slides.

**AC-COACH-06**  
WHEN a quality score is below the alert threshold THEN the system SHALL surface a "Atenção" chip next to the representative's presentation metric.

---

### Market Segment Scoping

**AC-COACH-07**  
All coaching metrics SHALL apply the two-dimensional authorization rule. A manager can only coach on data within their authorized territory and segments.

---

## Design

### Coaching Priority Score (computed)

```
coaching_score = weighted_sum(
  effective_rate × 0.20,
  product_promotion_rate × 0.20,
  presentation_completion_rate × 0.20,
  avg_visit_quality_score × 0.15,
  followup_completion_rate × 0.15,
  next_objective_rate × 0.10
)

Lower coaching_score → higher coaching need
```

### Data Models

```typescript
interface RepresentativeCoachingProfile {
  representativeId: string;
  representativeName: string;
  period: DateRange;
  segmentIds: string[];

  effectiveRate: number;
  productPromotionRate: number;
  presentationCompletionRate: number;
  avgVisitQualityScore: number;
  followUpCompletionRate: number;
  nextObjectiveRate: number;

  coachingPriorityScore: number;
  coachingPriorityLevel: 'high' | 'medium' | 'low';

  topIneffectiveReasons: { reason: string; count: number }[];
  topProductComments: { comment: string; count: number }[];
  mostSkippedSlides: { presentationId: string; slideIndex: number; skipRate: number }[];
  unsegmentedCustomerCount: number;
}
```

### Open Questions

1. Should the manager be able to leave a coaching note tied to a specific visit or metric, visible to the representative?
2. Should coaching scores be visible to the representative themselves, or managers only?
3. Is there a planned V2 AI layer that generates coaching summaries in natural language?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-113](https://linear.app/atlasmed/issue/ATLAS-113/) | Parent | Spec 24: Manager Coaching Tools | Backlog |
| [ATLAS-114](https://linear.app/atlasmed/issue/ATLAS-114/) | [BE] | Manager Coaching — coaching notes & accompaniment API | Backlog |
| [ATLAS-115](https://linear.app/atlasmed/issue/ATLAS-115/) | [WE] | Manager Coaching — coaching web UI | Backlog |
| [ATLAS-182](https://linear.app/atlasmed/issue/ATLAS-182/) | [DESIGN] | Spec 24: Manager Coaching — coaching tools UI | Backlog |
