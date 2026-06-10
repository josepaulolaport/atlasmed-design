# Spec: Territory Map (Mapa)

**Domain:** Territory Map  
**Status:** Not started — planned  
**Last Updated:** 2026-06-10  
**Related:** [Spec 10 — Market Segmentation](./10-market-segmentation.md), [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md), [Spec 15 — Agenda Planning](./15-agenda-planning.md), [Spec 30 — Follow-Up Actions](./30-followup-actions.md), [Spec 00 — Platform Foundation](./00-platform-foundation.md)

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Territory Map (all screens) | ❌ **Not started** | Mobile only; no mapping SDK, no Visit model |
| Territory entity (for scoping) | ❌ **Not started** | Currently `territoryId` is a string (F-008 gap); see F-101 in Spec 00 |
| **Prerequisites** | — | F-101 (territory entity) → Spec 10 → Spec 11 → Spec 30 → this spec |

> This entire spec is a **mobile-only** Flutter feature. Map SDK: `flutter_map` (OpenStreetMap). Geofencing: `geolocator` package. Route planning: requires either a routing API (OSRM, OpenRouteService) or Google Directions API.

---

## Overview

The Territory Map is the field representative's spatial intelligence hub. It replaces a paper route plan with an interactive map showing all clinics and doctors in the territory, color-coded by relationship health. From the map, representatives can plan optimized daily routes, receive AI-suggested clinic visits, navigate stop-by-stop, detect when they arrive at a clinic, track a visit in progress, log the visit outcome, schedule follow-ups, and manage their favorites. A companion Nearby Clinics list provides a distance-sorted view for quick access without the map.

> **Implementation note:** The design prototype uses a static SVG illustration for the map. The production implementation uses `flutter_map` (OpenStreetMap) with the `geolocator` package for geofencing. See Map SDK Requirements section below.

---

## User Stories

**US-MAP-01 — Visualize Territory**  
As a field representative, I want to see all clinics and doctors in my territory on a map, color-coded by their relationship status, so that I can visually identify where to focus my effort.

**US-MAP-02 — Explore a Clinic from the Map**  
As a field representative, I want to tap a clinic pin and see a quick overview (commercial health, actions) without leaving the map, so that I can decide whether to add it to my route.

**US-MAP-03 — Plan a Daily Route**  
As a field representative, I want the app to suggest an optimized daily route and let me customize the stop order, so that I can plan an efficient workday.

**US-MAP-04 — Navigate the Route**  
As a field representative, I want to navigate stop-by-stop and receive prompts when I arrive at each clinic, so that I never miss a stop or forget to log a visit.

**US-MAP-05 — Log a Visit**  
As a field representative, I want to record the outcome, notes, and follow-up date for a visit directly from the map, so that my CRM is always up to date immediately after each interaction.

**US-MAP-06 — Track a Visit In Progress**  
As a field representative, I want the app to track how long I have been at a clinic, so that I have an accurate visit duration in the log.

**US-MAP-07 — Handle Nearby Opportunities Mid-Route**  
As a field representative, I want the app to proactively suggest high-potential clinics near my current route, so that I can capitalize on unexpected opportunities without replanning from scratch.

**US-MAP-08 — Manage Follow-ups**  
As a field representative, I want to see and act on my pending follow-up reminders, so that I do not miss any committed call-backs or visits.

**US-MAP-09 — Manage Favorites**  
As a field representative, I want to mark clinics as favorites and filter my favorites by status, so that I can quickly access my most important accounts.

**US-MAP-10 — Browse Nearby Clinics**  
As a field representative, I want to see a list of clinics sorted by distance from my current location with filters for status and opening hours, so that I can find opportunities when I have unexpected free time.

---

## Requirements & Acceptance Criteria

### Main Map View

**AC-MAP-01**  
WHEN the user opens Mapa THEN the system SHALL display a map centered on the representative's current location showing all territory clinics and doctors as pins.

**AC-MAP-02**  
WHEN clinic pins are rendered THEN the system SHALL color them according to relationship status: amber = high opportunity, navy = recently visited, red = overdue.

**AC-MAP-03**  
WHEN the map loads THEN the system SHALL display a search bar, a floating action menu (FAB), and a "Sugestões para você" bottom card showing the highest-priority nearby clinic.

**AC-MAP-04**  
WHEN the user taps "Ver todas" in the suggestions card THEN the system SHALL navigate to the Nearby Clinics list screen.

---

### Clinic Bottom Sheet (pin tap)

