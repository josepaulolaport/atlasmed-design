# Spec: Customer Timeline

**Domain:** Customer Timeline  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10

> **Implementation status:** Not started. The timeline is a **materialized event surface** — no new data is collected, it aggregates existing records from Visit, ProductPromotion, SampleDelivery, ConsentRecord, SurveyResult, FollowUpAction, and others. Can be built as a denormalized `CustomerTimelineEvent` table (DB: `customer_timeline_events`) populated by database triggers or application-level hooks. Note: Spec 06 uses `OrderStatusEvent` for order delivery status — different model, no collision. Recommend building it late in the implementation sequence, after the source models exist.  
**Depends on:** [Spec 04 — Client Management](./04-client-management.md), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 16 — Customer Segmentation Surveys](./16-customer-segmentation-surveys.md), [Spec 17 — Cadastro Health](./17-cadastro-health.md), [Spec 18 — Consent & Communication](./18-consent-communication.md), [Spec 19 — Sample Management](./19-sample-gift-management.md), [Spec 21 — Requests & Approvals](./21-requests-approvals.md), [Spec 26 — Medical Campaigns](./26-medical-campaigns.md), [Spec 30 — Follow-Up Actions](./30-followup-actions.md)

---

## Overview

The customer timeline consolidates all interactions and events related to a specific doctor, clinic, or establishment into a single, chronological, filterable feed. Instead of navigating multiple profile sections, a user can open the timeline and see the full relationship history: visits, product promotions, presentations, samples, consent changes, cadastro updates, segmentation changes, follow-ups, and notes — ordered by date, filterable by type.

The timeline is primarily a mobile read surface but also feeds the pre-visit intelligence view and future AI summarization.

---

## User Stories

**US-TL-01 — View Full Relationship History**  
As a field representative, I want to see a chronological timeline of everything that has happened with a customer, so that I can understand the relationship at a glance before a visit.

**US-TL-02 — Filter by Event Type**  
As a field representative, I want to filter the timeline to show only visits, only product promotions, or only follow-ups, so that I can focus on a specific type of history.

**US-TL-03 — Navigate to Linked Records**  
As a field representative, I want to tap a timeline event and navigate to its full detail, so that I can review specifics without memorizing where things live.

**US-TL-04 — Manager Reviews Relationship History**  
As a manager, I want to see a customer's timeline for any representative in my scope, so that I can assess the quality of the relationship.

**US-TL-05 — Segment-Scoped Timeline**  
As a field representative assigned to Dermatology, I want to see only Dermatology-relevant events in the timeline, so that I do not see information from other segments I am not authorized for.

---

## Requirements & Acceptance Criteria

### Timeline Display

**AC-TL-01**  
WHEN the timeline is opened for a customer THEN the system SHALL display all events in reverse chronological order (most recent first), grouped by month.

**AC-TL-02**  
WHEN an event row is displayed THEN the system SHALL show: event type icon, date and time, author (representative name), event summary, and a link to the full record.

**AC-TL-03**  
WHEN the timeline is filtered THEN only events matching the selected types SHALL be displayed, and the timeline grouping SHALL update accordingly.

---

### Event Types Tracked

| Event Type | Icon | Triggered By |
|-----------|------|-------------|
| Visita efetiva | ✅ | Visit logged as effective |
| Visita inefetiva | ⬜ | Visit logged as ineffective |
| Produto promovido | 💊 | Product promotion record created |
| Apresentação utilizada | 📊 | Presentation session linked to visit |
| Amostra entregue | 🎁 | Sample delivery record created |
| Follow-up criado | 📌 | Follow-up action created |
| Follow-up concluído | ✓ | Follow-up marked complete |
| Consentimento registrado | 🔒 | Consent grant/revocation recorded |
| Dado atualizado | ✏️ | Approved data correction applied |
| Segmentação realizada | 📋 | Segmentation survey completed |
| Nota adicionada | 📝 | Field note created |
| Missão de campanha | 🎯 | Campaign execution linked to customer |

**AC-TL-04**  
WHEN a visit event is displayed THEN the system SHALL show inline: outcome type, duration, and a summarized list of products promoted with top structured comment per product.

---

### Market Segment Scoping

**AC-TL-05**  
WHEN the timeline is loaded THEN the backend SHALL apply the two-dimensional authorization rule (Spec 10). Events from segments the user is not authorized for SHALL be hidden, not shown as placeholders.

**AC-TL-06**  
WHEN a user is authorized for multiple segments that overlap on the same customer THEN the timeline SHALL show events from all authorized segments in a unified chronological feed.

---

## Design

### Data Models

```typescript
type TimelineEventType =
  | 'effective_visit' | 'ineffective_visit'
  | 'product_promotion' | 'presentation_used'
  | 'sample_delivered' | 'followup_created'
  | 'followup_completed' | 'consent_recorded'
  | 'data_updated' | 'segmentation_done'
  | 'note_added' | 'campaign_execution';

/**
 * CustomerTimelineEvent — renamed from TimelineEvent to avoid collision with
 * OrderStatusEvent in Spec 06 (orders delivery timeline).
 * Database table: customer_timeline_events
 */
interface CustomerTimelineEvent {
  id: string;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  type: TimelineEventType;
  occurredAt: Date;
  authorId: string;
  authorName: string;
  segmentIds: string[];
  summary: string;                 // human-readable 1-line
  referenceId: string;             // ID of the linked record
  referenceType: string;           // e.g. 'visit', 'product_promotion'
}
```

### Performance Considerations

- Timeline events are materialized as denormalized rows (not computed on the fly from joins across multiple tables).
- Events are written asynchronously when source records are created or updated.
- Paginate at 20 events per page; support infinite scroll.

### Open Questions

1. Should timeline events be created in real time (synchronous) or via an event bus (asynchronous)?
2. Should the timeline be accessible as a standalone screen or only from within a customer profile?
3. Can managers add comments to timeline events for coaching purposes?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-92](https://linear.app/atlasmed/issue/ATLAS-92/) | Parent | Spec 27: Customer Timeline | Backlog |
| [ATLAS-93](https://linear.app/atlasmed/issue/ATLAS-93/) | [BE] | Customer Timeline — aggregation API | Backlog |
| [ATLAS-94](https://linear.app/atlasmed/issue/ATLAS-94/) | [WE] | Customer Timeline — web timeline component | Backlog |
| [ATLAS-95](https://linear.app/atlasmed/issue/ATLAS-95/) | [MOB] | Customer Timeline — Flutter timeline tab | Backlog |
| [ATLAS-177](https://linear.app/atlasmed/issue/ATLAS-177/) | [DESIGN] | Spec 27: Customer Timeline — web timeline component | Backlog |
