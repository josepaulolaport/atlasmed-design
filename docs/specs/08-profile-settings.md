# Spec: Profile & Settings (Perfil)

**Domain:** Profile & Settings  
**Status:** API/Web partial · Mobile: Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 21 — Requests & Approvals](./21-requests-approvals.md) (account deletion request), [Spec 22 — Offline Sync](./22-offline-sync.md) (sync status), [Spec 18 — Consent & Communication](./18-consent-communication.md), [Spec 31 — Notifications](./31-notifications.md) (per-type notification preferences — AC-PROF-04 toggles map to Spec 31 notification types), [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-005/F-006 — existing profile/security)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Profile view and edit (name, avatar) | ✅ **Implemented** | F-005 — `/profile` on web |
| Email verification and change | ✅ **Implemented** | F-005 |
| Phone verification and change | ✅ **Implemented** | F-005 |
| 2FA (TOTP) setup and management | ✅ **Implemented** | F-006 — `/security` on web |
| Session list and revocation | ✅ **Implemented** | F-002 — `/sessions` on web |
| Password change | ✅ **Implemented** | F-004 |
| Mobile profile screen | ❌ **Not started** | Calls existing `/api/v1/profile` endpoints |
| Work hours editor | ❌ **Not started** | No `WorkHours` model; mobile only |
| Language selector | ❌ **Not started** | No i18n infra yet |
| Notification preferences | ❌ **Not started** | Depends on F-105 (notifications platform) |
| Help center / support chat | ❌ **Not started** | Mobile only |
| Account deletion request | ❌ **Not started** | Will use Spec 21 approval workflow |
| Market segment display | ❌ **Not started** | Depends on Spec 10 |
| Offline sync status indicator | ❌ **Not started** | Depends on Spec 22 |
| 2FA recovery codes | ❌ **Not started** | Known gap in F-006 |

---

## Overview

The Profile & Settings section is the representative's personal control center. From a single screen they can view their identity, check territory and performance summaries, manage preferences (notifications, work hours, language, Wi-Fi downloads), access support resources (help center, chat, legal documents), and log out. Sub-screens allow editing personal information and work schedule. The section also surfaces the support ecosystem: a help center with FAQs and tutorials, a live support chat, and formal legal documents (terms of use, privacy policy).

---

## User Stories

**US-PROF-01 — View Personal Profile**  
As a field representative, I want to see my name, role, region, and performance summary at a glance, so that I have a personal home base within the app.

**US-PROF-02 — Edit Personal Information**  
As a field representative, I want to update my name, email, phone, and profile photo, so that my contact details are always accurate.

**US-PROF-03 — Set Work Hours**  
As a field representative, I want to define my working days and time range, so that the app only sends me notifications and suggestions during business hours.

**US-PROF-04 — Change Language**  
As a field representative, I want to change the app language to my preferred locale, so that I can use the app comfortably.

**US-PROF-05 — Manage Notification Preferences**  
As a field representative, I want to control which types of notifications I receive (follow-up alerts, nearby opportunities), so that I am not interrupted unnecessarily.

**US-PROF-06 — Get Help**  
As a field representative, I want to browse a help center with FAQs and tutorial videos, so that I can solve problems without calling support.

**US-PROF-07 — Contact Support**  
As a field representative, I want to chat with a support agent directly in the app, so that I can resolve issues without switching to another channel.

**US-PROF-08 — Review Legal Documents**  
As a field representative, I want to read the Terms of Use and Privacy Policy at any time, and download them, so that I am informed of my rights and obligations.

**US-PROF-09 — Delete Account**  
As a field representative, I want the ability to request account deletion, so that I can exercise my LGPD data-subject rights if needed.

---

## Requirements & Acceptance Criteria

### Profile Overview Screen

**AC-PROF-01**  
WHEN the user opens Perfil THEN the system SHALL display: avatar (initials if no photo), name, role, region chip, an edit button, and the following sections: Territory, Resumo rápido, Preferências, Atividade recente, Suporte & conta, Sair da conta.

**AC-PROF-02**  
WHEN the Territory section is displayed THEN the system SHALL show a map preview thumbnail, clinic count, doctor count, coverage % bar, and an "Abrir mapa" CTA.

**AC-PROF-02A**  
WHEN the Territory section is displayed AND the user has market segments assigned (Spec 10) THEN the system SHALL display the user's assigned segment names as chips below the territory summary.

**AC-PROF-03**  
WHEN the Resumo rápido section is displayed THEN the system SHALL show: visits this week, pending follow-ups, and conversion rate this month.

