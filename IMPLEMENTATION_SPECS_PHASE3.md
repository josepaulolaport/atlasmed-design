# AtlasMed Design - Implementation Specifications
## Phase 3: Complete Experience

---

## Project Context

**Project Name:** AtlasMed Salesman App Design  
**Technology Stack:** Static HTML + React 18 (CDN) + Babel Standalone  
**Architecture:** Component-based React app with CDN dependencies, no build system  
**Deployment:** GitHub Pages (static file serving)

### Core Dependencies (CDN-loaded)
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
```

### Project Structure
```
/
├── index.html                    # Main entry point, loads all components
├── components/
│   ├── atlas-bi.jsx             # BI Dashboard screen
│   ├── atlas-pedidos.jsx        # Orders screen
│   ├── atlas-map.jsx            # Territory map screen
│   ├── atlas-presentations.jsx  # Product presentations screen
│   ├── atlas-list.jsx           # Client list screen
│   ├── atlas-clinic.jsx         # Clinic detail screen
│   ├── atlas-doctor.jsx         # Doctor detail screen
│   ├── atlas-profile.jsx        # User profile screen
│   └── [other components].jsx
└── .github/workflows/pages.yml  # GitHub Pages deployment
```

### Design System Guidelines

#### Color Palette
- **Primary Brand:** `#6366f1` (indigo)
- **Success:** `#10b981` (green)
- **Warning:** `#f59e0b` (amber)
- **Error:** `#ef4444` (red)
- **Backgrounds:** 
  - Main: `#f8f9fa` (light gray)
  - Cards: `#ffffff` (white)
  - Dark overlays: `rgba(0,0,0,0.5)`
- **Text:**
  - Primary: `#1f2937` (dark gray)
  - Secondary: `#6b7280` (medium gray)
  - Tertiary: `#9ca3af` (light gray)

#### Typography
- **Font Family:** 'Inter', system-ui, -apple-system, sans-serif
- **Sizes:**
  - Display: 28px (bold)
  - H1: 24px (bold)
  - H2: 20px (semibold)
  - H3: 18px (semibold)
  - Body: 16px (normal)
  - Small: 14px (normal)
  - Caption: 12px (normal)

#### Common Component Patterns
1. **Bottom Sheets:** Modal overlays that slide up from bottom
2. **Top Bar:** Consistent navigation bar with back button and title
3. **Cards:** White background, border-radius 16px, box-shadow subtle
4. **Status Chips:** Small colored pills for statuses (pending, completed, etc.)
5. **Action Buttons:** Primary (indigo), Secondary (white with border)
6. **List Items:** Touchable areas with right chevron for navigation

---

## Implementation Tasks Overview

### Phase 3: Complete Experience (10 tasks)
These screens complete the user journey by adding full-screen expansions, support features, settings, and advanced filtering.

- **TASK-009:** Territory Full Map
- **TASK-010:** Activity Full List
- **TASK-011:** Help Center
- **TASK-012:** Support Chat
- **TASK-013:** Terms & Privacy
- **TASK-014:** Language Selector
- **TASK-015:** Nearby Clinics Expanded
- **TASK-016:** Presentation Filters
- **TASK-017:** Order Live Tracking
- **TASK-018:** BI Drill-down Screens

---

## TASK-009: Territory Full Map

### Context
The Map screen (`atlas-map.jsx`) currently shows a mini map widget. Users need a full-screen, interactive map view to visualize their entire territory, see all clinics/doctors, plan routes, and analyze geographic distribution of their clients.

### User Flow
1. User taps "Ver mapa completo" button on Map screen
2. Full-screen map opens showing all territory points
3. User can:
   - Pan and zoom the map
   - Toggle between clinics and doctors
   - Filter by status (visited, pending, priority)
   - See cluster markers when zoomed out
   - Tap markers to see quick info
   - Open full detail from marker popup
   - Get directions to selected location
   - View territory boundaries/regions

### Visual Design

**Layout:**
- Full screen with map taking entire viewport
- Floating controls overlay on map:
  - Top: Search bar + filter button + close button
  - Bottom: Legend showing marker types
  - Right side: Zoom controls (+/-)
  - Bottom-right: "My Location" button

**Map Markers:**
- **Clinics (blue pin):** `#3b82f6`
- **Doctors (purple pin):** `#8b5cf6`
- **Visited (green badge):** Small green dot on marker
- **Priority (red badge):** Small red dot on marker
- **Cluster:** Circle with number showing count

**Popup Card (on marker tap):**
```
┌─────────────────────────┐
│ 🏥 Clínica ABC          │
│ Rua XYZ, 123            │
│ ✅ Visitado há 3 dias   │
│ [Ver detalhes] [Rota]   │
└─────────────────────────┘
```

### Data Structure

