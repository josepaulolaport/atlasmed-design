# Spec: Follow-Up Actions

**Domain:** Follow-Up Actions  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 22 — Offline Sync](./22-offline-sync.md) (offline follow-up creation), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `FollowUpAction` model. The BullMQ infrastructure (F-010) is available for "due today" notification triggers. The manager hierarchy (`managerId` on User — F-009) supports the manager oversight queries. Prerequisite chain: Spec 11 → **this spec**.

---

## Overview

Follow-up actions are tasks and commitments that arise from customer interactions. After a visit, a representative may promise to send technical material, confirm sample availability, schedule a return visit, escalate a request to a manager, or resolve a customer concern. These commitments must be tracked with owners, due dates, priorities, and statuses so that nothing falls through the cracks. Follow-up actions are the operational bridge between individual visits and ongoing relationship management.

> **Relationship to Territory Map spec:** Spec 05 defines the UI surface for follow-ups (tabs: Pendentes/Hoje/Próximos/Concluídos). This spec defines the full data model, lifecycle, permissions, and business rules behind that surface.

---

## User Stories

**US-FU-01 — Create Follow-Up from Visit**  
As a field representative, I want to create one or more follow-up actions when I log a visit, so that commitments I make during the interaction are immediately captured.

**US-FU-02 — Create Standalone Follow-Up**  
As a field representative, I want to create a follow-up action independent of a visit (e.g. from a customer profile or a phone call), so that any commitment can be tracked regardless of how it originated.

**US-FU-03 — Manage My Follow-Up List**  
As a field representative, I want to see all my pending, overdue, and completed follow-ups in one place, with due date and priority indicators, so that I can manage my commitments daily.

**US-FU-04 — Complete a Follow-Up**  
As a field representative, I want to mark a follow-up as completed with an optional note, so that the system reflects resolved commitments.

**US-FU-05 — View Customer Follow-Ups**  
As a field representative, I want to see all open follow-ups for a specific customer on their profile, so that I know what is pending before my next visit.

**US-FU-06 — Manager Oversight**  
As a manager, I want to see open and overdue follow-ups across my team, filtered by representative, customer, segment, and priority, so that I can identify bottlenecks and coach my team.

**US-FU-07 — Follow-Up Reminders**  
As a field representative, I want to receive a notification when a follow-up is due today or overdue, so that I do not forget about commitments.

---

## Requirements & Acceptance Criteria

### Creating Follow-Ups

**AC-FU-01**  
WHEN a representative is in the visit log sheet THEN the system SHALL display an "Adicionar follow-up" section allowing them to create one or more follow-ups before saving the visit.

**AC-FU-02**  
WHEN a follow-up is created THEN the system SHALL require: title (short description), due date, and owner (defaults to the current user).

**AC-FU-03**  
WHEN a follow-up is created THEN the system SHALL allow optionally setting: action type, priority (low / medium / high), related product, and notes.

**AC-FU-04**  
WHEN a follow-up is created from a visit THEN the system SHALL automatically link it to that visit and inherit the customer and market segment.

**AC-FU-05**  
WHEN a follow-up is created standalone (from customer profile or task list) THEN the system SHALL require the user to select or confirm the customer.

---

### Action Types (standardized, admin-configurable)

| Code | Label |
|------|-------|
| `send_material` | Enviar material técnico |
| `send_whatsapp` | Enviar WhatsApp |
| `update_cadastro` | Atualizar cadastro |
| `confirm_samples` | Confirmar disponibilidade de amostras |
| `schedule_visit` | Agendar próxima visita | Completing this action MAY optionally create a `planned` Visit (Spec 11) with the follow-up's `dueDate` as the scheduled date, subject to user confirmation |
| `manager_approval` | Solicitar aprovação do gestor |
| `resolve_request` | Resolver solicitação do cliente |
| `other` | Outro |

---

### Follow-Up Status Lifecycle

```
pending → [completed | cancelled | overdue (automatic)]
overdue → [completed | cancelled]
```

**AC-FU-06**  
WHEN a follow-up's due date passes without being completed THEN the system SHALL automatically transition its status to `overdue`.

**AC-FU-07**  
WHEN a representative marks a follow-up as completed THEN the system SHALL record `completedAt`, `completedBy`, and an optional completion note.

**AC-FU-08**  
WHEN a representative cancels a follow-up THEN the system SHALL require a cancellation reason.

---

### Follow-Up List (Representative View)

