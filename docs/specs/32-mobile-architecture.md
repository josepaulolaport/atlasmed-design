# Spec: Mobile App Architecture

**Domain:** Mobile Architecture (Foundation)
**Status:** Not started — planned
**Last Updated:** 2026-06-10
**Depends on:** [Spec 00 — Platform Foundation](./00-platform-foundation.md), [Spec 01 — Authentication](./01-authentication.md), [Spec 31 — Notifications](./31-notifications.md)

> **Implementation status:** A Flutter stub exists (F-019 in Spec 00) but contains no application code. This spec is the architectural decision record for the mobile app. All mobile-facing specs (Specs 01, 03, 05, 07, 09, 11–22, 24, 27, 28, 30) assume this architecture.

> **This spec contains architectural decisions, not user-facing ACs.** Developers should treat it as a mandatory read before writing any Flutter code.

---

## Overview

The Atlasmed mobile app is a Flutter application targeting Android and iOS. It is the primary tool for field representatives in the CRM workflow — visit registration, product promotion, agenda management, presentations, and follow-ups.

> **TypeScript vs Dart convention:** Data models in all other specs are written as TypeScript interfaces — they represent the **API contract** (request/response shapes). The Flutter app implements equivalent Dart models using `freezed`-generated classes in `features/*/data/models/`. When a spec says `interface Visit { … }` it describes the JSON shape from the API; the Dart side has `@freezed class Visit with _$Visit`.  

The app is **offline-first**: all reads come from the local Drift (SQLite) database — the app NEVER blocks a user action on network availability. The server is the **cross-device reconciliation authority**: it holds the canonical merged state and resolves conflicts. A background `SyncService` pushes queued writes and pulls updated state whenever connectivity is available.

---

## Technology Decisions

### Language and Runtime
- **Flutter 3.x / Dart** — cross-platform UI framework
- Minimum SDK: Android 26 (API 26+), iOS 14+

### State Management — Riverpod
- Package: `flutter_riverpod` + `riverpod_annotation` (code generation)
- Rationale: compile-safe, testable, no `BuildContext` dependency in business logic, excellent async support
- Pattern: `AsyncNotifier` for server-backed state, `Notifier` for local UI state, `StreamProvider` for Drift query streams

### Navigation — GoRouter
- Package: `go_router`
- Pattern: shell route with a **side drawer** (`Scaffold.drawer`) as the primary navigation; 6 top-level sections (Desempenho, Explorar, Mapa, Pedidos, Apresentações, Perfil — see Spec 02)
- The shell route wraps a `Scaffold` whose `AppBar` shows the hamburger icon and `Drawer` renders the section list; individual sections are sub-navigators in GoRouter
- Deep linking: notification tap → `go_router` URI mapping (defined in Spec 31 notification types table)
- Auth guard: `redirect` callback checks `AuthState`; unauthenticated routes redirect to `/login`

### Local Database — Drift
- Package: `drift` + `drift_flutter` (SQLite integration)
- Drift provides a type-safe, reactive SQLite ORM with code generation
- All server models that need offline access have a corresponding Drift table
- Drift query streams feed directly into Riverpod `StreamProvider`s — no manual state update needed when data changes

### Secure Token Storage
- Package: `flutter_secure_storage`
- Stores: `access_token`, `refresh_token`, `device_id` (generated once per install)
- Never stored in SharedPreferences or Drift (PII + security)

### HTTP Client
- Package: `dio`
- Auth interceptor: injects `Authorization: Bearer <token>` on every request
- Refresh interceptor: on 401, attempts token refresh (Spec 01); queues concurrent requests during refresh; logs out on refresh failure
- Base URL: configured via build flavor (`dev` / `staging` / `prod`)

### Push Notifications
- Package: `firebase_messaging` (FCM + APNs) + `flutter_local_notifications`
- See Spec 31 for full notification spec
- Token lifecycle managed by `NotificationService` singleton

### File Storage
- Package: `path_provider`
- Downloaded PDF / PPTX materials (Spec 07) stored under `getApplicationDocumentsDirectory()`
- Path: `<appDocDir>/materials/<materialId>/<version>/<filename>`

