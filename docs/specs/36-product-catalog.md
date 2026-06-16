# Spec 36 — Product Catalog & Information Hub

## Overview

A **standalone product browsing and reference experience** available to reps, managers, and admins independent of the visit flow. This spec extends the product data model defined in [Spec 12 — Product Promotion](./12-product-promotion.md) with rich content fields (images, clinical documents, datasheets) and provides dedicated catalog pages in the web app and Flutter mobile app. The product detail page is the single authoritative reference for a product's clinical and commercial information.

> **Relationship to Spec 12:** Spec 12 owns the `Product` model, promotion recording, and structured comments. This spec adds rich content, document management, and a standalone browsing surface. Both specs share the same `Product` record — no duplication.

> **Relationship to Spec 34 (Doctor Portal):** The doctor-facing catalog (Spec 34) consumes `doctorVisible = true` products from this same catalog with the same rich content.

---

## User Stories

**US-CAT-01 — Browse the Product Catalog Independently**
As a field representative, I want a dedicated "Products" page where I can browse and search all products assigned to my segments, so that I can review the portfolio at any time — not only during a visit.

**US-CAT-02 — View Rich Product Information**
As a field representative, I want to see a product's full detail page including clinical summary, indications, contraindications, images, and attached clinical documents, so that I am well-prepared for any conversation about that product.

**US-CAT-03 — Access Product Materials**
As a field representative, I want to see all CLM presentations and clinical datasheets linked to a product from the product detail page, so that I can open them directly without hunting through the materials library.

**US-CAT-04 — Admin Manages Rich Product Content**
As an admin, I want to edit a product's rich content fields (images, clinical summary, documents) from a dedicated editor, so that the catalog always reflects current scientific and commercial data.

**US-CAT-05 — Manager Reviews Product Portfolio**
As a manager, I want to see the product catalog with team-level usage and promotion stats alongside product information, so that I can identify gaps in product coverage.

---

## Requirements & Acceptance Criteria

### Product Catalog Page

**AC-CAT-01**
WHEN a representative or manager opens the Products page THEN the system SHALL display a searchable, filterable list of all products within their segment scope.

**AC-CAT-02**
WHEN the catalog is displayed THEN each product card SHALL show: name, therapeutic area, category, status chip (Active / Inactive / Archived), and a thumbnail image if one exists.

**AC-CAT-03**
WHEN the user applies filters THEN the system SHALL support: therapeutic area (multi-select), category (multi-select), and status.

**AC-CAT-04**
WHEN the user searches THEN the system SHALL match on product name, active substance, and therapeutic area.

**AC-CAT-05**
WHEN the rep views the catalog THEN only `active` products matching their segment scope SHALL be shown. Managers see `active` + `inactive` within their scope.

**AC-CAT-06**
WHEN the admin views the catalog THEN all statuses (including `archived`) are shown.

---

### Product Detail Page

**AC-CAT-07**
WHEN a product row is tapped/clicked THEN the system SHALL navigate to the product detail page with full rich content.

**AC-CAT-08**
WHEN the product detail page loads THEN the system SHALL display the following sections:
- **Header:** product name, active substance, category, therapeutic area, status chip, thumbnail
- **Clinical Summary:** indication overview, contraindications, key clinical data (free-text, markdown)
- **Segments:** market segments the product belongs to
- **Materials:** linked CLM presentations (from Spec 07) and clinical documents
- **Active Campaigns:** any running campaigns promoting this product (from Spec 26)
- **Recent Promotion Activity:** rep's own most recent promotions of this product (from Spec 12)

**AC-CAT-09**
WHEN the Materials section is displayed THEN each item SHALL show: title, type (Presentation / Datasheet / Study / Other), last updated date, and a download/open action.

**AC-CAT-10**
WHEN a rep taps "Promote this product" from the detail page THEN the system SHALL navigate to the visit log with this product pre-selected in the promotion list.

---

### Product Document Management

**AC-CAT-11**
WHEN an admin uploads a document to a product THEN the system SHALL accept: PDF, PPTX, DOCX, PNG, JPEG. Max file size: 50 MB.

**AC-CAT-12**
WHEN a document is uploaded THEN the system SHALL store: file name, type, upload date, uploaded by, and a version note (optional).

