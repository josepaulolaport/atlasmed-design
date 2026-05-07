# Atlasmed Design - Phase 2 Implementation Specifications

**Project:** Atlasmed Salesman App Design System  
**Phase:** 2 - Enhanced UX  
**Priority:** High  
**Total Time:** 12 hours  
**Prerequisites:** Phase 1 complete (TASK-001 through TASK-004)

---

## PROJECT CONTEXT REMINDER

### About Atlasmed
Atlasmed is a pharmaceutical sales representative mobile application. This is a **design showcase project** where all components are React-based but load via CDN (no build process). Each component file is self-contained with inline mock data.

### Architecture
- **React 18.3.1** + **React DOM** via unpkg CDN
- **Babel Standalone** for in-browser JSX transpilation
- **No npm, no webpack** - pure HTML + script tags
- **Component files:** `/components/*.jsx`
- **Entry point:** `/index.html`

### Design System Quick Reference
```javascript
// Colors
const COLORS = {
  navy: '#0a2f7f',        // Primary
  navyBright: '#1e40af',  // Interactive
  green: '#16a373',       // Success
  amber: '#c6861b',       // Warning
  red: '#b84545',         // Error
  gray: '#6b7280',        // Text secondary
};

// Typography: Inter font, 400-700 weights
// Cards: 14px border-radius, #fff background, #eef0f3 border
// Buttons: 12px border-radius, 14px font-size, 600 weight
```

---

## PHASE 2 TASKS OVERVIEW

| Task | Screen | Time | Complexity |
|------|--------|------|------------|
| TASK-005 | Visit History Full List | 4h | Medium |
| TASK-006 | Products Full List | 3h | Medium |
| TASK-007 | Work Hours Editor | 2h | Low |
| TASK-008 | Profile Editor | 3h | Medium |

---

## TASK-005: Visit History Full List Screen

**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** None  
**File to create:** `/components/visit-history-full.jsx`

### Context
On clinic and doctor detail screens, there's a "Histórico de visitas" section that shows the 3 most recent visits. Below this is a button "Ver histórico completo" that should open a full-screen view with ALL visits, filtering, search, and export capabilities.

### User Flow
1. User is viewing clinic or doctor detail screen
2. User scrolls to visit history section
3. User taps "Ver histórico completo →" button
4. Full-screen view slides in from right
5. User sees complete chronological list of ALL visits (not just 3)
6. User can filter by outcome (positivo, neutro, misto, negativo)
7. User can search by keyword
8. User can export to PDF/CSV (shows toast in mockup)
9. User taps back arrow to return to detail screen

### Requirements

#### Visual Design
- **Layout:** Full screen (position: absolute, inset: 0)
- **Header:**
  - Back arrow (left)
  - Title: "Histórico de visitas"
  - Subtitle: "{Entity name}" (clinic or doctor name)
  - Export button (right, download icon)
- **Filters:**
  - Pill buttons: "Todas" | "Positivas" | "Mistas" | "Negativas"
  - Active filter: navy background, white text
  - Show count on each pill: "Todas (18)"
- **Search bar:**
  - Placeholder: "Buscar na anotação, consultor…"
  - Magnifying glass icon
  - Clear X button when typing
- **Visit list:**
  - Same design as on detail screen
  - Timeline dots (colored by outcome)
  - Date, time, duration
  - Consultant avatar + name
  - Kind chip (e.g., "Reunião agendada")
  - "com {person}" chip
  - Order value (if any) in green chip
  - Samples (if any) in blue chip
  - Full note text
- **Summary stats (top):**
  - Total visits
  - Total orders / value
  - Average duration
  - Displayed in 3-column grid
- **Empty state:**
  - Calendar icon
  - "Nenhuma visita encontrada"
  - "Ajuste os filtros ou busca"

#### Data Structure
```javascript
// Extend the visits array from clinic/doctor detail
const ALL_VISITS_MOCK = [
  {
    id: 'v-1',
    date: '17/abr · qui',
    time: '14h30',
    duration: '42 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica', // For doctor view
    note: 'Reunião com Dra. Mariana. Demonstração do novo AtlasGel 240g...',
    outcome: 'positivo', // positivo | neutro | misto | negativo
    orderValue: null,
    samples: ['AtlasGel 240g · 5un'],
  },
  // ... include all 18+ visits (currently only ~8 shown on detail)
  {
    id: 'v-18',
    date: '12/nov · seg',
    time: '09h15',
    duration: '25 min',
    consultant: 'Bruno Araújo',
    consultantHue: 28,
    consultantInitials: 'BA',
    kind: 'Prospecção',
    withWhom: 'Recepção',
    location: 'Clínica Santa Mônica',
    note: 'Primeira visita. Deixei cartão e material institucional.',
    outcome: 'neutro',
    orderValue: null,
    samples: null,
  },
  // Add 10-12 more visits covering several months
];

// Outcome metadata (reuse from detail screen)
const OUTCOME_META = {
  positivo: { color: '#16a373', label: 'Positivo', bg: 'rgba(22,163,115,0.12)' },
  neutro:   { color: '#8a94a6', label: 'Neutro',   bg: 'rgba(138,148,166,0.14)' },
  misto:    { color: '#c6861b', label: 'Misto',    bg: 'rgba(198,134,27,0.14)' },
  negativo: { color: '#b84545', label: 'Negativo', bg: 'rgba(184,69,69,0.12)' },
};
```

#### Functionality
1. **Filter by outcome:**
   - "Todas": Show all visits
   - "Positivas": Only outcome === 'positivo'
   - "Mistas": Only outcome === 'misto'
   - "Negativas": Only outcome === 'negativo'
   - Update pill counts dynamically
2. **Search:**
   - Filter by: note text, consultant name, withWhom, kind
   - Case-insensitive
   - Real-time filtering
