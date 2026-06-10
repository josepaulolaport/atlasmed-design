# Spec: Pre-Visit Intelligence & Next Visit Objective

**Domain:** Pre-Visit Intelligence · Next Visit Objective  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 30 — Follow-Up Actions](./30-followup-actions.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. Pure aggregation/read spec — no new database writes required. Builds atop visit, product promotion, follow-up, consent, and frequency models. Can be implemented as a single `/api/v1/customers/:id/pre-visit-intel` endpoint once the data sources are in place.

---

## Overview

The pre-visit intelligence view gives a field representative a structured briefing before meeting a doctor or visiting a clinic. Instead of manually reviewing multiple sections of a customer profile, the representative opens one focused view that aggregates all relevant context: last visit, last promoted products, previous objections, pending follow-ups, consent status, frequency progress, and the next visit objective set after the previous interaction. A V2 layer will add AI-generated summaries; V1 is structured data only.

The next visit objective is a forward-looking field captured at the end of each visit that defines what should happen in the *next* interaction. It creates continuity between visits and feeds directly into the pre-visit view.

---

## User Stories

**US-PVI-01 — Open Pre-Visit Briefing**  
As a field representative, I want to open a pre-visit briefing for any customer from their profile or my agenda, so that I can prepare in under a minute.

**US-PVI-02 — See Previous Visit Summary**  
As a field representative, I want to see what happened in my last visit (date, outcome, products discussed, objections), so that I can build on the previous interaction.

**US-PVI-03 — Review Pending Actions**  
As a field representative, I want to see all open follow-ups and the next visit objective before I enter the clinic, so that I do not forget any commitments.

**US-PVI-04 — Check Frequency Status**  
As a field representative, I want to know whether this customer is on target, behind, or overdue on frequency, so that I understand the urgency of the visit.

**US-PVI-05 — Review Consent and Contact Preferences**  
As a field representative, I want to see the customer's consent status and preferred contact channels at a glance, so that I respect their preferences from the start.

**US-PVI-06 — Set a Next Visit Objective**  
As a field representative, I want to define a next visit objective after completing a visit, so that my future self (and any colleague covering this customer) knows what to do next.

**US-PVI-07 — Segment-Scoped Briefing**  
As a field representative, I want to see only the information from segments I am authorized for, so that I do not inadvertently access another team's customer data.

---

## Requirements & Acceptance Criteria

### Pre-Visit Intelligence View

**AC-PVI-01**  
WHEN a representative opens the pre-visit view for a customer THEN the system SHALL display the following sections: Última visita, Objetivo da próxima visita, Pendências, Frequência, Produtos em foco, Consentimento e preferências.

**AC-PVI-02**  
WHEN no previous visit exists THEN the "Última visita" section SHALL display "Sem visitas anteriores".

**AC-PVI-03**  
WHEN the pre-visit view loads THEN the system SHALL apply market segment scoping: sections containing information from a segment not assigned to the current user SHALL be hidden or replaced with a "Não acessível neste segmento" placeholder.

**AC-PVI-04**  
WHEN the "Última visita" section is displayed THEN the system SHALL show: visit date, visit outcome type (effective/ineffective), products promoted with their structured comments (summarized), samples delivered, and the note left.

**AC-PVI-05**  
WHEN the "Pendências" section is displayed THEN the system SHALL show all open follow-up actions for this customer, sorted by due date (most overdue first).

**AC-PVI-06**  
WHEN the "Frequência" section is displayed THEN the system SHALL show the current frequency progress (e.g. "1/2 este mês") and last effective visit date, referencing Spec 11.

**AC-PVI-07**  
WHEN the "Produtos em foco" section is displayed THEN the system SHALL highlight: products not discussed in the last 60 days, products with high customer interest in previous visits, and products with active campaigns.

**AC-PVI-08**  
WHEN the "Consentimento e preferências" section is displayed THEN the system SHALL show consent status per channel and communication preferences, referencing Spec 18.

---

### Next Visit Objective

**AC-NVO-01**  
WHEN a representative finishes logging an effective visit THEN the system SHALL display a "Objetivo da próxima visita" input field as the final step before saving.

**AC-NVO-02**  
WHEN the objective field is displayed THEN the system SHALL show a short text input (max 200 chars) and an optional product link (connect objective to a specific product).

**AC-NVO-03**  
WHEN the objective field is left blank THEN the system SHALL allow saving the visit without an objective but SHALL flag the visit for quality scoring (see Spec 28 — Visit Quality Score).

**AC-NVO-04**  
WHEN a next visit objective exists THEN the system SHALL display it prominently at the top of the pre-visit intelligence view for the next interaction with that customer.

**AC-NVO-05**  
WHEN a new objective is set THEN the previous objective SHALL be archived (moved to the visit record history) rather than deleted.

**AC-NVO-06**  
WHEN a manager views a customer profile THEN the manager SHALL be able to see the current next visit objective left by the assigned representative.

---

### Market Segment Scoping

**AC-PVI-09**  
Pre-visit intelligence data for a customer SHALL only include records from segments that overlap between the user's assigned segments and the customer's segments.

---

## Design

### Pre-Visit View Layout

```
┌─────────────────────────────────┐
│ ← Pré-visita · [Customer Name]  │
├─────────────────────────────────┤
│ OBJETIVO DA PRÓXIMA VISITA      │
│ "[Objective text]"              │
│ Set after: [last visit date]    │
├─────────────────────────────────┤
│ ÚLTIMA VISITA                   │
│ [Date] · [Effective/Ineffective]│
│ Produtos: [A, B, C]             │
│ Interesse: [high for A]         │
│ Nota: "[note excerpt]"          │
├─────────────────────────────────┤
│ PENDÊNCIAS ([N])                │
│ • [Follow-up title] · [due]     │
│ • [Follow-up title] · overdue   │
├─────────────────────────────────┤
│ FREQUÊNCIA                      │
│ 1 / 2 este mês · Em dia         │
├─────────────────────────────────┤
│ PRODUTOS EM FOCO                │
│ [Product A] Não discutido há 45d│
│ [Product B] Alto interesse      │
├─────────────────────────────────┤
│ CONSENTIMENTO                   │
│ WhatsApp ✓ · Email ✓ · Tel ✓   │
└─────────────────────────────────┘
```

### Data Models

```typescript
interface PreVisitIntelligence {
  entityId: string;
  entityType: 'clinic' | 'doctor';
  generatedAt: Date;
  nextVisitObjective?: NextVisitObjective;
  lastVisit?: VisitSummary;
  openFollowUps: FollowUpSummary[];
  frequencyProgress: FrequencyProgress;
  focusProducts: FocusProduct[];
  consent: ConsentSummary;
}

interface NextVisitObjective {
  id: string;
  text: string;
  relatedProductId?: string;
  setByUserId: string;
  setAfterVisitId: string;
  createdAt: Date;
  isArchived: boolean;
}

interface VisitSummary {
  visitId: string;
  date: Date;
  status: 'effective' | 'ineffective';
  promotedProducts: {
    productId: string;
    productName: string;
    interestLevel: InterestLevel;
    topComment?: string;
  }[];
  samplesDelivered: boolean;
  noteExcerpt?: string;
}

interface FocusProduct {
  productId: string;
  productName: string;
  reason: 'not_recently_discussed' | 'high_interest' | 'active_campaign';
  daysSinceLastDiscussion?: number;
}

interface ConsentSummary {
  channels: { channel: string; consented: boolean; capturedAt?: Date }[];
  preferredChannel?: string;
  preferredTime?: string;
}
```

### Entry Points

The pre-visit view is accessible from:
1. Agenda (Spec 15) — tap a planned visit → "Ver pré-visita"
2. Customer profile (Spec 04) — header action "Pré-visita"
3. Territory map (Spec 05) — clinic bottom sheet → "Pré-visita"

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Customer has no history in any segment | All sections show "Sem dados" |
| Last visit from a segment user is not assigned to | Section hidden with "Não acessível neste segmento" |
| Objective text not set | Section shows "Nenhum objetivo definido para esta visita" with CTA to add one |
| Pre-visit loaded offline | Shows last-cached version with "Dados offline · Atualizado em [date]" banner |
| Multiple representatives cover the same customer | Shows last visit by any rep; follow-ups filtered to the current user's only |

### Open Questions

1. Should the pre-visit view show a history of past objectives (not just the current one)?
2. Can a manager add a coaching note to a next visit objective for their representative?
3. Should AI-generated suggestions (V2) appear in the same view, or as a separate "AI mode"?
4. How far back should "last visit" look — most recent overall, or most recent in the current segment?
5. ~~Should the pre-visit view be available as a standalone notification?~~ **Resolved:** The `visit_reminder` notification (Spec 31) deep-links directly to the pre-visit intelligence screen for the scheduled visit. The notification title is "Visita agendada para hoje" and the deep-link resolves to `/visits/:visitId/briefing`.