**AC-CAT-13**
WHEN a newer version of a document is uploaded THEN the previous version SHALL be archived and remain accessible via "older versions" — not deleted.

**AC-CAT-14**
WHEN a document is marked `restricted` THEN it SHALL only be visible to users with the admin role and explicit access grants — not to reps or managers.

---

### Admin Product Content Editor

**AC-CAT-15**
WHEN an admin edits a product THEN the system SHALL expose all rich content fields in addition to the standard fields from Spec 12:
- `thumbnail` — single image upload
- `images` — gallery (up to 10 images)
- `clinicalSummary` — markdown editor with preview
- `indications` — markdown or bullet list
- `contraindications` — markdown or bullet list
- `activeSubstance` — text
- `documents` — document attachment management (AC-CAT-11 to AC-CAT-14)

**AC-CAT-16**
WHEN an admin saves a clinical summary change THEN the system SHALL record the editor's identity and timestamp as an audit entry — clinical content changes are sensitive.

---

## Data Model Extension

The following fields are added to the existing `Product` model from Spec 12:

```prisma
model Product {
  // existing fields from Spec 12 ...
  activeSubstance    String?
  thumbnail          String?           // S3 URL
  images             String[]          // S3 URLs (up to 10)
  clinicalSummary    String?           // Markdown
  indications        String?           // Markdown
  contraindications  String?           // Markdown
  documents          ProductDocument[]
}

model ProductDocument {
  id            String              @id @default(cuid())
  productId     String
  product       Product             @relation(fields: [productId], references: [id])
  title         String
  type          ProductDocumentType
  s3Key         String
  fileSize      Int                 // bytes
  isRestricted  Boolean             @default(false)
  isArchived    Boolean             @default(false)
  versionNote   String?
  uploadedById  String
  createdAt     DateTime            @default(now())
}

enum ProductDocumentType {
  PRESENTATION
  DATASHEET
  CLINICAL_STUDY
  PATIENT_LEAFLET
  OTHER
}
```

---

## Navigation & Access

### Mobile (Flutter — RepShell)
A **Products** tab is added to the side drawer navigation (between Catalog/Explorar and Agenda). Accessible to `USER` (rep) and `MANAGER` roles.

### Web (Next.js — `/app/products/*`)
- `/app/products` — catalog page (rep/manager view)
- `/app/admin/products` — admin product management (CRUD + rich content editor)

Both routes already exist in spirit via ATLAS-157 (admin catalog ticket); this spec adds the rep-facing standalone page and the rich content layers.

---

## Acceptance Criteria Summary

- Rep can reach the product catalog from the main navigation without starting a visit.
- Product detail page shows all rich content sections with correct data.
- Documents open/download correctly on both web and mobile.
- Admin can add/update all rich content fields.
- Document versioning preserves history and never deletes old versions.
- Segment scoping is enforced: reps only see products matching their segments.
- "Promote this product" deep-link from detail page enters the visit flow correctly.

---

## Open Questions

1. Should reps be able to mark products as "favorites" for quick access?
2. Should the catalog have an offline mode (download product info for offline reading)?
3. Are there regulatory requirements around who can view restricted clinical documents?
4. Should managers see team-level promotion stats per product on this page, or only in BI Dashboard (Spec 03)?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-213](https://linear.app/atlasmed/issue/ATLAS-213/) | PARENT | Product Catalog & Information Hub | Backlog |
| [ATLAS-214](https://linear.app/atlasmed/issue/ATLAS-214/) | BE | Product Catalog — rich content fields, document management & standalone catalog API | Backlog |
| [ATLAS-215](https://linear.app/atlasmed/issue/ATLAS-215/) | WE | Product Catalog — standalone catalog page, search/filter & rich product detail | Backlog |
| [ATLAS-216](https://linear.app/atlasmed/issue/ATLAS-216/) | WE | Product Catalog — admin rich content editor & document upload | Backlog |
| [ATLAS-217](https://linear.app/atlasmed/issue/ATLAS-217/) | MOB | Product Catalog — standalone "Products" screen, search/filter & rich product detail | Backlog |
| [ATLAS-218](https://linear.app/atlasmed/issue/ATLAS-218/) | DESIGN | Product Catalog & Information Hub — web & mobile screens | Backlog |
