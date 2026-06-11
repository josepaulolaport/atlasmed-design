# Spec: Notifications Infrastructure

**Domain:** Notifications (Push · In-App Inbox · Badge)
**Status:** Not started — planned
**Last Updated:** 2026-06-10
**Depends on:** [Spec 00 — Platform Foundation](./00-platform-foundation.md), [Spec 08 — Profile & Settings](./08-profile-settings.md) (notification preferences), [Spec 32 — Mobile Architecture](./32-mobile-architecture.md)

> **Implementation status:** Not started. No `NotificationRecord` model exists. Push token registration not implemented. This spec defines the notification delivery infrastructure used by all other specs that emit notification events. See Notification Types table for the full source-spec map (Specs 07, 08, 15, 19, 20, 21, 22, 26, 30).

---

## Overview

Notifications are the primary mechanism for keeping field representatives and managers informed of time-sensitive events. This spec defines three delivery surfaces:

1. **Push notifications** — delivered to the device OS even when the app is in the background, via Firebase Cloud Messaging (FCM). On iOS, FCM routes through APNs.
2. **In-app inbox** — a persisted list of notifications visible inside the app; survives across sessions.
3. **Badge count** — the unread notification count shown on the app icon and the notification tab.

Notification preferences (which types are enabled per user) are managed in Spec 08 (Profile & Settings, AC-PROF-04). This spec defines the delivery infrastructure; the preference toggles reference these notification type codes.

---

## User Stories

**US-NOT-01 — Push Notification Delivery**
As a field representative, I want to receive push notifications for time-sensitive events (upcoming follow-ups, request status changes) even when the app is closed, so that I never miss critical CRM updates.

**US-NOT-02 — In-App Inbox**
As a field representative, I want to see all my recent notifications in a single inbox inside the app, so that I can review what I missed while offline.

**US-NOT-03 — Deep Linking**
As a field representative, I want tapping a notification to open the relevant screen directly (e.g. a follow-up due notification opens the follow-up detail), so that I can act immediately.

**US-NOT-04 — Badge Count**
As a field representative, I want to see the number of unread notifications on the app icon and the notification tab, so that I know at a glance whether there is something requiring attention.

**US-NOT-05 — Opt Out Per Type**
As a field representative, I want to disable notifications for specific types (e.g. visit reminders but not follow-up dues), so that I control my own interruption level.

---

## Requirements

### Push Token Registration

**AC-NOT-01**
WHEN the app launches for the first time after authentication THEN the system SHALL request push notification permission from the OS (Android POST_NOTIFICATIONS, iOS native prompt).

**AC-NOT-02**
WHEN the user grants push permission THEN the system SHALL register the FCM token with the server via `POST /api/v1/devices` (token, platform: `android | ios`, deviceId).

**AC-NOT-03**
WHEN the FCM token is refreshed by the OS THEN the app SHALL send the new token to `PATCH /api/v1/devices/:deviceId` automatically.

**AC-NOT-04**
WHEN the user logs out THEN the system SHALL deregister the device token via `DELETE /api/v1/devices/:deviceId` so that notifications are not delivered after logout.

---

### Push Delivery

**AC-NOT-05**
WHEN a notification event is triggered server-side THEN the system SHALL send a push notification within 10 seconds via FCM to all registered devices for the target user.

**AC-NOT-06**
Push notifications SHALL carry both a `notification` payload (title + body, shown by OS) and a `data` payload containing: `notificationId`, `type`, `entityId`, `entityType`.

**AC-NOT-07**
WHEN the user's preference for a notification type is disabled (Spec 08 AC-PROF-04) THEN the server SHALL skip push delivery for that type but still persist the `NotificationRecord` in the inbox.

**AC-NOT-08**
WHEN a push notification is tapped while the app is in the background or closed THEN the app SHALL deep-link to the entity screen defined in the type's deep-link mapping (see Notification Types table).

**AC-NOT-09**
WHEN a push notification arrives while the app is in the foreground THEN the system SHALL suppress the OS notification and instead display an in-app banner or update the inbox badge directly.

---

### In-App Inbox

**AC-NOT-10**
The system SHALL persist every delivered notification as a `NotificationRecord` server-side, regardless of device registration or push preference status.

**AC-NOT-11**
WHEN the user opens the notification inbox THEN the system SHALL display notifications ordered by `createdAt` descending, paginated at 30 per page.

**AC-NOT-12**
WHEN the user taps a notification in the inbox THEN the system SHALL mark it as read (`readAt` = now) and navigate to the deep-link target.

**AC-NOT-13**
WHEN the user taps "Marcar todas como lidas" THEN the system SHALL set `readAt` on all unread `NotificationRecord`s for that user.

**AC-NOT-14**
WHEN the user taps "Excluir" on a notification THEN the system SHALL soft-delete the record (`deletedAt` = now); it SHALL NOT be shown again.

**AC-NOT-15**
The inbox SHALL display a visual distinction between read and unread notifications (e.g. unread dot, bold title).

---

### Badge Count

**AC-NOT-16**
The notification tab icon SHALL display the count of unread `NotificationRecord`s for the authenticated user.

**AC-NOT-17**
WHEN the user reads or dismisses notifications THEN the badge count SHALL update immediately in the local UI without requiring a full refresh.

**AC-NOT-18**
WHEN a new push notification arrives THEN the FCM `data` payload SHALL include `unread_count` so the app can update the badge without an additional API call.

---

### Notification Types

The following event types are defined. All specs that emit notifications reference these type codes.