### Map SDK
- Primary: `flutter_map` (OpenStreetMap tiles, open-source, no API key required)
- Alternative: `google_maps_flutter` (if Google Maps branding is acceptable and API key is available)
- Decision deferred to implementation; `flutter_map` is recommended default

---

## Offline-First Architecture

### Core Principle

> The app NEVER checks "am I online?" before rendering a screen or accepting a user action. All reads come from the local Drift database. Writes go to Drift immediately and are queued for server sync.

```
User action
    │
    ▼
Repository layer
    ├── Write to Drift immediately (optimistic)
    ├── Enqueue SyncQueueEntry in Drift
    └── Return success to UI
         │
         (background)
         ▼
    SyncService (connectivity-aware)
         ├── On connect: drain SyncQueue → POST /api/v1/sync/batch
         └── On server response: update Drift record with server-assigned IDs / timestamps
```

### Drift Tables (required for offline-first)

Every domain spec that declares offline-capable actions (Spec 22 AC-OFF-01) requires a corresponding Drift table. Required tables at launch:

| Drift table | Source spec | Notes |
|-------------|------------|-------|
| `visits` | Spec 11 | Full visit model; synced after save |
| `product_promotions` | Spec 12 | Linked to visit |
| `sample_deliveries` | Spec 19 | Linked to visit |
| `follow_up_actions` | Spec 30 | Created during visit or standalone |
| `next_visit_objectives` | Spec 14 | Per customer |
| `agenda_items` | Spec 15 | Read-only cache + planned visits |
| `clinic_profiles` | Spec 04 | Pre-cached for assigned clinics |
| `doctor_profiles` | Spec 04 | Pre-cached for assigned doctors |
| `notification_records` | Spec 31 | Inbox cache; mirrors `NotificationRecord`; `syncedAt` cursor for delta fetch |
| `consent_records` | Spec 18 | Captured during visit |
| `survey_results` | Spec 16 | `templateSnapshot` stored as JSON text column |
| `presentation_events` | Spec 13 | Slide interaction events buffered offline; flushed on sync |
| `presentation_sessions` | Spec 13 | Session boundary records (start/end times per visit) |
| `download_records` | Spec 07 | Downloaded material metadata (materialId, version, localPath, downloadedAt) |
| `field_notes` | Spec 04 | Free-text notes attached to clinic/doctor profiles; created offline |
| `products` | Spec 12 | Product catalog cache for offline visit/order forms (read-only) |
| `sample_inventory` | Spec 19 | Rep sample balance cache; updated after each delivery sync |
| `survey_templates` | Spec 16 | Cached survey templates for offline survey completion |
| `sync_queue` | Spec 22 | Action queue; see below |

### SyncQueue Table

```dart
// Drift table definition (illustrative)
class SyncQueueEntries extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get operationId => text()();          // UUID, for idempotency
  TextColumn get entityType => text()();           // 'visit' | 'follow_up' | ...
  TextColumn get action => text()();               // 'create' | 'update' | 'delete'
  TextColumn get payload => text()();              // JSON serialised entity
  TextColumn get status => text()                  // 'pending' | 'syncing' | 'failed' | 'synced'
      .withDefault(const Constant('pending'))();
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastAttemptAt => dateTime().nullable()();
}
```

### SyncService

- Implemented as a Riverpod `Provider` holding a `SyncService` singleton
- Watches `connectivity_plus` stream for online/offline transitions
- On connect: queries `sync_queue` for `status = 'pending'`, sends `POST /api/v1/sync/batch`
- On server success: marks entries `synced`, updates local Drift records with server-side `id` and `createdAt`
- On server failure: increments `attempts`; after 3 attempts marks `failed`; surfaces error in UI
- Conflict resolution: **last-write-wins** for most entities; visit records are append-only (cannot be edited after save), so no conflict is possible on the most critical entity

### Pre-Cache Strategy (Spec 22 read cache)

