# Spec: App Shell & Navigation

**Domain:** App Shell & Navigation  
**Status:** Web: Implemented · Mobile: Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 08 — Profile & Settings](./08-profile-settings.md) (notification preferences), [Spec 21 — Requests & Approvals](./21-requests-approvals.md) (notification badge), [Spec 00 — Platform Foundation](./00-platform-foundation.md) (F-018 / existing web shell)

## Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Web app shell (Next.js 16) | ✅ **Implemented** | See F-018 in Spec 00 — full auth flow, role-gated nav, shared UI |
| Web navigation (Dashboard, Users, Clinics, Doctors, Registry, Health) | ✅ **Implemented** | Role-gated routing in place |
| Mobile app shell (Flutter) | ❌ **Not started** | Flutter stub exists (F-019); see Spec 32 for architecture |
| Mobile side drawer with 6 sections | ❌ **Not started** | Flutter GoRouter shell route + `Scaffold.drawer` (side drawer — see Spec 32) |
| Dark/light theme toggle | ❌ **Not started** | Mobile only |
| Organization switcher in nav | ❌ **Not started** | Depends on Spec 00-multi-tenancy |
| In-app notification badge | ❌ **Not started** | Depends on Spec 31 (F-105 notifications platform) |

> **Context for this spec:** The screen-by-screen navigation design in this spec describes the **Flutter mobile app** (Spec 32). Navigation uses GoRouter with a shell route wrapping a `Scaffold.drawer` (side drawer) — no bottom tab bar. The web shell is largely complete (F-018). Mobile work on this spec begins after the Spec 32 scaffold is set up.

---

## Overview

The app shell is the persistent structural layer that wraps every authenticated screen. It provides the top navigation bar, a side drawer for primary navigation between the six main sections of the app, global theme support (light/dark), and app metadata display. The shell is invisible during authentication and becomes active immediately after login success.

---

## User Stories

**US-SHELL-01 — Primary Navigation**  
As a field representative, I want a consistent navigation mechanism to move between the main sections of the app, so that I can reach any area quickly without getting lost.

**US-SHELL-02 — User Identity in Navigation**  
As a field representative, I want to see my name and email in the navigation drawer, so that I know I am signed in as the correct user.

**US-SHELL-03 — App Version Awareness**  
As a field representative, I want to see the current app version, so that I can reference it when reporting issues to support.

**US-SHELL-04 — Theme Preference**  
As a field representative, I want to switch between light and dark themes, so that I can use the app comfortably in different lighting conditions.

**US-SHELL-05 — Logout**  
As a field representative, I want to log out from the navigation drawer, so that I can end my session securely.

---

## Requirements & Acceptance Criteria

### Top Bar

**AC-SHELL-01**  
WHEN any main section is active THEN the system SHALL display a top bar containing a hamburger menu button and a breadcrumb title ("Atlasmed · {section name}").

**AC-SHELL-02**  
WHEN the hamburger button is tapped THEN the system SHALL slide open the side drawer from the left edge.

---

### Side Drawer

**AC-SHELL-03**  
WHEN the drawer is open THEN the system SHALL display the user's full name, email address, and a header background in the primary brand color.

**AC-SHELL-04**  
WHEN the drawer is open THEN the system SHALL display navigation items in the following order: Desempenho, Explorar, Mapa, Pedidos, Apresentações, Perfil — each with a representative icon.

**AC-SHELL-05**  
WHEN the user taps a navigation item THEN the system SHALL close the drawer and navigate to the selected section.

**AC-SHELL-06**  
WHEN the user taps the active navigation item THEN the system SHALL close the drawer without re-navigating.

**AC-SHELL-07**  
WHEN the active section changes THEN the system SHALL highlight the corresponding navigation item in the drawer.

**AC-SHELL-08**  
WHEN the drawer is open THEN the system SHALL display the app version string (e.g. "Atlasmed · v2.4.1") in the drawer footer.

**AC-SHELL-09**  
WHEN the user taps outside the drawer or swipes it closed THEN the system SHALL close the drawer without navigating.

---

### Logout from Drawer

**AC-SHELL-10**  
WHEN the drawer is open THEN the system SHALL display a "Sair" (logout) action at the bottom of the drawer.

**AC-SHELL-11**  
WHEN the user taps "Sair" THEN the system SHALL display a confirmation sheet ("Sair da conta?") with a Sair and a Cancelar button.

**AC-SHELL-12**  
WHEN the user confirms logout THEN the system SHALL clear the session token and navigate to the login screen.

**AC-SHELL-13**  
WHEN the user cancels logout THEN the system SHALL dismiss the confirmation sheet without logging out.

---

### Theme

**AC-SHELL-14**  
WHEN the app starts THEN the system SHALL apply the theme saved in user preferences (default: dark).

