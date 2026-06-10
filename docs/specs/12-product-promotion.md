# Spec: Product Promotion

**Domain:** Product Promotion (Portfolio · Promotion During Visits · Structured Comments)  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 19 — Sample Management](./19-sample-gift-management.md) (samples section), [Spec 26 — Medical Campaigns](./26-medical-campaigns.md) (campaign-ranked products), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `Product`, `ProductPromotion`, or `StructuredComment` models exist. Prerequisite chain: Spec 11 → **this spec**. The product catalog API and segment-scoped filtering must be built before any promotion recording.

---

## Overview

This spec covers three tightly coupled features:

1. **Product Portfolio** — the catalog of medical/pharmaceutical products that representatives promote, with segment-aware visibility and status management.
2. **Product Promotion During Visits** — the structured registration of which products were discussed with a customer during a visit, including what happened in each interaction.
3. **Structured Product Comments** — predefined, configurable comment options that describe what occurred during a product discussion, replacing free-text-only notes for analytical purposes.

Together these three features create a high-quality data layer for execution tracking, manager coaching, and future AI recommendations.

---

## User Stories

### Product Portfolio

**US-PP-01 — Browse the Product Portfolio**  
As a field representative, I want to see all products assigned to my market segments, so that I know what I am authorized to promote.

**US-PP-02 — View Product Details**  
As a field representative, I want to see a product's description, therapeutic area, category, associated materials, and segment assignment, so that I can prepare for product discussions.

**US-PP-03 — Admin Manages Products**  
As an admin, I want to create, activate, archive, and restrict products, so that the portfolio always reflects current business strategy.

### Product Promotion

**US-PP-04 — Register Promoted Products**  
As a field representative, I want to select which products I promoted during a visit and record what happened in each discussion, so that the CRM has structured data about product execution.

**US-PP-05 — Segment-Scoped Product Selection**  
As a field representative, I want the product list during visit registration to show only products relevant to my segments and the customer's segments, so that I am never prompted to promote out-of-scope products.

**US-PP-06 — Link Products to Materials**  
As a field representative, I want to see the approved CLM materials for a product I am promoting, so that I can open the correct presentation directly from the promotion screen.

### Structured Comments

**US-PP-07 — Select Structured Comments**  
As a field representative, I want to select one or more structured comments per promoted product (e.g. "Cliente mostrou interesse", "Solicitou material clínico"), so that the nature of each discussion is captured in a reportable format.

**US-PP-08 — Manager Analyzes Comment Patterns**  
As a manager, I want to see aggregated structured comments by product, representative, and segment, so that I can identify recurring objections, strong interest signals, and missed promotion opportunities.

**US-PP-09 — Marketing Views Comment Analytics**  
As an admin (ADMIN role), I want to see which comments appear most frequently for each product, so that I can refine messaging, training, and presentation materials.

---

## Requirements & Acceptance Criteria

### Product Portfolio

**AC-PP-01**  
WHEN an admin creates a product THEN the system SHALL require: name, category, therapeutic area, and at least one market segment. Status defaults to `active`.

**AC-PP-02**  
WHEN a product is set to `inactive` or `archived` THEN it SHALL not appear in promotion selection during new visits, but historical promotion records SHALL retain the reference.

**AC-PP-03**  
WHEN a product is `restricted` THEN it SHALL only be visible to users with an explicit exception grant in addition to the normal segment assignment.

**AC-PP-04**  
WHEN a representative views the product portfolio (from a customer profile or during a visit) THEN the system SHALL only show products whose segments intersect with BOTH the representative's assigned segments AND the customer's assigned segments.

**AC-PP-05**  
WHEN a product has associated CLM materials THEN the product card SHALL display a "Materiais disponíveis" indicator with count.

---

### Product Promotion During Visits

**AC-PP-06**  
WHEN a representative registers a visit as `effective` THEN the system SHALL display a "Produtos promovidos" section where they can add one or more product promotion records.

**AC-PP-07**  
WHEN a representative adds a product to the promotion list THEN the system SHALL present a product promotion form per product.

**AC-PP-08**  
WHEN the product promotion form is displayed THEN the system SHALL allow the representative to record for each product:
- Whether the product was discussed (`discussed: boolean`)
- Whether a CLM presentation was shown (`presentationShown: boolean`)
- Whether samples were delivered (`samplesDelivered: boolean` + optional quantity)
- Whether the customer showed interest (`interestLevel: 'none' | 'low' | 'medium' | 'high'`)
- One or more structured comments
- Optional free-text note (max 500 chars)

**AC-PP-09**  
WHEN `presentationShown = true` THEN the system SHALL allow the representative to link the specific presentation material version shown.