```javascript
const TERRITORY_POINTS = [
  {
    id: 'clinic-1',
    type: 'clinic',
    name: 'Clínica ABC',
    address: 'Rua XYZ, 123',
    lat: -23.550520,
    lng: -46.633308,
    lastVisit: '2026-05-04',
    status: 'visited', // visited | pending | priority
    priority: 2,
  },
  {
    id: 'doctor-1',
    type: 'doctor',
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    clinic: 'Clínica ABC',
    lat: -23.550520,
    lng: -46.633308,
    lastVisit: null,
    status: 'pending',
    priority: 1,
  },
  // ... more points
];

const TERRITORY_BOUNDS = {
  north: -23.4,
  south: -23.7,
  east: -46.4,
  west: -46.8,
};
```

### Functionality

1. **Map Rendering:**
   - Use a map library (Leaflet or Mapbox GL JS via CDN)
   - Initial view: Fit all territory points in view
   - Maintain 60fps performance even with 100+ markers

2. **Clustering:**
   - When zoomed out, group nearby markers
   - Show count in cluster circle
   - Expand cluster on tap

3. **Filtering:**
   - Toggle switches: Show Clinics | Show Doctors
   - Status filter: All | Visited | Pending | Priority
   - Search bar: Filter by name/address

4. **Interactions:**
   - Tap marker: Show popup with quick info
   - Tap "Ver detalhes": Navigate to clinic/doctor detail
   - Tap "Rota": Open native maps app with directions
   - "My Location" button: Center map on user's current location

5. **Legend:**
   - Visual guide at bottom showing what each marker type means

### Component Structure