**AC-FU-09**  
WHEN the representative views their follow-up list THEN the system SHALL display tabs: Pendentes, Hoje, Próximos, Concluídos — with count badges.

**AC-FU-10**  
WHEN a follow-up card is displayed THEN the system SHALL show: title, customer name, due date, priority indicator, action type chip, and quick actions (e.g. Ligar, Ver no mapa for visit-related follow-ups).

**AC-FU-11**  
WHEN the representative filters by customer THEN the system SHALL show only follow-ups linked to that customer.

---

### Follow-Ups on Customer Profile

**AC-FU-12**  
WHEN a customer profile is opened THEN the system SHALL display a "Pendências" section showing all open follow-ups for that customer.

**AC-FU-13**  
WHEN the pre-visit intelligence view is opened THEN the system SHALL display pending follow-ups as part of the customer context (see Spec 14 — Pre-Visit Intelligence).

---

### Manager View

**AC-FU-14**  
WHEN a manager opens the follow-up management view THEN the system SHALL display their team's follow-ups filterable by: representative, customer, status, priority, action type, market segment, due date range.

**AC-FU-15**  
WHEN a manager views overdue follow-ups THEN the system SHALL sort them by oldest due date first and highlight them visually.

---

### Market Segment Scoping

**AC-FU-16**  
All follow-up queries SHALL apply the two-dimensional authorization rule (territory + market segment). See [Spec 10 — Market Segmentation](./10-market-segmentation.md).

**AC-FU-17**  
WHEN a follow-up action is created THEN the system SHALL emit a `followup` activity entry to Spec 09 (Activity Log) with `entityId`, `entityType`, `actionType`, and `dueDate`.

WHEN a follow-up action is completed THEN the system SHALL emit a corresponding `followup_completed` activity entry with completion notes (if any).

---

## Design

### Data Models

```typescript
type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';
type FollowUpPriority = 'low' | 'medium' | 'high';
type FollowUpActionType =
  | 'send_material'
  | 'send_whatsapp'
  | 'update_cadastro'
  | 'confirm_samples'
  | 'schedule_visit'
  | 'manager_approval'
  | 'resolve_request'
  | 'other';

interface FollowUpAction {
  id: string;
  title: string;
  actionType: FollowUpActionType;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  ownerId: string;
  entityId: string;               // customer (clinic or doctor)
  entityType: 'clinic' | 'doctor';
  segmentIds: string[];           // inherited from customer
  visitId?: string;               // null if created standalone
  relatedProductId?: string;
  note?: string;
  dueDate: Date;
  completedAt?: Date;
  completedBy?: string;
  completionNote?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Follow-up due date in the past (creation) | System warns "Data no passado" but allows creation |
| Visit deleted after follow-up linked | Follow-up remains but `visitId` link shows "(visita removida)" |
| Ownership transfer | Manager can reassign a follow-up to another rep in their scope |
| Offline creation | Follow-up saved locally; synced when connection restores (see Spec 22) |
| Bulk complete | Manager can mark multiple overdue follow-ups as "resolved" in batch |

### Notifications

Follow-up notifications are managed by the notifications infrastructure (Spec 31 — Notifications). Key events (type codes defined in Spec 31):
- Follow-up due today → morning notification to owner
- Follow-up becomes overdue → notification to owner + manager flag
- Follow-up completed → no notification (confirmatory toast only)

### Open Questions

1. Can a follow-up be assigned to a manager or another representative (not just the visit creator)?
2. ~~Should follow-ups generate entries in the Activity Log (Spec 09)?~~ **Resolved:** Yes — AC-FU-17.
3. Is there an escalation flow (rep → manager) when a follow-up is blocked?
4. Can customers see their own follow-ups through a future portal, or is this strictly internal?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-57](https://linear.app/atlasmed/issue/ATLAS-57/) | Parent | Spec 30: Follow-Up Actions | Backlog |
| [ATLAS-58](https://linear.app/atlasmed/issue/ATLAS-58/) | [BE] | Follow-Up Actions — model, CRUD API & notification scheduling | Backlog |
| [ATLAS-59](https://linear.app/atlasmed/issue/ATLAS-59/) | [MOB] | Follow-Up Actions — Flutter creation & list | Backlog |
| [ATLAS-186](https://linear.app/atlasmed/issue/ATLAS-186/) | [WE] | Follow-Up Actions — manager team follow-up management | Backlog |
| [ATLAS-187](https://linear.app/atlasmed/issue/ATLAS-187/) | [DESIGN] | Spec 30: Follow-Up Actions — manager web view | Backlog |
