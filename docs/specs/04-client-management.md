# Spec: Client Management (Explorar)

**Domain:** Client Management  
**Status:** API/Web partial · Mobile: Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 14 — Pre-Visit Intelligence](./14-pre-visit-intelligence.md), [Spec 16 — Customer Segmentation Surveys](./16-customer-segmentation-surveys.md), [Spec 17 — Cadastro Health](./17-cadastro-health.md), [Spec 18 — Consent & Communication](./18-consent-communication.md), [Spec 21 — Requests & Approvals](./21-requests-approvals.md), [Spec 27 — Customer Timeline](./27-customer-timeline.md), [Spec 30 — Follow-Up Actions](./30-followup-actions.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-013/F-014/F-015)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Clinic CRUD API | ✅ **Implemented** | F-013 — `/api/v1/clinics` with pagination, search, soft delete |
| Doctor CRUD API | ✅ **Implemented** | F-014 — `/api/v1/doctors` with clinicId filter |
| Doctor-clinic associations (dual-track) | ✅ **Implemented** | F-015 — confirm, manual associate, end |
| Clinic list UI (web) | ✅ **Implemented** | `/clinics` |
| Clinic detail UI (web) | ✅ **Implemented** | `/clinics/[id]` with associated doctors |
| Doctor list UI (web) | ✅ **Implemented** | `/doctors` |
| Doctor detail UI (web) | ❌ **Not started** | API exists; web page missing |
| Territory-based scope filtering | ✅ **Implemented** | Via F-008 ScopeContext |
| Market segment filtering | ❌ **Not started** | Depends on Spec 10 and Spec 00-multi-tenancy |
| Visit history on profile | ❌ **Not started** | No Visit model exists yet; depends on Spec 11 |
| Notes, follow-ups on profile | ❌ **Not started** | Depends on Spec 30 |
| Photo gallery viewer | ❌ **Not started** | Mobile feature |
| Edit suggestion workflow (mobile) | ❌ **Not started** | Backend: registry suggestions (F-017) partially covers this; full Spec 21 needed |
| Cadastro health score on profile | ❌ **Not started** | Depends on Spec 17 |
| Consent status on profile | ❌ **Not started** | Depends on Spec 18 |
| Full product list on profile | ❌ **Not started** | No Product model; depends on Spec 12 |
| Pre-visit intelligence view | ❌ **Not started** | Depends on Spec 14 |
| Multi-tenancy scoping | ❌ **Not started** | Depends on Spec 00-multi-tenancy |

> **Existing API endpoints** that mobile implementation will reuse: `GET /api/v1/clinics`, `GET /api/v1/clinics/:id`, `GET /api/v1/clinics/:id/doctors`, `GET /api/v1/doctors`, `GET /api/v1/doctors/:id`. New endpoints (visits, notes, follow-ups, products, consent) will be added as dependent specs are implemented.

---

## Overview

The Client Management module (Explorar) is the central CRM interface for field representatives. It provides a unified view of clinics and doctors in the representative's territory, enabling search, filtering, and sorting. From the list, representatives navigate to rich detail pages for each clinic or doctor, where they can view commercial health metrics, product usage, visit history, associated contacts, photos, and administrative data — and suggest edits to any field. Two supporting screens — full visit history and full product list — offer deeper exploration of longitudinal data.

---

## User Stories

**US-CRM-01 — Browse Territory Contacts**  
As a field representative, I want to see all clinics and doctors in my territory in a single searchable list, so that I can quickly find any contact.

**US-CRM-02 — Filter and Sort Contacts**  
As a field representative, I want to filter by status and product use (for clinics) or specialty (for doctors), and sort by name, proximity, or time since last visit, so that I can prioritize my outreach.

**US-CRM-03 — View Clinic Profile**  
As a field representative, I want to see a comprehensive profile for each clinic including commercial health, products used, visit history, nearby clinics, doctors, and administrative data, so that I am well-prepared before and after a visit.

**US-CRM-04 — View Doctor Profile**  
As a field representative, I want to see a doctor's personal details, prescribing behavior, associated clinics, and interaction history, so that I can tailor my approach to each physician.

**US-CRM-05 — Initiate Contact**  
As a field representative, I want quick-action buttons to call, WhatsApp, email, register a visit, or create an order directly from a clinic or doctor profile, so that I can act immediately without switching apps.

