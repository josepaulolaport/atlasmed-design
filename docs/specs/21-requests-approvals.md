# Spec: Requests & Approval Workflows

**Domain:** Requests & Approval Workflows  
**Status:** Partially implemented (registry suggestions) — full model not started  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 31 — Notifications](./31-notifications.md) (request event types: `request_submitted`, `request_approved`, `request_rejected`, `request_returned`), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-017 — existing registry suggestions)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Registry suggestions (CLINIC_REMOVAL, CLINIC_REACTIVATION, DOCTOR_CLINIC_REMOVAL) | ✅ **Implemented** | F-017 — `IngestionSuggestion` table + review API |
| Data correction requests (general model) | ❌ **Not started** | This spec generalizes F-017 |
| Sample replenishment requests | ❌ **Not started** | Depends on Spec 19 |
| Absence approval requests | ❌ **Not started** | Depends on Spec 20 |
| Visit correction requests | ❌ **Not started** | Depends on Spec 11 |
| Account deletion requests | ❌ **Not started** | Referenced from Spec 08 |
| Requester and reviewer web/mobile UI | ❌ **Not started** | Web: extend existing `/registry-suggestions` pattern |

### Relationship to Registry Suggestions (F-017)

The existing `IngestionSuggestion` workflow (F-017) is the **first concrete implementation** of this spec's concept. When building the full Spec 21 approval engine:

1. The new `ApprovalRequest` table should **subsume** the `IngestionSuggestion` table over time — registry suggestions become one `requestType` within the unified workflow
2. The existing `/api/v1/registry-suggestions` API endpoints can be maintained as an alias or deprecated in favour of `/api/v1/requests?type=registry_suggestion`
3. The `IngestionSuggestion` state machine (PENDING → APPROVED/REJECTED/EXPIRED/SUPERSEDED) maps directly to the lifecycle defined in this spec

Do not rebuild what already exists — extend it.

---

## Overview

Many CRM actions require a second review before taking effect — data corrections, territory changes, segment reassignments, sample replenishment, absence requests, visit corrections, and future commercial exceptions. This spec defines a generic, auditable request-and-approval workflow that all other specs reference. The workflow preserves the full history of what was proposed, who reviewed it, and what decision was made.

> **Relationship to other specs:** Spec 04 (Client Management) has an edit suggestion flow. Spec 19 (Sample Management) has replenishment requests. Spec 20 (Absence) has leave approval. This spec is the underlying engine for all of them.

---

## User Stories

**US-REQ-01 — Submit a Request**  
As a field representative, I want to submit a request for data changes, corrections, or resource adjustments, so that I can initiate changes that require authorization without having direct edit access.

**US-REQ-02 — Track My Requests**  
As a field representative, I want to see the status of all my pending requests, so that I know what is waiting for review and what was approved or rejected.

**US-REQ-03 — Review Pending Requests**  
As a manager, I want to see all pending requests within my scope, so that I can review, approve, or reject them efficiently.

**US-REQ-04 — Understand Decision History**  
As a representative or manager, I want to see the full audit trail for any request (original proposal, reviewer, decision, reason), so that decisions are transparent and traceable.

**US-REQ-05 — Request Data Correction**  
As a field representative, I want to suggest a correction to a customer's data and have it routed to the appropriate reviewer, so that errors are fixed without me having unrestricted edit access.

---

## Requirements & Acceptance Criteria

### Creating a Request

**AC-REQ-01**  
WHEN a request is created THEN the system SHALL record: requester, request type, target entity (if applicable), proposed change data, creation timestamp, and initial status `pending`.

**AC-REQ-02**  
WHEN a request is created THEN the system SHALL automatically determine the correct reviewer based on the request type and the requester's territory/segment scope (e.g. the requester's direct manager, or admin for global changes).

**AC-REQ-03**  
WHEN a request is submitted THEN the system SHALL emit a `request_submitted` notification event (Spec 31 — Notifications) targeting the assigned reviewer.

---

### Request Types

| Type Code | Label | Reviewer | Notes |
|-----------|-------|---------|-------|
| `data_correction` | Correção de cadastro | Manager | Field edits submitted by reps (Spec 04 AC-CRM-50) |
| `registry_suggestion` | Sugestão de atualização via registry | Admin/Manager | Migrated from F-017 `IngestionSuggestion`; F-017 status `ACCEPTED` maps to `approved` here |
| `new_customer` | Novo cliente (clínica/médico) | Manager | |
| `segment_assignment` | Alteração de segmento do cliente | Admin | |
| `territory_reassignment` | Reatribuição de território | Admin | |
| `consent_correction` | Correção de consentimento | Manager | |
| `visit_correction` | Correção de visita registrada | Manager | |
| `sample_replenishment` | Reposição de amostras | Manager | |
| `absence_registration` | Registro de ausência | Manager | |
| `account_deletion` | Exclusão de conta | Admin | LGPD right-to-erasure; anonymization, not hard delete |
| `other` | Outro | Manager or Admin | |