```javascript
// File: components/atlas-map-full.jsx

function TerritoryFullMapScreen({ onBack }) {
  const [filter, setFilter] = React.useState({
    showClinics: true,
    showDoctors: true,
    status: 'all', // all | visited | pending | priority
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPoint, setSelectedPoint] = React.useState(null);
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    // Initialize map (pseudo-code for Leaflet)
    const map = L.map(mapRef.current).setView([-23.550520, -46.633308], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // Add markers based on filtered data
    const filtered = filterPoints(TERRITORY_POINTS, filter, searchQuery);
    const markers = L.markerClusterGroup();
    filtered.forEach(point => {
      const marker = L.marker([point.lat, point.lng], {
        icon: getMarkerIcon(point)
      });
      marker.on('click', () => setSelectedPoint(point));
      markers.addLayer(marker);
    });
    map.addLayer(markers);

    return () => map.remove();
  }, [filter, searchQuery]);

  const filterPoints = (points, filter, query) => {
    return points.filter(p => {
      if (!filter.showClinics && p.type === 'clinic') return false;
      if (!filter.showDoctors && p.type === 'doctor') return false;
      if (filter.status !== 'all' && p.status !== filter.status) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  };

  const getMarkerIcon = (point) => {
    // Return custom icon based on type and status
    const color = point.type === 'clinic' ? '#3b82f6' : '#8b5cf6';
    const badgeColor = point.status === 'visited' ? '#10b981' : 
                       point.status === 'priority' ? '#ef4444' : null;
    // Create custom icon HTML
    return L.divIcon({ /* ... */ });
  };

  const handleGetDirections = (point) => {
    const url = `https://maps.google.com/?q=${point.lat},${point.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#fff' }}>
      {/* Top Controls */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        gap: 8,
      }}>
        <button onClick={onBack} style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: 'none',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        }}>
          ←
        </button>
        <input
          type="text"
          placeholder="Buscar local..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            height: 40,
            padding: '0 16px',
            border: 'none',
            borderRadius: 20,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: 14,
          }}
        />
        <button onClick={() => {/* open filter modal */}} style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: 'none',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        }}>
          ⚙
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <button style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: 'none',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: 20,
        }}>+</button>
        <button style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: 'none',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: 20,
        }}>−</button>
      </div>

      {/* My Location Button */}
      <button style={{
        position: 'absolute',
        right: 16,
        bottom: 100,
        width: 48,
        height: 48,
        borderRadius: 24,
        border: 'none',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontSize: 20,
      }}>📍</button>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        padding: 12,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: 16,
        fontSize: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#3b82f6' }} />
          <span>Clínicas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#8b5cf6' }} />
          <span>Médicos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#10b981' }} />
          <span>Visitado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#ef4444' }} />
          <span>Prioridade</span>
        </div>
      </div>

      {/* Marker Popup */}
      {selectedPoint && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 1001,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {selectedPoint.type === 'clinic' ? '🏥' : '👨‍⚕️'} {selectedPoint.name}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            {selectedPoint.address || selectedPoint.specialty}
          </div>
          {selectedPoint.lastVisit && (
            <div style={{ fontSize: 12, color: '#10b981', marginBottom: 12 }}>
              ✅ Visitado {getRelativeTime(selectedPoint.lastVisit)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                onBack();
                // Navigate to detail screen
                if (selectedPoint.type === 'clinic') {
                  // showClinicDetail(selectedPoint.id)
                } else {
                  // showDoctorDetail(selectedPoint.id)
                }
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Ver detalhes
            </button>
            <button
              onClick={() => handleGetDirections(selectedPoint)}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                background: '#6366f1',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Rota 🗺
            </button>
          </div>
          <button
            onClick={() => setSelectedPoint(null)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              color: '#9ca3af',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

const TERRITORY_POINTS = [
  {
    id: 'clinic-1',
    type: 'clinic',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000',
    lat: -23.561414,
    lng: -46.655882,
    lastVisit: '2026-05-04',
    status: 'visited',
    priority: 2,
  },
  {
    id: 'clinic-2',
    type: 'clinic',
    name: 'Hospital Central',
    address: 'Rua Augusta, 500',
    lat: -23.556858,
    lng: -46.662335,
    lastVisit: null,
    status: 'pending',
    priority: 1,
  },
  {
    id: 'doctor-1',
    type: 'doctor',
    name: 'Dr. Roberto Alves',
    specialty: 'Cardiologia',
    clinic: 'Clínica São Lucas',
    lat: -23.561414,
    lng: -46.655882,
    lastVisit: '2026-05-04',
    status: 'visited',
    priority: 2,
  },
  {
    id: 'doctor-2',
    type: 'doctor',
    name: 'Dra. Maria Santos',
    specialty: 'Endocrinologia',
    clinic: 'Hospital Central',
    lat: -23.556858,
    lng: -46.662335,
    lastVisit: null,
    status: 'priority',
    priority: 1,
  },
  // Add 20+ more points for realistic testing
];

Object.assign(window, { TerritoryFullMapScreen, TERRITORY_POINTS });
```

### Integration Points

1. **From Map Screen (`atlas-map.jsx`):**
   - Add "Ver mapa completo" button
   - On click: Show `TerritoryFullMapScreen`

2. **Map Library CDN:**
   - Add Leaflet CSS/JS to `index.html`:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
   ```

3. **Navigation:**
   - From full map to clinic detail: Use existing clinic detail component
   - From full map to doctor detail: Use existing doctor detail component

### Testing Checklist

- [ ] Map loads correctly with all territory points
- [ ] Markers render with correct colors (blue for clinics, purple for doctors)
- [ ] Status badges show correctly (green for visited, red for priority)
- [ ] Clustering works when zoomed out (markers group into clusters)
- [ ] Tapping marker shows popup with correct information
- [ ] "Ver detalhes" button navigates to correct detail screen
- [ ] "Rota" button opens native maps app with correct coordinates
- [ ] Search filters markers by name
- [ ] Filter toggles work (show/hide clinics/doctors)
- [ ] Status filter works (all, visited, pending, priority)
- [ ] Zoom controls (+/-) function correctly
- [ ] "My Location" button centers map on user's position
- [ ] Legend shows all marker types
- [ ] Close button returns to Map screen
- [ ] Map maintains 60fps with 100+ markers
- [ ] Works on mobile (touch pan/zoom)

---

## TASK-010: Activity Full List

### Context
The BI Dashboard (`atlas-bi.jsx`) shows "Atividades Recentes" with 3-4 items. Users need to see their complete activity history, filter by type, search, and export for reporting.

### User Flow
1. User taps "Ver todas" on Recent Activities section
2. Full-screen activity list opens
3. User can:
   - Scroll through all activities
   - Filter by type (visits, calls, orders, presentations)
   - Filter by date range
   - Search by client name or activity details
   - Export list to CSV/PDF
   - Tap any activity to see related entity (clinic/doctor/order)

### Visual Design

**Layout:**
- Top bar with back button and "Atividades"
- Search bar below top bar
- Filter pills row (Todas, Visitas, Ligações, Pedidos, Apresentações)
- Date range selector
- Activity list (infinite scroll)
- Floating export button (bottom-right)

**Activity Card:**
```
┌─────────────────────────────────────┐
│ 🏥 Visita • Clínica ABC            │
│ Reunião com Dr. João Silva          │
│ 15:30 • Há 2 horas                  │
│ ✅ Concluída • Resultado: Positivo  │
└─────────────────────────────────────┘
```

### Data Structure

```javascript
const ACTIVITY_TYPES = {
  visit: { icon: '🏥', label: 'Visita', color: '#3b82f6' },
  call: { icon: '📞', label: 'Ligação', color: '#8b5cf6' },
  order: { icon: '📦', label: 'Pedido', color: '#10b981' },
  presentation: { icon: '📊', label: 'Apresentação', color: '#f59e0b' },
  email: { icon: '✉️', label: 'Email', color: '#6b7280' },
};

const ALL_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'visit',
    title: 'Reunião com Dr. João Silva',
    entity: { type: 'clinic', id: 'clinic-1', name: 'Clínica ABC' },
    timestamp: '2026-05-07T15:30:00',
    status: 'completed',
    outcome: 'positive',
    notes: 'Cliente interessado em novo produto X',
  },
  {
    id: 'act-2',
    type: 'call',
    title: 'Follow-up pedido #1234',
    entity: { type: 'doctor', id: 'doc-1', name: 'Dr. Roberto Alves' },
    timestamp: '2026-05-07T10:15:00',
    status: 'completed',
    duration: '12 min',
  },
  // ... more activities (100+)
];
```

### Functionality

1. **Filtering:**
   - Type filter: Show only selected activity type
   - Date range: Today, Last 7 days, Last 30 days, Custom
   - Multiple filters can be active simultaneously

2. **Search:**
   - Real-time search across title, entity name, and notes
   - Highlight matching text in results

3. **Sorting:**
   - Default: Newest first
   - Option: Oldest first

4. **Infinite Scroll:**
   - Load 20 activities initially
   - Load more as user scrolls down

5. **Export:**
   - Generate CSV with all filtered activities
   - Include: Date, Type, Title, Entity, Status, Notes
   - Download file named: `atividades_${date}.csv`

6. **Navigation:**
   - Tap activity: Navigate to related entity detail (clinic/doctor/order)

### Component Structure

```javascript
// File: components/atlas-activity-full.jsx

function ActivityFullListScreen({ onBack }) {
  const [activities, setActivities] = React.useState(ALL_ACTIVITIES);
  const [filter, setFilter] = React.useState('all'); // all | visit | call | order | presentation
  const [dateRange, setDateRange] = React.useState('all'); // all | today | 7days | 30days
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('desc'); // desc | asc
  const [exporting, setExporting] = React.useState(false);

  const filteredActivities = React.useMemo(() => {
    let result = [...activities];

    // Type filter
    if (filter !== 'all') {
      result = result.filter(a => a.type === filter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (dateRange === '7days') cutoff.setDate(now.getDate() - 7);
      else if (dateRange === '30days') cutoff.setDate(now.getDate() - 30);
      result = result.filter(a => new Date(a.timestamp) >= cutoff);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.entity.name.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [activities, filter, dateRange, searchQuery, sortOrder]);

  const handleExport = () => {
    setExporting(true);
    
    // Generate CSV
    const headers = ['Data', 'Tipo', 'Título', 'Cliente', 'Status', 'Notas'];
    const rows = filteredActivities.map(a => [
      new Date(a.timestamp).toLocaleString('pt-BR'),
      ACTIVITY_TYPES[a.type].label,
      a.title,
      a.entity.name,
      a.status === 'completed' ? 'Concluída' : 'Pendente',
      a.notes || '',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atividades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => setExporting(false), 1000);
  };

  const handleActivityTap = (activity) => {
    onBack();
    // Navigate based on entity type
    if (activity.entity.type === 'clinic') {
      // showClinicDetail(activity.entity.id)
    } else if (activity.entity.type === 'doctor') {
      // showDoctorDetail(activity.entity.id)
    } else if (activity.type === 'order') {
      // showOrderDetail(activity.id)
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      <AtlasTopBar page="Atividades" active="explorar" />

      {/* Header with Stats */}
      <div style={{ padding: '16px 16px 8px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          {filteredActivities.length} atividades
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {dateRange === 'all' ? 'Todas as datas' : 
           dateRange === 'today' ? 'Hoje' :
           dateRange === '7days' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="Buscar atividades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            fontSize: 15,
            outline: 'none',
          }}
        />
      </div>

      {/* Filter Pills */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}>
        {['all', 'visit', 'call', 'order', 'presentation'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 20,
              background: filter === type ? '#6366f1' : '#f3f4f6',
              color: filter === type ? '#fff' : '#6b7280',
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {type === 'all' ? 'Todas' : ACTIVITY_TYPES[type].label}
          </button>
        ))}
      </div>

      {/* Date Range Selector */}
      <div style={{
        padding: '8px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
        fontSize: 12,
      }}>
        {['all', 'today', '7days', '30days'].map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            style={{
              padding: '4px 10px',
              border: dateRange === range ? '1px solid #6366f1' : '1px solid #e5e7eb',
              borderRadius: 6,
              background: dateRange === range ? '#eef2ff' : '#fff',
              color: dateRange === range ? '#6366f1' : '#6b7280',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {range === 'all' ? 'Todas' :
             range === 'today' ? 'Hoje' :
             range === '7days' ? '7 dias' : '30 dias'}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div style={{ padding: 16 }}>
        {filteredActivities.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            Nenhuma atividade encontrada
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onTap={() => handleActivityTap(activity)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Export Button (Floating) */}
      <button
        onClick={handleExport}
        disabled={exporting || filteredActivities.length === 0}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: 'none',
          background: exporting ? '#9ca3af' : '#6366f1',
          color: '#fff',
          fontSize: 24,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          cursor: exporting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {exporting ? '⏳' : '📥'}
      </button>
    </div>
  );
}

function ActivityCard({ activity, onTap }) {
  const meta = ACTIVITY_TYPES[activity.type];
  
  return (
    <div
      onClick={onTap}
      style={{
        padding: 16,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: `${meta.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: meta.color, fontWeight: 600, marginBottom: 2 }}>
            {meta.label} • {activity.entity.name}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            {activity.title}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {getRelativeTime(activity.timestamp)}
          </div>
          {activity.status === 'completed' && (
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 6 }}>
              ✅ Concluída
              {activity.outcome && ` • ${activity.outcome === 'positive' ? 'Resultado: Positivo' : 'Resultado: Neutro'}`}
            </div>
          )}
          {activity.notes && (
            <div style={{
              fontSize: 12,
              color: '#6b7280',
              marginTop: 6,
              fontStyle: 'italic',
            }}>
              "{activity.notes}"
            </div>
          )}
        </div>
        <div style={{ fontSize: 18, color: '#9ca3af' }}>›</div>
      </div>
    </div>
  );
}

function getRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

const ALL_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'visit',
    title: 'Reunião com Dr. João Silva',
    entity: { type: 'clinic', id: 'clinic-1', name: 'Clínica ABC' },
    timestamp: '2026-05-07T15:30:00',
    status: 'completed',
    outcome: 'positive',
    notes: 'Cliente interessado em novo produto X',
  },
  {
    id: 'act-2',
    type: 'call',
    title: 'Follow-up pedido #1234',
    entity: { type: 'doctor', id: 'doc-1', name: 'Dr. Roberto Alves' },
    timestamp: '2026-05-07T10:15:00',
    status: 'completed',
    duration: '12 min',
  },
  {
    id: 'act-3',
    type: 'order',
    title: 'Pedido de reposição',
    entity: { type: 'clinic', id: 'clinic-2', name: 'Hospital Central' },
    timestamp: '2026-05-06T14:20:00',
    status: 'completed',
  },
  {
    id: 'act-4',
    type: 'presentation',
    title: 'Apresentação: Produto Xarelto',
    entity: { type: 'doctor', id: 'doc-3', name: 'Dra. Maria Santos' },
    timestamp: '2026-05-06T09:00:00',
    status: 'completed',
    outcome: 'positive',
  },
  // Add 50+ more activities for realistic testing
];