**US-CRM-06 — Manage Field Notes**  
As a field representative, I want to add and view private notes on any clinic or doctor, so that I can capture observations that do not fit into structured fields.

**US-CRM-07 — Suggest Data Corrections**  
As a field representative, I want to suggest corrections to clinic or doctor data (phone, address, CNPJ, etc.) that go through admin review, so that inaccurate data gets fixed without me having edit access.

**US-CRM-08 — Browse Visit History**  
As a field representative, I want to see the full visit history for any clinic or doctor, with outcome filters and search, so that I can review past interactions in detail.

**US-CRM-09 — Analyze Product Usage**  
As a field representative, I want to see which products a clinic uses, their volumes, trends, and share of wallet, so that I can identify growth and upsell opportunities.

**US-CRM-10 — Manage Photos**  
As a field representative, I want to view, add, and manage photos associated with clinics and doctors (e.g. façade, reception, business cards), so that I have visual context for my relationships.

---

## Requirements & Acceptance Criteria

### Unified Client List

**AC-CRM-01**  
WHEN the user opens Explorar THEN the system SHALL display a tab toggle (Clínicas / Médicos) each with a count badge, a search bar, a filter button, and an active-sort chip row.

**AC-CRM-02**  
WHEN a clinic tab is active THEN each row SHALL display: name, distance, city, status chip, last visit date, doctor count, and a priority indicator.

**AC-CRM-03**  
WHEN a doctor tab is active THEN each row SHALL display: avatar with initials and hue, name, specialty, primary clinic, CRM number, distance, and a priority indicator.

**AC-CRM-04**  
WHEN the user types in the search bar THEN the system SHALL filter results in real time matching name, neighborhood (clinics), or specialty/CRM (doctors).

**AC-CRM-05**  
WHEN the user opens the filter sheet for clinics THEN the system SHALL offer: status (Ativa / Em negociação / Inativa / Nunca comprou / Rejeição) and product in use (multi-select).

**AC-CRM-06**  
WHEN the user opens the filter sheet for doctors THEN the system SHALL offer: specialty (multi-select).

**AC-CRM-07**  
WHEN filters are active THEN the system SHALL display removable filter chips above the list.

**AC-CRM-08**  
WHEN the user opens the sort sheet THEN the system SHALL offer: Nome A–Z, Mais próximos, Sem visita há mais tempo, Sem contato há mais tempo.

**AC-CRM-09**  
WHEN the list is loading THEN the system SHALL show shimmer skeleton rows.

**AC-CRM-10**  
WHEN no results match the search/filters THEN the system SHALL display an empty state with a suggestion to change the query or clear filters.

---

### Clinic Detail

**AC-CRM-11**  
WHEN a clinic row is tapped THEN the system SHALL navigate to the clinic detail screen.

**AC-CRM-12**  
WHEN the clinic detail loads THEN the system SHALL display the header (avatar with camera badge, status chip, name, neighborhood + distance, specialties, last interaction ribbon, full address).

**AC-CRM-13**  
WHEN the clinic header is visible THEN the system SHALL display quick-action buttons: Ligar, WhatsApp, Rota, Nova visita, Novo pedido.

**AC-CRM-14**  
WHEN any phone number, WhatsApp, or email quick action is tapped THEN the system SHALL open the appropriate native handler (phone dialer, WhatsApp deep-link, email client).

**AC-CRM-15**  
WHEN the "Rota" action is tapped THEN the system SHALL add the clinic to or show the current day's route.

**AC-CRM-16**  
WHEN the user taps "Nova visita" THEN the system SHALL open the visit log sheet pre-filled with this clinic.

**AC-CRM-17**  
WHEN the user taps "Novo pedido" THEN the system SHALL open the new order flow with this clinic pre-selected.

**AC-CRM-18**  
WHEN displayed THEN the system SHALL show a suggest-edit banner informing the user that pencil-icon edits go to admin review.

**AC-CRM-19**  
WHEN the context card is displayed THEN the system SHALL show: assigned consultant with tenure, client type label, and city/region.

**AC-CRM-20**  
WHEN the user taps the route toggle THEN the system SHALL add the clinic to today's route and display its position number in the toggle label.

**AC-CRM-21**  
WHEN the commercial health section is displayed THEN the system SHALL show: LTV (R$), average ticket (R$), visit frequency (days), and a link to visit history.