**AC-PROF-04**  
WHEN the Preferências section is displayed THEN the system SHALL show toggles for: Alertas de follow-up, Oportunidades próximas, Download só em Wi-Fi; and tappable rows for: Horário de trabalho (showing current schedule), Idioma (showing current language).

**AC-PROF-05**  
WHEN the Atividade recente section is displayed THEN the system SHALL show the last 4 activity items with a "Ver tudo" CTA linking to the full Activity Log.

**AC-PROF-06**  
WHEN the Suporte & conta section is displayed THEN the system SHALL show: Central de ajuda, Falar com o suporte, Termos e privacidade.

**AC-PROF-07**  
WHEN the user taps "Sair da conta" THEN the system SHALL display a confirmation bottom sheet (Sair / Cancelar).

**AC-PROF-08**  
WHEN the user confirms logout THEN the system SHALL clear the session and navigate to the login screen.

---

### Profile Editor Screen

**AC-PROF-09**  
WHEN the user taps the edit button THEN the system SHALL navigate to the Profile Editor screen with a back button, "Editar perfil" title, and a "Salvar" button.

**AC-PROF-10**  
WHEN the Profile Editor loads THEN the system SHALL display: avatar with camera badge overlay, editable fields (Nome completo, E-mail, Telefone), and read-only sections (Território, Cargo, Desde).

**AC-PROF-11**  
WHEN the user taps the avatar/camera badge THEN the system SHALL open a Photo Action Sheet with options: Câmera, Galeria, Remover foto.

**AC-PROF-12**  
WHEN the user selects Câmera or Galeria THEN the system SHALL open the platform's native camera or photo picker.

**AC-PROF-13**  
WHEN the user selects Remover foto THEN the system SHALL replace the photo with the initials avatar.

**AC-PROF-14**  
WHEN the user taps "Salvar" THEN the system SHALL validate all fields:
- Nome completo: minimum 3 characters
- E-mail: valid format
- Telefone: minimum 10 digits

**AC-PROF-15**  
WHEN all validations pass THEN the system SHALL display a "Salvando…" loading state (spinner in button), persist the changes, show a "Perfil atualizado ✓" success toast, and navigate back automatically after a short delay.

**AC-PROF-16**  
WHEN validation fails THEN the system SHALL display inline error messages below each invalid field.

**AC-PROF-17**  
WHEN the user taps "Excluir minha conta" THEN the system SHALL display a confirmation dialog warning of permanent data loss with a Cancelar / Excluir conta pair.

**AC-PROF-18**
WHEN the user confirms account deletion THEN the system SHALL submit an `account_deletion` request via Spec 21 (Requests & Approvals) and display a confirmation message indicating the request is pending admin approval. The account SHALL NOT be deleted immediately.

---

### Work Hours Editor

**AC-PROF-19**  
WHEN the user taps "Horário de trabalho" THEN the system SHALL open the Work Hours Editor as a bottom sheet.

**AC-PROF-20**  
WHEN the editor opens THEN the system SHALL display: a live preview of the current schedule, 7 day-toggle buttons (Dom–Sáb), start and end time pickers, and 4 preset buttons (Comercial, Manhã, Tarde, Estendido).

**AC-PROF-21**  
WHEN the user taps a preset THEN the system SHALL update the day toggles and time pickers to the preset's values and highlight the active preset button.

| Preset | Days | Hours |
|--------|------|-------|
| Comercial 🏢 | Seg–Sex | 08:00–18:00 |
| Manhã 🌅 | Seg–Sex | 08:00–12:00 |
| Tarde ☀️ | Seg–Sex | 13:00–18:00 |
| Estendido 🚀 | Seg–Sáb | 07:30–19:00 |

**AC-PROF-22**  
WHEN the user adjusts days or times manually THEN the system SHALL deselect any active preset.

**AC-PROF-23**  
WHEN the user taps "Salvar horário" THEN the system SHALL validate:
- At least one day is selected
- End time is after start time

**AC-PROF-24**  
WHEN validation passes THEN the system SHALL save the work hours and close the sheet.

**AC-PROF-25**  
WHEN validation fails THEN the system SHALL display the relevant error message within the sheet.

---

### Language Selector

**AC-PROF-26**  
WHEN the user taps "Idioma" THEN the system SHALL open the Language Selector as a bottom sheet.

**AC-PROF-27**  
WHEN the sheet opens THEN the system SHALL display 8 language options each with a flag emoji, native name, and display name; the current language pre-selected; a "(Recomendado)" label on pt-BR.