Object.assign(window, { ActivityFullListScreen, ALL_ACTIVITIES, ACTIVITY_TYPES });
```

### Integration Points

1. **From BI Dashboard (`atlas-bi.jsx`):**
   - Find "Atividades Recentes" section
   - Add "Ver todas" button
   - On click: Show `ActivityFullListScreen`

2. **Navigation:**
   - From activity to clinic: Use existing `ClinicDetailScreen`
   - From activity to doctor: Use existing `DoctorDetailScreen`
   - From activity to order: Use existing order detail view

### Testing Checklist

- [ ] All activities load correctly
- [ ] Type filter works (all, visits, calls, orders, presentations)
- [ ] Date range filter works (all, today, 7 days, 30 days)
- [ ] Search filters activities by title, entity name, notes
- [ ] Sort order toggle works (newest/oldest first)
- [ ] Activity cards show correct icon and color
- [ ] Tapping activity navigates to correct detail screen
- [ ] Export button generates CSV with correct data
- [ ] CSV downloads with timestamp in filename
- [ ] Infinite scroll loads more activities
- [ ] "No activities found" message shows when filters return empty
- [ ] Floating export button is disabled when no results
- [ ] Activity cards show relative time (e.g., "há 2 horas")
- [ ] Completed activities show green checkmark
- [ ] Activity notes display in card when present

---

## TASK-011: Help Center

### Context
Users need access to help documentation, FAQs, video tutorials, and guides to learn how to use the app effectively. This screen should be accessible from the Profile screen.

### User Flow
1. User taps "Central de Ajuda" in Profile screen
2. Help Center opens with categories
3. User can:
   - Browse help categories
   - Search for specific topics
   - View FAQ articles
   - Watch video tutorials
   - Contact support if needed

### Visual Design

**Layout:**
- Top bar with back button and "Central de Ajuda"
- Search bar
- Category grid (4 main categories with icons)
- "Perguntas Frequentes" section
- "Tutoriais em Vídeo" section
- "Ainda precisa de ajuda?" CTA button

**Category Cards:**
```
┌─────────────────┐
│      📱         │
│   Primeiros     │
│     Passos      │
└─────────────────┘
```

**FAQ Item:**
```
┌──────────────────────────────────────┐
│ Como adicionar uma nova clínica?   › │
└──────────────────────────────────────┘
```

### Data Structure

```javascript
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    icon: '📱',
    title: 'Primeiros Passos',
    description: 'Como começar a usar o app',
    articles: 12,
  },
  {
    id: 'visits',
    icon: '🏥',
    title: 'Visitas',
    description: 'Gerenciar visitas e agendamentos',
    articles: 8,
  },
  {
    id: 'orders',
    icon: '📦',
    title: 'Pedidos',
    description: 'Fazer e acompanhar pedidos',
    articles: 10,
  },
  {
    id: 'reports',
    icon: '📊',
    title: 'Relatórios',
    description: 'Entender seus indicadores',
    articles: 6,
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Como adicionar uma nova clínica?',
    answer: 'Para adicionar uma nova clínica, vá até a aba "Explorar", toque no botão "+" no canto inferior direito e preencha os dados solicitados. A clínica será adicionada à sua carteira após aprovação do gestor.',
  },
  {
    id: 'faq-2',
    question: 'Como registrar uma visita realizada?',
    answer: 'Na tela da clínica ou médico, toque em "Registrar Visita", preencha os detalhes (data, horário, resultado) e salve. A visita aparecerá no histórico e nos seus indicadores.',
  },
  // ... more FAQs (15-20 total)
];

