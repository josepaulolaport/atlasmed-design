# Spec 34 — Doctor Portal

## Overview

The Doctor Portal is a dedicated product surface for healthcare professionals (HCPs) registered in the Atlasmed CRM. Doctors access a separate navigation shell — distinct from the field-rep experience — with features purpose-built for clinical decision support and product access. The MVP ships two capabilities: a **Sales Catalog** for ordering promoted products and a **Medication Dosage Calculator** for evidence-based dosing guidance. The portal is available on both web (`/portal/*`) and the Flutter mobile app (role-gated shell).

---

## 1. Doctor Identity & Self-Registration

### 1.1 DOCTOR Role

A new `DOCTOR` value is added to the existing `Role` enum. Doctor accounts are full `User` records in the system but carry a strictly limited permission set:

| Permission | DOCTOR | USER (rep) | MANAGER | ADMIN |
|-----------|--------|-----------|---------|-------|
| View own orders | ✓ | — | ✓ | ✓ |
| Browse product catalog | ✓ | — | — | ✓ |
| Use dosage calculator | ✓ | — | — | — |
| View CRM / visit data | ✗ | ✓ | ✓ | ✓ |
| Access analytics | ✗ | — | ✓ | ✓ |
| Territory scope | ✗ (N/A) | ✓ | ✓ | — |

Doctor accounts bypass territory-based scope enforcement entirely — they are customers, not employees.

### 1.2 Self-Registration Flow

Doctors self-register without an invitation link. The system validates their identity against the existing `Doctor` table (populated via CNES/CFM ingestion — see Spec 33):

```
1. Doctor visits /portal/register
2. Enters CFM registration number + email
3. API looks up a Doctor record matching the CFM number
4. If found → creates User(role=DOCTOR) linked to that Doctor.id
5. Sends email-verification link
6. Doctor sets password; optional TOTP 2FA enrollment
7. Redirected to Doctor Portal home
```

If no matching `Doctor` record exists the registration is rejected with a user-friendly message directing them to contact their Atlasmed representative.

**Data model addition:**
```prisma
model User {
  // existing fields ...
  doctorId  String?  @unique  // nullable FK to Doctor
  doctor    Doctor?  @relation(fields: [doctorId], references: [id])
}
```

The `Doctor` model gains a `hasPortalAccount Boolean @default(false)` flag for CRM visibility.

### 1.3 Session & Security

- Same JWT / refresh-rotation stack as reps (Spec 01).
- TOTP 2FA optional at registration, enforceable per admin policy.
- Separate audit-log `subjectType = DOCTOR` for compliance.

---

## 2. Doctor Portal Shell

### 2.1 Web (`/portal/*`)

A dedicated layout distinct from the rep/admin shell (`/app/*`). Route guard: only `DOCTOR` role may access `/portal/*`; all other roles are redirected to their own root.

**Navigation items (MVP):**
- Home (welcome / quick links)
- Catalog
- My Orders
- Dosage Calculator
- Profile & Settings

### 2.2 Flutter Mobile

The Flutter app detects the authenticated user's role post-login and forks to the appropriate shell:

```
if (user.role == Role.DOCTOR) → DoctorShell (GoRouter branch /doctor/*)
else                          → RepShell    (existing side-drawer shell)
```

`DoctorShell` uses a bottom navigation bar (vs. the rep side drawer) with tabs: **Catalog · Calculator · Orders · Profile**.

The offline-first Drift schema and SyncService do not apply to the doctor shell — doctor data (catalog, orders, calculator) is always fetched online.

---

## 3. Sales Catalog

### 3.1 Overview

Doctors browse an admin-curated subset of the product catalog and place direct orders. Orders created by doctors flow into the existing `Order` module (Spec 06) with `sourceRole = DOCTOR` for downstream tracking.

### 3.2 Product Visibility