**Supported languages:** pt-BR, pt-PT, en-US, es-ES, es-MX, fr-FR, de-DE, it-IT.

**AC-PROF-28**  
WHEN the user selects a language and taps "Aplicar" THEN the system SHALL display an "Aplicando…" loading state, apply the language globally, persist the preference, and close the sheet.

**AC-PROF-29**  
WHEN the language changes THEN all text visible to the user SHALL be rendered in the selected locale without requiring an app restart.

---

### Notification Preferences

Toggles in AC-PROF-04 map to notification type codes defined in Spec 31. Preferences are stored server-side (see Spec 31 AC-NOT-07).

| Toggle label | Spec 31 type code(s) controlled |
|---|---|
| Alertas de follow-up | `follow_up_due`, `follow_up_overdue` |
| Oportunidades próximas | `nearby_opportunity` |
| (not a toggle — all request events always on) | `request_approved`, `request_rejected`, `request_returned` |
| (not a toggle — always on) | `visit_reminder`, `campaign_launched`, `absence_approved`, `absence_rejected`, `sample_inventory_low`, `presentation_update_available`, `visit_sync_failed` |

> V1 exposes only the two opt-out toggles plus Wi-Fi restriction. All other types are always-on in V1 and cannot be disabled by the user.

**AC-PROF-30**  
WHEN the "Alertas de follow-up" toggle is on THEN the system SHALL enable push and in-app notifications for type codes `follow_up_due` and `follow_up_overdue` (Spec 31). When toggled off, the server SHALL set `enabled: false` for those types in the user's `NotificationPreference` records.

**AC-PROF-31**  
WHEN the "Oportunidades próximas" toggle is on THEN the system SHALL enable push notifications for type code `nearby_opportunity` (Spec 31, default: off — opt-in). When toggled off, the server SHALL disable the type.

**AC-PROF-32**  
WHEN the "Download só em Wi-Fi" toggle is on THEN the system SHALL block presentation and asset downloads on mobile data (also enforced by the Presentations module — Spec 07 AC-PRES-22).

---

### Help Center

**AC-PROF-33**  
WHEN the user taps "Central de ajuda" THEN the system SHALL navigate to the Help Center screen.

**AC-PROF-34**  
WHEN the Help Center loads THEN the system SHALL display: a hero search bar, 6 category cards with article counts, 10 FAQ accordion items, 4 video tutorial cards, and contact information (phone, email).

**AC-PROF-35**  
WHEN the user types in the search bar THEN the system SHALL filter FAQ items and category cards matching the query.

**AC-PROF-36**  
WHEN the user taps a FAQ item THEN the system SHALL expand or collapse its answer.

**AC-PROF-37**  
WHEN the user taps a video tutorial "play" button THEN the system SHALL open the video in the platform's native video player or an in-app player.

**AC-PROF-38**  
WHEN the user taps the support phone number THEN the system SHALL open the native phone dialer.

**AC-PROF-39**  
WHEN the user taps the support email THEN the system SHALL open the native email client with the support address pre-filled.

---

### Support Chat

**AC-PROF-40**  
WHEN the user taps "Falar com o suporte" THEN the system SHALL navigate to the Support Chat screen.

**AC-PROF-41**  
WHEN the Support Chat loads THEN the system SHALL display: the agent avatar and name, an online/away/offline status indicator, conversation history, and an input bar.

**AC-PROF-42**  
WHEN the user sends a message THEN the system SHALL display it as a sent bubble with a timestamp and a read-receipt indicator (✓ sent, ✓✓ read).

**AC-PROF-43**  
WHEN the agent is typing THEN the system SHALL display an animated typing indicator (three dots).

**AC-PROF-44**  
WHEN quick-reply chips are available THEN the system SHALL display them above the input bar for one-tap responses.

**AC-PROF-45**  
WHEN the user taps an attachment button THEN the system SHALL open a file/photo picker to attach a file to the message.

---

### Terms & Privacy Documents

**AC-PROF-46**  
WHEN the user taps "Termos e privacidade" THEN the system SHALL display a screen allowing selection between "Termos de Uso" and "Política de Privacidade".

**AC-PROF-47**  
WHEN a document is opened THEN the system SHALL display: a back button, the document title, a "Atualizado em {date}" label, a download button, an in-document search bar, a collapsible table of contents, and the full document body.

**AC-PROF-48**  
WHEN the user types in the document search bar THEN the system SHALL highlight all occurrences of the search term in the document body.