On login and on every app foreground:
1. Fetch today's agenda (`/api/v1/agenda/today`) → write to `agenda_items`
2. Fetch profile snapshots for all assigned clinics/doctors → write to `clinic_profiles` / `doctor_profiles`
3. Fetch pending follow-ups → write to `follow_up_actions`
4. Fetch new `notification_records` since last sync

---

## Project Layer Structure

```
lib/
├── main.dart
├── app/
│   ├── router.dart          (GoRouter config, shell route, deep-link mapping)
│   └── providers.dart       (ProviderScope overrides for flavors/testing)
├── core/
│   ├── api/
│   │   ├── dio_client.dart  (Dio instance, auth + refresh interceptors)
│   │   └── endpoints.dart   (API path constants)
│   ├── db/
│   │   ├── database.dart    (Drift AppDatabase)
│   │   └── tables/          (one .dart file per Drift table)
│   ├── sync/
│   │   ├── sync_service.dart
│   │   └── sync_queue_dao.dart
│   ├── auth/
│   │   ├── auth_notifier.dart
│   │   └── token_storage.dart   (flutter_secure_storage wrapper)
│   └── notifications/
│       └── notification_service.dart
├── features/
│   ├── agenda/
│   ├── clients/
│   ├── visits/
│   ├── presentations/
│   ├── bi_dashboard/
│   ├── map/
│   ├── orders/
│   └── profile/
└── shared/
    ├── widgets/
    └── theme/
```

Each feature folder follows the pattern:
```
feature_name/
├── data/
│   ├── repository.dart          (reads Drift + calls Dio)
│   └── models/                  (Dart data classes, Freezed)
├── presentation/
│   ├── screens/
│   └── widgets/
└── application/
    └── notifiers/               (Riverpod AsyncNotifier classes)
```

---

## Build Flavors

Three flavors (configured via `flutter_flavorizr` or manual `main_*.dart` approach):

| Flavor | API base URL | Firebase project |
|--------|-------------|-----------------|
| `dev` | `http://localhost:3000` | atlasmed-dev |
| `staging` | `https://api-staging.atlasmed.com.br` | atlasmed-staging |
| `prod` | `https://api.atlasmed.com.br` | atlasmed-prod |

---

## Key Packages Summary

| Package | Version | Purpose |
|---------|---------|---------|
| `flutter_riverpod` | latest | State management |
| `riverpod_annotation` | latest | Riverpod code generation |
| `go_router` | latest | Navigation + deep linking |
| `drift` + `drift_flutter` | latest | Offline-first SQLite ORM |
| `dio` | latest | HTTP client |
| `flutter_secure_storage` | latest | JWT token + device ID storage |
| `firebase_messaging` | latest | FCM push notifications |
| `flutter_local_notifications` | latest | Foreground notification display |
| `firebase_core` | latest | Firebase initialisation |
| `path_provider` | latest | File system paths for materials |
| `connectivity_plus` | latest | Online/offline detection for SyncService |
| `flutter_map` | latest | Territory and customer map (Spec 05) |
| `freezed` | latest | Immutable data classes |
| `json_serializable` | latest | JSON serialisation |
| `open_file` | latest | Open downloaded PDF/PPTX natively |

---

## Testing Strategy

- **Unit tests**: Riverpod notifiers tested with `ProviderContainer` + fake repositories (no Flutter widgets needed)
- **Widget tests**: individual screen widgets with mocked providers
- **Integration tests**: `flutter_test` + `integration_test` package; runs on real device/emulator
- **Offline tests**: inject a `FakeDio` that always throws `DioException` to verify offline-first behaviour

---

## Related Specs

All mobile-facing specs assume this architecture. Key cross-references:
- Spec 01: `flutter_secure_storage` for token storage
- Spec 05: `flutter_map` SDK
- Spec 07: `path_provider` + `open_file` for materials
- Spec 13: Drift buffer for presentation events
- Spec 22: `SyncService` + `SyncQueue` (offline-first sync)
- Spec 31: `firebase_messaging` + `flutter_local_notifications`
