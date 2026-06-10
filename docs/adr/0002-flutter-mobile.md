# ADR 0002: Flutter as the Mobile Platform

## Status

Accepted

## Context

Atlasmed's mobile app is the primary tool for field representatives. It must work offline in areas with poor connectivity, render complex data-heavy screens (maps, charts, forms), and be distributed to both Android and iOS.

The initial assumption during spec writing was React Native / Expo. After reviewing requirements — offline-first SQLite (Drift), complex custom UI, and the existing Flutter stub already in the repository — the decision was made to standardize on Flutter.

## Decision

The Atlasmed mobile app is built with **Flutter / Dart**. Key package choices:

| Concern | Package |
|---------|---------|
| State management | `riverpod` / `flutter_riverpod` |
| Navigation & deep-linking | `go_router` |
| Offline-first local database | `drift` (SQLite) |
| Secure token storage | `flutter_secure_storage` |
| HTTP client | `dio` |
| Push notifications | `firebase_messaging` (FCM/APNs) |
| File handling / downloads | `path_provider` |
| Native file viewing (PDF/PPTX) | `open_file` |
| Maps | `flutter_map` |
| Charts | `fl_chart` |

## Rationale

- A Flutter stub already existed in the repository, indicating prior intent.
- Drift provides a type-safe offline-first SQLite layer that React Native's ecosystem (WatermelonDB, MMKV) did not offer as cleanly for this use case.
- Riverpod's compile-time safety and testability suit a complex, multi-domain field app.
- GoRouter's shell-route pattern supports the side-drawer navigation required by the design (Spec 02).
- Single codebase targeting both Android and iOS reduces maintenance burden for a small team.

## Consequences

- All mobile specs (01, 02, 05, 07, 13, 15, 22, 32) reference Flutter-specific implementations.
- TypeScript interfaces in specs represent API contracts; Dart equivalents use `freezed`-generated models.
- No React Native dependencies should be added to the project.
- See Spec 32 (Mobile Architecture) for the full offline-first architecture, project layer structure, Drift table inventory, and SyncService design.
