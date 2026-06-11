# Spec: Presentations

**Domain:** Presentations (Apresentações)  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 13 — Presentation Observability](./13-presentation-observability.md), [Spec 26 — Medical Campaigns](./26-medical-campaigns.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| CLM / Presentations library | ❌ **Not started** | No PresentationMaterial model in codebase |
| Material versioning | ❌ **Not started** | Design described in this spec |
| PDF viewer | ❌ **Not started** | Mobile only |
| **Prerequisites** | — | Spec 10 (segment filter) → this spec; Spec 13 depends on this spec |

> This spec covers the **mobile CLM library** and **admin material upload**. File storage infrastructure (S3/R2 for PDF/images) does not yet exist.
> 
> **CLM content scope:** Presentations are externally-prepared **PDF or PPTX files uploaded by admins** via the web admin panel. There is no in-platform slide authoring. The app displays these files using the device's native viewer or an in-app PDF renderer.

---

## Overview

The Presentations module gives field representatives access to a curated library of sales and clinical materials — product decks, institutional presentations, training content, and commercial guides. Representatives can browse, search, filter, download, view, and share these materials directly from the app. Content is managed centrally by marketing/medical teams and versioned so that representatives always have the latest approved materials.

---

## User Stories

**US-PRES-01 — Browse Library**  
As a field representative, I want to see all available presentations organized by category, so that I can find relevant material for an upcoming clinic visit.

**US-PRES-02 — Search Presentations**  
As a field representative, I want to search for presentations by name or topic, so that I can quickly find a specific deck without scrolling.

**US-PRES-03 — Filter by Category, Lab, and Stock**  
As a field representative, I want to filter the library by medical category, laboratory, and stock availability, so that I see only the presentations relevant to my current context.

**US-PRES-04 — Download for Offline Use**  
As a field representative, I want to download presentations to my device, so that I can show them during clinic visits without an internet connection.

**US-PRES-05 — View Presentation Detail**  
As a field representative, I want to see the title, author, page count, file size, language, and a preview of a presentation before I download it, so that I choose the right material.

**US-PRES-06 — Open and Share**  
As a field representative, I want to open a downloaded presentation and share it with a doctor or clinic contact, so that I can leave them a copy after my visit.

**US-PRES-07 — Featured Presentations**  
As a field representative, I want to see highlighted featured presentations at the top of the library, so that I am aware of priority or newly released materials.

**US-PRES-08 — Admin Material Upload**  
As an admin (ADMIN role), I want to upload a PDF or PPTX file as a new presentation material version, so that representatives have access to the latest approved content from their app.

---

## Requirements & Acceptance Criteria

### Library Screen

**AC-PRES-01**  
WHEN the user opens Apresentações THEN the system SHALL display a search bar, category filter chips, a "Em destaque" (featured) horizontal carousel, and a sorted list of all available presentations.

**AC-PRES-02**  
WHEN no filters or search are active THEN the system SHALL default to "Mais recentes" sort order.

**AC-PRES-03**  
WHEN the user selects a category chip THEN the system SHALL filter the list and carousel to show only presentations in that category.

**AC-PRES-04**  
WHEN the user selects "Todas" THEN the system SHALL remove the category filter and show all presentations.

**AC-PRES-05**  
WHEN the user types in the search bar THEN the system SHALL filter the list in real time, matching against title and subtitle.

**AC-PRES-06**  
WHEN a search returns no results THEN the system SHALL display a "Nenhuma apresentação encontrada" empty state with a suggestion to adjust the search or filters.

**AC-PRES-07**  
WHEN the library is empty THEN the system SHALL display an appropriate empty state message.

**AC-PRES-08**  
WHEN a presentation row is displayed THEN the system SHALL show: format thumbnail (PDF/PPTX icon), title, subtitle, page count, file size, and a download/downloaded state button.

---

### Advanced Filters Sheet

**AC-PRES-09**  
WHEN the user opens the filters sheet THEN the system SHALL display: Categoria (multi-select grid), Laboratório (multi-select chips), Disponibilidade (single-select: Em estoque / Estoque baixo / Sem estoque), and Ordenar por (single-select: Nome A→Z, Z→A, Mais recente, Mais popular, Atualizada recentemente).

**AC-PRES-10**  
WHEN the user applies filters THEN the system SHALL close the sheet, update the list, and display an active-filter count badge on the filter button.

**AC-PRES-11**  
WHEN the user taps "Limpar tudo" THEN the system SHALL reset all filter selections to their defaults without closing the sheet.

**AC-PRES-12**  
WHEN no filters are active THEN the system SHALL not show a badge on the filter button.

---

### Presentation Detail Screen

**AC-PRES-13**  
WHEN the user taps a presentation row THEN the system SHALL navigate to the detail screen showing: category label, share button, large slide preview, title, subtitle, page count, file size, format, author, category, last-updated date, language, and a list of related presentations.

**AC-PRES-14**  
WHEN the presentation has not been downloaded THEN the system SHALL show a "Visualizar" button and a "Baixar" button.

**AC-PRES-15**  
WHEN the user taps "Baixar" THEN the system SHALL show a download progress indicator and disable the button until the download completes.

**AC-PRES-16**  
WHEN the download completes THEN the system SHALL replace the "Baixar" button with "Abrir" and show a share icon.

**AC-PRES-17**  
WHEN the user taps "Abrir" on a **PDF** THEN the system SHALL open the file in the in-app PDF viewer (AC-PRES-20–24).

WHEN the user taps "Abrir" on a **PPTX** THEN the system SHALL open the file using the device's native viewer via the `open_file` Flutter package. If no compatible app is installed, the system SHALL display a message with instructions to install a compatible viewer (e.g. Google Slides, Microsoft Office).

**AC-PRES-18**  
WHEN the user taps the share icon THEN the system SHALL trigger the platform's native share sheet.

**AC-PRES-19**  
WHEN the user taps "Visualizar" THEN the system SHALL open an in-app PDF viewer (without requiring a full download to persistent storage).

---

### PDF Viewer

**AC-PRES-20**  
WHEN the PDF viewer opens THEN the system SHALL display the first page of the document.

**AC-PRES-21**  
WHEN the user swipes horizontally THEN the system SHALL advance or go back one page.

**AC-PRES-22**  
WHEN the user double-taps THEN the system SHALL toggle fullscreen mode (hiding the top bar and controls).

**AC-PRES-23**  
WHEN the user taps the screen while in fullscreen THEN the system SHALL restore the standard navigation controls.

**AC-PRES-24**  
WHEN the viewer is active THEN the system SHALL display a page counter (current / total).

---

### Download Management

**AC-PRES-25**  
WHEN the user has toggled "Download só em Wi-Fi" in Profile > Preferences THEN the system SHALL only initiate downloads when connected to a Wi-Fi network and display an informational message when on mobile data.

**AC-PRES-26**  
WHEN the app detects a newer version of a downloaded presentation THEN the system SHALL prompt the user to update their local copy.

**AC-PRES-26a** *(offline-first — Spec 32)*  
WHEN the device is offline THEN the system SHALL silently serve the downloaded cached version without prompting. Version detection occurs only during foreground sync (connectivity restored). On reconnect, if a newer version is available, the system SHALL emit a `presentation_update_available` in-app notification (Spec 31) and show a banner on the material card. The offline cached copy SHALL NEVER be blocked from viewing due to a newer version being available on the server.

---

### Admin Material Upload (Web — ADMIN role only)

**AC-PRES-27**  
WHEN an admin opens the material upload form THEN the system SHALL display: `materialId` (auto-generated slug, editable), `name`, `version` (default: `1.0`), `category`, `segments` (multi-select from Spec 10), `isFeatured` toggle, file attachment field (PDF or PPTX only, max 50 MB).

**AC-PRES-28**  
WHEN the admin submits the upload form THEN the system SHALL validate the file type (PDF or PPTX only), upload the file to object storage (S3/R2), create a `PresentationMaterial` record with status `active`, and notify the admin of success with the generated `materialId`.

**AC-PRES-29**  
WHEN the admin uploads a new version for an existing `materialId` THEN the system SHALL set the previous version to `inactive` and set the new version as `active`. Both versions are preserved for historical presentation session records (Spec 13).

**AC-PRES-30**  
WHEN an admin deactivates a material THEN the system SHALL set its status to `inactive`; it SHALL no longer appear in the representative's library but previously downloaded copies remain accessible.

---

## Design

### Screen Inventory

| Screen | Entry |
|--------|-------|
| Library (`PresentationsLibraryScreen`) | Main navigation |
| Detail (`PresentationDetailScreen`) | Tap any presentation row |
| PDF Viewer | "Visualizar" or "Abrir" |
| Filters Sheet (`PresentationFiltersSheet`) | Filter icon in library |

### Component Architecture (Flutter)

- **`PresentationsLibraryScreen`** — manages search state, active category chip, list data; delegates to `PresentationRow` and `FeaturedCard`
- **`FeaturedCarousel`** — horizontal `ListView` of featured presentation cards with download button
- **`PresentationRow`** — list item with thumbnail, metadata, and download state button
- **`PresentationDetailScreen`** — detail view; manages download state machine
- **`PresentationFiltersSheet`** — bottom sheet (DraggableScrollableSheet); multi-select and single-select groups; emits via Riverpod `StateNotifier`
- **`PDFViewerScreen`** — wraps `syncfusion_flutter_pdfviewer` or `flutter_pdfview`; manages page state, fullscreen toggle
- **PPTX files** — opened via `open_file` package (delegates to device OS); no in-app rendering

### Download State Machine

```
idle
  └─[tap Baixar]→ downloading (progress 0–100%)
       ├─[complete]→ downloaded (shows Abrir + share)
       └─[error]→ idle (shows error toast + retry)
```

### Data Models

```typescript
type PresentationFormat = 'PDF' | 'PPTX' | 'MP4';
type PresentationCategory =
  | 'Institucional'
  | 'Produtos'
  | 'Clínico'
  | 'Treinamento'
  | 'Comercial';

type MedicalCategory =
  | 'Cardiovascular'
  | 'Diabetes'
  | 'Oncologia'
  | 'Neurologia'
  | 'Gastroenterologia'
  | 'Pediatria'
  | 'Ginecologia'
  | 'Institucional';

interface Presentation {
  id: string;
  title: string;
  subtitle: string;
  format: PresentationFormat;
  category: PresentationCategory;
  medicalCategories: MedicalCategory[];
  laboratoryId: string;
  laboratoryName: string;
  author: string;
  language: string;
  pageCount: number;
  fileSizeMB: number;
  fileUrl: string;
  thumbnailUrl: string;
  updatedAt: Date;
  isFeatured: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  relatedIds: string[];
  downloadCount: number;
}

interface DownloadRecord {
  materialId: string;          // stable material ID; aligns with Spec 13 PresentationSession
  materialVersion: string;     // semver or hash; aligns with Material Versioning section below
  localPath: string;
  downloadedAt: Date;
}

interface PresentationFilters {
  categories: MedicalCategory[];
  laboratories: string[];
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy: 'name_asc' | 'name_desc' | 'newest' | 'popular' | 'recently_updated';
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Download interrupted (network loss) | Resume on reconnect or show "Retomar download" |
| Storage full on device | Alert: "Espaço insuficiente. Libere espaço e tente novamente." |
| File corrupted after download | Detect checksum mismatch → delete + show retry |
| PDF render failure | Fallback message with "Abrir com outro app" option |
| Presentation removed by admin | Show "Este material foi removido" on detail; grey out in list |
| Offline, content already downloaded | Allow viewing from local Drift `download_records` / `path_provider` cache — no connectivity needed |
| Offline, content NOT yet downloaded | Show "Sem conexão" tooltip on "Baixar"; disable the button. "Visualizar" is not shown if file is not cached locally. |

### Market Segmentation Note

The CLM library (all filters and presentation cards) SHALL apply the two-dimensional authorization rule (Spec 10, AC-SEG-17): only materials assigned to at least one of the user's market segments are displayed. The Advanced Filters sheet SHALL include a segment filter chip when the user is assigned to multiple segments.

### Flutter File Storage

Downloaded materials are stored using `path_provider` (Spec 32):
```
<appDocDir>/materials/<materialId>/<version>/<filename>
```
- `DownloadRecord` is persisted in the Drift `download_records` table for offline-first access
- Checksums (MD5 or SHA256) are verified after download to detect corruption (AC-PRES error table)
- `open_file` package used to open PPTX with the device OS

### Material Versioning

Each published CLM presentation SHALL carry a `materialId` + `version` tuple. When a new version is published:
- The old version is set to `inactive` (not deleted)
- Existing download links continue to work (downloaded file is version-specific)
- Historical presentation session records (Spec 13) retain the `materialId` + `version` they were created with, preserving their quality score context

Version is displayed on the material card (e.g. "v2.1") and on the presentation detail screen.

### Presentation Observability Integration

When a representative opens a presentation **from within a visit log flow** (Spec 11 / Spec 12), the system SHALL automatically create a `PresentationSession` linked to the active visit and product promotion record (see Spec 13, AC-OBS-01). This happens transparently — the representative does not need to trigger tracking manually.

### Open Questions

1. Is presentation content hosted on a CDN or streamed from the main API?
2. Are there permission tiers (e.g. some presentations only visible to certain product lines/regions)?
3. What is the maximum file size that should be supported?
4. Should download history be synced across devices for the same user?
5. Is there an analytics requirement to track which presentations were opened/shared and with whom?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-66](https://linear.app/atlasmed/issue/ATLAS-66/) | Parent | Spec 07: Presentations | Backlog |
| [ATLAS-67](https://linear.app/atlasmed/issue/ATLAS-67/) | [BE] | Presentations — material model, S3 upload API & versioning | Backlog |
| [ATLAS-68](https://linear.app/atlasmed/issue/ATLAS-68/) | [WE] | Presentations — admin upload & material management UI | Backlog |
| [ATLAS-69](https://linear.app/atlasmed/issue/ATLAS-69/) | [MOB] | Presentations — Flutter viewer, download & offline playback | Backlog |
| [ATLAS-172](https://linear.app/atlasmed/issue/ATLAS-172/) | [DESIGN] | Spec 07: Presentations — admin material management UI | Backlog |
