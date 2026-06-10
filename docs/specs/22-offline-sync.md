# Spec: Offline Sync

**Domain:** Offline Sync  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Depends on:** [Spec 32 — Mobile Architecture](./32-mobile-architecture.md) (Drift + SyncService), all mobile-facing specs — especially: Spec 11, Spec 12, Spec 13, Spec 15, Spec 19, Spec 30, [Spec 00 — Platform Foundation](./00-platform-foundation.md)

> **Implementation status:** Not started. The API layer (Elysia) is in place and all write endpoints will need idempotency keys added. The offline library decision is **resolved**: the app uses **Drift** (type-safe SQLite ORM for Flutter) as the local database, with a `SyncQueue` Drift table as the action queue. See Spec 32 for the full architecture. The API's `/api/v1/sync/batch` endpoint does not yet exist.

---

## Overview

Field representatives work in hospitals, clinics, and remote locations where internet connectivity is unreliable. The Atlasmed mobile app is **offline-first**: the app always reads from the local Drift database (Spec 32) and never blocks a user action on network availability. Writes go to Drift immediately and are queued for server sync. A background `SyncService` reconciles local state with the server whenever connectivity is available.

This spec defines the offline-capable feature set, the sync queue, the sync strategy, conflict resolution, and data scope controls.

---

## User Stories

**US-OFF-01 — Work Without Internet**  
As a field representative in a low-connectivity environment, I want to register visits, log products, and capture presentation events even when offline, so that my work is never blocked by a poor signal.

**US-OFF-02 — Sync Automatically**  
As a field representative, I want my offline records to sync automatically when I reconnect, so that I do not have to think about it.

**US-OFF-03 — Know My Sync Status**  
As a field representative, I want to see which records are pending sync, so that I know whether my data is up to date on the server.

**US-OFF-04 — Avoid Duplicate Records**  
As a field representative, I want the system to never create duplicate visits or events when retrying a sync, so that my history remains accurate.

**US-OFF-05 — Scope Offline Cache to My Data**  
As a field representative, I want the app to only cache data I am authorized to access, so that offline data for other segments or territories is never stored on my device.

---

## Requirements & Acceptance Criteria

### Offline-Capable Features

**AC-OFF-01**  
The following actions SHALL be available without a network connection:

| Action | Source spec | Notes |
|--------|-------------|-------|
| View today's agenda (pre-cached) | Spec 15 | read-only; changes synced on reconnect |
| Open customer profile (pre-cached for assigned customers) | Spec 04 | visits, history, health chip |
| Register a visit (effective or ineffective) | Spec 11 | full form including promotions, note |
| Log product promotions within a visit | Spec 12 | promoted products + structured comments |
| Record sample deliveries | Spec 19 | linked to visit |
| Capture presentation slide events | Spec 13 | buffered locally, synced on reconnect |
| Create follow-up actions | Spec 30 | from visit end-screen or standalone |
| Add field notes to customers | Spec 04 | |
| Save next-visit objective | Spec 14 | part of visit save or standalone pre-visit |
| Record customer consent / opt-in | Spec 18 | consent captured during visit or in profile |
| Complete a customer segmentation survey | Spec 16 | classification survey during / after visit |
| Confirm cadastro data (mark as reviewed) | Spec 17 | AC-CAD-10; does not submit edit suggestion |

**AC-OFF-02**  
The following actions SHALL require connectivity and SHALL display an informative message when offline:

| Action | Reason |
|--------|--------|
| Browse the full customer list with new search/filter | large result set |
| Submit an approval request | Spec 21; requires server-side workflow |
| Submit an edit suggestion (cadastro correction) | Spec 17 / Spec 21; requires approval routing |
| Upload photos | binary upload; too large for queue |
| Load presentations not yet downloaded | binary assets |
| Access the BI dashboard with live data | Spec 03; aggregations are server-side |
| Submit absence / non-field activity | Spec 20; requires approval workflow |
| Register order | Spec 06; requires inventory validation |

---

### Local Action Queue

**AC-OFF-03**  
WHEN a user performs any offline-capable write operation THEN the system SHALL save it as a pending operation in the local action queue.

**AC-OFF-04**  
WHEN the device reconnects THEN the system SHALL process the action queue automatically in order, retrying failed operations up to a configurable maximum (default: 3 attempts).

**AC-OFF-05**  
WHEN an operation has been queued THEN the system SHALL display a "Pendente de sync" indicator on the affected record.

**AC-OFF-06**  
WHEN an operation is successfully synced THEN the indicator SHALL change to "Sincronizado" momentarily and then disappear.

**AC-OFF-07**  
WHEN an operation fails all retry attempts THEN the system SHALL display a "Falha no sync" indicator and allow manual retry or discard.

---

### Idempotency