3. **Summary calculations:**
   - Total visits: filtered.length
   - Total orders: visits with orderValue
   - Sum order values (parse "R$ 4.120" → 4120)
   - Average duration: parse "42 min" or "1h 12min" → minutes, then average
4. **Export:**
   - Show toast: "Exportando histórico..." (2s) → "Histórico exportado ✓"
   - Console log the data (in real app would generate PDF/CSV)

#### Component Structure
```javascript
function VisitHistoryFullScreen({ entityType, entityId, entityName, visits = ALL_VISITS_MOCK, onBack }) {
  const [filter, setFilter] = React.useState('todas');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [exporting, setExporting] = React.useState(false);
  
  // Filter by outcome
  const outcomeFiltered = visits.filter(v => {
    if (filter === 'todas') return true;
    if (filter === 'positivas') return v.outcome === 'positivo';
    if (filter === 'mistas') return v.outcome === 'misto';
    if (filter === 'negativas') return v.outcome === 'negativo';
    return true;
  });
  
  // Filter by search
  const filtered = outcomeFiltered.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.note?.toLowerCase().includes(q) ||
      v.consultant?.toLowerCase().includes(q) ||
      v.withWhom?.toLowerCase().includes(q) ||
      v.kind?.toLowerCase().includes(q)
    );
  });
  
  // Calculate counts for pills
  const counts = {
    todas: visits.length,
    positivas: visits.filter(v => v.outcome === 'positivo').length,
    mistas: visits.filter(v => v.outcome === 'misto').length,
    negativas: visits.filter(v => v.outcome === 'negativo').length,
  };
  
  // Calculate summary stats
  const totalVisits = filtered.length;
  const ordersWithValue = filtered.filter(v => v.orderValue);
  const totalOrders = ordersWithValue.length;
  const totalValue = ordersWithValue.reduce((sum, v) => {
    const val = parseFloat(v.orderValue.replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const avgDuration = Math.round(
    filtered.reduce((sum, v) => {
      // Parse "42 min" or "1h 12min" to minutes
      const match = v.duration.match(/(\d+)\s*h?\s*(\d+)?/);
      if (!match) return sum;
      const h = v.duration.includes('h') ? parseInt(match[1]) * 60 : 0;
      const m = v.duration.includes('h') ? (match[2] ? parseInt(match[2]) : 0) : parseInt(match[1]);
      return sum + h + m;
    }, 0) / totalVisits
  );
  
  const handleExport = () => {
    setExporting(true);
    console.log('Exporting visit history:', filtered);
    setTimeout(() => {
      setExporting(false);
      // Show success toast
    }, 2000);
  };
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 300ms ease',
      zIndex: 100,
    }}>
      <AtlasTopBar page="Explorar" active="explorar"/>
      
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #eef0f3', background: '#fff',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" strokeWidth="1.8">
              <path d="M10 3l-5 5 5 5"/>
            </svg>
          </button>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Histórico de visitas
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', marginTop: 2 }}>
              {entityName}
            </div>
          </div>
          
          <button onClick={handleExport} disabled={exporting} style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #eef0f3', background: exporting ? '#f3f4f6' : '#fff',
            cursor: exporting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: exporting ? '#9ca3af' : '#0a2f7f',
          }}>
            {exporting ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M8 2v3M8 11v3M14 8h-3M5 8H2"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M8 2v9M4 7.5l4 4 4-4"/>
                <path d="M2 13.5h12"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Summary stats */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0a2f7f' }}>{totalVisits}</div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>visitas</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#16a373' }}>
            {totalOrders > 0 ? `R$ ${(totalValue / 1000).toFixed(1)}k` : '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
            {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
            {avgDuration > 0 ? `${avgDuration} min` : '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>duração média</div>
        </div>
      </div>
      
      {/* Search bar */}
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #eef0f3', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#f7f8fb', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#6b7280" strokeWidth="1.7">
            <circle cx="6.5" cy="6.5" r="5"/>
            <path d="M11 11l2.5 2.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar na anotação, consultor…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 14, fontFamily: 'Inter, system-ui',
              color: '#1f2937',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              width: 20, height: 20, borderRadius: 10,
              background: '#e5e7eb', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#6b7280" strokeWidth="1.6">
                <path d="M1 1l6 6M7 1L1 7"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Filter pills */}
      <div style={{
        padding: '12px 16px 8px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', gap: 6,
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'positivas', label: 'Positivas' },
          { key: 'mistas', label: 'Mistas' },
          { key: 'negativas', label: 'Negativas' },
        ].map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '5px 11px',
                borderRadius: 999,
                border: `1px solid ${active ? '#0a2f7f' : '#e5e7eb'}`,
                background: active ? '#0a2f7f' : '#fff',
                color: active ? '#fff' : '#374151',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              {f.label}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '0 5px',
                borderRadius: 6,
                background: active ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
                color: active ? '#fff' : '#6b7280',
              }}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Visit list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 16px 24px',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: 80,
            color: '#9ca3af',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="6" width="20" height="16" rx="2"/>
                <path d="M4 10h20M10 3v6M18 3v6"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>
              Nenhuma visita encontrada
            </div>
            <div style={{ fontSize: 13 }}>
              Ajuste os filtros ou busca
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            border: '1px solid #eef0f3',
            borderRadius: 14,
            padding: 16,
          }}>
            {filtered.map((visit, i) => (
              <VisitItem
                key={visit.id}
                visit={visit}
                isLast={i === filtered.length - 1}
                showLocation={entityType === 'doctor'} // Show location for doctor view
              />
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Reuse VisitItem from clinic/doctor detail (copy or import)
function VisitItem({ visit, isLast, showLocation = false }) {
  const meta = OUTCOME_META[visit.outcome] || OUTCOME_META.neutro;
  
  return (
    <div style={{
      display: 'flex', gap: 12,
      paddingBottom: isLast ? 0 : 16,
      position: 'relative',
    }}>
      {/* Timeline rail */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 14, flexShrink: 0,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: 5,
          background: meta.color,
          marginTop: 5,
          boxShadow: `0 0 0 3px ${meta.color}22`,
        }}/>
        {!isLast && (
          <div style={{
            flex: 1, width: 2, background: '#eef0f3',
            marginTop: 3, minHeight: 20,
          }}/>
        )}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Date + consultant */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8, marginBottom: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729' }}>
              {visit.date}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              {visit.time} · {visit.duration}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 9,
              background: `hsl(${visit.consultantHue}, 48%, 86%)`,
              color: `hsl(${visit.consultantHue}, 55%, 28%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>
              {visit.consultantInitials}
            </div>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              {visit.consultant}
            </span>
          </div>
        </div>
        
        {/* Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: meta.bg, color: meta.color,
            fontSize: 10.5, fontWeight: 700,
          }}>
            {visit.kind}
          </span>
          
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: '#f3f4f6', color: '#4b5563',
            fontSize: 10.5, fontWeight: 500,
          }}>
            com {visit.withWhom}
          </span>
          
          {showLocation && visit.location && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(30,64,175,0.08)', color: '#1e40af',
              fontSize: 10.5, fontWeight: 500,
            }}>
              📍 {visit.location}
            </span>
          )}
          
          {visit.orderValue && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(22,163,115,0.12)', color: '#117a55',
              fontSize: 10.5, fontWeight: 700,
            }}>
              pedido · {visit.orderValue}
            </span>
          )}
          
          {visit.samples && visit.samples.map((s, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(30,64,175,0.08)', color: '#1e40af',
              fontSize: 10.5, fontWeight: 500,
            }}>
              amostra · {s}
            </span>
          ))}
        </div>
        
        {/* Note */}
        <div style={{
          fontSize: 12.5, color: '#374151',
          lineHeight: 1.5, textWrap: 'pretty',
        }}>
          {visit.note}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  VisitHistoryFullScreen,
  ALL_VISITS_MOCK,
});
```

#### Integration Points
- Import in `index.html` after clinic/doctor components
- Modify `ClinicVisits` component in `atlas-clinic.jsx`:
  - Add state: `const [historyFullOpen, setHistoryFullOpen] = React.useState(false)`
  - Wire up "Ver histórico completo" button
  - Render overlay: `{historyFullOpen && <VisitHistoryFullScreen ... />}`
- Same integration for `DoctorDetailScreen`

#### Testing Checklist
- [ ] Opens from detail screen button
- [ ] Shows all visits (not just 3)
- [ ] Summary stats calculate correctly
- [ ] Filter pills work
- [ ] Search filters in real-time
- [ ] Empty state displays
- [ ] Export shows loading → success toast
- [ ] Back button returns to detail screen
- [ ] Slide-in animation works
- [ ] For doctor view, shows location per visit

---

## TASK-006: Products Full List Screen

**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** None  
**File to create:** `/components/products-full-list.jsx`

### Context
On clinic detail screens, the "Produtos em uso" section shows 3 products with mini trend charts. A "Ver todos" button should open a full-screen view showing ALL products the clinic uses, with complete historical trends, share of wallet analysis, and drill-down details.

### User Flow
1. User is viewing clinic detail screen
2. User scrolls to "Produtos em uso" section (shows 3 products)
3. User taps "Ver todos →" link
4. Full-screen product list slides in
5. User sees ALL products with 6-month trends
6. User can sort by growth, volume, or share
7. User can expand a product to see monthly breakdown
8. User taps back to return to clinic detail

### Requirements

#### Visual Design
- **Layout:** Full screen slide-in from right
- **Header:**
  - Back arrow
  - Title: "Produtos em uso"
  - Subtitle: "{Clinic name}" or "últimos 6 meses"
  - Sort button (right, filter icon)
- **Summary card (top):**
  - Total products count
  - Total 6-month volume (sum all)
  - Average growth percentage
  - 3-column grid, card background
- **Product rows:**
  - Product icon (colored circle with initials)
  - Product name (14px, 600 weight)
  - 6-month volume (12px, gray)
  - Growth badge (▲/▼ with percentage, colored)
  - Mini trend chart (6 bars)
  - Share bar (horizontal progress bar with percentage)
  - Expand arrow (chevron down)
- **Expanded state (accordion):**
  - Monthly breakdown table
  - Month | Volume | Growth
  - Show all 6 months
  - Collapse arrow (chevron up)
- **Sort options (bottom sheet):**
  - "Maior crescimento"
  - "Maior volume"
  - "Maior share"
  - "Nome A-Z"

#### Data Structure
```javascript
// Extend products from clinic detail
const ALL_PRODUCTS_MOCK = [
  {
    id: 'prod-1',
    name: 'AtlasGel',
    share: 68,
    volume: 'R$ 128.400',
    volumeRaw: 128400,
    trend: [32, 28, 34, 30, 38, 36], // Last 6 months (Nov-Apr)
    growth: +12,
    category: 'Ortopedia',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 18.400', growth: null },
      { month: 'Dez/25', volume: 'R$ 20.200', growth: +9.8 },
      { month: 'Jan/26', volume: 'R$ 19.600', growth: -3.0 },
      { month: 'Fev/26', volume: 'R$ 22.100', growth: +12.8 },
      { month: 'Mar/26', volume: 'R$ 23.800', growth: +7.7 },
      { month: 'Abr/26', volume: 'R$ 24.300', growth: +2.1 },
    ],
  },
  {
    id: 'prod-2',
    name: 'CardioFlex',
    share: 22,
    volume: 'R$ 40.600',
    volumeRaw: 40600,
    trend: [18, 16, 14, 12, 10, 8],
    growth: -22,
    category: 'Cardiologia',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 9.200', growth: null },
      { month: 'Dez/25', volume: 'R$ 8.100', growth: -12.0 },
      { month: 'Jan/26', volume: 'R$ 7.400', growth: -8.6 },
      { month: 'Fev/26', volume: 'R$ 6.200', growth: -16.2 },
      { month: 'Mar/26', volume: 'R$ 5.100', growth: -17.7 },
      { month: 'Abr/26', volume: 'R$ 4.600', growth: -9.8 },
    ],
  },
  {
    id: 'prod-3',
    name: 'AtlasVit',
    share: 10,
    volume: 'R$ 15.520',
    volumeRaw: 15520,
    trend: [4, 5, 6, 7, 8, 10],
    growth: +58,
    category: 'Suplementação',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 1.200', growth: null },
      { month: 'Dez/25', volume: 'R$ 1.600', growth: +33.3 },
      { month: 'Jan/26', volume: 'R$ 2.100', growth: +31.3 },
      { month: 'Fev/26', volume: 'R$ 2.800', growth: +33.3 },
      { month: 'Mar/26', volume: 'R$ 3.600', growth: +28.6 },
      { month: 'Abr/26', volume: 'R$ 4.220', growth: +17.2 },
    ],
  },
  // Add 4-7 more products to show full catalog
  {
    id: 'prod-4',
    name: 'OrtoPlus',
    share: 0,
    volume: 'R$ 0',
    volumeRaw: 0,
    trend: [0, 0, 0, 0, 0, 0],
    growth: 0,
    category: 'Ortopedia',
    opportunity: true, // Mark as opportunity (not yet purchased)
    monthlyBreakdown: [],
  },
];
```

#### Functionality
1. **Calculate summary:**
   - Total products: Filter products where volumeRaw > 0
   - Total volume: Sum all volumeRaw
   - Avg growth: Average of all growth percentages
2. **Sort:**
   - Growth: Sort by growth (descending)
   - Volume: Sort by volumeRaw (descending)
   - Share: Sort by share (descending)
   - Name: Sort alphabetically
3. **Expand/collapse:**
   - Click product row to toggle expanded state
   - Show monthly breakdown when expanded
   - Smooth height animation
4. **Opportunities:**
   - Show products with opportunity: true at bottom
   - Different styling (dashed border, amber accent)
   - Label: "Oportunidade" badge

#### Component Structure
```javascript
function ProductsFullListScreen({ clinicId, clinicName, products = ALL_PRODUCTS_MOCK, onBack }) {
  const [sortBy, setSortBy] = React.useState('share'); // share | growth | volume | name
  const [sortSheetOpen, setSortSheetOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(new Set());
  
  // Filter active products vs opportunities
  const activeProducts = products.filter(p => !p.opportunity && p.volumeRaw > 0);
  const opportunities = products.filter(p => p.opportunity || p.volumeRaw === 0);
  
  // Sort active products
  const sorted = [...activeProducts].sort((a, b) => {
    if (sortBy === 'growth') return b.growth - a.growth;
    if (sortBy === 'volume') return b.volumeRaw - a.volumeRaw;
    if (sortBy === 'share') return b.share - a.share;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });
  
  // Calculate summary
  const totalProducts = activeProducts.length;
  const totalVolume = activeProducts.reduce((sum, p) => sum + p.volumeRaw, 0);
  const avgGrowth = Math.round(
    activeProducts.reduce((sum, p) => sum + p.growth, 0) / totalProducts
  );
  
  const toggleExpand = (productId) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpanded(newExpanded);
  };
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 300ms ease',
      zIndex: 100,
    }}>
      <AtlasTopBar page="Explorar" active="explorar"/>
      
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={/* back button style */}>
            {/* Back arrow */}
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Produtos em uso
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', marginTop: 2 }}>
              {clinicName}
            </div>
          </div>
          
          <button onClick={() => setSortSheetOpen(true)} style={/* sort button */}>
            {/* Sort icon */}
          </button>
        </div>
      </div>
      
      {/* Summary card */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0a2f7f' }}>
              {totalProducts}
            </div>
            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
              produtos ativos
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#16a373' }}>
              R$ {(totalVolume / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
              volume 6m
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 18, fontWeight: 700,
              color: avgGrowth >= 0 ? '#16a373' : '#b84545',
            }}>
              {avgGrowth >= 0 ? '+' : ''}{avgGrowth}%
            </div>
            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
              crescimento médio
            </div>
          </div>
        </div>
      </div>
      
      {/* Product list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px 24px',
      }}>
        {/* Active products */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {sorted.map((product, i) => (
            <ProductRow
              key={product.id}
              product={product}
              isExpanded={expanded.has(product.id)}
              onToggle={() => toggleExpand(product.id)}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
        
        {/* Opportunities section */}
        {opportunities.length > 0 && (
          <>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#374151',
              letterSpacing: 0.6, textTransform: 'uppercase',
              padding: '20px 2px 10px',
            }}>
              Oportunidades · {opportunities.length}
            </div>
            <div style={{
              background: '#fff',
              border: '1px dashed rgba(198,134,27,0.4)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              {opportunities.map((product, i) => (
                <OpportunityRow
                  key={product.id}
                  product={product}
                  isLast={i === opportunities.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Sort bottom sheet */}
      {sortSheetOpen && (
        <SortBottomSheet
          currentSort={sortBy}
          onSelect={(sort) => {
            setSortBy(sort);
            setSortSheetOpen(false);
          }}
          onClose={() => setSortSheetOpen(false)}
        />
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// Product row component (collapsible)
function ProductRow({ product, isExpanded, onToggle, isLast }) {
  const max = Math.max(...product.trend);
  const positive = product.growth >= 0;
  
  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid #f1f3f6',
    }}>
      {/* Main row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'Inter, system-ui',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {/* Product icon */}
          <ProductIcon name={product.name} size={36}/>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1729' }}>
                {product.name}
              </span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {product.volume}
              </span>
            </div>
          </div>
          
          {/* Growth badge */}
          <span style={{
            fontSize: 11.5, fontWeight: 700,
            color: positive ? '#117a55' : '#b84545',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            {positive ? '▲' : '▼'} {Math.abs(product.growth)}%
          </span>
          
          {/* Expand arrow */}
          <svg
            width="14" height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="#8a94a6"
            strokeWidth="1.6"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 200ms',
            }}
          >
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </div>
        
        {/* Trend + share */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          {/* Mini trend chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
            {product.trend.map((v, i) => (
              <div key={i} style={{
                width: 5,
                height: `${(v / max) * 100}%`,
                minHeight: 3,
                background: i === product.trend.length - 1 ? '#1e40af' : '#c7d2fe',
                borderRadius: 2,
              }}/>
            ))}
          </div>
          
          {/* Share bar */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: '#6b7280',
              marginBottom: 3,
            }}>
              <span>Share</span>
              <span style={{ fontWeight: 600, color: '#0f1729' }}>
                {product.share}%
              </span>
            </div>
            <div style={{
              height: 5,
              borderRadius: 3,
              background: '#eef0f3',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${product.share}%`,
                height: '100%',
                background: '#1e40af',
                borderRadius: 3,
              }}/>
            </div>
          </div>
        </div>
      </button>
      
      {/* Expanded monthly breakdown */}
      {isExpanded && (
        <div style={{
          padding: '0 16px 16px',
          animation: 'expandDown 200ms ease',
        }}>
          <div style={{
            background: '#f7f8fb',
            borderRadius: 10,
            padding: 12,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#8a94a6',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Detalhamento mensal
            </div>
            
            {product.monthlyBreakdown.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderTop: i === 0 ? 'none' : '1px solid #eef0f3',
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 500 }}>
                  {m.month}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#1f2937', fontWeight: 600 }}>
                    {m.volume}
                  </span>
                  {m.growth !== null && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: m.growth >= 0 ? '#117a55' : '#b84545',
                      minWidth: 42,
                      textAlign: 'right',
                    }}>
                      {m.growth >= 0 ? '+' : ''}{m.growth.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Opportunity row (non-expandable)
function OpportunityRow({ product, isLast }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid rgba(198,134,27,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <ProductIcon name={product.name} size={36}/>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1729' }}>
            {product.name}
          </span>
          <span style={{
            padding: '1px 6px',
            borderRadius: 999,
            background: 'rgba(198,134,27,0.12)',
            color: '#b07a10',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}>
            Oportunidade
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: '#6b7280' }}>
          Não comprado ainda · {product.category}
        </div>
      </div>
      
      <button style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid rgba(198,134,27,0.3)',
        background: 'transparent',
        color: '#c6861b',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        Apresentar
      </button>
    </div>
  );
}

// Product icon (reuse from pedidos)
function ProductIcon({ name, size = 40 }) {
  const palettes = [
    { key: 'Atlas',  hue: 220 },
    { key: 'Cardio', hue: 355 },
    { key: 'Orto',   hue: 145 },
    { key: 'Vital',  hue: 270 },
  ];
  const match = palettes.find(p => name.startsWith(p.key));
  const hue = match ? match.hue : 220;
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size / 4,
      background: `hsl(${hue},52%,93%)`,
      border: `1px solid hsl(${hue},38%,84%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.3,
        fontWeight: 700,
        color: `hsl(${hue},52%,35%)`,
        letterSpacing: -0.5,
      }}>
        {name.slice(0, 2)}
      </span>
    </div>
  );
}

// Sort bottom sheet
function SortBottomSheet({ currentSort, onSelect, onClose }) {
  const options = [
    { key: 'share', label: 'Maior share', sub: 'Participação na clínica' },
    { key: 'growth', label: 'Maior crescimento', sub: 'Expansão nos últimos 6 meses' },
    { key: 'volume', label: 'Maior volume', sub: 'Faturamento em R$' },
    { key: 'name', label: 'Nome A-Z', sub: 'Ordem alfabética' },
  ];
  
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 50,
      }}/>
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        zIndex: 51,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px 28px',
        animation: 'slideUp 250ms ease',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#e5e7eb',
          margin: '0 auto 18px',
        }}/>
        
        <div style={{
          fontSize: 17, fontWeight: 700, color: '#1f2937',
          marginBottom: 12,
        }}>
          Ordenar por
        </div>
        
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: 12,
              background: currentSort === opt.key ? '#eef2ff' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'Inter, system-ui',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Radio circle */}
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              border: `2px solid ${currentSort === opt.key ? '#1e40af' : '#d1d5db'}`,
              background: currentSort === opt.key ? '#1e40af' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {currentSort === opt.key && (
                <div style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: '#fff',
                }}/>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: '#0f1729',
              }}>
                {opt.label}
              </div>
              <div style={{
                fontSize: 12, color: '#6b7280', marginTop: 1,
              }}>
                {opt.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes expandDown {
          from { max-height: 0; opacity: 0; }
          to { max-height: 500px; opacity: 1; }
        }
      `}</style>
    </>
  );
}

Object.assign(window, {
  ProductsFullListScreen,
  ALL_PRODUCTS_MOCK,
});
```

#### Integration Points
- Import in `index.html`
- Modify `ClinicProducts` in `atlas-clinic.jsx`:
  - Add state: `const [productsFullOpen, setProductsFullOpen] = React.useState(false)`
  - Wire up "Ver todos" link
  - Render: `{productsFullOpen && <ProductsFullListScreen ... />}`

#### Testing Checklist
- [ ] Opens from clinic detail
- [ ] Shows all products
- [ ] Summary stats calculate correctly
- [ ] Sort options work
- [ ] Product rows expand/collapse
- [ ] Monthly breakdown displays
- [ ] Opportunities section shows
- [ ] Back button returns to clinic detail
- [ ] Animations work smoothly

---

## TASK-007: Work Hours Editor

**Priority:** High  
**Complexity:** Low  
**Estimated Time:** 2 hours  
**Dependencies:** None  
**File to create:** `/components/work-hours-editor.jsx`

### Context
On the Profile screen, there's a preferences row for "Horário de trabalho" showing "Seg a Sex · 08:00 – 18:00". Tapping the chevron should open an editor where users can set their work schedule. This is used to determine when the app should send notifications and show opportunities.

### User Flow
1. User is on Profile screen
2. User taps "Horário de trabalho" preference row (has chevron)
3. Bottom sheet slides up with time picker
4. User selects work days (checkboxes for each day)
5. User sets start time (hour/minute picker)
6. User sets end time (hour/minute picker)
7. User taps "Salvar"
8. Sheet closes, preference row updates with new schedule

### Requirements

#### Visual Design
- **Layout:** Bottom sheet (60% screen height)
- **Header:**
  - Handle bar
  - Title: "Horário de trabalho"
  - Subtitle: "Define quando você receberá notificações"
  - Close X button
- **Days of week:**
  - 7 pill buttons (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
  - Multiple selection
  - Active: navy background
  - Inactive: gray background
- **Time pickers:**
  - "Início" label + time display (HH:MM format)
  - "Término" label + time display
  - Tap to open time picker wheel
- **Quick presets:**
  - "Comercial (Seg-Sex 08:00-18:00)"
  - "Manhã (Seg-Sex 08:00-12:00)"
  - "Tarde (Seg-Sex 13:00-18:00)"
  - Tap preset to apply settings
- **Actions:**
  - Cancel (secondary)
  - Save (primary, navy)

#### Data Structure
```javascript
const WORK_HOURS_DEFAULT = {
  days: [1, 2, 3, 4, 5], // 0=Sun, 1=Mon, ..., 6=Sat
  startHour: 8,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PRESETS = [
  {
    label: 'Comercial',
    sub: 'Seg-Sex · 08:00-18:00',
    days: [1, 2, 3, 4, 5],
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  },
  {
    label: 'Manhã',
    sub: 'Seg-Sex · 08:00-12:00',
    days: [1, 2, 3, 4, 5],
    startHour: 8,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
  },
  {
    label: 'Tarde',
    sub: 'Seg-Sex · 13:00-18:00',
    days: [1, 2, 3, 4, 5],
    startHour: 13,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  },
];
```

#### Functionality
1. **Day selection:**
   - Click day pill to toggle
   - Can select 0-7 days
   - Visual feedback on selection
2. **Time picker:**
   - Mobile-style wheel picker for hours (00-23) and minutes (00, 15, 30, 45)
   - Or use native `<input type="time">` for simplicity
3. **Validation:**
   - End time must be after start time
   - Show error if invalid: "Horário de término deve ser após o início"
4. **Format output:**
   - Days: "Seg a Sex" (if consecutive), "Seg, Qua, Sex" (if not)
   - Time: "08:00 – 18:00"
5. **Save:**
   - Update profile preferences
   - Log to console (in real app would POST to API)
   - Close sheet

#### Component Structure
```javascript
function WorkHoursEditorSheet({ open, onClose, initialHours = WORK_HOURS_DEFAULT, onSave }) {
  const [days, setDays] = React.useState(initialHours.days);
  const [startHour, setStartHour] = React.useState(initialHours.startHour);
  const [startMinute, setStartMinute] = React.useState(initialHours.startMinute);
  const [endHour, setEndHour] = React.useState(initialHours.endHour);
  const [endMinute, setEndMinute] = React.useState(initialHours.endMinute);
  const [error, setError] = React.useState('');
  
  const toggleDay = (dayIndex) => {
    setDays(prev => 
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };
  
  const applyPreset = (preset) => {
    setDays(preset.days);
    setStartHour(preset.startHour);
    setStartMinute(preset.startMinute);
    setEndHour(preset.endHour);
    setEndMinute(preset.endMinute);
  };
  
  const handleSave = () => {
    // Validate
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      setError('Horário de término deve ser após o início');
      return;
    }
    
    if (days.length === 0) {
      setError('Selecione pelo menos um dia');
      return;
    }
    
    const hours = { days, startHour, startMinute, endHour, endMinute };
    onSave(hours);
    onClose();
  };
  
  return (
    <BottomSheet open={open} onClose={onClose} height="60%">
      <div style={{ padding: '20px' }}>
        {/* Title */}
        <div style={{
          fontSize: 17, fontWeight: 700, color: '#1f2937',
          marginBottom: 4,
        }}>
          Horário de trabalho
        </div>
        <div style={{
          fontSize: 13, color: '#6b7280',
          marginBottom: 20,
        }}>
          Define quando você receberá notificações
        </div>
        
        {/* Days */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#8a94a6',
          letterSpacing: 0.6, textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Dias da semana
        </div>
        <div style={{
          display: 'flex', gap: 6, marginBottom: 24,
        }}>
          {DAY_LABELS.map((label, i) => {
            const isSelected = days.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 8,
                  border: `1px solid ${isSelected ? '#0a2f7f' : '#e5e7eb'}`,
                  background: isSelected ? '#0a2f7f' : '#fff',
                  color: isSelected ? '#fff' : '#6b7280',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        
        {/* Time pickers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#8a94a6',
              letterSpacing: 0.6, textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Início
            </div>
            <input
              type="time"
              value={`${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':');
                setStartHour(parseInt(h));
                setStartMinute(parseInt(m));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                fontFamily: 'Inter, system-ui',
                color: '#1f2937',
              }}
            />
          </div>
          
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#8a94a6',
              letterSpacing: 0.6, textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Término
            </div>
            <input
              type="time"
              value={`${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':');
                setEndHour(parseInt(h));
                setEndMinute(parseInt(m));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                fontFamily: 'Inter, system-ui',
                color: '#1f2937',
              }}
            />
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(184,69,69,0.10)',
            color: '#b84545',
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}
        
        {/* Presets */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#8a94a6',
          letterSpacing: 0.6, textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Atalhos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
                {preset.label}
              </div>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                {preset.sub}
              </div>
            </button>
          ))}
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              height: 48,
              borderRadius: 12,
              border: 'none',
              background: '#0a2f7f',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >
            Salvar horário
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

// Helper to format days for display
function formatDays(dayIndices) {
  if (dayIndices.length === 0) return 'Nenhum dia';
  if (dayIndices.length === 7) return 'Todos os dias';
  
  // Check if consecutive weekdays (1-5)
  const isWeekdays = dayIndices.length === 5 && 
    dayIndices.every(d => d >= 1 && d <= 5);
  if (isWeekdays) return 'Seg a Sex';
  
  // Otherwise, list out
  return dayIndices.map(i => DAY_LABELS[i]).join(', ');
}

// Helper to format time
function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

Object.assign(window, {
  WorkHoursEditorSheet,
  WORK_HOURS_DEFAULT,
  formatDays,
  formatTime,
});
```

#### Integration Points
- Import in `index.html`
- Modify `ProfileScreen` in `atlas-profile.jsx`:
  - Add state: `const [workHoursEditorOpen, setWorkHoursEditorOpen] = React.useState(false)`
  - Add state: `const [workHours, setWorkHours] = React.useState(WORK_HOURS_DEFAULT)`
  - Wire up "Horário de trabalho" preference row to open editor
  - Update display to show formatted hours
  - Handle onSave callback

#### Testing Checklist
- [ ] Opens from profile preferences
- [ ] Days toggle correctly
- [ ] Time pickers work
- [ ] Presets apply correctly
- [ ] Validation shows error
- [ ] Save updates profile display
- [ ] Cancel closes without saving
- [ ] Format displays correctly (Seg-Sex, 08:00-18:00)

---

## TASK-008: Profile Editor

**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** None  
**File to create:** `/components/profile-editor.jsx`

### Context
On the Profile screen header, there's a pencil/edit button (top right). Tapping this should open a full-screen editor where users can update their personal information like name, email, phone, and upload a profile photo.

### User Flow
1. User is on Profile screen
2. User taps pencil icon (top right of header)
3. Full-screen editor slides in from right
4. User can edit name, email, phone
5. User can tap avatar to change photo (mock: shows "Foto atualizada" toast)
6. User taps "Salvar alterações"
7. Confirmation toast appears
8. Editor closes, profile screen updates

### Requirements

#### Visual Design
- **Layout:** Full screen slide-in from right
- **Header:**
  - Back arrow (left)
  - Title: "Editar perfil"
  - Save button (text, top right, navy color)
- **Avatar section (top):**
  - Large avatar (100px circle)
  - Camera badge (bottom right of avatar)
  - "Alterar foto" text below (tappable)
  - Centered layout
- **Form fields:**
  - Label above each input (10px, uppercase, gray)
  - Input boxes (white background, border, 14px font)
  - Fields: Nome completo, E-mail, Telefone
  - Each field in a card
- **Region (read-only):**
  - Display current region
  - Lock icon
  - Help text: "Solicite alteração ao gestor"
- **Delete account (danger zone):**
  - "Excluir minha conta" link (red text, small)
  - Bottom of screen
  - Shows confirmation dialog

#### Data Structure
```javascript
const USER_PROFILE_EDITABLE = {
  name: 'Rafael Melo',
  email: 'rafael.melo@atlasmed.com',
  phone: '+55 11 98412-5520',
  initials: 'RM',
  region: 'São Paulo · Zona Oeste', // Read-only
  role: 'Representante Comercial', // Read-only
  since: 'Desde março de 2024', // Read-only
};
```

#### Functionality
1. **Photo update:**
   - Tap avatar or "Alterar foto"
   - Show action sheet: "Câmera" | "Galeria" | "Cancelar"
   - In mockup: Show toast "Foto atualizada ✓"
   - In real app: Upload to server
2. **Form validation:**
   - Name: Min 3 characters, required
   - Email: Valid email format, required
   - Phone: Valid Brazilian phone format
3. **Save:**
   - Validate all fields
   - Show loading state on button
   - Show success toast: "Perfil atualizado ✓"
   - Update profile display
   - Close editor
4. **Delete account:**
   - Show confirmation dialog
   - "Tem certeza? Esta ação não pode ser desfeita"
   - "Cancelar" | "Excluir conta" (red)
   - In mockup: Just show toast "Ação não disponível no demo"

#### Component Structure
```javascript
function ProfileEditorScreen({ user = USER_PROFILE_EDITABLE, onBack, onSave }) {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [phone, setPhone] = React.useState(user.phone);
  const [saving, setSaving] = React.useState(false);
  const [photoActionOpen, setPhotoActionOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  
  const validate = () => {
    const errs = {};
    
    if (!name || name.trim().length < 3) {
      errs.name = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'E-mail inválido';
    }
    
    if (!phone || phone.length < 10) {
      errs.phone = 'Telefone inválido';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  
  const handleSave = () => {
    if (!validate()) return;
    
    setSaving(true);
    const updated = { ...user, name, email, phone };
    
    setTimeout(() => {
      console.log('Profile updated:', updated);
      onSave(updated);
      setSaving(false);
      // Show success toast
      onBack();
    }, 1000);
  };
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 300ms ease',
      zIndex: 100,
    }}>
      <AtlasTopBar page="Perfil" active="perfil"/>
      
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1px solid #eef0f3',
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" strokeWidth="1.8">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        
        <div style={{
          fontSize: 15, fontWeight: 600, color: '#1f2937',
        }}>
          Editar perfil
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: saving ? '#f3f4f6' : 'transparent',
            color: saving ? '#9ca3af' : '#0a2f7f',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, system-ui',
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
      
      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 16px',
      }}>
        {/* Avatar section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <button
            onClick={() => setPhotoActionOpen(true)}
            style={{
              width: 100, height: 100, borderRadius: 50,
              background: 'linear-gradient(135deg, #0a2f7f 0%, #1e40af 45%, #16a373 115%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 36,
              fontWeight: 700,
              position: 'relative',
              cursor: 'pointer',
              border: '3px solid #fff',
              boxShadow: '0 6px 20px rgba(10,47,127,0.22)',
            }}
          >
            {user.initials}
            
            {/* Camera badge */}
            <div style={{
              position: 'absolute',
              bottom: 2, right: 2,
              width: 30, height: 30,
              borderRadius: 15,
              background: '#0a2f7f',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M1.5 4h2l1-1.3h5l1 1.3h2a1 1 0 011 1v6a1 1 0 01-1 1H1.5a1 1 0 01-1-1V5a1 1 0 011-1z"/>
                <circle cx="7" cy="8" r="2"/>
              </svg>
            </div>
          </button>
          
          <div style={{
            fontSize: 13,
            color: '#0a2f7f',
            fontWeight: 600,
            marginTop: 12,
            cursor: 'pointer',
          }}
          onClick={() => setPhotoActionOpen(true)}>
            Alterar foto
          </div>
        </div>
        
        {/* Form fields */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
        }}>
          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              color: '#8a94a6',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.name ? '#b84545' : '#e5e7eb'}`,
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'Inter, system-ui',
                color: '#1f2937',
                outline: 'none',
              }}
            />
            {errors.name && (
              <div style={{ fontSize: 11, color: '#b84545', marginTop: 4 }}>
                {errors.name}
              </div>
            )}
          </div>
          
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              color: '#8a94a6',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.email ? '#b84545' : '#e5e7eb'}`,
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'Inter, system-ui',
                color: '#1f2937',
                outline: 'none',
              }}
            />
            {errors.email && (
              <div style={{ fontSize: 11, color: '#b84545', marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>
          
          {/* Phone */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              color: '#8a94a6',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.phone ? '#b84545' : '#e5e7eb'}`,
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'Inter, system-ui',
                fontVariantNumeric: 'tabular-nums',
                color: '#1f2937',
                outline: 'none',
              }}
            />
            {errors.phone && (
              <div style={{ fontSize: 11, color: '#b84545', marginTop: 4 }}>
                {errors.phone}
              </div>
            )}
          </div>
        </div>
        
        {/* Region (read-only) */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#f7f8fb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6b7280" strokeWidth="1.6">
                <rect x="4" y="3" width="8" height="10" rx="1"/>
                <path d="M6 3V2a1 1 0 011-1h2a1 1 0 011 1v1"/>
              </svg>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#8a94a6',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                Território
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {user.region}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                Solicite alteração ao gestor
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete account */}
        <button
          onClick={() => setDeleteConfirmOpen(true)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: '1px solid rgba(184,69,69,0.22)',
            background: '#fff',
            color: '#b84545',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
          }}
        >
          Excluir minha conta
        </button>
      </div>
      
      {/* Photo action sheet */}
      {photoActionOpen && (
        <ActionSheet
          options={[
            { label: 'Câmera', icon: '📷', action: () => console.log('Camera') },
            { label: 'Galeria', icon: '🖼', action: () => console.log('Gallery') },
            { label: 'Cancelar', cancel: true },
          ]}
          onClose={() => setPhotoActionOpen(false)}
        />
      )}
      
      {/* Delete confirmation */}
      {deleteConfirmOpen && (
        <ConfirmDialog
          title="Excluir conta?"
          message="Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos."
          confirmLabel="Excluir conta"
          confirmDanger
          onConfirm={() => {
            console.log('Delete account');
            setDeleteConfirmOpen(false);
          }}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// Confirm dialog component
function ConfirmDialog({ title, message, confirmLabel, confirmDanger = false, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200,
      }}/>
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        background: '#fff',
        borderRadius: 16,
        padding: '24px',
        width: '80%',
        maxWidth: 320,
        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontSize: 18, fontWeight: 700, color: '#1f2937',
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 14, color: '#6b7280', lineHeight: 1.5,
          marginBottom: 24,
        }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: 'none',
              background: confirmDanger ? '#b84545' : '#0a2f7f',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  ProfileEditorScreen,
  USER_PROFILE_EDITABLE,
  ConfirmDialog,
});
```

#### Integration Points
- Import in `index.html`
- Modify `ProfileScreen` in `atlas-profile.jsx`:
  - Add state: `const [editorOpen, setEditorOpen] = React.useState(false)`
  - Wire up pencil button to open editor
  - Handle onSave callback to update user data
  - Render: `{editorOpen && <ProfileEditorScreen ... />}`

#### Testing Checklist
- [ ] Opens from profile edit button
- [ ] Avatar displays correctly
- [ ] Photo action sheet shows
- [ ] Form fields are editable
- [ ] Validation works
- [ ] Error messages display
- [ ] Region is read-only
- [ ] Save button shows loading
- [ ] Success updates profile
- [ ] Delete confirmation shows
- [ ] Back button closes without saving

---

*Continue to [Phase 3 specs document for TASK-009 through TASK-018]*