| Type | Label | Source spec | Deep-link target | Default enabled | Audience |
|------|-------|-------------|-----------------|----------------|---------|
| `follow_up_due` | Follow-up vence hoje | Spec 30 | Follow-up detail | Yes | Rep |
| `follow_up_overdue` | Follow-up em atraso | Spec 30 | Follow-up detail | Yes | Rep |
| `request_submitted` | Nova solicitação aguarda revisão | Spec 21 | Request detail | Yes | Manager |
| `request_approved` | Solicitação aprovada | Spec 21 | Request detail | Yes | Rep |
| `request_rejected` | Solicitação rejeitada | Spec 21 | Request detail | Yes | Rep |
| `request_returned` | Solicitação devolvida para correção | Spec 21 | Request detail | Yes | Rep |
| `visit_reminder` | Visita agendada para hoje | Spec 15 | Agenda / visit detail | Yes | Rep |
| `campaign_launched` | Nova campanha ativa | Spec 26 | Campaign detail | Yes | Rep |
| `registry_suggestion_pending` | Sugestão de cadastro aguarda revisão | Spec 21 / F-017 | Registry suggestion detail | Yes | Manager |
| `absence_approved` | Ausência aprovada | Spec 20 | Absence record detail | Yes | Rep |
| `absence_rejected` | Ausência rejeitada | Spec 20 | Absence record detail | Yes | Rep |
| `sample_inventory_low` | Estoque de amostras baixo | Spec 19 | Sample inventory screen | Yes | Rep |
| `presentation_update_available` | Material atualizado disponível | Spec 07 | Presentation detail | Yes | Rep |
| `nearby_opportunity` | Oportunidade próxima (clínica sem visita recente) | Spec 08 AC-PROF-31 | Customer profile | No (opt-in) | Rep |
| `visit_sync_failed` | Falha ao sincronizar visita | Spec 22 | Sync status / visit detail | Yes | Rep |

**AC-NOT-19**
WHEN a notification event is emitted by a source spec THEN the server SHALL resolve the target user(s), check their per-type preference, create the `NotificationRecord`, and enqueue the FCM push via BullMQ (existing infrastructure — F-010).

---

### Offline Behaviour

**AC-NOT-20**
WHEN the device is offline and the app is opened THEN the inbox SHALL display the last cached set of notifications from the local Drift table.

**AC-NOT-21**
WHEN the device reconnects THEN the app SHALL fetch new `NotificationRecord`s since the last sync and merge them into the local Drift cache.

---

## Design

### Data Models

```typescript
interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationEventType;
  title: string;
  body: string;
  entityId?: string;
  entityType?: string;           // 'visit' | 'follow_up' | 'request' | 'campaign' | ...
  data?: Record<string, unknown>; // extra context for deep-link
  readAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
}

interface DeviceRegistration {
  id: string;
  userId: string;
  fcmToken: string;
  platform: 'android' | 'ios';
  deviceId: string;              // stable device identifier (UUID generated on first launch)
  registeredAt: Date;
  lastSeenAt: Date;
}

type NotificationEventType =
  | 'follow_up_due'
  | 'follow_up_overdue'
  | 'request_submitted'
  | 'request_approved'
  | 'request_rejected'
  | 'request_returned'
  | 'visit_reminder'
  | 'campaign_launched'
  | 'registry_suggestion_pending'
  | 'absence_approved'
  | 'absence_rejected'
  | 'sample_inventory_low'
  | 'presentation_update_available'
  | 'nearby_opportunity'
  | 'visit_sync_failed';
```

### API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/devices` | Register FCM token |
| `PATCH` | `/api/v1/devices/:deviceId` | Update FCM token |
| `DELETE` | `/api/v1/devices/:deviceId` | Deregister on logout |
| `GET` | `/api/v1/notifications` | Inbox (paginated, ?cursor=) |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark single as read |
| `POST` | `/api/v1/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/v1/notifications/:id` | Soft-delete |
| `GET` | `/api/v1/notifications/unread-count` | Badge count |

### Flutter Implementation Notes

- Push handling: `firebase_messaging` package
- Local display when foregrounded: `flutter_local_notifications` package
- Token registration: called once after successful login, stored in `flutter_secure_storage`
- Inbox cached in Drift table (`notification_records`) for offline-first access (Spec 32)
- Badge count stored as a Riverpod `StateProvider<int>`, updated on push receipt and inbox sync

### Server Implementation Notes

- FCM send via `firebase-admin` SDK in the Elysia API
- Notification jobs enqueued to BullMQ (existing F-010 infrastructure) to avoid blocking the request handler
- `DeviceRegistration` and `NotificationRecord` added as new Prisma models
- Per-type preference checked server-side before push but record is always persisted

---

## Market Segmentation Note

Notification content (title, body, entityId) is resolved after segment/territory authorization. A user never receives a notification for an entity outside their scope. Server-side resolution uses the same `ScopeContext` as all other APIs.

---

## Open Questions

1. Should notifications have an expiry (e.g. auto-delete after 90 days)?
2. ~~Should managers receive `follow_up_due` for their team's follow-ups, or only their own?~~ **Resolved:** Managers do NOT receive `follow_up_due` push notifications for their team in V1. Team-level overdue follow-ups are visible in the Coverage & Execution Dashboard (Spec 23) and Coaching Dashboard (Spec 24). This avoids notification spam for managers with large teams.

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-33](https://linear.app/atlasmed/issue/ATLAS-33/) | Parent | Spec 31: Notifications Infrastructure | Backlog |
| [ATLAS-34](https://linear.app/atlasmed/issue/ATLAS-34/) | [BE] | Notifications — FCM delivery, models & preference API | Backlog |
| [ATLAS-35](https://linear.app/atlasmed/issue/ATLAS-35/) | [MOB] | Notifications — Flutter inbox, badge & deep-link routing | Backlog |
