# Spec: Cadastro Health

**Domain:** Cadastro Health  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 04 — Client Management](./04-client-management.md), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 21 — Requests & Approval Workflows](./21-requests-approvals.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. The existing Clinic/Doctor models (F-013/F-014) provide the base data. The registry ingestion system (F-016) already tracks `sourceContentHash` and `manuallyEditedAt` — this data feeds into freshness scoring. No `CadastroHealth` score model exists yet. The "edit suggestion → approval" flow (Spec 21) is the correction pathway referenced here.

---

## Overview

Cadastro health measures the completeness, freshness, and operational readiness of customer records (clinics, doctors, establishments). Without healthy cadastro data, the CRM cannot correctly scope queries, deliver accurate pre-visit intelligence, or support AI recommendations. This spec defines required and recommended fields per entity type, a health score model, freshness rules, and the workflow for identifying and correcting gaps.

> **Relationship to existing specs:** Spec 03 (BI Dashboard) already has a "Data Quality" card at a high level. Spec 04 (Client Management) has an edit suggestion flow. This spec provides the data model, scoring rules, and manager-facing detail behind both of those surfaces.

---

## User Stories

**US-CAD-01 — See a Customer's Health Score**  
As a field representative, I want to see a health indicator on a customer's profile so that I know whether the record is complete before I use it for planning.

**US-CAD-02 — Identify Missing Fields**  
As a field representative, I want to see exactly which fields are missing or outdated on a customer record, so that I can submit corrections efficiently.

**US-CAD-03 — Submit Data Corrections**  
As a field representative, I want to submit corrections for missing or incorrect fields, routed through the approval workflow if required, so that data quality improves over time.

**US-CAD-04 — Manager Monitors Data Quality**  
As a manager, I want to see a data quality summary for my territory and segment, so that I can prioritize which records need attention.

**US-CAD-05 — Admin Configures Field Rules**  
As an admin, I want to define which fields are required, recommended, or optional per entity type, so that the health model reflects business priorities.

---

## Requirements & Acceptance Criteria

### Health Score Model

**AC-CAD-01**  
WHEN a customer record is evaluated THEN the system SHALL compute a health score (0–100) based on the presence and freshness of required and recommended fields.

**AC-CAD-02**  
WHEN a required field is missing THEN it SHALL contribute a larger penalty to the score than a missing recommended field.

**AC-CAD-03**  
WHEN a record has not been confirmed or updated within the configured freshness window (default: 12 months) THEN the system SHALL apply a freshness penalty to the score regardless of field completeness.

**AC-CAD-04**  
WHEN a score is computed THEN the system SHALL assign a status category:

| Score Range | Status | Label |
|------------|--------|-------|
| 85–100 | healthy | Saudável |
| 60–84 | incomplete | Incompleto |
| 30–59 | outdated | Desatualizado |
| 0–29 | critical | Crítico |

---

### Required and Recommended Fields

#### Doctor

| Field | Class |
|-------|-------|
| name | required |
| CRM / professional ID | required |
| specialty | required |
| primary clinic | required |
| territory assignment | required |
| market segment assignment | required |
| active status | required |
| phone | recommended |
| email | recommended |
| WhatsApp | recommended |
| visit address | recommended |
| preferred visit hours | recommended |
| consent status | recommended |
| birthday | optional |

#### Clinic

| Field | Class |
|-------|-------|
| name | required |
| CNPJ | required |
| address | required |
| territory assignment | required |
| market segment assignment | required |
| active status | required |
| phone | recommended |
| email | recommended |
| business hours | recommended |
| assigned representative | recommended |
| specialty list | recommended |
| website | optional |

**AC-CAD-05**  
WHEN the market segment field is empty on a customer record THEN the system SHALL set the health status to `critical` regardless of other field completeness, because unclassified records cannot be correctly scoped.

---

### Health Score on Customer Profile

**AC-CAD-06**  
WHEN a customer profile is opened THEN the system SHALL display the health status chip (Saudável / Incompleto / Desatualizado / Crítico) in the header.

**AC-CAD-07**  
WHEN the user taps the health chip THEN the system SHALL open a health detail view listing all fields, their status (filled / missing / outdated), and a "Corrigir" button per missing or outdated field.

**AC-CAD-08**  
WHEN the user taps "Corrigir" on a field THEN the system SHALL open the Edit Suggestion modal (Spec 04 AC-CRM-50) pre-filled with the field name and current value (if any).

---

### Freshness Rules

**AC-CAD-09**  
WHEN any required or recommended field was last confirmed more than the configured freshness window ago THEN the system SHALL flag the field as `outdated`.

**AC-CAD-10**  
WHEN a representative visits a customer and confirms their data is correct THEN the system SHALL offer a "Confirmar dados" action that resets the freshness clock for all visible fields without submitting a change.

---

### Manager Dashboard

**AC-CAD-11**  
WHEN a manager opens the data quality view (accessible from the BI Dashboard) THEN the system SHALL display:
- Summary bar: counts of Healthy / Incomplete / Outdated / Critical records
- Filterable by: representative, territory, market segment, entity type, health status
- A sortable list of records with their health scores and top missing fields

**AC-CAD-12**  
WHEN the manager filters by `critical` THEN the system SHALL highlight records where the market segment field is missing.

---

### Market Segment Scoping

**AC-CAD-13**  
All health score queries and data quality views SHALL apply the two-dimensional authorization rule (Spec 10). A representative only sees health issues for customers within their territory and segment.

---

## Design

### Health Score Calculation (example weights)

```
score = 100
  − (missing_required_fields × 15)
  − (missing_recommended_fields × 5)
  − (freshness_penalty: 0 if fresh, up to 20 if > 24 months stale)

clamp(score, 0, 100)
```

### Data Models

```typescript
type HealthStatus = 'healthy' | 'incomplete' | 'outdated' | 'critical';
type FieldClass = 'required' | 'recommended' | 'optional';
type FieldHealthStatus = 'filled' | 'missing' | 'outdated';

interface CadastroHealth {
  entityId: string;
  entityType: 'clinic' | 'doctor';
  score: number;
  status: HealthStatus;
  lastConfirmedAt?: Date;
  lastUpdatedAt: Date;
  fields: FieldHealth[];
}

interface FieldHealth {
  fieldName: string;
  fieldClass: FieldClass;
  status: FieldHealthStatus;
  value?: string;
  lastUpdatedAt?: Date;
}

interface FieldDefinition {
  entityType: 'clinic' | 'doctor';
  fieldName: string;
  fieldClass: FieldClass;
  freshnessWindowDays: number;
  penaltyWeight: number;
}
```

### Open Questions

1. Should field definitions be configurable per market segment (e.g. Aesthetics requires different fields than Orthopedics)?
2. Who can approve that a record's data is fresh without submitting a change (the rep, the manager)?
3. Should records with `critical` health be excluded from certain workflows (e.g. cannot create an order for a clinic with a missing CNPJ)?
4. Is there a report that shows which representative has the most critical-health records in their territory?