- Admins flag individual `Product` records as `doctorVisible: Boolean` (default `false`).
- Only `doctorVisible = true` products appear in the Doctor Portal catalog.
- Existing rep-facing catalog is unaffected.

### 3.3 Catalog Features

| Feature | Web | Mobile |
|---------|-----|--------|
| Browse all visible products | ✓ | ✓ |
| Search by name / therapeutic area | ✓ | ✓ |
| Filter by category | ✓ | ✓ |
| Product detail (description, images, indications) | ✓ | ✓ |
| Add to cart / place order | ✓ | ✓ |
| Order history | ✓ | ✓ |

### 3.4 Order Placement

- Doctor selects quantity and submits — creates an `Order` record with `doctorId` populated.
- Confirmation email sent automatically.
- Rep assigned to that doctor's territory is notified (existing notification infrastructure, Spec 31).
- Doctor can track order status in "My Orders".

### 3.5 Data Model Changes

```prisma
model Product {
  // existing fields ...
  doctorVisible Boolean @default(false)
}

model Order {
  // existing fields ...
  doctorId    String?
  doctor      Doctor?  @relation(fields: [doctorId], references: [id])
  sourceRole  OrderSource @default(REP)
}

enum OrderSource {
  REP
  DOCTOR
}
```

---

## 4. Medication Dosage Calculator

### 4.1 Overview

A clinical decision-support tool. Admins define drug dosing formulas; doctors input patient parameters and receive a calculated recommended dose with safety bounds and notes.

### 4.2 Admin Drug Formula Management

Accessible at `/app/admin/drug-formulas` (existing admin shell). Admins can:
- Create / edit / archive drug formulas
- Define formula parameters and dose bounds
- Add clinical notes visible to the doctor

**DrugFormula model:**
```prisma
model DrugFormula {
  id            String          @id @default(cuid())
  name          String          // e.g. "Amoxicillin (Pediatric)"
  activeSubstance String
  category      String?
  formulaType   DoseFormulaType
  dosePerKg     Float?          // mg/kg (weight-based)
  dosePerM2     Float?          // mg/m² (BSA-based)
  fixedDose     Float?          // mg (fixed)
  minDose       Float?          // safety floor (mg)
  maxDose       Float?          // safety ceiling (mg)
  frequency     String?         // e.g. "every 8 hours"
  route         String?         // e.g. "oral", "IV"
  clinicalNotes String?
  isActive      Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

enum DoseFormulaType {
  WEIGHT_BASED   // dose = dosePerKg × weight
  BSA_BASED      // dose = dosePerM2 × BSA (Mosteller formula)
  AGE_BASED      // dose looked up by age range
  FIXED
}
```

### 4.3 Calculator UI (Doctor-facing)

**Inputs:**
- Drug (searchable dropdown of active `DrugFormula` records)
- Patient weight (kg) — required for WEIGHT_BASED / BSA_BASED
- Patient age (years/months) — required for AGE_BASED / BSA_BASED
- Patient height (cm) — required for BSA_BASED (Mosteller: √[(H×W)/3600])

**Outputs:**
- Calculated dose (mg) with min/max bounds highlighted
- Dosing frequency & route
- Clinical notes from the formula
- Clear disclaimer: *"For reference only. Always confirm with clinical judgment and current prescribing guidelines."*

**Results are display-only — never persisted.**

### 4.4 BSA Formula

```
BSA (m²) = √[(height_cm × weight_kg) / 3600]   // Mosteller
```

### 4.5 Acceptance Criteria

- Dose renders correctly for all formula types.
- If calculated dose < `minDose`: highlight warning; show minimum dose.
- If calculated dose > `maxDose`: highlight warning; show maximum dose.
- Archived formulas do not appear in doctor-facing dropdown.
- Results display the disclaimer on every calculation.

---

## 5. Acceptance Criteria

