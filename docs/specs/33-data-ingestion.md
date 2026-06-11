# Spec: Data Ingestion — CNES, AMB & CFM

**Domain:** Data Ingestion  
**Status:** Partially implemented — framework exists, real source adapters not built  
**Last Updated:** 2026-06-10  
**Related:** [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-016/F-017 — existing ingestion framework), [Spec 17 — Cadastro Health](./17-cadastro-health.md) (freshness scoring), [Spec 21 — Requests & Approvals](./21-requests-approvals.md) (registry suggestion workflow), [Spec 29 — AI-Ready Data Layer](./29-ai-data-layer.md) (PRINCIPLE-AI-03)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Ingestion framework (run, diff, suggest) | ✅ **Implemented** | F-016/F-017 — `IngestionRun`, `IngestionSuggestion` models, non-destructive pipeline |
| Suggestion review UI | ✅ **Implemented** | `/registry-suggestions` (web) |
| `MockRegistrySourceAdapter` | ✅ **Implemented** | JSON fixtures, used in dev/demo only |
| `CnesFileAdapter` (bulk CSV/XML) | ❌ **Not started** | Primary real-world source |
| `AmbAdapter` (specialty/procedure data) | ❌ **Not started** | Interface TBD — abstract stub needed |
| `CfmAdapter` (license verification) | ❌ **Not started** | Interface TBD — abstract stub needed |
| Nightly BullMQ schedule | ❌ **Not started** | Cron job for automated nightly runs |
| Admin force-run & run history web UI | ❌ **Partial** | `/registry-ingestion` route exists; needs run status detail, scheduling controls |

---

## Overview

The data ingestion pipeline connects Atlasmed to official Brazilian healthcare registries, keeping the CRM's clinic and doctor records accurate and enriched without overwriting data that representatives have manually verified.

The existing framework (F-016/F-017) defines the correct non-destructive pattern: safe changes (new clinics, updated addresses) apply automatically; destructive changes (removal, deactivation) create reviewable `IngestionSuggestion` records rather than auto-deleting.

This spec defines three real source adapters that replace the existing `MockRegistrySourceAdapter`:

| Source | Entity type | Data provided |
|--------|-------------|---------------|
| **CNES** (Cadastro Nacional de Estabelecimentos de Saúde) | Clinics + Doctors | Establishment details, address, geo-coords, doctor-clinic associations |
| **AMB** (Associação Médica Brasileira) | Doctors | Specialty codes/classifications — *scope TBD pending AMB data access investigation* |
| **CFM** (Conselho Federal de Medicina) | Doctors | Doctor license status, CRM number, specialty registrations (RQE) — *scope TBD pending CFM API/file access investigation* |

---

## Source Adapter Interface

All real source adapters must implement the existing `RegistrySourceAdapter` interface. New adapters are a **plug-in** — the ingestion pipeline is unchanged.

```typescript
interface RegistrySourceAdapter {
  name: string;                              // e.g. 'CNES', 'AMB', 'CFM'
  entityTypes: ('clinic' | 'doctor')[];
  fetch(): Promise<RegistrySnapshot>;        // download + parse raw source
  normalize(raw: RegistrySnapshot): NormalizedRecord[];  // map to CRM shape
}

interface NormalizedRecord {
  entityType: 'clinic' | 'doctor';
  externalId: string;           // source's primary key (e.g. CNES code, CRM number)
  sourceContentHash: string;    // SHA-256 of serialized record for change detection
  data: Partial<Clinic | Doctor | DoctorClinicAssociation>;
}
```

---

## CNES Adapter

### Data Source

- **Provider:** DATASUS / Ministério da Saúde
- **Access method:** Bulk file download (CSV or XML) from the DATASUS open-data portal or `dados.gov.br`
- **Update frequency:** Monthly (DATASUS publishes monthly snapshots)
- **Recommended ingestion trigger:** Nightly cron — skips processing if the file hash matches the previously ingested snapshot

### Field Mapping

#### `Clinic` (from CNES Estabelecimentos)

