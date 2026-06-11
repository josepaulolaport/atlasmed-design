# Spec: Presentation Observability

**Domain:** Presentation Observability (Product Promotion Observability · Event Stream · Quality Scoring)  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 07 — Presentations](./07-presentations.md), [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 12 — Product Promotion](./12-product-promotion.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. No `PresentationSession` or `PresentationEvent` models exist. Prerequisite chain: Spec 07 (material model) + Spec 12 → **this spec**. The local event buffer (offline capture) uses Drift (Spec 32) for buffering slide events locally before sync.

---

## Overview

Presentation observability tracks how CLM materials are actually used during visits. When a representative opens a product presentation on their device, the system creates a session record and captures slide-level navigation events. Summaries derived from these events allow managers to assess execution quality, and marketing teams to identify which slides are skipped, which content resonates, and where representatives lose the doctor's attention.

This spec covers three linked features:
1. **Presentation Session Tracking** — session lifecycle, linked to visit and product promotion record.
2. **Event Stream** — raw slide-level events that are the source of truth for session reconstruction.
3. **Quality Scoring** — computed score per session based on configurable rules.

> **Scope note:** The system monitors how the company's approved material was used by the representative, not the doctor's behavior. This is a field execution compliance feature.

---

## User Stories

**US-OBS-01 — Session Created Automatically**  
As a field representative, I want the system to automatically track when I open a presentation during a visit, without any manual action, so that I do not have to remember to log it separately.

**US-OBS-02 — Offline Event Capture**  
As a field representative in a clinic with no connectivity, I want presentation events to be captured locally and synced later, so that offline sessions are not lost.

**US-OBS-03 — Manager Views Presentation Execution**  
As a manager, I want to see whether my team members completed their presentations during visits, which slides they skipped, and how long they spent on each, so that I can coach them on presentation technique.

**US-OBS-04 — Marketing Analyzes Slide Engagement**  
As an admin (ADMIN role), I want to see aggregate slide-level data (average time per slide, skip rates, completion rates) across all representatives, so that I can improve presentation content.

**US-OBS-05 — Understand Quality Score**  
As a manager, I want to see an explainable quality score for each session, not just a number, so that I can have specific coaching conversations.

---

## Requirements & Acceptance Criteria

### Session Tracking

**AC-OBS-01**  
WHEN a representative opens a CLM presentation from within the visit registration flow THEN the system SHALL automatically create a `PresentationSession` linked to the active visit and product promotion record.

**AC-OBS-02**  
WHEN a presentation session starts THEN the system SHALL record: session ID, presentation material ID, material version, visit ID, product promotion ID, representative ID, customer ID, segment IDs, start time, and device connectivity status (online/offline).

**AC-OBS-03**  
WHEN a presentation session ends (app closed, presentation closed, visit saved) THEN the system SHALL record: end time, last slide reached, total slides viewed, total slides skipped, total duration, and whether the session was completed.

**AC-OBS-04**  
WHEN a presentation is opened outside of a registered visit THEN the system SHALL still create a session but mark `visitId` as null and `context` as `standalone`.

---

### Event Stream

**AC-OBS-05**  
WHEN the representative navigates between slides THEN the system SHALL emit the following events: `slide_entered`, `slide_exited`, `slide_skipped`, `slide_revisited`.

**AC-OBS-06**  
WHEN a representative jumps from slide N to slide N+M (M > 1) THEN the system SHALL emit `slide_skipped` for each slide between N and N+M (hard skip).

**AC-OBS-07**  
WHEN a slide is displayed for less than a configurable threshold (default: 3 seconds) THEN the system SHALL mark the slide exit event with `viewQuality: 'too_quick'`.

**AC-OBS-08**  
WHEN the presentation reaches the last slide THEN the system SHALL emit a `presentation_completed` event.

**AC-OBS-09**  
WHEN the presentation is closed before the last slide THEN the system SHALL emit a `presentation_abandoned` event with `lastSlideIndex` recorded.

**AC-OBS-10**  
WHEN the device is offline THEN the system SHALL persist all events to local storage in insertion order. On reconnection, the system SHALL sync the full event queue without duplication (idempotent via event ID).

**AC-OBS-11**  
Each event SHALL include: `eventId` (UUID), `sessionId`, `slideIndex`, `slideId`, `eventType`, `timestamp`, `durationOnSlide` (for exit events), `viewQuality`.

---

### Session Summary (computed after session ends)

**AC-OBS-12**  
WHEN a session ends or syncs THEN the system SHALL compute and store a `SessionSummary` derived from the event stream:
- `completionStatus`: `completed` | `partial` | `abandoned`
- `totalSlidesViewed`: count of unique slides with `viewQuality != 'skipped'`
- `totalSlidesSkipped`: count of hard-skipped slides
- `avgTimePerSlide`: seconds
- `requiredSlidesViewed`: boolean (all required slides viewed with sufficient time)
- `qualityScore`: 0–100

---

### Quality Score

**AC-OBS-13**  
WHEN a session summary is computed THEN the quality score SHALL be calculated based on the following configurable dimensions:

| Dimension | Weight (default) | Condition |
|-----------|-----------------|-----------|
| Completion | 30% | Reached final slide |
| Required slides | 30% | All required slides viewed ≥ min_time |
| No hard skips | 20% | Zero hard-skipped slides |
| Adequate time | 20% | avg_time_per_slide ≥ configurable threshold |

**AC-OBS-14**  
WHEN a presentation defines required slides THEN the system SHALL use that definition for the "required slides" dimension. If no required slides are defined, this dimension is skipped and its weight redistributed.

**AC-OBS-15**  
WHEN a manager views a session's quality score THEN the system SHALL display an explainability breakdown: which dimensions passed, which failed, and why.

**AC-OBS-16**  
WHEN a quality score is below a configurable alert threshold (default: 50) THEN the system SHALL flag the session on the manager coaching dashboard (see Spec 24).

---

### Market Segment Scoping

**AC-OBS-17**  
All session and event queries SHALL apply the two-dimensional authorization rule. Session records inherit segment IDs from the visit and product promotion record.

---

## Design

### Event Types

```typescript
type PresentationEventType =
  | 'session_started'
  | 'slide_entered'
  | 'slide_exited'
  | 'slide_skipped'
  | 'slide_revisited'
  | 'presentation_completed'
  | 'presentation_abandoned'
  | 'session_synced';

type ViewQuality = 'normal' | 'too_quick' | 'skipped';
```

### Data Models

```typescript
interface PresentationSession {
  id: string;
  materialId: string;          // stable material identifier (Spec 07 uses materialId + version)
  materialVersion: string;     // semver or hash; aligns with Spec 07 versioning
  visitId?: string;
  productPromotionId?: string;
  representativeId: string;
  entityId?: string;
  segmentIds: string[];
  startedAt: Date;
  endedAt?: Date;
  syncedAt?: Date;
  completionStatus: 'completed' | 'partial' | 'abandoned';
  lastSlideIndex: number;
  totalSlides: number;
  totalSlidesViewed: number;
  totalSlidesSkipped: number;
  durationSeconds: number;
  avgTimePerSlide: number;
  qualityScore: number;             // 0–100
  qualityBreakdown: QualityBreakdown;
  wasOffline: boolean;
}

interface PresentationEvent {
  id: string;                       // UUID, for idempotent sync
  sessionId: string;
  eventType: PresentationEventType;
  slideIndex?: number;
  slideId?: string;
  timestamp: Date;
  durationOnSlide?: number;         // seconds (for exit events)
  viewQuality?: ViewQuality;
  metadata?: Record<string, unknown>;
}

interface QualityBreakdown {
  completion: { passed: boolean; score: number; reason?: string };
  requiredSlides: { passed: boolean; score: number; reason?: string };
  noHardSkips: { passed: boolean; score: number; reason?: string };
  adequateTime: { passed: boolean; score: number; reason?: string };
}

interface SlideDefinition {
  materialId: string;          // matches PresentationSession.materialId
  slideIndex: number;
  slideId: string;
  title?: string;
  isRequired: boolean;
  minViewTimeSeconds: number;       // 0 = no minimum
}
```

### Offline Event Buffer

```
Device (offline)
  ├── Events stored in Drift `presentation_events` table (see Spec 32 Drift Tables)
  ├── Queue preserved across app restarts
  └── On reconnect → batch POST to /api/presentation-events
        └── Server deduplicates by eventId
              └── Session summary recomputed server-side
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Session lost (app crash) | Events already emitted are preserved; session marked `partial` on sync |
| Presentation updated between offline and sync | Session links to the version ID stored at session start; not retroactively updated |
| Representative opens same presentation twice in one visit | Two separate sessions created; both linked to the visit |
| Quick scroll through all slides | All slides marked `view_quality: too_quick`; quality score reflects this |
| Score computation fails | Session flagged for manual review; default score = 0 |

### Open Questions

1. Should the system capture interaction events inside interactive slides (e.g. tap on a hotspot)?
2. Is there a maximum session duration after which the session is automatically abandoned?
3. Should quality scores be visible to the representative, or only to managers?
4. Are required slides configured per presentation version or per campaign?
5. Is there a way for representatives to contest a low quality score?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-83](https://linear.app/atlasmed/issue/ATLAS-83/) | Parent | Spec 13: Presentation Observability | Backlog |
| [ATLAS-84](https://linear.app/atlasmed/issue/ATLAS-84/) | [BE] | Presentation Observability — session & event models, analytics API | Backlog |
| [ATLAS-85](https://linear.app/atlasmed/issue/ATLAS-85/) | [MOB] | Presentation Observability — Flutter event tracking | Backlog |
| [ATLAS-158](https://linear.app/atlasmed/issue/ATLAS-158/) | [WE] | Presentation Observability — manager session review & engagement analytics | Backlog |
| [ATLAS-173](https://linear.app/atlasmed/issue/ATLAS-173/) | [DESIGN] | Spec 13: Presentation Observability — analytics & session review UI | Backlog |