**AC-SHELL-15**  
WHEN the user switches the theme THEN the system SHALL apply the new theme immediately across all visible surfaces without requiring a restart.

**AC-SHELL-16**  
WHEN the theme is changed THEN the system SHALL persist the preference so it is restored on the next app launch.

---

## Design

### Component Architecture

- **`AtlasTopBar`** — sticky header rendered by the root navigator; receives the current section title as a prop
- **`AtlasSideDrawer`** — overlay drawer; receives user info and current route; emits `onNavigate(route)`, `onLogout()`
- **`LogoutConfirmSheet`** — bottom sheet with two actions; reuses the shared `BottomSheet` component
- **`ThemeProvider`** — context provider (`ThemeCtx`) that distributes the current theme token set to all children; reads from and writes to persistent storage

### Navigation Destinations

| Label | Route | Icon Keyword |
|-------|-------|-------------|
| Desempenho | `/bi` | chart/performance |
| Explorar | `/explorar` | search/explore |
| Mapa | `/mapa` | map |
| Pedidos | `/pedidos` | shopping-bag |
| Apresentações | `/apresentacoes` | presentation |
| Perfil | `/perfil` | person |

### Theme Token Sets

```typescript
interface ThemeTokens {
  primary: string;
  success: string;
  warning: string;
  error: string;
  bgMain: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  shadow: string;
}

const lightTheme: ThemeTokens = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  bgMain: '#f8f9fa',
  bgCard: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  shadow: 'rgba(0,0,0,0.08)',
};

const darkTheme: ThemeTokens = { /* inverted equivalents */ };
```

### Data Models

```typescript
interface AppUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  region: string;
  avatarUrl?: string;
}

type AppRoute =
  | '/bi'
  | '/explorar'
  | '/mapa'
  | '/pedidos'
  | '/apresentacoes'
  | '/perfil';
```

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Session expires while app is open | Intercept any API 401 → clear token → redirect to login |
| Deep-link to a route with no session | Redirect to login; after login, restore deep-link destination |
| Theme persistence read fails | Fall back to dark theme silently |

### Market Segmentation Note

The `AuthContext` loaded on startup (containing `segmentIds` and `territoryIds`) is carried by the `ThemeProvider`/app-level context so that every screen can apply scoped filtering without re-fetching. When the user's segment assignments are updated server-side, the app shell must refresh the auth context on the next API call or token refresh.

Navigation items are not hidden based on market segment. All 6 main sections are visible regardless of segment assignment — visibility is enforced at the data query level within each section, not by hiding top-level navigation.

### Notifications Architecture Note

Notification delivery infrastructure is defined in **Spec 31 — Notifications**. Spec 08 (Profile & Settings) defines user preference toggles; Spec 31 defines canonical type codes, the `NotificationRecord` model, and FCM/in-app delivery. The events table below is a summary — see Spec 31 for the authoritative type list.

| Event | Spec 31 type code | Audience |
|-------|-------------------|---------|
| Follow-up due today | `follow_up_due` | Rep |
| Follow-up overdue | `follow_up_overdue` | Rep |
| Approval request submitted | `request_submitted` | Manager |
| Approval request decided | `request_approved` / `request_rejected` / `request_returned` | Rep |
| Absence approved/rejected | `absence_approved` / `absence_rejected` | Rep |
| Sample inventory low | `sample_inventory_low` | Rep |
| Visit sync failed | `visit_sync_failed` | Rep |
| Campaign activated | `campaign_launched` | Rep |
| Material update available | `presentation_update_available` | Rep |

All notifications respect the two-dimensional authorization rule (Spec 10): a notification is only sent to users authorized to see the referenced record.

**Open question 4 resolved:** Notification badge is shown in the app bar (top-right icon), not on drawer items — badge count driven by `NotificationRecord.isRead = false` (Spec 31 AC-NOT-16).

### Open Questions

1. Is swipe-to-open (edge swipe) for the drawer required?
2. Should the top bar show a back arrow instead of the hamburger on detail screens?
3. Are there role-based sections that should be hidden from certain users (e.g. managers vs. reps)?
4. Is there a notification badge on any navigation item?

---

## Linear Tickets

| Ticket | Type | Title | Status |
|--------|------|-------|--------|
| [ATLAS-127](https://linear.app/atlasmed/issue/ATLAS-127/) | Parent | Spec 02: App Shell & Navigation (Flutter mobile completion) | Backlog |
| [ATLAS-128](https://linear.app/atlasmed/issue/ATLAS-128/) | [MOB] | App Shell — theme toggle, logout, notification badge & deep-link guard | Backlog |
| [ATLAS-151](https://linear.app/atlasmed/issue/ATLAS-151/) | [WE] | App Shell & Navigation — web implementation complete | Done |
