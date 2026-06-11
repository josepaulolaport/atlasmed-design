# Spec: Visit Quality Score

**Domain:** Visit Quality Score  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10

> **Implementation status:** Not started. Scoring is computed asynchronously via a BullMQ job (infrastructure already in place — F-010) after a visit is saved. The score and breakdown are stored on the `Visit` record. Prerequisite chain: Spec 11 → Spec 12 → Spec 13 → **this spec**.  
**Depends on:** [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 13 — Presentation Observability](./13-presentation-observability.md), [Spec 14 — Pre-Visit Intelligence](./14-pre-visit-intelligence.md), [Spec 19 — Sample Management](./19-sample-gift-management.md), [Spec 30 — Follow-Up Actions](./30-followup-actions.md) (follow-up creation as quality dimension)

---

## Overview

The visit quality score evaluates the substance of a visit, not just its existence. It helps managers shift from "how many visits happened" to "how well were visits executed." A score is computed for each effective visit using configurable dimensions: products promoted, presentation used and completed, structured comments recorded, samples registered, next visit objective set, and follow-up created. Scores are explainable and configurable per market segment.

---

## User Stories

**US-VQS-01 — See a Visit's Quality Score**  
As a manager, I want to see a quality score on each visit record, so that I can quickly identify visits that need coaching attention.

**US-VQS-02 — Understand Why a Score Is Low**  
As a manager, I want an explanation of what drove a low score (e.g. "no product promoted, no next objective"), so that coaching conversations are specific.

**US-VQS-03 — Representative Self-Assessment**  
As a field representative, I want to see my own quality scores after a visit, so that I can understand what a good visit looks like and improve proactively.

**US-VQS-04 — Segment-Specific Quality Rules**  
As an admin, I want to configure different quality dimensions per market segment, so that "high quality" is defined appropriately for each business vertical.

---

## Requirements & Acceptance Criteria

### Score Computation

**AC-VQS-01**  
WHEN an effective visit is saved THEN the system SHALL compute a quality score (0–100) asynchronously.

**AC-VQS-02**  
WHEN the score is computed THEN the system SHALL evaluate the following default dimensions:

| Dimension | Default Weight | Passes When |
|-----------|---------------|-------------|
| Visit is effective | — | Required precondition; ineffective visits are not scored |
| ≥1 product promoted | 20% | At least one product promotion record created |
| Presentation used | 20% | At least one presentation session linked to the visit |
| Presentation completed | 15% | Linked session quality score ≥ threshold (see Spec 13) |
| Structured comments recorded | 15% | At least 2 structured comments across all promoted products |
| Samples registered | 10% | Sample delivery recorded (or explicit "none delivered") |
| Next visit objective set | 10% | nextVisitObjective is not null (Spec 14) |
| Follow-up action created | 10% | At least one follow-up action created during or after the visit (Spec 30) |

> **Weight total: 100%.** Ineffective visits receive `null` score and no `VisitQualityScore` record is created.

**AC-VQS-03**  
WHEN a dimension is not applicable for a specific visit context (e.g. no sample items exist for the product) THEN the system SHALL skip that dimension and redistribute its weight proportionally.

**AC-VQS-04**  
WHEN the score is computed THEN the system SHALL generate an explainability breakdown: one line per dimension showing whether it passed, failed, or was skipped — and a plain-language reason for each failure.

---

### Score Categories

| Score Range | Category |
|------------|---------|
| 80–100 | Excelente |
| 60–79 | Bom |
| 40–59 | Regular |
| 0–39 | Precisa melhorar |

---

### Score Display

**AC-VQS-05**  
WHEN a visit is displayed (in history, coaching dashboard, or visit detail) THEN the system SHALL show the quality score badge and category.

**AC-VQS-06**  
WHEN the user taps the score badge THEN the system SHALL show the full explainability breakdown.

**AC-VQS-07**  
WHEN the representative adds context to a low-scoring visit (e.g. "Very brief interaction — doctor in a hurry") THEN the system SHALL save the context note alongside the score and display it to managers.

---

### Configuration

**AC-VQS-08**  
WHEN an admin configures quality rules per market segment THEN the system SHALL allow overriding dimension weights and enabling/disabling dimensions for that segment.

---

### Market Segment Scoping

**AC-VQS-09**  
Visit quality scores and configuration respect the two-dimensional authorization rule (Spec 10). Managers only see scores for visits in their territory and segment scope.

---

## Design

### Data Models

```typescript
type QualityCategory = 'excelente' | 'bom' | 'regular' | 'precisa_melhorar';

interface VisitQualityScore {
  visitId: string;
  score: number;
  category: QualityCategory;
  segmentId?: string;
  breakdown: QualityDimension[];
  contextNote?: string;
  computedAt: Date;
}

interface QualityDimension {
  code: string;
  label: string;
  weight: number;
  passed: boolean;
  skipped: boolean;
  contributedScore: number;
  failureReason?: string;
}

interface SegmentQualityConfig {
  segmentId: string;
  dimensions: {
    code: string;
    weight: number;
    isEnabled: boolean;
    thresholdOverride?: number;
  }[];
}
```

### Open Questions

1. Should quality scores be recomputed when a representative retroactively adds a product promotion or objective?
2. Should the score be visible to the representative immediately after saving the visit, or only after a configurable delay?
3. ~~Should there be a "minimum quality threshold" that triggers a notification to the manager?~~ **Resolved (deferred):** No push notification for low quality scores in V1. Managers surface this via the Coverage & Execution Dashboard (Spec 23) and Coaching Dashboard (Spec 24). A `visit_quality_alert` notification type may be added in V2 if coaching adoption is low.
4. Are there legal or union considerations around using quality scores for performance evaluation?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-89](https://linear.app/atlasmed/issue/ATLAS-89/) | Parent | Spec 28: Visit Quality Score | Backlog |
| [ATLAS-90](https://linear.app/atlasmed/issue/ATLAS-90/) | [BE] | Visit Quality Score — computation engine & API | Backlog |
| [ATLAS-91](https://linear.app/atlasmed/issue/ATLAS-91/) | [MOB] | Visit Quality Score — Flutter post-visit score card | Backlog |
| [ATLAS-163](https://linear.app/atlasmed/issue/ATLAS-163/) | [WE] | Visit Quality Score — manager quality reports & admin rule configuration | Backlog |
| [ATLAS-178](https://linear.app/atlasmed/issue/ATLAS-178/) | [DESIGN] | Spec 28: Visit Quality Score — quality dashboard & rule config UI | Backlog |