**AC-PROF-49**  
WHEN the user taps a table-of-contents entry THEN the system SHALL smooth-scroll to the corresponding section.

**AC-PROF-50**  
WHEN the user taps the download button THEN the system SHALL generate or retrieve a PDF of the document and trigger the platform's native save/share sheet.

---

## Design

### Screen Hierarchy

```
ProfileScreen
├── ProfileEditorScreen
│   ├── PhotoActionSheet (camera / gallery / remove)
│   └── DeleteAccountDialog
├── WorkHoursEditorSheet
├── LanguageSelectorSheet
├── HelpCenterScreen
├── SupportChatScreen
└── LegalDocumentScreen (terms | privacy)
```

### Data Models

```typescript
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  role: string;
  region: string;
  avatarUrl?: string;
  startDate: Date;
}

interface WorkHours {
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
}

interface NotificationPreferences {
  followUpAlerts: boolean;
  nearbyOpportunities: boolean;
  wifiOnlyDownloads: boolean;
}

interface UserPreferences {
  language: string;     // BCP-47 tag e.g. "pt-BR"
  theme: 'light' | 'dark';
  workHours: WorkHours;
  notifications: NotificationPreferences;
}

interface SupportMessage {
  id: string;
  authorRole: 'user' | 'agent';
  content: string;
  sentAt: Date;
  readAt?: Date;
  attachmentUrl?: string;
}

interface SupportChatSession {
  id: string;
  agentName: string;
  agentStatus: 'online' | 'away' | 'offline';
  messages: SupportMessage[];
  quickReplies: string[];
}

interface LegalDocument {
  type: 'terms' | 'privacy';
  title: string;
  updatedAt: Date;
  sections: LegalSection[];
}

interface LegalSection {
  id: string;
  title: string;
  content: string;
}
```

### i18n Architecture

- Language selection persists to `UserPreferences.language`.
- All user-visible strings are keyed in a translation resource file (e.g. `i18n/pt-BR.json`, `i18n/en-US.json`, …).
- Language change reloads the active locale bundle; no app restart required.
- Date/number formatting must use the selected locale's conventions.
- LGPD-specific legal text (Terms, Privacy Policy) is only available in Portuguese; other languages fall back to English for legal content.

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Profile save API fails | Toast error; form values preserved |
| Photo upload fails | Toast error; avatar reverts to previous state |
| Account deletion unavailable (MVP) | Toast: "Ação não disponível no demo. Contate o suporte." |
| Support chat agent offline | Show "Agente indisponível · Deixe uma mensagem" |
| Language bundle not downloaded | Fall back to pt-BR |
| Work hours save fails | Toast error; sheet remains open |
| Help Center search finds nothing | "Nenhum resultado para '{query}'" empty state |
| Legal document download fails | Toast error with retry |

### Market Segmentation Note

The profile overview SHALL display the user's assigned market segments alongside their territory, so that they can see their full access scope. Segment assignments are read-only for representatives — changes are made by an admin. Removing a segment from the user's list SHALL trigger a cache clear and scope refresh (Spec 22, AC-OFF-14).

### Notification Events Sourced from Other Specs

The notification preferences defined in this spec control delivery settings. The events themselves are defined across multiple specs:
- Follow-up due / overdue → [Spec 30](./30-followup-actions.md)
- Approval request updates → [Spec 21](./21-requests-approvals.md)
- Sample inventory low → [Spec 19](./19-sample-gift-management.md)
- Sync failures → [Spec 22](./22-offline-sync.md)
- Campaign activated → [Spec 26](./26-medical-campaigns.md)

### Account Deletion Note

Account deletion requests are processed through [Spec 21 — Requests & Approval Workflows](./21-requests-approvals.md) as type `account_deletion`. The existing "Excluir conta" flow in this spec routes to the approval workflow rather than executing immediately.

### Open Questions

1. Is work hours configuration synced to the backend or stored locally only?
2. Is support chat a 3rd-party integration (e.g. Intercom, Zendesk) or a custom implementation?
3. Are video tutorials hosted in-app or linked to an external URL?
4. How is account deletion handled for LGPD compliance — immediate, or scheduled with a grace period?
5. Should territory data on the profile (clinic/doctor counts) be pulled from the same API as the BI dashboard?
6. ~~Are notification preferences synced to a push notification backend or only stored locally?~~ **Resolved:** Preferences are stored server-side via `PATCH /api/v1/notifications/preferences` (Spec 31 AC-NOT-07). The Flutter app reads them on sync; the server enforces them when routing pushes.