const VIDEO_TUTORIALS = [
  {
    id: 'video-1',
    title: 'Tour pelo aplicativo',
    duration: '3:24',
    thumbnail: 'https://via.placeholder.com/320x180',
    url: 'https://www.youtube.com/watch?v=...',
  },
  {
    id: 'video-2',
    title: 'Como fazer um pedido',
    duration: '2:15',
    thumbnail: 'https://via.placeholder.com/320x180',
    url: 'https://www.youtube.com/watch?v=...',
  },
  // ... more videos
];
```

### Functionality

1. **Search:**
   - Search across all FAQs and articles
   - Show matching results grouped by category
   - Highlight matching text

2. **Category Navigation:**
   - Tap category: Show all articles in that category
   - Each article opens in expandable accordion or new screen

3. **FAQ Accordion:**
   - Tap question: Expand to show answer
   - Tap again: Collapse

4. **Video Player:**
   - Tap video: Open in modal or native player
   - Show duration and thumbnail

5. **Contact Support:**
   - CTA button at bottom: "Falar com o Suporte"
   - Opens support chat (TASK-012)

### Component Structure

```javascript
// File: components/atlas-help.jsx

function HelpCenterScreen({ onBack }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedFaq, setExpandedFaq] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const filteredFaqs = React.useMemo(() => {
    if (!searchQuery) return FAQ_ITEMS;
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(faq =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (selectedCategory) {
    return (
      <CategoryDetailScreen
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      <AtlasTopBar page="Central de Ajuda" active="perfil" />

      {/* Search Bar */}
      <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="Buscar ajuda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            fontSize: 15,
            outline: 'none',
          }}
        />
      </div>

      {/* Categories Grid */}
      {!searchQuery && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Categorias
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
            {HELP_CATEGORIES.map(cat => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: 20,
                  background: '#fff',
                  borderRadius: 16,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: 48, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {cat.articles} artigos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          {searchQuery ? 'Resultados da busca' : 'Perguntas Frequentes'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredFaqs.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 14,
            }}>
              Nenhuma pergunta encontrada
            </div>
          ) : (
            filteredFaqs.map(faq => (
              <div
                key={faq.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  style={{
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>
                    {faq.question}
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: '#9ca3af',
                    transition: 'transform 0.2s',
                    transform: expandedFaq === faq.id ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}>
                    ›
                  </div>
                </div>
                {expandedFaq === faq.id && (
                  <div style={{
                    padding: '0 16px 16px',
                    fontSize: 14,
                    color: '#6b7280',
                    lineHeight: 1.6,
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: 16,
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Tutorials */}
      {!searchQuery && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Tutoriais em Vídeo
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {VIDEO_TUTORIALS.map(video => (
              <div
                key={video.id}
                onClick={() => window.open(video.url, '_blank')}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  background: '#fff',
                  borderRadius: 12,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{
                  width: 120,
                  height: 68,
                  borderRadius: 8,
                  background: '#e5e7eb',
                  backgroundImage: `url(${video.thumbnail})`,
                  backgroundSize: 'cover',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 11,
                  }}>
                    {video.duration}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Assistir vídeo
                  </div>
                </div>
                <div style={{ fontSize: 18, color: '#9ca3af', alignSelf: 'center' }}>
                  ▶
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div style={{ padding: 16 }}>
        <button
          onClick={() => {
            onBack();
            // Open support chat (TASK-012)
            // showSupportChat()
          }}
          style={{
            width: '100%',
            padding: 16,
            border: 'none',
            borderRadius: 12,
            background: '#6366f1',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          💬 Falar com o Suporte
        </button>
      </div>
    </div>
  );
}

function CategoryDetailScreen({ category, onBack }) {
  const articles = [
    { id: '1', title: 'Como começar a usar o app', readTime: '2 min' },
    { id: '2', title: 'Configurando seu perfil', readTime: '3 min' },
    { id: '3', title: 'Adicionando sua primeira clínica', readTime: '4 min' },
    // ... more articles based on category
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 48 }}>{category.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{category.title}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{category.description}</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => {/* Open article detail */}}
              style={{
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  📖 {article.readTime}
                </div>
              </div>
              <div style={{ fontSize: 18, color: '#9ca3af' }}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    icon: '📱',
    title: 'Primeiros Passos',
    description: 'Como começar a usar o app',
    articles: 12,
  },
  {
    id: 'visits',
    icon: '🏥',
    title: 'Visitas',
    description: 'Gerenciar visitas e agendamentos',
    articles: 8,
  },
  {
    id: 'orders',
    icon: '📦',
    title: 'Pedidos',
    description: 'Fazer e acompanhar pedidos',
    articles: 10,
  },
  {
    id: 'reports',
    icon: '📊',
    title: 'Relatórios',
    description: 'Entender seus indicadores',
    articles: 6,
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Como adicionar uma nova clínica?',
    answer: 'Para adicionar uma nova clínica, vá até a aba "Explorar", toque no botão "+" no canto inferior direito e preencha os dados solicitados. A clínica será adicionada à sua carteira após aprovação do gestor.',
  },
  {
    id: 'faq-2',
    question: 'Como registrar uma visita realizada?',
    answer: 'Na tela da clínica ou médico, toque em "Registrar Visita", preencha os detalhes (data, horário, resultado) e salve. A visita aparecerá no histórico e nos seus indicadores.',
  },
  {
    id: 'faq-3',
    question: 'Como fazer um pedido?',
    answer: 'Na tela de apresentações de produtos, selecione o produto desejado, escolha a quantidade, defina a clínica destinatária e confirme. O pedido será enviado para processamento.',
  },
  {
    id: 'faq-4',
    question: 'Como ver meus indicadores de performance?',
    answer: 'Acesse a aba "BI" no menu principal. Lá você verá seu desempenho de vendas, visitas realizadas, taxa de conversão e outros indicadores importantes.',
  },
  {
    id: 'faq-5',
    question: 'Como editar informações de uma clínica?',
    answer: 'Na tela de detalhes da clínica, toque no ícone de lápis no canto superior direito para editar as informações. As mudanças precisarão ser aprovadas pelo gestor.',
  },
];

const VIDEO_TUTORIALS = [
  {
    id: 'video-1',
    title: 'Tour pelo aplicativo',
    duration: '3:24',
    thumbnail: 'https://via.placeholder.com/320x180/6366f1/ffffff?text=Tour',
    url: '#',
  },
  {
    id: 'video-2',
    title: 'Como fazer um pedido',
    duration: '2:15',
    thumbnail: 'https://via.placeholder.com/320x180/10b981/ffffff?text=Pedidos',
    url: '#',
  },
  {
    id: 'video-3',
    title: 'Registrando visitas',
    duration: '3:45',
    thumbnail: 'https://via.placeholder.com/320x180/f59e0b/ffffff?text=Visitas',
    url: '#',
  },
];

Object.assign(window, { HelpCenterScreen, HELP_CATEGORIES, FAQ_ITEMS, VIDEO_TUTORIALS });
```

### Integration Points

1. **From Profile Screen (`atlas-profile.jsx`):**
   - Add "Central de Ajuda" list item
   - On tap: Show `HelpCenterScreen`

2. **Link to Support Chat:**
   - "Falar com o Suporte" button opens `SupportChatScreen` (TASK-012)

### Testing Checklist

- [ ] Help center screen loads with all categories
- [ ] Search filters FAQs correctly
- [ ] Category cards navigate to category detail
- [ ] FAQ items expand/collapse on tap
- [ ] FAQ answers display with correct formatting
- [ ] Video thumbnails load correctly
- [ ] Video duration shows on thumbnail
- [ ] Tapping video opens in new tab or player
- [ ] "Falar com o Suporte" button works
- [ ] Category detail shows relevant articles
- [ ] Article list items navigate to article detail
- [ ] Back button returns from category detail
- [ ] Search shows "no results" message when appropriate
- [ ] Categories show correct article count

---

## TASK-012: Support Chat

### Context
Users need a way to contact support for issues that can't be resolved through the help center. This should be a real-time chat interface that feels modern and responsive.

### User Flow
1. User taps "Suporte" in Profile or "Falar com o Suporte" in Help Center
2. Chat screen opens
3. User can:
   - See chat history with support
   - Send text messages
   - Attach photos/files
   - See when support is typing
   - Receive real-time responses
   - Rate the support interaction

### Visual Design

**Layout:**
- Top bar with back button, "Suporte", and status indicator
- Chat message list (scrollable)
- Input bar at bottom with text field, attachment button, send button

**Message Bubbles:**
```
User message (right-aligned, indigo):
┌──────────────────────┐
│ Como faço para...?   │
│             15:30 ✓✓ │
└──────────────────────┘

Support message (left-aligned, gray):
┌──────────────────────┐
│ Olá! Para isso você  │
│ precisa...           │
│ 15:31                │
└──────────────────────┘
```

### Data Structure

```javascript
const CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'support',
    text: 'Olá! Sou a Ana do suporte AtlasMed. Como posso ajudar?',
    timestamp: '2026-05-07T14:00:00',
    status: 'delivered',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Estou com dificuldade para registrar uma visita',
    timestamp: '2026-05-07T14:02:00',
    status: 'read',
  },
  {
    id: 'msg-3',
    sender: 'support',
    text: 'Sem problemas! Vou te ajudar. Qual mensagem de erro está aparecendo?',
    timestamp: '2026-05-07T14:03:00',
    status: 'delivered',
  },
  // ... more messages
];

const SUPPORT_STATUS = {
  online: { label: 'Online', color: '#10b981' },
  away: { label: 'Ausente', color: '#f59e0b' },
  offline: { label: 'Offline', color: '#9ca3af' },
};
```

### Functionality

1. **Real-time Messaging:**
   - Send text messages
   - Receive responses (simulate with setTimeout for now)
   - Show typing indicator when support is typing

2. **Message Status:**
   - Sent: Single checkmark (✓)
   - Delivered: Double checkmark (✓✓)
   - Read: Double checkmark in blue (✓✓)

3. **Attachments:**
   - Button to attach photos/files
   - Show thumbnail in message bubble

4. **Auto-scroll:**
   - Scroll to bottom when new message arrives
   - Scroll to bottom when user sends message

5. **Support Status:**
   - Show online/away/offline indicator in top bar

6. **Rating:**
   - After support marks conversation as resolved, show rating prompt
   - 1-5 stars with optional text feedback

### Component Structure

```javascript
// File: components/atlas-support-chat.jsx

function SupportChatScreen({ onBack }) {
  const [messages, setMessages] = React.useState(CHAT_MESSAGES);
  const [inputText, setInputText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [supportStatus, setSupportStatus] = React.useState('online');
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate support typing and response
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        sender: 'support',
        text: 'Entendi. Deixa eu verificar isso para você...',
        timestamp: new Date().toISOString(),
        status: 'delivered',
      }]);
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ←
        </button>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          💬
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Suporte AtlasMed</div>
          <div style={{
            fontSize: 12,
            color: SUPPORT_STATUS[supportStatus].color,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: SUPPORT_STATUS[supportStatus].color,
            }} />
            {SUPPORT_STATUS[supportStatus].label}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            background: '#fff',
            borderRadius: '16px 16px 16px 4px',
            fontSize: 14,
            color: '#9ca3af',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: 'none',
            background: '#f3f4f6',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          📎
        </button>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            fontSize: 15,
            outline: 'none',
            resize: 'none',
            maxHeight: 100,
            fontFamily: 'inherit',
          }}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: 'none',
            background: inputText.trim() ? '#6366f1' : '#e5e7eb',
            color: '#fff',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            fontSize: 20,
            transition: 'background 0.2s',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  
  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
    }}>
      <div style={{
        padding: '12px 16px',
        background: isUser ? '#6366f1' : '#fff',
        color: isUser ? '#fff' : '#1f2937',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        fontSize: 15,
        lineHeight: 1.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {message.text}
      </div>
      <div style={{
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
        textAlign: isUser ? 'right' : 'left',
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        gap: 4,
      }}>
        {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        {isUser && message.status && (
          <span style={{ color: message.status === 'read' ? '#10b981' : '#9ca3af' }}>
            {message.status === 'sent' ? '✓' : '✓✓'}
          </span>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div className="typing-dot" style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        background: '#9ca3af',
        animation: 'typing 1.4s infinite',
      }} />
      <div className="typing-dot" style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        background: '#9ca3af',
        animation: 'typing 1.4s infinite 0.2s',
      }} />
      <div className="typing-dot" style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        background: '#9ca3af',
        animation: 'typing 1.4s infinite 0.4s',
      }} />
      <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

const CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'support',
    text: 'Olá! Sou a Ana do suporte AtlasMed. Como posso ajudar?',
    timestamp: '2026-05-07T14:00:00',
    status: 'delivered',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Estou com dificuldade para registrar uma visita',
    timestamp: '2026-05-07T14:02:00',
    status: 'read',
  },
  {
    id: 'msg-3',
    sender: 'support',
    text: 'Sem problemas! Vou te ajudar. Qual mensagem de erro está aparecendo?',
    timestamp: '2026-05-07T14:03:00',
    status: 'delivered',
  },
];

const SUPPORT_STATUS = {
  online: { label: 'Online', color: '#10b981' },
  away: { label: 'Ausente', color: '#f59e0b' },
  offline: { label: 'Offline', color: '#9ca3af' },
};

Object.assign(window, { SupportChatScreen, CHAT_MESSAGES, SUPPORT_STATUS });
```

### Integration Points

1. **From Profile Screen:**
   - Add "Suporte" list item
   - On tap: Show `SupportChatScreen`

2. **From Help Center:**
   - "Falar com o Suporte" button opens `SupportChatScreen`

3. **Push Notifications (Future):**
   - When support responds, send push notification
   - Tapping notification opens chat

### Testing Checklist

- [ ] Chat screen loads with message history
- [ ] Support status indicator shows correct color
- [ ] Text input allows typing
- [ ] Send button is disabled when input is empty
- [ ] Pressing Enter sends message
- [ ] User messages appear right-aligned in indigo
- [ ] Support messages appear left-aligned in gray
- [ ] Timestamps show in correct format (HH:MM)
- [ ] Message status icons show correctly (✓ vs ✓✓)
- [ ] Read receipts turn green
- [ ] Typing indicator animates smoothly
- [ ] Auto-scroll works when new messages arrive
- [ ] Attachment button is present (functionality TBD)
- [ ] Back button returns to previous screen
- [ ] Chat history persists between sessions
- [ ] Long messages wrap correctly in bubbles

---

*Continue to next file for TASK-013 through TASK-018...*