**AC-MAP-05**  
WHEN the user taps a clinic pin THEN the system SHALL open a bottom sheet showing: name, address, potential tag, quick actions (Iniciar rota, Registrar visita, Ligar, WhatsApp), commercial health preview, commercial signals, product preview, and a "Ver perfil completo" link.

**AC-MAP-06**  
WHEN the user taps "Iniciar rota" in the bottom sheet THEN the system SHALL create a route to that clinic and transition to the Active Navigation state.

**AC-MAP-07**  
WHEN the user taps "Registrar visita" THEN the system SHALL open the Visit Log Sheet pre-filled with this clinic.

**AC-MAP-08**  
WHEN the user toggles "Clínicas próximas" in the bottom sheet THEN the system SHALL expand the sheet to display nearby clinics with a distance slider (default 2.5 km).

**AC-MAP-09**  
WHEN the user taps a nearby clinic row THEN the system SHALL navigate to that clinic's bottom sheet or open its profile.

---

### Route Planning

**AC-MAP-10**  
WHEN the user requests a daily route THEN the system SHALL suggest an optimized plan showing: stop count, estimated total duration, and total distance.

**AC-MAP-11**  
WHEN the full route plan is displayed THEN the system SHALL show an ordered stop list with drag handles to reorder stops, a delete button per stop, and an "Adicionar parada" CTA.

**AC-MAP-12**  
WHEN the user taps "Otimizar ordem" THEN the system SHALL recalculate the stop order for minimum travel time and update the list.

**AC-MAP-13**  
WHEN the user taps "Iniciar rota" THEN the system SHALL transition to Active Navigation.

---

### Active Navigation

**AC-MAP-14**  
WHEN Active Navigation is running THEN the system SHALL display a "Próxima parada" card with the destination name and a "Navegar" action, and a progress indicator (e.g. "Parada 2 de 8").

**AC-MAP-15**  
WHEN the user taps "Navegar" THEN the system SHALL launch the platform's native maps app with turn-by-turn directions to the next stop.

**AC-MAP-16**  
WHEN the user arrives within 50 metres of the next stop's coordinates THEN the system SHALL display a "Você chegou · Xm" arrival chip and an "Iniciar visita" prompt.

**AC-MAP-17**  
WHEN the user taps "Iniciar visita" THEN the system SHALL start a visit-in-progress timer and display an amber status bar with the elapsed time.

**AC-MAP-18**  
WHEN "Não é aqui" is tapped on the arrival prompt THEN the system SHALL dismiss the prompt and continue navigation.

**AC-MAP-19**  
WHEN "Pular parada" is tapped THEN the system SHALL skip the current stop and advance to the next one.

---

### Visit In Progress

**AC-MAP-20**  
WHEN a visit is in progress THEN the system SHALL display an amber status bar with a live elapsed-time counter, and offer: Concluir visita, Adicionar nota, Ligar.

**AC-MAP-21**  
WHEN the user exits the clinic's geofence during a visit THEN the system SHALL display a prompt asking whether the visit is complete or the representative is temporarily away.

**AC-MAP-22**  
WHEN the user taps "Concluir visita" THEN the system SHALL stop the timer and open the Visit Log Sheet pre-filled with the elapsed duration and clinic.

---

### Dynamic Route Suggestion (mid-route)

**AC-MAP-23**  
WHEN a high-potential clinic is detected within a configurable radius (e.g. 1.5 km) of the current route THEN the system SHALL surface an opportunity card showing the clinic name and detour distance.

**AC-MAP-24**  
WHEN the user taps "Adicionar à rota" on the suggestion THEN the system SHALL insert the clinic as the next stop in the active route.

**AC-MAP-25**  
WHEN the user taps "Ver no mapa" THEN the system SHALL center the map on the suggested clinic and show its pin.

---

### Visit Log Sheet

**AC-MAP-26**  
WHEN the Visit Log Sheet is displayed THEN the system SHALL show: outcome chips (Visitado / Interessado / Sem interesse and others), an optional note textarea with voice input, and optional follow-up date shortcut (+3 / +7 / +14 days or custom date picker).

WHEN the user selects a follow-up date THEN the system SHALL create a `FollowUpAction` (Spec 30 AC-FU-01–04) with:
- `actionType`: `schedule_visit` if outcome = "Visitado", otherwise `other` (user may change)
- `dueDate`: selected date
- `entityId` / `entityType`: current map stop
- `sourceVisitId`: the visit being saved

The full Spec 30 follow-up form is not shown at this point — the map creates a lightweight follow-up; the user may edit it from the Follow-Up tab.

**AC-MAP-27**  
WHEN the user taps "Salvar visita" THEN the system SHALL persist the visit record and return to the map or the next stop in the route.

