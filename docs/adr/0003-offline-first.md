# ADR 0003: Offline-First Mobile Architecture

## Status

Accepted

## Context

Field representatives use the Atlasmed mobile app in areas with poor or no connectivity — hospital corridors, rural clinics, basements. The core field execution workflow (visit registration, product promotion, follow-ups, presentations) must not require connectivity to function.

Two strategies were considered:
1. **Offline-capable:** Try the network first; fall back to a local cache on failure.
2. **Offline-first:** Read always from local storage; sync to server in the background.

## Decision

The mobile app is **offline-first**: Drift (SQLite) is the primary read source. The app never checks connectivity before rendering a screen or allowing a user action. A background `SyncService` reconciles local writes with the server whenever connectivity is restored.

The server is the **cross-device reconciliation authority** — it holds the merged, canonical state and resolves conflicts. It is not the read source for any mobile screen.

## Rationale

- Field reps frequently visit locations with no data coverage.
- The offline-capable pattern produces degraded UX (loading spinners, error states) on unreliable networks.
- Drift's reactive queries update the UI automatically when data arrives from sync, without re-renders or extra state management.
- The domain is write-heavy (visit logs, promotions, follow-ups) — queueing writes is a well-understood pattern (see `sync_queue` table in Spec 32).

## Consequences

- All mobile data access goes through Drift tables, not HTTP calls.
- New mobile features must include a corresponding Drift table in Spec 32.
- The `SyncService` must handle idempotency (client-generated UUIDs), conflict resolution (server wins for shared records; both-retained for field notes), and retry with back-off.
- Pre-cache strategy at login populates the Drift DB with the user's territory scope (agenda, customer profiles, products, materials — see Spec 22 AC-OFF-13).
- Features that require live server state (order registration, absence submission) are explicitly marked as requiring connectivity in Spec 22 AC-OFF-02.
- See Spec 22 (Offline Sync) and Spec 32 (Mobile Architecture) for the implementation contract.