**AC-CRM-22**  
WHEN the products section is displayed THEN the system SHALL show each product with 6-month volume, growth %, trend bar chart, and share % bar.

**AC-CRM-23**  
WHEN the user taps "Ver todos" in the products section THEN the system SHALL navigate to the full product list screen.

**AC-CRM-24**  
WHEN the payers section is displayed THEN the system SHALL show a donut chart and a breakdown of payers with their share percentages.

**AC-CRM-25**  
WHEN the nearby map section is displayed THEN the system SHALL show an interactive map centered on the clinic, a radius slider (0.5–5 km), and a list of nearby clinics sorted by distance.

**AC-CRM-26**  
WHEN the visit history preview is displayed THEN the system SHALL show summary stats and the most recent 3–5 visits with outcome filter pills and a "Ver histórico completo" CTA.

**AC-CRM-27**  
WHEN the doctors section is displayed THEN the system SHALL show scrollable mini-cards for each associated doctor with formation, birthday, interest tags, and a "Ver perfil completo" CTA.

**AC-CRM-28**  
WHEN the notes section is displayed THEN the system SHALL show all private notes in numbered order with an "Adicionar nota" CTA.

**AC-CRM-29**  
WHEN the user adds a note THEN the system SHALL save it privately to the representative's record.

**AC-CRM-30**  
WHEN the administrative section is displayed THEN the system SHALL show fields: CNPJ, endereço, telefone, e-mail, site, horário — empty fields SHALL show a "Completar" chip.

**AC-CRM-31**  
WHEN the user taps a pencil icon or "Completar" chip on any admin field THEN the system SHALL open the Edit Suggestion modal for that field.

---

### Doctor Detail

**AC-CRM-32**  
WHEN a doctor row is tapped THEN the system SHALL navigate to the doctor detail screen showing: avatar, status chip, name, CRM, residency, and quick actions (Ligar, WhatsApp, E-mail, Nova visita).

**AC-CRM-33**  
WHEN the personal card is displayed THEN the system SHALL show: Formação, Residência, Aniversário, Time, Interesses, Idiomas, and contact fields (phone, WhatsApp, email) — empty contact fields SHALL show "Completar" chips.

**AC-CRM-34**  
WHEN the prescribing section is displayed THEN the system SHALL show each product with 6-month volume, trend bars, growth %, and share %.

**AC-CRM-35**  
WHEN the clinics section is displayed THEN the system SHALL show each associated clinic with the doctor's role and days present, tappable to navigate to that clinic's detail.

---

### Visit History Full Screen

**AC-CRM-36**  
WHEN the user taps "Ver histórico completo" THEN the system SHALL open the full visit history screen with header (back, entity name, export button) and summary stats.

**AC-CRM-37**  
WHEN the visit history is filtered or searched THEN the system SHALL update the summary stats reactively.

**AC-CRM-38**  
WHEN a visit row is displayed THEN the system SHALL show: outcome-colored timeline dot, date, time, duration, consultant name, visit kind, contact person, order value (if any), sample tags (if any), and full note text.

**AC-CRM-39**  
WHEN the user taps the export button THEN the system SHALL export all currently visible visits as a CSV file.

---

### Products Full List Screen

**AC-CRM-40**  
WHEN the user opens the full product list THEN the system SHALL show summary stats and an expandable row per product with 6-month volume, growth %, trend bar, and share bar.

**AC-CRM-41**  
WHEN the user expands a product row THEN the system SHALL show a monthly breakdown table (month, volume, MoM growth %).

**AC-CRM-42**  
WHEN the opportunities section is displayed THEN the system SHALL list products not yet purchased with an "Apresentar" CTA per row.

**AC-CRM-43**  
WHEN the user taps the sort button THEN the system SHALL open a sort sheet: Maior share / Maior crescimento / Maior volume / Nome A–Z.

---

### Photo Gallery Viewer

**AC-CRM-44**  
WHEN the user taps the photos section THEN the system SHALL open the full-screen photo gallery overlay.

**AC-CRM-45**  
WHEN the gallery is open THEN the system SHALL display the main photo, prev/next arrows, a caption bar (label, date, context), a thumbnail strip, a photo counter, and an actions menu (⋯).

**AC-CRM-46**  
WHEN the user presses ← / → keys or arrows THEN the system SHALL navigate to the previous/next photo.