**AC-MAP-28**  
IF no outcome chip is selected THEN the system SHALL display a validation error and prevent submission.

---

### Follow-ups List

**AC-MAP-29**  
WHEN the user opens the Follow-ups screen THEN the system SHALL display tabs: Pendentes, Hoje, Próximos, Concluídos — each with a count badge.

**AC-MAP-30**  
WHEN a follow-up card is displayed THEN the system SHALL show the entity name, follow-up date, and action buttons: Ligar, Ver no mapa.

**AC-MAP-31**  
WHEN the user taps "Ver no mapa" THEN the system SHALL return to the map centered on that clinic's pin.

---

### Favorites List

**AC-MAP-32**  
WHEN the user opens the Favorites screen THEN the system SHALL display filter pills: Todas, Ativas, Em negociação, Alto potencial — and a list of favorited clinics.

**AC-MAP-33**  
WHEN a favorite clinic card is displayed THEN the system SHALL show name, status, distance, and a "Rota" CTA.

**AC-MAP-34**  
WHEN the user taps the "Rota" CTA THEN the system SHALL start a route to that clinic.

---

### Full Territory Map (`TerritoryFullMapScreen`)

**AC-MAP-35**  
WHEN the full map opens THEN the system SHALL display back navigation, a search bar ("Buscar local…"), a filter button, zoom controls, and a "Minha localização" FAB.

**AC-MAP-36**  
WHEN the user taps a territory marker THEN the system SHALL display a popup with: name, address or specialty, visit status, "Ver detalhes" link, and "Rota" CTA.

**AC-MAP-37**  
WHEN the filter sheet is open THEN the system SHALL allow toggling visibility of Clínicas / Médicos and filtering by status (all / visited / pending / priority).

**AC-MAP-38**  
WHEN filters are active THEN the system SHALL display a badge on the filter button showing the active filter count.

---

### Nearby Clinics List (`NearbyClinicsScreen`)

**AC-MAP-39**  
WHEN the nearby list opens THEN the system SHALL display the representative's current address (based on GPS), a "Atualizar localização" button, a search bar, filter pills, and a clinic list sorted by distance.

**AC-MAP-40**  
WHEN filter pills are displayed THEN the system SHALL show: Todas, Prioritárias, Pendentes, Visitadas, Abertas agora — each with a count badge.

**AC-MAP-41**  
WHEN a nearby clinic card is displayed THEN the system SHALL show: name, address, distance, and tags (Prioridade alta / Visitado / Nunca visitado / Aberto / Fechado / doctor count).

**AC-MAP-42**  
WHEN the user taps "Ver detalhes" THEN the system SHALL navigate to the clinic detail screen.

**AC-MAP-43**  
WHEN the user taps "Rota · X min" THEN the system SHALL start navigation to that clinic.

---

## Design

### Screen & State Inventory

```
MapScreen
├── InitialView (all pins, suggestions card)
├── ClinicSelectedView (bottom sheet over map)
│   └── NearbyExpandedView (distance slider + list)
├── RouteSummaryView (AI plan card)
├── RoutePlanView (full stop list)
├── ActiveNavigationView (next-stop card, progress)
│   ├── ArrivalPromptView (near-clinic chip)
│   ├── VisitInProgressView (timer bar)
│   │   └── LeftLocationPromptView
│   └── DynamicSuggestionView (mid-route opportunity)
├── VisitLogSheet (outcome + note + follow-up)
├── FollowupsListView
├── FavoritesListView
└── FloatingMenuView
TerritoryFullMapScreen
NearbyClinicsScreen
```

### Data Models

