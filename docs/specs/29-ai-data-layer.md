# Spec: AI-Ready Structured Data Layer

**Domain:** AI-Ready Structured Data Layer  
**Status:** Active — apply during all new development  
**Last Updated:** 2026-06-10  
**Type:** Cross-cutting engineering principle — not a user-facing feature module  
**Applies to:** All specs in this system

> **Implementation note:** Several principles in this spec apply to the **existing** codebase right now. Specifically: the registry ingestion system (F-016/F-017) follows the dual-track / "never destroy history" principle (PRINCIPLE-AI-03). The `AuditLog` (F-010) supports PRINCIPLE-AI-11 (immutable event log). New development should treat this spec as a code review checklist, not a future TODO. The existing `IngestionSuggestion` and `AuditLog` tables are reference implementations to learn from.

---

## Overview

This spec is not a screen or a user-facing feature. It is a set of engineering principles and data design requirements that must be applied across the entire Atlasmed CRM to ensure all structured data is AI-accessible in the future. The goal is to build an execution data foundation — not just operational screens — so that a future AI assistant can answer questions about the field team's performance, recommend actions, surface anomalies, and help representatives prepare for visits.

Without these principles, the system may look functionally complete but produce data that is difficult to query, analyze, or feed into AI models: free-text notes everywhere, status fields without history, relationships broken by hard deletes, and metrics computed in ad hoc ways.

---

## Core Principles

### 1. Prefer Structured Fields Over Free Text

**PRINCIPLE-AI-01**  
Every domain event that describes what happened during a customer interaction SHALL have at minimum one structured field capturing its nature — type, outcome, classification, or category — in addition to any free-text note.

Examples:
- Visit outcome → `VisitStatus` enum, not just a note
- Product discussion result → `InterestLevel` enum + `StructuredComment[]`
- Consent capture → explicit channel and purpose fields, not just "consented"
- Frequency status → computed `FrequencyProgress` object, not a text description

**PRINCIPLE-AI-02**  
Free-text fields SHALL be supplementary, not the primary data. Any text field expected to be analyzed at scale SHALL be paired with a structured classifier.

---

### 2. Never Destroy History

**PRINCIPLE-AI-03**  
Customer records, product associations, survey answers, consent records, and segment assignments SHALL NEVER be hard-deleted when they are superseded. Instead:
- Use soft deletes (`deletedAt` timestamp) for records that are no longer current
- Create versioned or event-based history for fields that change over time
- Preserve segment snapshots on visit records (not live foreign keys)

> **LGPD Right to Erasure exception (PRINCIPLE-AI-03A):** When an `account_deletion` request (Spec 21) is approved, personal identifying data for that user SHALL be **pseudonymised/anonymised** rather than hard-deleted. Replace names, emails, and contact fields with placeholder values; retain the structural records (visits, promotions, scores) for business continuity and audit. The anonymisation job is the only permitted path to removing PII. See Spec 08 AC-PROF-18 and Spec 21 for the approval flow.

**PRINCIPLE-AI-04**  
Survey versions (Spec 16), consent policy versions (Spec 18), and presentation material versions (Spec 07 / Spec 13) SHALL use explicit version IDs so that historical records remain correctly linked even after the source changes.

---

### 3. Record Intent and Outcome Separately

**PRINCIPLE-AI-05**  
Planned actions (planned visit, scheduled follow-up, campaign target) SHALL be stored separately from executed outcomes (effective visit, completed follow-up, campaign execution). This separation enables analysis of planning vs. execution gaps.

---

### 4. Use Consistent Timestamps

**PRINCIPLE-AI-06**  
Every record SHALL include both `createdAt` (when the record was inserted into the database) and the business timestamp of the event it represents (e.g. `executedAt` for a visit, `grantedAt` for consent). These are not always the same — a visit registered retroactively has a `createdAt` after the `executedAt`.

**PRINCIPLE-AI-07**  
For offline-created records, the client timestamp SHALL be stored as the business timestamp; the server insertion timestamp SHALL be stored as `createdAt`. Both SHALL be preserved.

---

### 5. Segment Context on Every Record

**PRINCIPLE-AI-08**  
Every operational record (visit, product promotion, follow-up, sample delivery, presentation session) SHALL carry a `segmentIds` snapshot at the time of creation. This enables AI queries scoped to a market segment without having to join through live relationship tables.

---

### 6. Event Sourcing for High-Frequency Actions

**PRINCIPLE-AI-09**  
Actions that generate many records quickly (presentation slide events, sync queue items) SHALL use an event stream pattern: store raw events with timestamps and reconstruct summaries. Do not compute summaries destructively from events; preserve the raw stream.

See Spec 13 (Presentation Event Stream) as the reference implementation.

---

### 7. Denormalized Read Models

**PRINCIPLE-AI-10**  
For AI queries and analytics, maintain denormalized materialized views or summary tables:
- Customer timeline events (Spec 27) — materialized from source tables
- Frequency progress (Spec 11) — recalculated and cached per customer
- Visit quality scores (Spec 28) — stored on the visit record after computation
- Cadastro health scores (Spec 17) — recomputed and cached

These read models must not be the source of truth, but they must exist so that AI queries and dashboards can run efficiently without joining 10 tables.

---

### 8. Audit Every Approval

**PRINCIPLE-AI-11**  
The approval workflow (Spec 21) SHALL produce an immutable event log per request. This log is the primary source for AI analysis of data quality evolution, correction frequency, and approval patterns over time.

---

## AI Use Cases This Data Layer Enables

Once the above principles are applied across all specs, the following AI capabilities become achievable without additional data collection:

| AI Use Case | Required Data |
|------------|---------------|
| "Which doctors should I visit this week?" | Frequency progress, segmentation, agenda, frequency targets |
| "What should I say to Dr. João?" | Pre-visit intelligence, last visit summary, structured comments, pending follow-ups |
| "Which reps are skipping Product A presentations?" | Product promotion records, presentation sessions, quality scores |
| "Which customers have pending consent?" | Consent records by channel and status |
| "Which doctors requested technical material?" | Structured comments (`technical_material_requested`) |
| "Which segment is underperforming?" | Coverage metrics, effective rates, frequency compliance by segment |
| "Which Dermatology customers haven't been visited?" | Visit history + frequency status + segment filter |
| "What is the most common objection for Product X?" | Structured comments aggregated by product |
| "Which reps set next-visit objectives consistently?" | Next visit objective records by representative |

---

## Compliance with This Spec

New feature specs SHALL reference this spec and confirm their data model complies with the principles above. Pull requests adding new data models SHALL be reviewed for compliance with PRINCIPLE-AI-01 through PRINCIPLE-AI-11 before merge.

---

## Open Questions

1. Should AI capabilities be built in-house or via an LLM API integration (e.g. OpenAI, Anthropic)?
2. ~~Is there a data retention policy that conflicts with "never destroy history"? (LGPD right to erasure)~~ **Resolved:** PRINCIPLE-AI-03A — anonymisation path. See above.
3. At what scale (customer count, visit count per day) does the denormalized read model strategy need to be supplemented by a vector database or dedicated analytics warehouse?