**AC-CRM-47**  
WHEN the user taps ⋯ THEN the system SHALL show an action sheet: Compartilhar foto, Editar descrição, Excluir foto.

**AC-CRM-48**  
WHEN the user taps the "Adicionar" FAB THEN the system SHALL show an action sheet: Tirar foto com a câmera, Escolher da galeria.

**AC-CRM-49**  
WHEN a photo is deleted THEN the system SHALL request confirmation before permanently removing it.

---

### Edit Suggestion Modal

**AC-CRM-50**  
WHEN the Edit Suggestion modal opens for a clinic field THEN the system SHALL show the current value (read-only) and an input for the new value.

**AC-CRM-51**  
WHEN the Edit Suggestion modal opens for a doctor field THEN the same pattern SHALL apply with doctor-specific fields.

**AC-CRM-52**  
WHEN the user submits a suggestion THEN the system SHALL validate the new value and display field-specific errors:
- Phone: 10–11 digits
- Email: valid format
- CNPJ: 14 digits
- URL: must start with http(s)://
- Text fields: minimum 2 characters

**AC-CRM-53**  
WHEN the user taps "Enviar sugestão" with a valid new value THEN the system SHALL submit the suggestion to the admin review queue and display a "Sugestão enviada para revisão" success toast.

**AC-CRM-54**  
WHEN a suggestion is submitted THEN the original field value SHALL remain unchanged until an admin approves the suggestion.

**AC-CRM-55**  
WHEN the optional reason textarea is used THEN the system SHALL enforce a 200-character maximum.

---

## Design

### Screen Hierarchy

```
ExplorarScreen (Clínicas | Médicos tabs)
├── ClinicDetailScreen
│   ├── PhotoGalleryViewer (overlay)
│   ├── EditSuggestionModal (overlay)
│   ├── VisitHistoryFullScreen
│   └── ProductsFullListScreen
└── DoctorDetailScreen
    ├── PhotoGalleryViewer (overlay)
    ├── EditSuggestionModal (overlay)
    └── VisitHistoryFullScreen
```

### Data Models

```typescript
/**
 * ClinicStatus — canonical commercial relationship status.
 * Used by Spec 03 (BI), Spec 04 (profile), Spec 23 (coverage), Spec 17 (health).
 *
 * "Em risco" is NOT a stored status value. It is a computed label derived at
 * query time:
 *   - A clinic is "em risco" when status = 'ativa' AND last effective visit
 *     was > 60 days ago (threshold configurable per Spec 23 AC-COV-06).
 * The BI dashboard "Em risco" and Coverage dashboard abandonment chip both
 * use this same computed rule. No separate `em_risco` enum value is stored.
 *
 * "nunca compraram" (BI) = clinics with status = 'ativa' | 'negociacao' AND
 * no orders exist (Spec 06). Different concept from "nunca visitada".
 */
type ClinicStatus =
  | 'ativa'           // active commercial relationship
  | 'negociacao'      // in negotiation / prospect
  | 'inativa'         // relationship was active but lapsed
  | 'nunca'           // never visited / never engaged
  | 'rejeicao';       // rejected relationship

interface Clinic {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  cnpj?: string;
  businessHours?: BusinessHours;
  status: ClinicStatus;
  specialties: string[];
  distanceKm: number;
  lastVisitDate?: Date;
  doctorCount: number;
  isPriority: boolean;
  assignedRepresentativeId: string;  // "consultant" in legacy; standardized to representative
  assignedSince: Date;
  photos: Photo[];
  ltv: number;
  avgTicket: number;
  visitFrequencyDays: number;
  products: ClinicProduct[];
  payers: Payer[];
  notes: FieldNote[];
}

interface Doctor {
  id: string;
  firstName: string;           // aligns with implemented Doctor model (F-014)
  lastName: string;
  displayName: string;         // computed: `${firstName} ${lastName}`
  crm: string;
  specialty: string;
  residency?: string;
  formation?: string;
  birthday?: Date;
  team?: string;
  interests?: string[];
  languages?: string[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  clinics: DoctorClinicRelation[];
  distanceKm: number;
  isPriority: boolean;
  photos: Photo[];
  prescribing: DoctorProduct[];
  notes: FieldNote[];
  tags: ('Decisora' | 'Influenciadora' | 'Nova' | 'Fria')[];
}

interface ClinicProduct {
  productId: string;
  productName: string;
  category: string;
  volume6m: number;
  growthPercent: number;
  sharePercent: number;
  monthlyData: MonthlyVolume[];
}

interface Payer {
  name: string;
  sharePercent: number;
}

interface Photo {
  id: string;
  url: string;
  label: string;
  date: Date;
  context: string;
}

interface FieldNote {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
}

interface EditSuggestion {
  entityType: 'clinic' | 'doctor';
  entityId: string;
  fieldName: string;
  currentValue: string;
  proposedValue: string;
  reason?: string;
  submittedAt: Date;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Visit records shown in profile history use the canonical Visit model
 * from Spec 11 (Visit Lifecycle & Frequency Targets).
 *
 * Key fields displayed in this context:
 *   status:            'effective' | 'ineffective' (planned/cancelled filtered out)
 *   executedAt:        Date of the visit
 *   durationMinutes:   Duration
 *   consultantId:      Rep who made the visit
 *   outcome:           'positive' | 'mixed' | 'neutral' (effective only)
 *   ineffectiveReason: IneffectiveReason (ineffective only)
 *   note:              Free-text note
 *   promotedProductIds: Products promoted
 *
 * Do not duplicate the full Visit interface here. Reference Spec 11 for the
 * complete model including segmentIds, plannedDate, followUpIds, etc.
 */
```