```typescript
interface MapPin {
  id: string;
  type: 'clinic' | 'doctor';
  lat: number;
  lng: number;
  status: ClinicStatus;
  isPriority: boolean;
  name: string;
  lastVisitDays?: number;
}

type PinColor = 'amber' | 'navy' | 'red';

interface Route {
  id: string;
  date: Date;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
}

interface RouteStop {
  order: number;
  entityId: string;
  entityType: 'clinic' | 'doctor';
  entityName: string;
  address: Address;
  lat: number;
  lng: number;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  visitId?: string;
}

interface ActiveNavigation {
  routeId: string;
  currentStopIndex: number;
  visitInProgress?: VisitInProgress;
}

interface VisitInProgress {
  entityId: string;           // supports clinic or doctor visits
  entityType: 'clinic' | 'doctor';
  startedAt: Date;
  note?: string;
}

/**
 * VisitLog is the UI form model for capturing visit outcome from the map.
 * On save it creates a Visit record (Spec 11) using the following mapping:
 *
 * Map UI chip         → Visit.status        → Visit.ineffectiveReason
 * "Visitado"          → 'effective'          → (none)
 * "Sem contato"       → 'ineffective'        → 'prof_absent' (default; rep may change)
 * "Interessado"       → 'effective'          → (none); Visit.outcome = 'positive'
 * "Sem interesse"     → 'effective'          → (none); Visit.outcome = 'neutral'
 *
 * The full Visit model (status, segmentIds, promotedProductIds, etc.)
 * is defined in Spec 11. VisitLog here is the frontend form state only.
 */
interface VisitLog {
  entityId: string;
  entityType: 'clinic' | 'doctor';
  /** Maps to Spec 11 VisitStatus after submission (see mapping above). */
  uiOutcome: 'visited' | 'interested' | 'not_interested' | 'no_contact';
  note?: string;
  durationMinutes: number;
  locationVerified: boolean;
}

/**
 * Follow-ups shown in the map tab use the full Spec 30 FollowUpAction model.
 * The tabs (Pendentes / Hoje / Próximos / Concluídos) map to Spec 30 status:
 *   Pendentes   → status: 'pending'
 *   Hoje        → status: 'pending' AND dueDate = today
 *   Próximos    → status: 'pending' AND dueDate > today
 *   Concluídos  → status: 'completed'
 * The data interface is FollowUpAction (Spec 30). No local Followup model.
 */
```

### Geofence Logic

- Arrival detection: trigger when device coordinates are within **50 metres** of the stop's coordinates.
- Departure detection: trigger when device coordinates are more than **100 metres** from the stop's coordinates while a visit is in progress.
- Polling interval: every 15 seconds while navigation or visit is active.
- Requires `ACCESS_FINE_LOCATION` (Android) / `kCLAuthorizationStatusAuthorizedAlways` (iOS) for background geofencing.

### Map SDK Requirements

**Flutter package decision:** Use `flutter_map` (OpenStreetMap tiles, open-source, no API key or billing required) as the default. Migrate to `google_maps_flutter` only if business requirements demand Google-branded maps or Google routing.

`flutter_map` supports all required capabilities:
- Render clinic/doctor pins with custom `Marker` widgets (color and icon overlays)
- Tap on marker to show bottom sheet
- Draw route polylines using the `PolylineLayer`
- Animate user-location with `flutter_map_location_marker` plugin
- Offline tile caching via `CachedNetworkImage` tile provider or `flutter_map_tile_caching` plugin
- Pin clustering via `flutter_map_supercluster` plugin

### Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Location permission denied | Show explanatory banner; map still loads centered on territory centroid |
| GPS signal lost during navigation | Show "GPS indisponível" toast; last known location displayed |
| Visit log save fails | Toast error; preserve unsaved log as a draft |
| Route calculation fails (API error) | Show last-cached route or empty plan with retry |
| Clinic has no coordinates | Exclude from map view; include in nearby list with "Endereço não confirmado" |
| Background location disabled | Warn that geofence arrival detection requires background location |

### Market Segmentation Note

Map pins and clinic/doctor lists shown on the map SHALL apply the two-dimensional authorization rule (Spec 10, AC-SEG-14). A pin is visible only if the customer is in the user's territory AND shares at least one market segment. The segment filter in the territory full map view (AC-MAP-37) allows narrowing to a single segment when the user is assigned to multiple.

### Visit Lifecycle Note

The Visit Log Sheet (AC-MAP-26–28) creates visit records following the full lifecycle model defined in [Spec 11 — Visit Lifecycle](./11-visit-lifecycle-frequency.md). The outcome chips in the Visit Log Sheet map to the `VisitStatus` + `IneffectiveReason` model in Spec 11. "Visitado" = `effective`; "Sem contato" or unavailability scenarios = `ineffective` + reason.

### Follow-Up Note

The follow-ups list (AC-MAP-29–31) renders the data model defined in [Spec 30 — Follow-Up Actions](./30-followup-actions.md). All follow-up creation from the Visit Log Sheet flows through Spec 30 (AC-FU-04). The Pendentes/Hoje/Próximos/Concluídos tabs map to Spec 30's status lifecycle.

### Open Questions

1. ~~What mapping SDK?~~ **Resolved:** `flutter_map` (OpenStreetMap). See Map SDK Requirements section.
2. What is the threshold for triggering a dynamic route suggestion (distance, potential score)?
3. How is route optimization computed — server-side (TSP) or client-side (heuristic)?
4. Can representatives start a visit without geofence detection (manual override)?
5. Should follow-ups created from the map be visible in the Activity Log and the BI dashboard?
6. What is the definition of "Prioridade alta" — is it a computed score or a manual flag?