**AC-REQ-04**  
WHEN the request type is `data_correction` THEN the system SHALL store the current field value and the proposed new value for each affected field.

**AC-REQ-05**  
WHEN a request has multiple affected fields THEN all fields SHALL be reviewed together in a single decision (not field by field).

---

### Request Lifecycle

```
pending
  ├── [reviewer approves] → approved
  ├── [reviewer rejects]  → rejected
  ├── [reviewer returns]  → returned_for_correction
  │       └── [requester resubmits] → pending
  └── [requester cancels] → cancelled
```

**AC-REQ-06**  
WHEN a reviewer approves a request THEN the system SHALL apply the proposed change automatically to the target record and record `approvedBy`, `approvedAt`, and optional approval notes.

**AC-REQ-07**  
WHEN a reviewer rejects a request THEN the system SHALL require a rejection reason and notify the requester.

**AC-REQ-08**  
WHEN a reviewer returns a request for correction THEN the requester SHALL be notified and able to edit the proposal and resubmit.

**AC-REQ-09**  
WHEN a requester cancels a pending request THEN the system SHALL record `cancelledAt` and no change SHALL be applied.

---

### Audit Trail

**AC-REQ-10**  
WHEN any state transition occurs on a request THEN the system SHALL append an immutable event to the request history: actor, timestamp, action, and notes.

**AC-REQ-11**  
WHEN a `data_correction` request is approved THEN the customer record SHALL show the old value, new value, approver, and date in the field's edit history.

---

### Requester View

**AC-REQ-12**  
WHEN a representative opens their requests view THEN the system SHALL display all their requests grouped by status (Pendente / Aprovado / Rejeitado / Devolvido / Cancelado) with date and request type.

---

### Reviewer View

**AC-REQ-13**  
WHEN a manager opens the review queue THEN the system SHALL display pending requests sorted by creation date, with request type, requester name, and target entity.

**AC-REQ-14**  
WHEN a reviewer opens a `data_correction` request THEN the system SHALL display a side-by-side diff of current vs proposed values.

---

### Market Segment Scoping

**AC-REQ-15**  
All request queries SHALL apply normal authorization scoping. A manager only sees requests for customers, representatives, and resources within their territory and segment.

---

## Design

### Data Models

```typescript
type RequestType =
  | 'data_correction' | 'registry_suggestion' | 'new_customer' | 'segment_assignment'
  | 'territory_reassignment' | 'consent_correction' | 'visit_correction'
  | 'sample_replenishment' | 'absence_registration' | 'account_deletion' | 'other';

type RequestStatus =
  | 'pending' | 'approved' | 'rejected' | 'returned_for_correction' | 'cancelled';

interface ApprovalRequest {
  id: string;
  type: RequestType;
  requesterId: string;
  reviewerId?: string;
  targetEntityId?: string;
  targetEntityType?: string;
  proposedChanges: Record<string, { current: unknown; proposed: unknown }>;
  description?: string;
  status: RequestStatus;
  history: RequestHistoryEvent[];
  createdAt: Date;
  updatedAt: Date;
}

interface RequestHistoryEvent {
  id: string;
  requestId: string;
  actorId: string;
  action: RequestStatus | 'resubmitted';
  note?: string;
  occurredAt: Date;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Target record deleted before approval | Request marked `stale`; reviewer notified; change cannot be applied |
| Reviewer leaves company | Request reassigned to admin; original reviewer noted in history |
| Conflicting requests for same field | Second request shown as "Conflito — outra solicitação pendente para este campo" |
| Auto-approval rules (future) | Admin can configure certain request types to auto-approve based on conditions |

### Open Questions

1. Should there be a configurable SLA (e.g. requests unanswered after 5 days are escalated)?
2. Can a request be reassigned to a different reviewer by the admin?
3. Should there be an in-app comment thread on a request (back-and-forth between requester and reviewer)?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-50](https://linear.app/atlasmed/issue/ATLAS-50/) | Parent | Spec 21: Requests & Approvals (full model) | Backlog |
| [ATLAS-51](https://linear.app/atlasmed/issue/ATLAS-51/) | [BE] | Requests & Approvals — approval engine & API | Backlog |
| [ATLAS-52](https://linear.app/atlasmed/issue/ATLAS-52/) | [WE] | Requests & Approvals — manager approval queue | Backlog |
| [ATLAS-53](https://linear.app/atlasmed/issue/ATLAS-53/) | [MOB] | Requests & Approvals — rep submission & status | Backlog |
| [ATLAS-169](https://linear.app/atlasmed/issue/ATLAS-169/) | [DESIGN] | Spec 21: Requests & Approvals — manager approval queue UI | Backlog |