### Registration
- Doctor with a valid CFM number in the `Doctor` table can self-register.
- Doctor without a matching record is rejected gracefully.
- `hasPortalAccount` flag is set to `true` after successful verification.
- Doctor cannot access any `/portal/*` route before email verification.

### Portal Shell
- Web: `/portal/*` routes are inaccessible to non-DOCTOR roles.
- Mobile: `DoctorShell` renders only when `user.role == DOCTOR`.
- Rep/manager users never see the doctor navigation shell.

### Sales Catalog
- Only `doctorVisible = true` products appear in the catalog.
- Placing an order creates an `Order` with `sourceRole = DOCTOR`.
- The assigned territory rep receives a notification for each doctor order.
- Doctor can view all their past orders with status.

### Dosage Calculator
- Calculator returns correct dose for each `DoseFormulaType`.
- Min/max bounds are enforced with visible warnings.
- No calculation results are stored in the database.
- Admin can create, edit, and archive drug formulas.

---

## 6. Open Questions

- **Doctor invitation by rep**: Should a rep be able to invite a specific doctor to register (e.g. send a magic link), or is pure self-registration sufficient for MVP?
- **Catalog pricing**: Should prices be visible to doctors, or show only product name/description?
- **Order fulfillment**: Who fulfills a doctor order — a central logistics team or the assigned rep?
- **Calculator audit**: Regulatory future requirement to log which formulas were viewed (not the results, just the formula ID + timestamp) for pharmacovigilance?

---

## 7. Future Roadmap (Post-MVP)

- Doctor-facing CME content / educational materials
- Sample request (linked to Sample & Inventory spec)
- Direct messaging with the assigned rep
- Patient management tools (outcome tracking)
- Push notifications for order status updates
- Multi-language support (EN/PT-BR)

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-188](https://linear.app/atlasmed/issue/ATLAS-188/) | PARENT | Doctor Portal — Sales Catalog & Dosage Calculator | Backlog |
| [ATLAS-189](https://linear.app/atlasmed/issue/ATLAS-189/) | BE | Doctor Portal — DOCTOR role, self-registration & CFM validation | Backlog |
| [ATLAS-190](https://linear.app/atlasmed/issue/ATLAS-190/) | BE | Doctor Portal — sales catalog API & doctorVisible product flag | Backlog |
| [ATLAS-191](https://linear.app/atlasmed/issue/ATLAS-191/) | BE | Doctor Portal — drug formula model & dosage calculator API | Backlog |
| [ATLAS-192](https://linear.app/atlasmed/issue/ATLAS-192/) | WE | Doctor Portal — web app shell, auth & navigation | Backlog |
| [ATLAS-193](https://linear.app/atlasmed/issue/ATLAS-193/) | WE | Doctor Portal — sales catalog & order placement web UI | Backlog |
| [ATLAS-194](https://linear.app/atlasmed/issue/ATLAS-194/) | WE | Doctor Portal — dosage calculator web UI | Backlog |
| [ATLAS-195](https://linear.app/atlasmed/issue/ATLAS-195/) | WE | Doctor Portal — admin drug formula management | Backlog |
| [ATLAS-196](https://linear.app/atlasmed/issue/ATLAS-196/) | MOB | Doctor Portal — Flutter DoctorShell & role-gated navigation | Backlog |
| [ATLAS-197](https://linear.app/atlasmed/issue/ATLAS-197/) | MOB | Doctor Portal — sales catalog Flutter screens | Backlog |
| [ATLAS-198](https://linear.app/atlasmed/issue/ATLAS-198/) | MOB | Doctor Portal — dosage calculator Flutter screen | Backlog |
| [ATLAS-200](https://linear.app/atlasmed/issue/ATLAS-200/) | DESIGN | Doctor Portal — web portal screens (shell, catalog, calculator) | Backlog |
| [ATLAS-199](https://linear.app/atlasmed/issue/ATLAS-199/) | DESIGN | Doctor Portal — mobile portal screens (shell, catalog, calculator) | Backlog |