### Edit Suggestion — Supported Fields

| Entity | Field | Validation |
|--------|-------|-----------|
| Clinic | nome | min 2 chars |
| Clinic | telefone | 10–11 digits |
| Clinic | e-mail | valid email |
| Clinic | endereço | min 2 chars |
| Clinic | site | http(s):// URL |
| Clinic | horário | free text |
| Clinic | CNPJ | 14 digits |
| Doctor | nome | min 2 chars |
| Doctor | telefone | 10–11 digits |
| Doctor | e-mail | valid email |
| Doctor | WhatsApp | 10–11 digits |
| Doctor | aniversário | valid date |
| Doctor | time | min 2 chars |
| Doctor | interesses | free text |
| Doctor | idiomas | free text |
| Doctor | CRM | min 4 chars |
| Doctor | especialidade | min 2 chars |

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Clinic/doctor not found (deleted) | 404 screen with back navigation |
| Photos fail to load | Placeholder with retry |
| Note save fails | Toast error, note retained in draft state |
| Edit suggestion submit fails | Toast error with retry |
| Product data unavailable | "Dados não disponíveis" per section |
| Location permission denied | Nearby map shows message prompting permission |
| Export (visit history) fails | Toast error |

### Market Segmentation Note

All client list and detail queries in this spec apply the two-dimensional authorization rule (see [Spec 10 — Market Segmentation](./10-market-segmentation.md), AC-SEG-14). The client list SHALL include a segment filter chip when the user is assigned to multiple segments. Customer rows display their segment chips so the user knows why each record is visible.

### Visit History Note

The visit history shown on clinic and doctor profiles (AC-CRM-26, AC-CRM-36–39) SHALL only include visits with `status: effective | ineffective` as defined in [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md). Planned and cancelled visits are available in the Agenda view (Spec 15), not in the profile history.

### Edit Suggestions Note

Edit suggestions (AC-CRM-50–55) are processed through the approval workflow defined in [Spec 21 — Requests & Approval Workflows](./21-requests-approvals.md) as request type `data_correction`. The approval workflow spec defines the reviewer routing, status lifecycle, and audit trail for all suggestions submitted from this module.

### Cadastro Health Note

The health status chip (Saudável / Incompleto / Desatualizado / Crítico) shown on customer profiles is defined by [Spec 17 — Cadastro Health](./17-cadastro-health.md). This spec defines the triggers; Spec 17 defines the scoring model and field requirements.

### Open Questions

1. Can representatives add new clinics or doctors, or only suggest edits to existing ones?
2. Is the priority indicator computed automatically (e.g. longest without visit) or set manually?
3. Are field notes visible to managers, or private to the rep?
4. Who manages the admin review queue for edit suggestions?
5. Should "Novo pedido" and "Nova visita" from the detail screen pre-fill and return to the detail, or is it a full-screen flow?
6. ~~What triggers the "Em risco" status for a clinic?~~ **Resolved:** "Em risco" is a computed label (not a stored status), defined above the ClinicStatus type. See also Spec 23 AC-COV-06 (60-day default threshold).