| CNES field | Clinic model field | Notes |
|---|---|---|
| `CO_CNES` | `externalId` (source: CNES) | Primary key |
| `NO_FANTASIA` / `NO_RAZAO_SOCIAL` | `name` | Prefer fantasy name; fall back to legal name |
| `DS_TIPO_UNIDADE` | `type` | Map to internal type enum |
| `CO_CEP`, `NO_LOGRADOURO`, `NU_ENDERECO`, `NO_BAIRRO`, `NO_MUNICIPIO`, `CO_ESTADO` | `address.*` | Composite address object |
| `NU_LATITUDE` / `NU_LONGITUDE` | `latitude` / `longitude` | For Spec 05 territory map |
| `TP_UNIDADE` | `isActive` | Map CNES status codes to boolean |
| `DT_ATUALIZACAO` | freshness metadata | Feeds `Spec 17` health score |

#### `Doctor` (from CNES Profissionais)

| CNES field | Doctor model field | Notes |
|---|---|---|
| `CO_CPF` / `CO_CRM` (via CFM join) | `externalId` | CNES uses CPF; prefer CRM number from CFM adapter if available |
| `NO_SERVIDOR` | `firstName` + `lastName` | Split on space |
| `DS_CBO` | `specialty` | CBO code → internal specialty enum mapping table required |
| `CO_CNES` (establishment) | `DoctorClinicAssociation.clinicId` | Creates/maintains association records |

#### `DoctorClinicAssociation`

CNES professional records link doctors to establishments. The existing dual-track model applies:
- If a CNES association is new → create `sourceActive = true`
- If a CNES association disappears → create `IngestionSuggestion` type `DOCTOR_CLINIC_REMOVAL` rather than deleting

### Non-Destructive Rules

| Change type | Action |
|---|---|
| New clinic in source, not in CRM | Auto-create |
| Updated clinic fields (name, address) | Auto-update (`sourceContentHash` diff) |
| Clinic removed from source | Create `IngestionSuggestion` type `CLINIC_REMOVAL` |
| New doctor-clinic association | Auto-create (`sourceActive = true`) |
| Doctor-clinic association removed from source | Create `IngestionSuggestion` type `DOCTOR_CLINIC_REMOVAL` |
| Manually edited field (`manuallyEditedAt` set) | **Skip** — rep-confirmed data wins over source |

---

## AMB Adapter

> **Status: Abstract stub — TBD.** AMB data access and exact file format/API are under investigation.

### Purpose (anticipated)

AMB (Tabela AMB / TUSS procedure codes) may provide:
- Specialty classifications for doctors (used to enrich `Doctor.specialty`)
- Procedure code tables (used by Orders — Spec 06 — for product-to-procedure mapping)

### Stub interface

When the scope is confirmed, the `AmbAdapter` will implement `RegistrySourceAdapter` for `entityType: 'doctor'`. Field mapping will be defined in a follow-up update to this spec.

**Pre-work before implementation:**
- Obtain AMB data access agreement or confirm open data availability
- Map AMB specialty codes to the internal specialty enum in `Doctor.specialty`
- Confirm overlap/conflict resolution with CNES specialty codes (CNES uses CBO codes; AMB uses its own)

---

## CFM Adapter

> **Status: Abstract stub — TBD.** CFM API/file access is under investigation.

### Purpose (anticipated)

CFM (Conselho Federal de Medicina) maintains the official registry of licensed physicians in Brazil. May provide:
- Doctor active CRM license number and status (ativo / suspenso / cancelado)
- Doctor specialty board certification (RQE — Registro de Qualificação de Especialidade)

### Stub interface

When the scope is confirmed, the `CfmAdapter` will implement `RegistrySourceAdapter` for `entityType: 'doctor'`. A `CfmLookup` service (point-lookup by CRM number, rather than full bulk download) may be more appropriate than a full snapshot adapter.

**Pre-work before implementation:**
- Assess CFM open-data availability (historical: CFM has had a public query portal)
- Determine if bulk snapshot or per-doctor lookup API is available
- Map CFM license status codes to CRM health/active flags

---

## Ingestion Pipeline

The pipeline is unchanged from F-016. Each adapter plugs into the existing `IngestionService`:

```
1. IngestionRun created (status: running)
2. Adapter.fetch() → downloads raw file / calls API
3. Adapter.normalize() → NormalizedRecord[]
4. Diff against current DB records (by externalId + sourceContentHash)
5. Apply safe changes (upserts)
6. Queue destructive changes as IngestionSuggestion records
7. IngestionRun updated (status: completed | failed, counts: added/updated/suggested/skipped)
8. Emit `registry_suggestion_pending` notification if new suggestions created (Spec 31)
```