**AC-OFF-08**  
Every offline operation SHALL be assigned a client-generated UUID before local storage. When synced, the server SHALL use this UUID to deduplicate: if the operation was already applied (e.g. from a previous partial sync), the server SHALL return success without creating a duplicate.

**AC-OFF-09**  
Presentation event records (Spec 13) SHALL use their client-generated `eventId` for server-side deduplication.

---

### Conflict Resolution

**AC-OFF-10**  
WHEN a local record is edited offline AND the server version of the same record was modified by another user during the offline period THEN the system SHALL detect a conflict on sync.

**AC-OFF-11**  
WHEN a conflict is detected THEN the system SHALL apply the following strategy:
- For visit records: server version wins; local offline version is saved as a correction request (Spec 21).
- For field notes: both versions are retained; user is notified.
- For customer profile cache: server version wins; local edits are discarded with a notification.

**AC-OFF-12**  
WHEN a conflict cannot be resolved automatically THEN the system SHALL present the user with a conflict resolution screen showing both versions and asking which to keep.

---

### Offline Cache Scope

**AC-OFF-13**  
WHEN the app is online THEN the system SHALL pre-cache the following data for the current user's authorized scope (two-dimensional auth rule, Spec 10):
- Today's agenda + next 7 days
- Customer profiles for all customers in the representative's territory and segments
- Downloaded presentation files (if "Download só em Wi-Fi" is not set)
- Active product portfolio
- Current sample inventory

**AC-OFF-14**  
WHEN the user's segment or territory assignment changes THEN the system SHALL clear the offline cache and re-populate it with the updated scope on the next sync.

**AC-OFF-15**  
The offline cache SHALL NEVER contain data from segments or territories the user is not authorized for. This SHALL be enforced by the cache population logic, not only by the query layer.

---

### Presentation Events (special case)

**AC-OFF-16**  
WHEN a presentation session starts on an offline device THEN the system SHALL write events to a local persistent buffer in real time (not at session end) to prevent data loss from app crashes.

**AC-OFF-17**  
WHEN the device reconnects THEN the full event buffer SHALL be synced before the session summary is computed server-side.

---

## Design

### Sync Architecture

```
Mobile App (Flutter / Drift)
├── Drift (SQLite) database — source of truth for all reads
│   ├── sync_queue      (write operations pending sync — see SyncQueueEntries in Spec 32)
│   ├── Entity tables   (visits, clinic_profiles, agenda_items, products, …)
│   └── presentation_events (slide event buffer)
│
└── SyncService (connectivity_plus — replaces legacy NetInfo)
    ├── Monitors connectivity passively; app NEVER blocks on connectivity check
    ├── On reconnect: drains sync_queue → POST /api/v1/sync/batch
    ├── Then: foreground pre-cache pull for modified entity ranges
    └── Publishes sync status via Riverpod StateNotifier → UI

Server
├── POST /api/v1/sync/batch
│   └── Processes each SyncQueueEntry with operationId UUID
│       ├── Deduplicates via idempotency key
│       ├── Applies changes
│       └── Returns results per operation (success/conflict/error)
└── GET /api/v1/sync/delta?since=<lastSyncAt>&scope=<userId>
    └── Returns changed records since last sync within user's authorized scope
```

### Sync Status Data Model

The Dart-side queue table is `SyncQueueEntries` defined in Spec 32. The `SyncStatus` and `SyncState` are server/API-contract types exposed as JSON over `GET /api/v1/sync/status`.

```typescript
// API contract types (TypeScript — server side)
type SyncStatus = 'synced' | 'pending' | 'failed' | 'conflict';

// SyncQueueEntry on mobile maps to SyncQueueEntries Drift table (Spec 32):
//   operationId (UUID, idempotency key), entityType, action, payload (JSON),
//   status, attempts, createdAt, lastAttemptAt
// These are NOT TypeScript models; mobile uses the Dart Drift schema directly.

interface SyncState {
  lastSyncAt: Date;
  pendingCount: number;
  failedCount: number;
  isOnline: boolean;
  isSyncing: boolean;
}
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Device offline for >7 days | Cache considered stale; force full refresh on reconnect |
| Server returns 401 during sync | Session expired; save queue; redirect to login; restore queue after login |
| Action queue exceeds configurable size limit | Warn user; oldest unsynced operations may be discarded with user confirmation |
| Background sync interrupted mid-batch | Resumes from last successful operation on next attempt (idempotency ensures no duplicates) |

### Open Questions

1. ~~Which offline database library?~~ **Resolved:** **Drift** (Flutter SQLite ORM). See Spec 32 for the full implementation architecture including `SyncQueue` table definition and `SyncService` design.
2. What is the maximum age of pre-cached customer profiles (TTL)?
3. Should managers have offline access to their team's data, or only their own?
4. Should offline-created visits be visible to managers immediately after sync, or only after a confirmation step?
