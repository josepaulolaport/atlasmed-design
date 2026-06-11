# Spec: Customer Segmentation Surveys

**Domain:** Customer Segmentation Surveys  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 04 — Client Management](./04-client-management.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `SurveyVersion` or `SurveyResult` models. The existing Clinic/Doctor CRUD (F-013/F-014) is in place to attach surveys to. Prerequisite chain: Spec 10 → **this spec**.

---

## Overview

Customer segmentation is distinct from market segmentation (Spec 10). Market segmentation controls which business vertical a user, product, or material belongs to. Customer segmentation classifies the commercial potential, priority, profile, and strategic value of a doctor, clinic, or establishment *within* a market segment. Segmentation is applied through configurable surveys that produce classifications such as high/medium/low potential, difficult access, strong relationship, or competitor loyalist.

These classifications influence visit frequency targets, agenda prioritization, product recommendation, and manager dashboards.

---

## User Stories

**US-CS-01 — Conduct Segmentation Survey**  
As a field representative, I want to fill in a segmentation survey for a doctor or clinic, so that the system can classify them for planning purposes.

**US-CS-02 — View Segmentation Result**  
As a field representative, I want to see a customer's current segmentation (e.g. "Alto potencial · Dermatologia"), so that I know their priority before planning a visit.

**US-CS-03 — Manager Monitors Segmentation Coverage**  
As a manager, I want to see which customers in my territory and segment have not yet been segmented or have an expired segmentation, so that I can assign the work to my team.

**US-CS-04 — Admin Designs Surveys**  
As an admin, I want to create and version segmentation surveys with configurable questions, answer options, and scoring rules, so that the business can refine its segmentation model over time.

**US-CS-05 — Segment-Specific Classification**  
As a manager, I want a doctor to have potentially different segmentation results per market segment (e.g. high priority for Dermatology, low for Orthopedics), so that each team has accurate priority data for their own market.

---

## Requirements & Acceptance Criteria

### Survey Design (Admin)

**AC-CS-01**  
WHEN an admin creates a segmentation survey THEN the system SHALL require: name, description, version, applicable market segments, applicable customer types (clinic/doctor/establishment), and a list of questions.

**AC-CS-02**  
WHEN a question is created THEN the system SHALL allow the following answer types: single-choice, multiple-choice, numeric, yes/no, and free-text.

**AC-CS-03**  
Survey templates support **free edit** — a template can be edited at any time without creating a new version. Historical `SurveyResult` records are protected via a `templateSnapshot` JSON field that captures the full template definition at the time of submission (see Data Models). This means edits to the live template do not retroactively alter past results.

Note: some `SurveyResult` data may originate from data extraction pipelines rather than in-app survey completion. These results must also include a `templateSnapshot` (or null if the template was not known at extraction time).

**AC-CS-04**  
WHEN a survey version is deactivated THEN it SHALL not be offered for new segmentation but SHALL remain linked to historical records that used it.

---

### Conducting a Survey

**AC-CS-05**  
WHEN a representative views a customer profile THEN the system SHALL display the customer's segmentation status: Não segmentado / Pendente / Segmentado (with date and version) / Expirado / Requer revisão.

**AC-CS-06**  
WHEN the representative taps "Segmentar" or "Revisar segmentação" THEN the system SHALL open the active survey for the customer's market segment(s).

**AC-CS-07**  
WHEN a customer belongs to multiple market segments THEN the system SHALL run each segment's active survey independently, producing segment-specific classifications.

**AC-CS-08**  
WHEN the representative completes and submits a survey THEN the system SHALL store all answers linked to: customer, market segment, survey version, representative, and timestamp.

**AC-CS-09**  
WHEN a survey result is computed THEN the system SHALL apply the configured scoring rules and store the resulting classification (e.g. `high_potential`, `medium_potential`, `low_potential`, `difficult_access`, `competitor_loyalist`).

---

### Classification Results

**AC-CS-10**  
WHEN a classification is computed THEN it SHALL be stored with: entityId, segmentId, surveyVersionId, classification code, score (if numeric), computed date, and representative who conducted it.

**AC-CS-11**  
WHEN a segmentation expires (configurable TTL per survey, e.g. 6 months) THEN the customer's status SHALL change to `Expirado` and the customer SHALL appear in the "requires re-segmentation" filter.

**AC-CS-12**  
WHEN the system recommends a visit frequency target THEN it SHALL use the customer's classification for the relevant market segment as one input.

---

### Manager Monitoring

**AC-CS-13**  
WHEN a manager views the segmentation coverage report THEN the system SHALL show: total customers, segmented count, pending count, not-segmented count, expired count — filterable by representative, market segment, and customer type.

**AC-CS-14**  
WHEN a manager views a customer's segmentation history THEN the system SHALL show all past survey results with version, date, representative, answers, and resulting classification.

---

### Market Segment Scoping

**AC-CS-15**  
Survey results for a customer SHALL only be visible to users who share at least one market segment with the customer (two-dimensional rule, Spec 10). A representative assigned only to Dermatology SHALL see only the Dermatology segmentation result for a shared customer.

---

## Design

### Data Models

```typescript
type SegmentationStatus =
  | 'not_segmented'
  | 'pending'
  | 'segmented'
  | 'expired'
  | 'requires_review';

type QuestionType = 'single_choice' | 'multiple_choice' | 'numeric' | 'yes_no' | 'free_text';

type CustomerClassification =
  | 'high_potential'
  | 'medium_potential'
  | 'low_potential'
  | 'difficult_access'
  | 'strong_relationship'
  | 'competitor_loyalist'
  | 'product_fit'
  | 'strategic_priority'
  | 'not_relevant';

// SurveyTemplate is the canonical live-template shape used by both the active template store
// and as the snapshot type embedded in SurveyResult.templateSnapshot.
type SurveyTemplate = SurveyVersion;

interface SurveyVersion {
  id: string;
  name: string;
  description: string;
  version: number;
  segmentIds: string[];
  applicableEntityTypes: ('clinic' | 'doctor' | 'establishment')[];
  questions: SurveyQuestion[];
  scoringRules: ScoringRule[];
  expirationDays: number;
  isActive: boolean;
  createdAt: Date;
}

interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: SurveyOption[];
  weight: number;
  isRequired: boolean;
}

interface SurveyOption {
  id: string;
  label: string;
  score: number;
}

interface SurveyResult {
  id: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  segmentId: string;
  surveyId: string;                      // references the live template
  templateSnapshot: SurveyTemplate;     // full copy of the template at submission time; protects against template edits
  conductedBy: string;                   // userId
  source: 'in_app' | 'data_extraction'; // origin of the result
  conductedAt: Date;
  answers: SurveyAnswer[];
  totalScore: number;
  classification: CustomerClassification;
  expiresAt: Date;
}

interface SurveyAnswer {
  questionId: string;
  selectedOptionIds?: string[];
  numericValue?: number;
  textValue?: string;
}

interface ScoringRule {
  minScore: number;
  maxScore: number;
  classification: CustomerClassification;
}
```

### Integration Points

| Feature | How segmentation is used |
|---------|--------------------------|
| Visit Frequency Targets (Spec 11) | High-potential customers get higher frequency targets |
| Agenda Planning (Spec 15) | Unplanned high-priority customers sorted by classification |
| Pre-Visit Intelligence (Spec 14) | Classification displayed in briefing |
| Coverage Dashboard (Spec 23) | Segmentation coverage tracked per segment |
| Manager Coaching (Spec 24) | Reps with low segmentation coverage flagged |

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Survey answered offline | Saved locally; synced on reconnect with original timestamp |
| Survey template edited while rep has it open | Rep completes with the in-session copy they loaded; `templateSnapshot` is captured at submit. No forced restart. |
| Customer has conflicting classifications across two segments | Each segment retains its own independent result; no conflict |
| Representative answers survey for out-of-scope customer | Blocked by two-dimensional auth rule at API level |

### Open Questions

1. Can a manager override a classification result without re-running the survey?
2. Should segmentation history be visible to the customer (future patient/doctor portal)?
3. Is there a maximum number of questions per survey for mobile usability?
4. Should the classification influence the priority indicator on the customer list card directly?

> **Survey versioning:** Resolved. Free edit with `templateSnapshot` on each result. See AC-CS-03 and `SurveyResult.templateSnapshot`. Offline: Drift `survey_results` stores `templateSnapshot` as a JSON text column (Spec 32).

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-76](https://linear.app/atlasmed/issue/ATLAS-76/) | Parent | Spec 16: Customer Segmentation Surveys | Backlog |
| [ATLAS-77](https://linear.app/atlasmed/issue/ATLAS-77/) | [BE] | Surveys — template model, response API & snapshot storage | Backlog |
| [ATLAS-78](https://linear.app/atlasmed/issue/ATLAS-78/) | [WE] | Surveys — admin template builder | Backlog |
| [ATLAS-79](https://linear.app/atlasmed/issue/ATLAS-79/) | [MOB] | Surveys — Flutter offline survey form | Backlog |
| [ATLAS-174](https://linear.app/atlasmed/issue/ATLAS-174/) | [DESIGN] | Spec 16: Surveys — admin template builder UI | Backlog |