**AC-PP-10**  
WHEN the product list is displayed during promotion selection THEN the system SHALL rank products by: active campaigns first, then by segment relevance, then alphabetically.

**AC-PP-11**  
WHEN a visit has zero promoted products THEN the system SHALL still allow saving but SHALL flag the visit as "Sem produto promovido" for quality scoring purposes (see Spec 28 — Visit Quality Score).

---

### Structured Product Comments

**AC-PP-12**  
WHEN a representative is filling in a product promotion record THEN the system SHALL display a multi-select list of structured comment options applicable to that product (filtered by product and market segment).

**AC-PP-13**  
WHEN the representative selects a structured comment THEN it SHALL be stored as a typed reference, not as copied text, to support future localization and reporting.

**AC-PP-14**  
WHEN an admin configures comment options THEN the system SHALL allow setting: label, scope (global / product-specific / segment-specific), and active status.

**AC-PP-15**  
WHEN a structured comment requiring follow-up is selected (e.g. "Solicitou material técnico") THEN the system SHALL offer a shortcut to create a follow-up action pre-filled with that context.

---

### Default Structured Comment Set

The following comments SHALL be available globally by default (admin-configurable):

| Code | Label |
|------|-------|
| `benefits_reinforced` | Benefícios do produto reforçados |
| `indication_explained` | Indicação clínica explicada |
| `safety_discussed` | Perfil de segurança discutido |
| `evidence_requested` | Evidência clínica solicitada |
| `material_delivered` | Material promocional entregue |
| `interest_shown` | Cliente demonstrou interesse |
| `objection_raised` | Objeção levantada |
| `competitor_mentioned` | Concorrente já em uso |
| `followup_required` | Follow-up necessário |
| `technical_material_requested` | Material técnico solicitado |
| `not_relevant` | Produto não relevante para o perfil |
| `no_interest` | Cliente sem interesse |

---

### Market Segment Scoping

**AC-PP-16**  
All product records and promotion records SHALL apply the two-dimensional authorization rule. See [Spec 10 — Market Segmentation](./10-market-segmentation.md), AC-SEG-10.

**AC-PP-17**  
WHEN a representative's segments and a customer's segments have a non-empty intersection THEN only products belonging to the intersection of segments SHALL be offered during promotion.

---

## Design

### Screen Flows

```
Visit Log Sheet
  └── "Produtos promovidos" section
        ├── Product search / filter
        ├── Per-product promotion form
        │     ├── discussed toggle
        │     ├── presentation shown toggle → link material version
        │     ├── samples section
        │     ├── interest level selector
        │     ├── structured comment multi-select
        │     └── free-text note
        └── Save → PromotionRecord stored, linked to visit
```

### Data Models

```typescript
type ProductStatus = 'active' | 'inactive' | 'archived' | 'restricted';
type InterestLevel = 'none' | 'low' | 'medium' | 'high';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  therapeuticArea: string;
  segmentIds: string[];
  status: ProductStatus;
  materialIds: string[];          // linked CLM material IDs
  targetSpecialties: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductPromotion {
  id: string;
  visitId: string;
  productId: string;
  productName: string;            // snapshot
  entityId: string;               // clinic or doctor
  segmentIds: string[];           // snapshot from visit
  consultantId: string;
  promotionDate: Date;
  discussed: boolean;
  presentationShown: boolean;
  presentationMaterialId?: string;
  presentationMaterialVersion?: string;
  samplesDelivered: boolean;
  sampleQuantity?: number;
  interestLevel: InterestLevel;
  structuredComments: string[];   // array of comment codes
  note?: string;
  createdAt: Date;
}

interface StructuredComment {
  code: string;
  label: string;
  scope: 'global' | 'product' | 'segment';
  productId?: string;
  segmentId?: string;
  triggersFollowUp: boolean;
  isActive: boolean;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Product deactivated after visit saved | Promotion record retained with product name snapshot; product shows "(Inativo)" in history |
| Representative tries to promote out-of-segment product | Blocked at API level; frontend hides product from selection |
| Zero structured comments selected | Allowed; system flags for quality score; visit not blocked |
| Duplicate product in same visit | System warns and asks to consolidate or confirm second interaction |
| Offline promotion logging | Promotion records saved locally; synced with visit record (see Spec 22) |

### Open Questions

1. Should product portfolio have a "priority" or "campaign focus" flag that affects ordering in the promotion list?
2. Can a manager retroactively edit a promotion record, or does that require a correction request (Spec 21)?
3. Should structured comments be translatable per language setting (Spec 08)?
4. Is there a maximum number of structured comments selectable per product per visit?
5. Should interest level feed directly into the customer segmentation model (Spec 16)?