---

## Scheduling

### Nightly BullMQ cron

```typescript
// runs nightly at 02:00 BRT
cronJob.schedule('0 5 * * *', async () => {
  await ingestionService.run({ adapter: 'CNES', triggeredBy: 'scheduled' });
  // AMB + CFM: added here when adapters are ready
});
```

- Skips if a run is already in progress
- Skips if source file hash unchanged since last successful run
- On failure: BullMQ retry (3 attempts, exponential backoff); final failure emits alert to ADMIN users

### Admin force-run

`POST /api/v1/registry-ingestion/run` (existing endpoint) continues to work as the admin-triggered force-run. Add optional `?adapter=CNES|AMB|CFM` query param to run a single adapter.

---

## Admin Web UI

Builds on the existing `/registry-ingestion` route:

| Screen/Component | Description |
|---|---|
| **Run history table** | List `IngestionRun` records: source, status, started/completed timestamps, counts (added/updated/suggested/skipped/errors) |
| **Run detail** | Per-run breakdown with error log if failed |
| **Force-run button** | Per-adapter or "Run all" |
| **Schedule status** | Shows next scheduled run time |
| **Suggestion queue** | Link to existing `/registry-suggestions` page |

---

## Acceptance Criteria

**AC-ING-01**  
WHEN the nightly cron fires THEN the system SHALL start a `CnesFileAdapter` ingestion run, download the latest CNES snapshot, and complete without manual intervention.

**AC-ING-02**  
WHEN the CNES source file hash is identical to the previous run THEN the system SHALL skip processing and mark the run as `skipped`.

**AC-ING-03**  
WHEN a clinic present in the previous CRM database is absent from the new CNES snapshot THEN the system SHALL create an `IngestionSuggestion` of type `CLINIC_REMOVAL` rather than deleting the record.

**AC-ING-04**  
WHEN a rep has manually edited a field (`manuallyEditedAt` is set) THEN the ingestion pipeline SHALL NOT overwrite that field.

**AC-ING-05**  
WHEN new `IngestionSuggestion` records are created THEN the system SHALL emit a `registry_suggestion_pending` notification to manager-role users (Spec 31).

**AC-ING-06**  
WHEN an ingestion run fails after 3 retries THEN the system SHALL mark the run as `failed` and create an alert notification for ADMIN users.

**AC-ING-07**  
WHEN an admin navigates to `/registry-ingestion` THEN the system SHALL display the last 10 ingestion runs with status, source, and record counts.

**AC-ING-08**  
WHEN an admin taps "Force Run" THEN the system SHALL start an immediate ingestion run and update the UI in real time.

---

## Open Questions

1. What is the exact DATASUS download URL / FTP path for the current CNES snapshot? (Required for `CnesFileAdapter.fetch()`)
2. What CBO code → internal specialty enum mapping table should be used? (CNES uses CBO; CFM uses its own specialties)
3. Is there an AMB open-data agreement or purchase required?
4. Does the CFM portal support bulk export or only per-CRM-number queries?
5. Should CNES geo-coordinates be ingested immediately into `Clinic.latitude/longitude` (for Spec 05 territory map) or held for admin confirmation?
6. What is the expected volume? (CNES has ~300k+ establishments nationally — should ingestion be scoped to specific states/territories or national?)

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-133](https://linear.app/atlasmed/issue/ATLAS-133/) | Parent | Spec 33: Data Ingestion — CNES, AMB & CFM | Backlog |
| [ATLAS-134](https://linear.app/atlasmed/issue/ATLAS-134/) | [BE] | Data Ingestion — CNES file adapter & nightly schedule | Backlog |
| [ATLAS-135](https://linear.app/atlasmed/issue/ATLAS-135/) | [BE] | Data Ingestion — AMB & CFM adapter stubs | Backlog |
| [ATLAS-136](https://linear.app/atlasmed/issue/ATLAS-136/) | [WE] | Data Ingestion — admin run history & controls | Backlog |
| [ATLAS-145](https://linear.app/atlasmed/issue/ATLAS-145/) | [BE] | Registry ingestion framework — run pipeline, mock adapter, suggestions workflow | Done |
