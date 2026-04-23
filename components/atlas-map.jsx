// MapScreen — the rep's map view of clinics in the territory.
// Built strictly with Atlasmed palette (navy #0a2f7f / #1e40af, green #16a373,
// warn #c6861b, Inter, white cards with soft shadow).
//
// All map imagery is drawn from scratch (SVG blocks + roads + parks) — not a
// real map tile provider. Pin coordinates are in the SVG's local coord space.

// ─────────────────────────────────────────────────────────────
// Data — clinics pinned to the territory
// ─────────────────────────────────────────────────────────────
const MAP_CLINICS = [
  { id: 'c1', name: 'Clínica Ortopédica São Lucas', x: 195, y: 260, kind: 'highPotential', distance: 1.2, status: 'Alto potencial', subtitle: 'Clínica · Ortopedia',
    lastVisit: '12/05/2024 (há 12 dias)', pipelineStatus: 'Prospect',
    noteAuthor: 'Dra. Ana', note: 'comentou que têm muitos casos de pós operatório de joelho. 12/03/2024',
    specialties: 'Clínica · Ortopedia' },
  { id: 'c2', name: 'Centro Ortopédico Paulista', x: 260, y: 360, kind: 'cold', distance: 0.6, status: 'Não visitado há 8 dias' },
  { id: 'c3', name: 'Clínica Ortopédica Moema', x: 160, y: 410, kind: 'warm', distance: 0.9, status: 'Visitado há 30 dias' },
  { id: 'c4', name: 'Orto Prime', x: 110, y: 300, kind: 'warm', distance: 1.3, status: 'Visitado há 15 dias' },
  { id: 'c5', name: 'Clínica do Esporte', x: 340, y: 420, kind: 'cold', distance: 1.6, status: 'Visitado há 60 dias' },
  { id: 'c6', name: 'Instituto Ortopédico Avançado', x: 380, y: 200, kind: 'cold', distance: 2.1, status: 'Não visitado há 45 dias' },
];

const PIN_COLOR = {
  highPotential: '#c6861b', // amber — opportunity
  warm: '#1e40af',          // navy — recently visited
  cold: '#b84545',          // red — overdue
};

// ─────────────────────────────────────────────────────────────
// MapCanvas — the drawn-from-scratch "map"
// props:
//   pins: [{id,x,y,kind,selected,label}]
//   route: [{x,y,label}]  — if set, draws dashed route through points
//   pulseId: id of pin to pulse (for dynamic suggestion)
//   userDot: {x,y} — blue dot for "you are here"
//   height
// ─────────────────────────────────────────────────────────────
function MapCanvas({ pins = [], route = null, pulseId = null, userDot = null, height = 480, labels = true, onPinClick }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#eef1ec', // warm off-white "paper" tone
      overflow: 'hidden',
    }}>
      <svg viewBox={`0 0 430 ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}>
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(10,47,127,0.04)" strokeWidth="1"/>
          </pattern>
          <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0a2f7f" floodOpacity="0.25"/>
          </filter>
          <radialGradient id="parkGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#cfe3c9"/>
            <stop offset="100%" stopColor="#b7d3ae"/>
          </radialGradient>
        </defs>

        {/* paper */}
        <rect width="430" height={height} fill="#eef1ec"/>
        <rect width="430" height={height} fill="url(#mapGrid)"/>

        {/* large park blob, top-left */}
        <path d="M -20 40 C 40 20, 120 30, 150 90 C 175 140, 110 180, 50 170 C -10 160, -30 100, -20 40 Z"
          fill="url(#parkGrad)"/>

        {/* secondary park, bottom-right */}
        <path d="M 320 460 C 360 440, 430 450, 450 500 L 450 560 L 310 560 C 290 520, 300 480, 320 460 Z"
          fill="url(#parkGrad)"/>

        {/* building blocks — soft beige rectangles */}
        {BUILDING_BLOCKS.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="4"
            fill={b.tint || '#e1ded6'} opacity="0.9"/>
        ))}

        {/* roads — primary */}
        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          {/* Av. diagonal */}
          <path d="M -10 180 L 460 340" strokeWidth="22"/>
          <path d="M -10 180 L 460 340" strokeWidth="18" stroke="#f7f6f2"/>
          {/* horizontal main */}
          <path d="M -10 380 L 460 390" strokeWidth="18"/>
          <path d="M -10 380 L 460 390" strokeWidth="14" stroke="#f7f6f2"/>
          {/* vertical main */}
          <path d="M 240 -10 L 260 500" strokeWidth="16"/>
          <path d="M 240 -10 L 260 500" strokeWidth="12" stroke="#f7f6f2"/>
        </g>

        {/* secondary roads — thinner */}
        <g stroke="#f7f6f2" strokeWidth="8" strokeLinecap="round" fill="none">
          <path d="M -10 270 L 460 270"/>
          <path d="M 100 -10 L 110 500"/>
          <path d="M 380 -10 L 390 500"/>
          <path d="M -10 440 L 460 440"/>
        </g>

        {/* neighborhood labels */}
        {labels && (
          <g fontFamily="Inter, system-ui" fontWeight="600" fontSize="10" fill="#8a94a6" letterSpacing="1.2">
            <text x="40" y="90" opacity="0.75">JARDINS</text>
            <text x="30" y="340" opacity="0.75">VILA NOVA</text>
            <text x="30" y="354" opacity="0.75">CONCEIÇÃO</text>
            <text x="320" y="480" opacity="0.75">MOEMA</text>
          </g>
        )}

        {/* route */}
        {route && <MapRoute route={route}/>}

        {/* user blue dot */}
        {userDot && (
          <g>
            <circle cx={userDot.x} cy={userDot.y} r="18" fill="rgba(30,64,175,0.18)">
              <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx={userDot.x} cy={userDot.y} r="8" fill="#1e40af" stroke="#fff" strokeWidth="3"/>
          </g>
        )}

        {/* pins */}
        {pins.map(p => (
          <MapPin key={p.id} pin={p} pulse={p.id === pulseId} onPinClick={onPinClick}/>
        ))}
      </svg>
    </div>
  );
}

// Small city-block rectangles to give the map texture
const BUILDING_BLOCKS = [
  { x: 30, y: 200, w: 50, h: 40 },
  { x: 30, y: 260, w: 50, h: 50, tint: '#dcd8cd' },
  { x: 120, y: 210, w: 80, h: 40 },
  { x: 120, y: 290, w: 80, h: 70 },
  { x: 180, y: 120, w: 40, h: 40, tint: '#dcd8cd' },
  { x: 180, y: 220, w: 50, h: 30 },
  { x: 270, y: 60, w: 70, h: 40 },
  { x: 270, y: 120, w: 60, h: 50, tint: '#dcd8cd' },
  { x: 270, y: 200, w: 50, h: 40 },
  { x: 340, y: 120, w: 70, h: 50 },
  { x: 350, y: 220, w: 60, h: 30, tint: '#dcd8cd' },
  { x: 270, y: 420, w: 70, h: 30 },
  { x: 130, y: 450, w: 90, h: 30, tint: '#dcd8cd' },
  { x: 30, y: 450, w: 60, h: 30 },
  { x: 360, y: 320, w: 55, h: 40 },
];

function MapPin({ pin, pulse, onPinClick }) {
  const color = pin.selected ? '#0a2f7f' : PIN_COLOR[pin.kind] || '#1e40af';
  return (
    <g
      transform={`translate(${pin.x}, ${pin.y})`}
      onClick={() => onPinClick && onPinClick(pin)}
      style={{ cursor: onPinClick ? 'pointer' : 'default' }}
    >
      {pulse && (
        <>
          <circle r="18" fill={color} opacity="0.25">
            <animate attributeName="r" values="12;30;12" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </>
      )}
      {pin.routeLabel && (
        // route stop marker — circular badge
        <>
          <circle r="13" fill="#fff" stroke={color} strokeWidth="2.5"
            filter="url(#pinShadow)"/>
          <text textAnchor="middle" y="4" fontFamily="Inter, system-ui" fontWeight="700"
            fontSize="11" fill={color}>{pin.routeLabel}</text>
        </>
      )}
      {!pin.routeLabel && (
        <>
          {/* teardrop */}
          <path d="M 0 -22 C -10 -22, -14 -14, -14 -6 C -14 4, -8 10, 0 22 C 8 10, 14 4, 14 -6 C 14 -14, 10 -22, 0 -22 Z"
            fill={color} filter="url(#pinShadow)"/>
          <circle cx="0" cy="-6" r="5" fill="#fff"/>
          {pin.selected && (
            <circle r="26" fill="none" stroke={color} strokeWidth="2.5" opacity="0.5"/>
          )}
        </>
      )}
    </g>
  );
}

// Dashed route polyline through points
function MapRoute({ route }) {
  if (route.length < 2) return null;
  const d = route.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = route[i - 1];
    const mx = (prev.x + p.x) / 2;
    const my = (prev.y + p.y) / 2 - 18;
    return `Q ${mx} ${my}, ${p.x} ${p.y}`;
  }).join(' ');
  return (
    <g>
      <path d={d} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round"/>
      <path d={d} fill="none" stroke="#1e40af" strokeWidth="4" strokeLinecap="round"
        strokeDasharray="0 10" style={{ strokeDashoffset: 0 }}/>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Top search bar — reusable across map screens
// ─────────────────────────────────────────────────────────────
function MapTopBar({ hasFilter = true, placeholder = 'Buscar clínicas, farmácias...' }) {
  return (
    <div style={{
      position: 'absolute', top: 52, left: 12, right: 12, zIndex: 5,
      display: 'flex', gap: 8, fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        flex: 1, height: 44, borderRadius: 14,
        background: '#fff',
        border: '1px solid #edeff3',
        boxShadow: '0 6px 16px rgba(15,23,41,0.08)',
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
      }}>
        <button style={{
          width: 22, height: 22, background: 'transparent', border: 'none',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
          cursor: 'pointer', padding: 0,
        }}>
          <span style={{ height: 2, background: '#0f1729', borderRadius: 1 }}/>
          <span style={{ height: 2, background: '#0f1729', borderRadius: 1 }}/>
          <span style={{ height: 2, background: '#0f1729', borderRadius: 1 }}/>
        </button>
        <span style={{
          fontSize: 13.5, color: '#8a94a6', fontWeight: 500, flex: 1,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>{placeholder}</span>
      </div>
      {hasFilter && (
        <button style={{
          width: 44, height: 44, borderRadius: 14,
          background: '#fff', border: '1px solid #edeff3',
          boxShadow: '0 6px 16px rgba(15,23,41,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0f1729" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h14M4 9h10M7 14h4"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Floating locate-me FAB (top-right, under search)
// ─────────────────────────────────────────────────────────────
function LocateFAB({ top = 110, right = 12 }) {
  return (
    <button style={{
      position: 'absolute', top, right, zIndex: 5,
      width: 44, height: 44, borderRadius: 14,
      background: '#fff', border: '1px solid #edeff3',
      boxShadow: '0 6px 16px rgba(15,23,41,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1e40af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3"/>
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3"/>
      </svg>
    </button>
  );
}

// Primary floating green FAB (bottom-right, Atlas brand-consistent)
function GreenFAB({ icon, bottom = 24, right = 16, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom, right, zIndex: 6,
      width: 56, height: 56, borderRadius: 18,
      background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
      border: 'none', cursor: 'pointer',
      boxShadow: '0 10px 26px rgba(22,163,115,0.45), 0 2px 6px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
    }}>{icon}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom navigation (shared)
// ─────────────────────────────────────────────────────────────
function MapBottomNav({ active = 'map' }) {
  const items = [
    { k: 'map', icon: MiIcons.map },
    { k: 'route', icon: MiIcons.route },
    { k: 'agenda', icon: MiIcons.agenda },
    { k: 'more', icon: MiIcons.chev },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
      height: 64, background: '#ffffff',
      borderTop: '1px solid #eef0f3',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      fontFamily: 'Inter, system-ui',
    }}>
      {items.map(i => (
        <button key={i.k} style={{
          width: 48, height: 40, border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: i.k === active ? '#1e40af' : '#8a94a6',
        }}>{i.icon}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FloatingMenu — the sole navigation surface for the map.
// Replaces the bottom tab bar: a single green FAB at bottom-right
// that expands upward into pill-shaped shortcuts (Sugestões, Rota
// do dia, Follow-ups, Desempenho, Favoritos). When open, the FAB
// flips to an X and the background dims softly.
//
// Props:
//   initialOpen — start in the open state (used on the dedicated
//                 "Menu flutuante" artboard).
// ─────────────────────────────────────────────────────────────
function FloatingMenu({ initialOpen = false }) {
  const [open, setOpen] = React.useState(initialOpen);
  const items = [
    { k: 'map',    label: 'Mapa',         color: '#1e40af', bg: 'rgba(30,64,175,0.10)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l4-1.5 4 1.5 4-1.5V12l-4 1.5-4-1.5-4 1.5V4z"/><path d="M6 2.5v11M10 4v11"/></svg> },
    { k: 'sug',    label: 'Sugestões',    color: '#c6861b', bg: 'rgba(198,134,27,0.14)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.5 3.5l.8.8M11.7 11.7l.8.8M3.5 12.5l.8-.8M11.7 4.3l.8-.8"/><circle cx="8" cy="8" r="3.5"/></svg> },
    { k: 'rota',   label: 'Rota do dia',  color: '#1e40af', bg: 'rgba(30,64,175,0.10)', icon: MiIcons.route },
    { k: 'follow', label: 'Follow-ups',   color: '#117a55', bg: 'rgba(22,163,115,0.12)', icon: MiIcons.agenda },
    { k: 'perf',   label: 'Desempenho',   color: '#1e40af', bg: 'rgba(30,64,175,0.10)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12V4M6 12V7M10 12V5M14 12V8M1 14h14"/></svg> },
    { k: 'fav',    label: 'Favoritos',    color: '#c6861b', bg: 'rgba(198,134,27,0.14)',
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l1.9 4.2 4.6.4-3.5 3 1.1 4.5L8 11.3 3.9 13.6 5 9.1 1.5 6.1l4.6-.4L8 1.5z"/></svg> },
  ];
  return (
    <>
      {/* soft scrim when open — doesn't block map interactions entirely,
          but signals focus on the menu */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Expanded menu items */}
      {open && (
        <div style={{
          position: 'absolute', right: 16, bottom: 96, zIndex: 6,
          display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
          fontFamily: 'Inter, system-ui',
        }}>
          {items.map(it => (
            <button key={it.k} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 999,
              background: '#fff', border: '1px solid #edeff3',
              boxShadow: '0 8px 20px rgba(15,23,41,0.10)',
              cursor: 'pointer',
              color: '#0f1729', fontSize: 13, fontWeight: 600,
            }}>
              {it.label}
              <span style={{
                width: 28, height: 28, borderRadius: 14, background: it.bg, color: it.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Primary FAB — hamburger when closed, X when open */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'absolute', bottom: 24, right: 16, zIndex: 7,
          width: 56, height: 56, borderRadius: 18,
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 26px rgba(22,163,115,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          transition: 'transform 180ms ease',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l10 10M16 6L6 16"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h14M4 11h14M4 16h8"/></svg>
        )}
      </button>
    </>
  );
}

const MiIcons = {
  map: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5l5-2 6 2 5-2v14l-5 2-6-2-5 2V5z"/><path d="M8 3v16M14 5v16"/></svg>,
  route: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="17" cy="16" r="2"/><path d="M7 6h6a4 4 0 010 8H9a4 4 0 000 8"/></svg>,
  agenda: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="16" height="14" rx="2"/><path d="M3 9h16M7 3v4M15 3v4"/></svg>,
  chev: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6 6-6"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// StatusLine — reusable "Alto potencial · Visitado há X dias"
// ─────────────────────────────────────────────────────────────
function PotentialTag({ label = 'Alto potencial' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: 'rgba(198,134,27,0.14)', color: '#a76d14',
      fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: '#c6861b' }}/>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini clinic list row (used inside bottom sheet + suggestion card)
// ─────────────────────────────────────────────────────────────
function ClinicMiniRow({ clinic, showChevron = true, showKind = true }) {
  const dotColor = PIN_COLOR[clinic.kind] || '#1e40af';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0',
      fontFamily: 'Inter, system-ui',
    }}>
      {showKind && (
        <div style={{
          width: 22, flexShrink: 0, display: 'flex', justifyContent: 'center',
        }}>
          <svg width="14" height="18" viewBox="0 0 14 18">
            <path d="M 7 1 C 2.5 1, 0.5 4.5, 0.5 7.5 C 0.5 11, 3 14, 7 17 C 11 14, 13.5 11, 13.5 7.5 C 13.5 4.5, 11.5 1, 7 1 Z"
              fill={dotColor}/>
            <circle cx="7" cy="6.5" r="2" fill="#fff"/>
          </svg>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{clinic.name}</div>
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>{clinic.status}</div>
      </div>
      <span style={{
        fontSize: 12, color: '#6b7280', fontWeight: 500, flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>{clinic.distance} km</span>
      {showChevron && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3l4 4-4 4"/>
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) MAPA — visão inicial
// ─────────────────────────────────────────────────────────────
function MapScreen1_Initial() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={MAP_CLINICS.map(c => ({ ...c }))} height={844}/>
      <MapTopBar/>
      <LocateFAB/>

      {/* Suggestion card at bottom */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 84, zIndex: 5,
        background: '#fff', borderRadius: 16,
        border: '1px solid #edeff3',
        boxShadow: '0 12px 28px rgba(15,23,41,0.12)',
        padding: '14px 14px 16px',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: '#8a94a6',
          }}>Sugestões para você</div>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#1e40af', fontSize: 12, fontWeight: 600, padding: 0,
          }}>Ver todas</button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(198,134,27,0.14)', color: '#c6861b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1.5l2 5 5.3.5-4 3.6 1.2 5.2L9 13l-4.5 2.8 1.2-5.2-4-3.6 5.3-.5L9 1.5z"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, marginBottom: 2 }}>
              Clínica Ortopédica São Lucas
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.45 }}>
              Não visitado há 12 dias · Alto potencial<br/>
              1,2 km de você
            </div>
          </div>
        </div>
      </div>

      <FloatingMenu/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) Clínica selecionada — bottom sheet with full detail
// ─────────────────────────────────────────────────────────────
function MapScreen2_ClinicSelected() {
  const selectedId = 'c1';
  const pins = MAP_CLINICS.map(c => ({ ...c, selected: c.id === selectedId }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={pins} height={844}/>
      <MapTopBar/>

      {/* Bottom sheet — richer, scrollable, decision-oriented.
          Sections are ordered to help the rep decide whether to visit:
            1. identity + potential tag
            2. Decisão rápida — at-a-glance cadence / pipeline / opportunity
            3. Saúde comercial — LTV, avg ticket, frequency, credit
            4. Sinais recentes — the "why now" triggers
            5. Produtos em uso — what's actually being sold there
            6. Quick actions (rota / registrar / ligar / whatsapp)
            7. Clínicas próximas — batch-visit helper
            8. Ver perfil completo → full clinic page */}
      <ClinicBottomSheet/>
      <FloatingMenu/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ClinicBottomSheet — rich decision drawer for a tapped pin.
//
// Layout (top → bottom):
//   · Title + full address + potential tag
//   · Quick actions (Iniciar rota · Registrar visita · Ligar · WhatsApp)
//   · "Clínicas próximas" button — toggles into a nearby-list view
//   · Insights — compact facts (Última visita · Pipeline · Oportunidade)
//   · Saúde comercial — Potencial + Ticket médio
//   · "Ver perfil completo" link row
//
// Tapping "Clínicas próximas" swaps the body to a nearby clinic list
// with a back button returning to the detail.
// ─────────────────────────────────────────────────────────────
function ClinicBottomSheet({ mode = 'drawer', initialView = 'detail' }) {
  // mode:
  //   'drawer' — floating bottom sheet over the map (620px, scrolls inside)
  //   'full'   — standalone card rendered at its natural height, for a
  //              dedicated artboard that shows every section at once.
  const [view, setView] = React.useState(initialView); // 'detail' | 'nearby'
  const isFull = mode === 'full';
  const shellStyle = isFull
    ? {
        position: 'relative',
        background: '#fff',
        borderRadius: 22,
        boxShadow: '0 20px 50px rgba(15,23,41,0.12), 0 2px 8px rgba(15,23,41,0.05)',
        fontFamily: 'Inter, system-ui',
        display: 'flex', flexDirection: 'column',
        margin: '16px 14px',
      }
    : {
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -10px 30px rgba(15,23,41,0.12)',
        fontFamily: 'Inter, system-ui',
        height: 620,
        display: 'flex', flexDirection: 'column',
      };
  const bodyStyle = isFull
    ? { padding: '0 18px 18px' }
    : { flex: 1, overflowY: 'auto', padding: '0 18px 8px', WebkitOverflowScrolling: 'touch' };

  const quickActions = [
    { k: 'route', label: 'Iniciar rota', bg: 'rgba(30,64,175,0.10)', color: '#1e40af', icon: MiIcons.route },
    { k: 'visit', label: 'Registrar visita', bg: 'rgba(22,163,115,0.12)', color: '#117a55', icon:
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10l3 3 7-7"/></svg> },
    { k: 'call', label: 'Ligar', bg: 'rgba(30,64,175,0.10)', color: '#1e40af', icon:
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14v2.5A1.5 1.5 0 0115.4 18c-2.6-.2-5-1.1-7.1-2.7a14.5 14.5 0 01-4.5-4.5A14.5 14.5 0 011.1 3.6 1.5 1.5 0 012.5 2H5l1.6 3.7L5 6.9a10 10 0 004.5 4.5l1.2-1.6L15 11.4 17 14z"/></svg> },
    { k: 'wa', label: 'WhatsApp', bg: 'rgba(22,163,115,0.12)', color: '#117a55', icon:
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10a7 7 0 01-10.3 6.1L2 18l1.9-4.7A7 7 0 1117 10z"/><path d="M7 8.5c.5 2 2 3.5 4 4 .4 0 .8-.2 1-.5l.4-.5c.2-.2.5-.3.8-.2l1 .4c.3.1.4.5.3.8-.4.9-1.3 1.4-2.3 1.3a6.5 6.5 0 01-5-5c-.1-1 .4-1.9 1.3-2.3.3-.1.6 0 .8.3l.4 1c.1.3 0 .6-.2.8l-.5.4c-.3.3-.4.6-.3 1z"/></svg> },
  ];

  return (
    <div style={shellStyle}>
      {/* handle — only in drawer mode */}
      {!isFull && (
        <div style={{
          width: 42, height: 4, borderRadius: 2, background: '#d1d5db',
          margin: '8px auto 10px', flexShrink: 0,
        }}/>
      )}
      {isFull && <div style={{ height: 18 }}/>}

      <div style={bodyStyle}>
        {view === 'nearby' ? (
          <>
            {/* Nearby view — swapped in when user taps the "Clínicas próximas" button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => setView('detail')}
                style={{
                  width: 36, height: 36, borderRadius: 12, border: '1px solid #edeff3',
                  background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0f1729',
                }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5"/></svg>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
                  Clínicas próximas
                </div>
                <div style={{ fontSize: 11.5, color: '#6b7280' }}>próximas à Clínica Ortopédica São Lucas</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#8a94a6' }}>Raio</span>
              <span style={{ fontSize: 11.5, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>1,5 km</span>
            </div>
            <DistanceSlider value={1.5}/>
            <div style={{ marginTop: 10 }}>
              {MAP_CLINICS.slice(1).map(c => (
                <div key={c.id} style={{ borderBottom: '1px solid #eef0f3' }}>
                  <ClinicMiniRow clinic={c}/>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Title row — full address sits under the name so the rep knows
                where they are before deciding anything else. */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, marginBottom: 4 }}>
                  Clínica Ortopédica São Lucas
                </div>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  fontSize: 12, color: '#4b5563', marginBottom: 8, lineHeight: 1.4,
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M6 11s4-3.4 4-6.8a4 4 0 00-8 0C2 7.6 6 11 6 11z"/>
                    <circle cx="6" cy="4.3" r="1.3"/>
                  </svg>
                  <span style={{ flex: 1, minWidth: 0 }}>Av. Nove de Julho, 3.452 — Jardim Paulista, São Paulo · SP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <PotentialTag/>
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>Ortopedia</span>
                  <span style={{ opacity: 0.4, color: '#8a94a6' }}>·</span>
                  <span style={{ fontSize: 11.5, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>1,2 km · 8 min</span>
                </div>
              </div>
              <button style={{
                width: 36, height: 36, borderRadius: 12, border: '1px solid #edeff3',
                background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="#c6861b">
                  <path d="M10 2l2.4 5.8 6.1.5-4.6 4.1 1.4 6L10 15.3 4.7 18.4l1.4-6L1.5 8.3l6.1-.5L10 2z"/>
                </svg>
              </button>
            </div>

            {/* Quick actions — now at the top so the rep can act on the clinic
                before scanning the rest of the data. */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
              padding: '12px 10px', borderRadius: 14,
              background: '#f7f9fc', border: '1px solid #eef0f3',
              marginBottom: 12,
            }}>
              {quickActions.map(a => (
                <button key={a.k} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 0',
                }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 12, background: a.bg, color: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{a.icon}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#0f1729' }}>{a.label}</span>
                </button>
              ))}
            </div>

            {/* Clínicas próximas — button that opens the nearby drawer.
                Kept prominent right after the quick actions because it is
                often used as a batch-visit helper. */}
            <button
              onClick={() => setView('nearby')}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 14,
                background: '#fff', border: '1px solid #edeff3',
                cursor: 'pointer', fontFamily: 'Inter, system-ui',
                boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
                marginBottom: 6, textAlign: 'left',
              }}>
              <span style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'rgba(30,64,175,0.10)', color: '#1e40af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="9" r="7.5"/><circle cx="9" cy="9" r="3"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2"/>
                </svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1 }}>
                  Clínicas próximas
                </div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>
                  {MAP_CLINICS.length - 1} clínicas no raio de 1,5 km
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3l4 4-4 4"/>
              </svg>
            </button>

            {/* Insights — compact facts (renamed from "Decisão rápida"). */}
            <SheetSection title="Insights">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <DecisionChip
                  label="Última visita"
                  value="há 12 dias"
                  sub="12/05 · Dra. Ana"
                  tone="neutral"
                />
                <DecisionChip
                  label="Pipeline"
                  value="Prospect"
                  sub="3ª tentativa"
                  tone="warn"
                />
                <DecisionChip
                  label="Oportunidade"
                  value="Alta"
                  sub="nova médica · ortopedia"
                  tone="opp"
                />
              </div>
            </SheetSection>

            {/* Saúde comercial — Potencial + Ticket médio (Pagamento removed). */}
            <SheetSection title="Saúde comercial">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <HealthStat label="Potencial" value="R$ 42k" sub="/mês estimado"/>
                <HealthStat label="Ticket médio" value="—" sub="sem histórico"/>
              </div>
              <div style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 10,
                background: '#f7f9fc', border: '1px solid #eef0f3',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11.5, color: '#4b5563',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#c6861b', flexShrink: 0 }}/>
                Prospect — sem pedidos ainda. Potencial baseado em volume de pacientes declarado.
              </div>
            </SheetSection>

            {/* View more — link to full clinic detail screen */}
            <a href="Atlasmed Login Flow.html#clinic-detail" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              margin: '14px 0 10px', padding: '14px 16px',
              borderRadius: 14,
              background: 'linear-gradient(180deg, #f7f9fc, #eef2f7)',
              border: '1px solid #e5e9ef',
              textDecoration: 'none',
              cursor: 'pointer',
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
                  Ver perfil completo
                </div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                  Fotos, médicos, histórico, saúde, produtos, fontes pagadoras
                </div>
              </div>
              <span style={{
                width: 32, height: 32, borderRadius: 10,
                background: '#fff', border: '1px solid #e5e9ef',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1e40af', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ── Subcomponents for the decision drawer ──────────────────────

function SheetSection({ title, right, children }) {
  return (
    <div style={{ paddingTop: 14, paddingBottom: 4, borderTop: '1px solid #eef0f3' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: '#8a94a6',
        }}>{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

const DECISION_TONE = {
  good:    { bar: '#16a373', valueColor: '#0f1729', hint: 'rgba(22,163,115,0.10)' },
  warn:    { bar: '#c6861b', valueColor: '#0f1729', hint: 'rgba(198,134,27,0.12)' },
  opp:     { bar: '#1e40af', valueColor: '#0f1729', hint: 'rgba(30,64,175,0.10)' },
  neutral: { bar: '#c9cfd9', valueColor: '#0f1729', hint: '#f7f9fc' },
};
function DecisionChip({ label, value, sub, tone = 'neutral' }) {
  const t = DECISION_TONE[tone];
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12,
      background: '#fff', border: '1px solid #eef0f3',
      position: 'relative', overflow: 'hidden',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: 2, background: t.bar,
      }}/>
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontSize: 10.5, color: '#8a94a6', fontWeight: 600, letterSpacing: 0.2, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: t.valueColor, letterSpacing: -0.2,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && (
          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function HealthStat({ label, value, sub }) {
  return (
    <div style={{
      padding: '10px 10px', borderRadius: 12,
      background: '#f7f9fc', border: '1px solid #eef0f3',
    }}>
      <div style={{ fontSize: 10, color: '#8a94a6', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

const SIGNAL_TONE = {
  good: { dot: '#16a373', bg: 'rgba(22,163,115,0.12)' },
  warn: { dot: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
  info: { dot: '#1e40af', bg: 'rgba(30,64,175,0.10)' },
};
function SignalRow({ tone = 'info', title, body, isLast }) {
  const t = SIGNAL_TONE[tone];
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '8px 0',
      borderBottom: isLast ? 'none' : '1px solid #f2f4f7',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 11, background: t.bg, color: t.dot,
        flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: t.dot }}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2, lineHeight: 1.45 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

const PITCH_TONE = {
  good:    { color: '#117a55', bg: 'rgba(22,163,115,0.12)' },
  warn:    { color: '#a76d14', bg: 'rgba(198,134,27,0.14)' },
  opp:     { color: '#1e40af', bg: 'rgba(30,64,175,0.10)' },
  neutral: { color: '#4b5563', bg: '#f1f3f6' },
};
function PitchRow({ label, tag, tone = 'good', isLast }) {
  const t = PITCH_TONE[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      padding: '10px 0',
      borderBottom: isLast ? 'none' : '1px solid #f2f4f7',
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>
        {label}
      </span>
      <span style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        padding: '3px 8px', borderRadius: 999,
        background: t.bg, color: t.color, flexShrink: 0,
      }}>{tag}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DistanceSlider — a styled range between 0,5 and 5 km
// ─────────────────────────────────────────────────────────────
function DistanceSlider({ value = 1.5, min = 0.5, max = 5 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: '6px 2px 0', fontFamily: 'Inter, system-ui' }}>
      <div style={{ position: 'relative', height: 6, background: '#eef0f3', borderRadius: 3 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
          background: 'linear-gradient(90deg, #1e40af, #2850c8)', borderRadius: 3,
        }}/>
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 10px)`, top: -7,
          width: 20, height: 20, borderRadius: 10,
          background: '#fff', border: '2.5px solid #1e40af',
          boxShadow: '0 2px 6px rgba(15,23,41,0.15)',
        }}/>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 10.5, color: '#8a94a6', marginTop: 5, fontVariantNumeric: 'tabular-nums',
      }}>
        <span>0,5 km</span><span>5 km</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) Clínicas próximas — full bottom-sheet list with slider
// ─────────────────────────────────────────────────────────────
function MapScreen3_NearbySheet() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={MAP_CLINICS.map(c => ({ ...c, selected: c.id === 'c1' }))} height={844}/>

      {/* Taller bottom sheet dominating */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -10px 30px rgba(15,23,41,0.10)',
        padding: '10px 0 0', fontFamily: 'Inter, system-ui',
        height: 640,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: '#d1d5db', margin: '2px auto 14px' }}/>

        {/* selected clinic pinned at top */}
        <div style={{ padding: '0 18px 14px', borderBottom: '1px solid #eef0f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, flex: 1 }}>
              Clínica Ortopédica São Lucas
            </span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#c6861b">
              <path d="M10 2l2.4 5.8 6.1.5-4.6 4.1 1.4 6L10 15.3 4.7 18.4l1.4-6L1.5 8.3l6.1-.5L10 2z"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
            <PotentialTag/>
            <span style={{ fontSize: 11.5, color: '#6b7280' }}>Clínica · Ortopedia</span>
            <span style={{ opacity: 0.5, color: '#8a94a6' }}>·</span>
            <span style={{ fontSize: 11.5, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>1,2 km</span>
          </div>
        </div>

        {/* Near list w/ slider */}
        <div style={{ padding: '14px 18px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1729' }}>Clínicas próximas</span>
            <span style={{ fontSize: 11.5, color: '#6b7280' }}>Distância: 2,5 km</span>
          </div>
          <DistanceSlider value={2.5}/>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px' }}>
          {MAP_CLINICS.slice(1).map(c => (
            <div key={c.id} style={{ borderBottom: '1px solid #eef0f3' }}>
              <ClinicMiniRow clinic={c}/>
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
            <button style={{
              background: 'transparent', border: 'none', color: '#1e40af',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Ver mais clínicas</button>
          </div>
        </div>

        <FloatingMenu/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) Rota sugerida (resumo)
// ─────────────────────────────────────────────────────────────
const ROUTE_STOPS = [
  { id: 'r1', x: 110, y: 160, routeLabel: 'A', name: 'Clínica Ortopédica São Lucas', distance: '1,2 km', kind: 'highPotential' },
  { id: 'r2', x: 200, y: 230, routeLabel: 'B', name: 'Centro Ortopédico Paulista', distance: '2,0 km', kind: 'warm' },
  { id: 'r3', x: 290, y: 180, routeLabel: 'C', name: 'Clínica Ortopédica Moema', distance: '2,8 km', kind: 'warm' },
  { id: 'r4', x: 370, y: 260, routeLabel: 'D', name: 'Orto Prime', distance: '3,1 km', kind: 'cold' },
];

function MapScreen4_RouteSummary() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={ROUTE_STOPS} route={ROUTE_STOPS} height={844}/>
      <MapTopBar/>

      {/* Summary card bottom */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 84, zIndex: 5,
        background: '#fff', borderRadius: 18,
        border: '1px solid #edeff3',
        boxShadow: '0 12px 28px rgba(15,23,41,0.12)',
        padding: '16px 16px 14px',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
            Plano sugerido para hoje
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          8 visitas · ~3h · 15 km
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROUTE_STOPS.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 20, height: 20, borderRadius: 10,
                background: PIN_COLOR[s.kind], color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{s.routeLabel}</span>
              <span style={{
                flex: 1, fontSize: 13, color: '#0f1729', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{s.name}</span>
              <span style={{ fontSize: 11.5, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{s.distance}</span>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: '#8a94a6', padding: '4px 0 2px' }}>+4 paradas</div>
        </div>

        <button style={{
          marginTop: 14, width: '100%', height: 46, borderRadius: 12, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(22,163,115,0.35)',
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
        }}>Ver rota completa</button>
      </div>

      <FloatingMenu/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5) Planejamento de rota (completo) — full plan page
// ─────────────────────────────────────────────────────────────
const ROUTE_FULL = [
  { id: 'f1', label: 'A', name: 'Clínica Ortopédica São Lucas', distance: '1,2 km · 10 min' },
  { id: 'f2', label: 'B', name: 'Centro Ortopédico Paulista', distance: '2,0 km · 12 min', selected: true },
  { id: 'f3', label: 'C', name: 'Clínica Ortopédica Moema', distance: '2,5 km · 15 min' },
  { id: 'f4', label: 'D', name: 'Orto Prime', distance: '3,1 km · 18 min' },
  { id: 'f5', label: 'E', name: 'Clínica do Esporte', distance: '3,6 km · 20 min' },
];

function MapScreen5_RoutePlan() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f7f8fb', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '14px 16px 14px',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 18,
          background: '#f3f4f6', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0f1729" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5"/></svg>
        </button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2, textAlign: 'center' }}>Rota do dia</div>
        <button style={{
          width: 36, height: 36, borderRadius: 18,
          background: '#f3f4f6', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#0f1729"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#fff', padding: '16px 16px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        borderBottom: '1px solid #eef0f3',
      }}>
        <RouteStat value="8" label="visitas"/>
        <RouteStat value="~3h" label="tempo total"/>
        <RouteStat value="15 km" label="distância"/>
      </div>

      {/* Map preview */}
      <div style={{ position: 'relative', height: 180, margin: '12px 16px 0', borderRadius: 14, overflow: 'hidden', border: '1px solid #edeff3' }}>
        <MapCanvas pins={ROUTE_STOPS} route={ROUTE_STOPS} height={180} labels={false}/>
      </div>

      {/* Ordered list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 0' }}>
        {ROUTE_FULL.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: s.selected ? 'rgba(30,64,175,0.06)' : 'transparent',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8a94a6" strokeWidth="1.7" strokeLinecap="round"><path d="M3 6h12M3 9h12M3 12h12"/></svg>
            <span style={{
              width: 24, height: 24, borderRadius: 12,
              background: s.selected ? '#1e40af' : '#e5e7eb',
              color: s.selected ? '#fff' : '#0f1729',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{s.label}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: s.selected ? '#1e40af' : '#0f1729', letterSpacing: -0.1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{s.distance}</div>
            </div>
            <button style={{
              width: 30, height: 30, border: 'none', background: 'transparent',
              color: '#8a94a6', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 4v8M10 4v8M4 4l1 10a1 1 0 001 1h4a1 1 0 001-1l1-10"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div style={{ padding: '10px 16px 6px', borderTop: '1px solid #eef0f3', display: 'flex', gap: 8 }}>
        <button style={ghostBtnStyle}>+ Adicionar parada</button>
        <button style={ghostBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'text-bottom' }}>
            <path d="M2 4a5 5 0 019-2.5M12 10a5 5 0 01-9 2.5"/><path d="M2 2v3h3M12 12V9h-3"/>
          </svg>
          Otimizar ordem
        </button>
      </div>
      <div style={{ padding: '4px 16px 16px' }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 15, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(22,163,115,0.35)',
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
        }}>Iniciar rota</button>
      </div>
    </div>
  );
}

const ghostBtnStyle = {
  flex: 1, height: 38, borderRadius: 10,
  background: '#fff', border: '1px solid #d7dbe3',
  color: '#0f1729', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'Inter, system-ui',
};

function RouteStat({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0f1729', letterSpacing: -0.4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6) Rota em execução — active navigation
// ─────────────────────────────────────────────────────────────
function MapScreen6_RouteActive() {
  const stops = [
    { id: 's1', x: 130, y: 180, routeLabel: 'A', kind: 'warm' },
    { id: 's2', x: 230, y: 280, routeLabel: 'B', kind: 'warm', selected: true },
    { id: 's3', x: 330, y: 360, routeLabel: 'C', kind: 'cold' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={stops} route={stops} userDot={{ x: 90, y: 130 }} height={844}/>

      {/* Top "next stop" card */}
      <div style={{
        position: 'absolute', top: 52, left: 12, right: 12, zIndex: 5,
        background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
        borderRadius: 16, padding: '14px 14px',
        boxShadow: '0 12px 28px rgba(10,47,127,0.35)',
        fontFamily: 'Inter, system-ui', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
            Próxima parada
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Centro Ortopédico Paulista
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>
            2,0 km · 12 min
          </div>
        </div>
        <button style={{
          padding: '9px 14px', borderRadius: 10, border: 'none',
          background: '#fff', color: '#0a2f7f',
          fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}>Navegar</button>
      </div>

      {/* Right stack: toggles */}
      <div style={{ position: 'absolute', top: 150, right: 12, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SideIconButton icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0f1729" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="10" rx="2"/><path d="M2 7h14"/></svg>
        }/>
        <SideIconButton icon={MiIcons.route} active/>
        <SideIconButton icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0f1729" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="12" height="10" rx="2"/><path d="M3 7h12M6 2v4M12 2v4"/></svg>
        }/>
      </div>

      {/* Bottom: progress + compact actions */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -10px 30px rgba(15,23,41,0.10)',
        padding: '14px 16px 18px', fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>Parada 2 de 8</span>
          <span style={{ fontSize: 11.5, color: '#6b7280' }}>Concluídas: 1 · Puladas: 0</span>
        </div>
        <div style={{ height: 6, background: '#eef0f3', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg, #1e40af, #2850c8)' }}/>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 42, borderRadius: 12, border: 'none',
            background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
            color: '#fff', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 6px 16px rgba(22,163,115,0.35)',
            cursor: 'pointer',
          }}>Visitar</button>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            color: '#0f1729', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer',
          }}>Pular</button>
          <button style={{
            width: 50, height: 42, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#0f1729"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SideIconButton({ icon, active }) {
  return (
    <button style={{
      width: 42, height: 42, borderRadius: 12,
      background: active ? '#1e40af' : '#fff',
      border: '1px solid #edeff3',
      boxShadow: '0 6px 16px rgba(15,23,41,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      color: active ? '#fff' : '#0f1729',
    }}>{React.cloneElement(icon, { stroke: active ? '#fff' : '#0f1729' })}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 7) Sugestão dinâmica durante a rota
// ─────────────────────────────────────────────────────────────
function MapScreen7_DynamicSuggestion() {
  const stops = [
    { id: 's1', x: 120, y: 180, routeLabel: 'A', kind: 'warm' },
    { id: 's2', x: 240, y: 290, routeLabel: 'B', kind: 'warm', selected: true },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas
        pins={[
          ...stops,
          { id: 'sug', x: 315, y: 220, kind: 'highPotential' },
        ]}
        route={stops}
        userDot={{ x: 200, y: 240 }}
        pulseId="sug"
        height={844}
      />

      {/* Opportunity card — big, centered, elevated */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 120, zIndex: 6,
        background: '#fff', borderRadius: 18,
        border: '1px solid #edeff3',
        boxShadow: '0 16px 40px rgba(15,23,41,0.18)',
        padding: '18px 16px 16px',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(22,163,115,0.14)', color: '#117a55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1.5L9.5 6h4.5l-3.7 2.7L11.8 13 8 10.3 4.2 13l1.5-4.3L2 6h4.5L8 1.5z"/>
              </svg>
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
              Você está próximo de<br/>uma oportunidade!
            </div>
          </div>
          <button style={{
            width: 28, height: 28, borderRadius: 14,
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
          </button>
        </div>

        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: '#f7f9fc', border: '1px solid #eef0f3',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <svg width="14" height="18" viewBox="0 0 14 18">
              <path d="M 7 1 C 2.5 1, 0.5 4.5, 0.5 7.5 C 0.5 11, 3 14, 7 17 C 11 14, 13.5 11, 13.5 7.5 C 13.5 4.5, 11.5 1, 7 1 Z" fill="#c6861b"/>
              <circle cx="7" cy="6.5" r="2" fill="#fff"/>
            </svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1729' }}>Clínica do Esporte</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.5 }}>
            Apenas 1,4 km de desvio <br/>· Não visitado há 60 dias
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #bde5d3', background: '#f0f9f4',
            color: '#117a55', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Ver no mapa</button>
          <button style={{
            flex: 1, height: 42, borderRadius: 12, border: 'none',
            background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(22,163,115,0.35)',
          }}>Adicionar à rota</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8) Registrar visita — rápido
// ─────────────────────────────────────────────────────────────
function MapScreen8_LogVisit() {
  const [outcome, setOutcome] = React.useState('visitado');
  const [followup, setFollowup] = React.useState('+7 dias');
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden', fontFamily: 'Inter, system-ui' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.35)' }}/>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '10px 18px 20px',
        boxShadow: '0 -10px 30px rgba(15,23,41,0.18)',
        maxHeight: 700,
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: '#d1d5db', margin: '2px auto 14px' }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>Registrar visita</span>
          <button style={{
            width: 28, height: 28, borderRadius: 14, background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
          </button>
        </div>

        {/* Outcome chips */}
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Resultado da visita</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <OutcomeChip k="visitado" current={outcome} set={setOutcome} label="Visitado" color="#117a55" bg="rgba(22,163,115,0.14)"/>
          <OutcomeChip k="interessado" current={outcome} set={setOutcome} label="Interessado" color="#a76d14" bg="rgba(198,134,27,0.14)"/>
          <OutcomeChip k="sem" current={outcome} set={setOutcome} label="Sem interesse" color="#b84545" bg="rgba(184,69,69,0.12)"/>
        </div>

        {/* Note */}
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Anotação rápida (opcional)</div>
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px',
          background: '#fafafa', display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 18,
        }}>
          <span style={{ flex: 1, fontSize: 13, color: '#8a94a6' }}>Como foi a visita? (opcional)</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1e40af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="6" height="10" rx="3"/>
            <path d="M3 8a6 6 0 0012 0M9 14v3M6 17h6"/>
          </svg>
        </div>

        {/* Follow-up */}
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Próximo contato / Follow-up</div>
        <div style={{ fontSize: 11, color: '#8a94a6', marginBottom: 8 }}>Lembrar em</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {['+3 dias', '+7 dias', '+14 dias', 'Personalizado'].map(l => (
            <button key={l} onClick={() => setFollowup(l)} style={{
              flex: 1, height: 36, padding: '0 4px', borderRadius: 10,
              border: followup === l ? '1.5px solid #16a373' : '1px solid #e5e7eb',
              background: followup === l ? 'rgba(22,163,115,0.08)' : '#fff',
              color: followup === l ? '#117a55' : '#0f1729',
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>

        <button style={{
          width: '100%', height: 50, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 15, fontWeight: 600,
          boxShadow: '0 10px 22px rgba(22,163,115,0.35)',
          cursor: 'pointer',
        }}>Salvar visita</button>
      </div>
    </div>
  );
}

function OutcomeChip({ k, current, set, label, color, bg }) {
  const on = current === k;
  return (
    <button onClick={() => set(k)} style={{
      flex: 1, height: 34, borderRadius: 10,
      border: on ? `1.5px solid ${color}` : '1px solid #e5e7eb',
      background: on ? bg : '#fff',
      color: on ? color : '#0f1729',
      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, system-ui',
    }}>{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 9) Follow-ups — tabbed list
// ─────────────────────────────────────────────────────────────
const FOLLOWUPS = [
  { id: 1, color: '#c6861b', name: 'Clínica Ortopédica Paulista', note: 'Ligar para Dra. Ana sobre novos lotes de produtos.', when: 'Hoje', whenColor: '#b84545' },
  { id: 2, color: '#c6861b', name: 'Orto Prime', note: 'Enviar catálogo de joelheiras.', when: 'Amanhã', whenColor: '#117a55' },
  { id: 3, color: '#c6861b', name: 'Instituto Ortopédico Avançado', note: 'Retorno sobre proposta enviada.', when: '14/06', whenColor: '#8a94a6' },
];

function MapScreen9_Followups() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f7f8fb', overflow: 'hidden', fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 16px 0',
        borderBottom: '1px solid #eef0f3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3 }}>Follow-ups</span>
          <button style={{
            width: 32, height: 32, borderRadius: 16, background: '#f3f4f6',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0f1729" strokeWidth="1.8" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><path d="M9 9l4 4"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 18 }}>
          {[
            { k: 'pend', l: 'Pendentes', n: 5, active: true },
            { k: 'hoje', l: 'Hoje', n: 2 },
            { k: 'prox', l: 'Próximos', n: 7 },
            { k: 'done', l: 'Concluídos' },
          ].map(t => (
            <div key={t.k} style={{
              padding: '0 0 10px', position: 'relative',
              fontSize: 13, fontWeight: 600,
              color: t.active ? '#1e40af' : '#8a94a6',
            }}>
              {t.l}{t.n != null && ` (${t.n})`}
              {t.active && <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
                background: '#1e40af', borderRadius: 1,
              }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {FOLLOWUPS.map(f => (
          <div key={f.id} style={{
            background: '#fff', border: '1px solid #edeff3', borderRadius: 14,
            padding: 14, marginBottom: 10,
            boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <svg width="14" height="18" viewBox="0 0 14 18" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M 7 1 C 2.5 1, 0.5 4.5, 0.5 7.5 C 0.5 11, 3 14, 7 17 C 11 14, 13.5 11, 13.5 7.5 C 13.5 4.5, 11.5 1, 7 1 Z" fill={f.color}/>
                <circle cx="7" cy="6.5" r="2" fill="#fff"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.4 }}>{f.note}</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: f.whenColor, flexShrink: 0 }}>{f.when}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={smallActionBtn}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10v1.8a1 1 0 01-1.1 1c-1.8-.1-3.5-.8-4.9-2a10 10 0 01-3.1-3.2A10 10 0 011.1 2.6 1 1 0 012 1.5h1.8L5 4l-1 1a7 7 0 003 3l1-1 2.5 1 .5 2z"/></svg>
                Ligar
              </button>
              <button style={smallActionBtn}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12s4-4 4-7a4 4 0 10-8 0c0 3 4 7 4 7z"/><circle cx="7" cy="5" r="1.5"/></svg>
                Ver no mapa
              </button>
            </div>
          </div>
        ))}
      </div>

      <FloatingMenu/>
    </div>
  );
}

const smallActionBtn = {
  flex: 1, height: 34, borderRadius: 10,
  background: '#f7f9fc', border: '1px solid #eef0f3',
  color: '#1e40af', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'Inter, system-ui',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

// ─────────────────────────────────────────────────────────────
// 10) Acesso rápido — floating action menu
// ─────────────────────────────────────────────────────────────
function MapScreen10_QuickMenu() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={MAP_CLINICS.map(c => ({ ...c }))} height={844}/>
      <MapTopBar/>
      <LocateFAB/>
      <FloatingMenu initialOpen/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6b) Rota em execução — PRÓXIMO a uma clínica da rota
//     O usuário chegou a menos de ~80m da próxima parada:
//     oferecemos "Iniciar visita" em destaque.
// ─────────────────────────────────────────────────────────────
function MapScreen6b_NearClinicPrompt() {
  // User dot sits right next to clinic B (the active/next stop)
  const stops = [
    { id: 's1', x: 130, y: 180, routeLabel: 'A', kind: 'warm' },
    { id: 's2', x: 230, y: 280, routeLabel: 'B', kind: 'warm', selected: true },
    { id: 's3', x: 330, y: 360, routeLabel: 'C', kind: 'cold' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={stops} route={stops} userDot={{ x: 215, y: 260 }} height={844}/>

      {/* Proximity ring + "Você chegou" chip anchored near clinic B */}
      <div style={{
        position: 'absolute', top: 232, left: 12, right: 12, zIndex: 5,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: '#0f8a5f',
          boxShadow: '0 6px 16px rgba(22,163,115,0.35)',
          fontFamily: 'Inter, system-ui',
          color: '#fff', fontSize: 11.5, fontWeight: 700,
          letterSpacing: 0.2,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3, background: '#fff',
            boxShadow: '0 0 0 3px rgba(255,255,255,0.35)',
          }}/>
          Você chegou · 40 m
        </div>
      </div>

      {/* Keep the small "next stop" header but dimmed/completed-looking */}
      <div style={{
        position: 'absolute', top: 52, left: 12, right: 12, zIndex: 5,
        background: 'rgba(10,47,127,0.88)',
        borderRadius: 16, padding: '10px 14px',
        boxShadow: '0 10px 24px rgba(10,47,127,0.30)',
        fontFamily: 'Inter, system-ui', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: 'rgba(255,255,255,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l3 3 5-6"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            Parada 2 · Você chegou
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Centro Ortopédico Paulista
          </div>
        </div>
      </div>

      {/* Prominent "Start visit" bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -12px 32px rgba(15,23,41,0.14)',
        padding: '12px 18px 20px', fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: '#d1d5db', margin: '2px auto 14px' }}/>

        {/* Clinic header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(22,163,115,0.14)', color: '#117a55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2C5.5 2 2 5 2 9c0 5 8 9 8 9s8-4 8-9c0-4-3.5-7-8-7z"/>
              <circle cx="10" cy="9" r="2.5"/>
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#117a55', marginBottom: 2 }}>
              Você está na clínica
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, marginBottom: 3 }}>
              Centro Ortopédico Paulista
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280' }}>
              Parada B · Rota do dia · 40 m de você
            </div>
          </div>
        </div>

        {/* Context snippet */}
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: '#f7f9fc', border: '1px solid #eef0f3',
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 16,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1e40af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l2.5 1.5"/>
          </svg>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.45 }}>
            Última visita há 15 dias · Dra. Mariana
          </div>
        </div>

        {/* Primary: Start visit */}
        <button style={{
          width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: -0.1,
          boxShadow: '0 10px 24px rgba(22,163,115,0.40)',
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7"/><path d="M7 6l5 3-5 3V6z" fill="#fff"/>
          </svg>
          Iniciar visita
        </button>

        {/* Secondary actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            color: '#0f1729', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Não é aqui</button>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            color: '#0f1729', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Pular parada</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6c) VISITA EM ANDAMENTO — status intermediário
//     Enquanto o usuário está na clínica, a rota fica "em pausa".
//     Um cronômetro + botão "Concluir visita" em destaque.
// ─────────────────────────────────────────────────────────────
function MapScreen6c_VisitInProgress() {
  const stops = [
    { id: 's1', x: 130, y: 180, routeLabel: 'A', kind: 'warm' },
    { id: 's2', x: 230, y: 280, routeLabel: 'B', kind: 'visiting', selected: true },
    { id: 's3', x: 330, y: 360, routeLabel: 'C', kind: 'cold' },
  ];

  // Custom pin for the visiting clinic: pulsing amber ring
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={stops.filter(s => s.id !== 's2')} route={stops} userDot={{ x: 215, y: 260 }} height={844}/>

      {/* Special "visiting" marker for stop B — drawn on top */}
      <svg viewBox="0 0 430 844" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform="translate(230, 280)">
          <circle r="26" fill="#c6861b" opacity="0.18">
            <animate attributeName="r" values="22;36;22" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.35;0.05;0.35" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle r="18" fill="#fff" stroke="#c6861b" strokeWidth="3"/>
          <text textAnchor="middle" y="5" fontFamily="Inter, system-ui" fontWeight="700"
            fontSize="13" fill="#c6861b">B</text>
        </g>
      </svg>

      {/* Top status bar — amber band signals "paused / visiting" */}
      <div style={{
        position: 'absolute', top: 52, left: 12, right: 12, zIndex: 5,
        background: 'linear-gradient(165deg, #d49a2c, #b8791a)',
        borderRadius: 16, padding: '12px 14px',
        boxShadow: '0 12px 28px rgba(198,134,27,0.35)',
        fontFamily: 'Inter, system-ui', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'rgba(255,255,255,0.18)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7"/><path d="M9 5v4l2.5 1.5"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', marginBottom: 2 }}>
            Visita em andamento
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Centro Ortopédico Paulista
          </div>
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          letterSpacing: 0.3,
        }}>
          08:42
        </div>
      </div>

      {/* Right side icons */}
      <div style={{ position: 'absolute', top: 150, right: 12, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SideIconButton icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0f1729" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="10" rx="2"/><path d="M2 7h14"/></svg>
        }/>
        <SideIconButton icon={MiIcons.route} active/>
      </div>

      {/* Bottom sheet — "visiting" state + options */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -10px 30px rgba(15,23,41,0.10)',
        padding: '12px 18px 18px', fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: '#d1d5db', margin: '2px auto 14px' }}/>

        {/* Route paused indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(198,134,27,0.08)',
          border: '1px solid rgba(198,134,27,0.22)',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 22, height: 22, borderRadius: 11,
              background: 'rgba(198,134,27,0.18)', color: '#a76d14',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="2" y="2" width="2" height="6" rx="0.5"/>
                <rect x="6" y="2" width="2" height="6" rx="0.5"/>
              </svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a76d14' }}>Rota em pausa</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#6b7280' }}>Parada 2 de 8</span>
        </div>

        {/* Progress bar — unchanged, with an amber "visiting" tick */}
        <div style={{ height: 6, background: '#eef0f3', borderRadius: 3, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
          <div style={{ width: '14%', height: '100%', background: 'linear-gradient(90deg, #1e40af, #2850c8)' }}/>
          <div style={{
            position: 'absolute', top: -3, left: '14%', width: 12, height: 12, borderRadius: 6,
            background: '#c6861b', border: '2px solid #fff',
            boxShadow: '0 0 0 2px rgba(198,134,27,0.30)',
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Concluídas: 1 · Em visita: 1</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Restantes: 6</span>
        </div>

        {/* Primary: Complete visit */}
        <button style={{
          width: '100%', height: 50, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 14.5, fontWeight: 700,
          boxShadow: '0 10px 22px rgba(22,163,115,0.38)',
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9l3.5 3.5L14 5"/></svg>
          Concluir visita
        </button>

        {/* Order during visit — navy accent, sits between "complete visit"
            (green, primary) and the softer secondary buttons below. */}
        <button style={{
          width: '100%', height: 44, borderRadius: 12, border: '1px solid #c7d2fe',
          background: '#eef2ff', color: '#1e40af',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, system-ui',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 2.5h2l1 8.5a1.2 1.2 0 001.2 1h5.2a1.2 1.2 0 001.2-1l.8-5H5.5"/>
            <circle cx="6.5" cy="14" r="1"/><circle cx="12" cy="14" r="1"/>
          </svg>
          Fazer pedido durante a visita
        </button>

        {/* Secondary: Cancel / add note */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 40, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            color: '#0f1729', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h10v6H7l-3 2.5V9H2V3z"/></svg>
            Adicionar nota
          </button>
          <button style={{
            flex: 1, height: 40, borderRadius: 12,
            border: '1px solid #f0d4d4', background: '#fff',
            color: '#b84545', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Cancelar visita</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6d) SAIU DA LOCALIZAÇÃO — confirmar conclusão
//     Começou a visita e se afastou: oferecemos concluir a visita.
// ─────────────────────────────────────────────────────────────
function MapScreen6d_LeftLocationPrompt() {
  const stops = [
    { id: 's1', x: 130, y: 180, routeLabel: 'A', kind: 'warm' },
    { id: 's2', x: 230, y: 280, routeLabel: 'B', kind: 'visiting', selected: true },
    { id: 's3', x: 330, y: 360, routeLabel: 'C', kind: 'cold' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef1ec', overflow: 'hidden' }}>
      <MapCanvas pins={stops.filter(s => s.id !== 's2')} route={stops} userDot={{ x: 305, y: 335 }} height={844}/>

      {/* Still-visiting marker left behind */}
      <svg viewBox="0 0 430 844" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Dashed link from user dot back to clinic B */}
        <path d="M 305 335 Q 260 300, 230 280"
          fill="none" stroke="#c6861b" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="4 5" opacity="0.75"/>
        <g transform="translate(230, 280)">
          <circle r="22" fill="#c6861b" opacity="0.16">
            <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle r="16" fill="#fff" stroke="#c6861b" strokeWidth="2.5"/>
          <text textAnchor="middle" y="4.5" fontFamily="Inter, system-ui" fontWeight="700"
            fontSize="12" fill="#c6861b">B</text>
        </g>
      </svg>

      {/* Top visit-in-progress strip stays, but now shows "afastou-se" */}
      <div style={{
        position: 'absolute', top: 52, left: 12, right: 12, zIndex: 5,
        background: 'linear-gradient(165deg, #d49a2c, #b8791a)',
        borderRadius: 16, padding: '12px 14px',
        boxShadow: '0 12px 28px rgba(198,134,27,0.35)',
        fontFamily: 'Inter, system-ui', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'rgba(255,255,255,0.18)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7"/><path d="M9 5v4l2.5 1.5"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', marginBottom: 2 }}>
            Visita em andamento
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Centro Ortopédico Paulista
          </div>
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        }}>
          14:05
        </div>
      </div>

      {/* Auto-prompt toast — "você se afastou" */}
      <div style={{
        position: 'absolute', top: 130, left: 12, right: 12, zIndex: 5,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', borderRadius: 999,
          background: '#0f1729', color: '#fff',
          fontFamily: 'Inter, system-ui',
          fontSize: 11.5, fontWeight: 600,
          boxShadow: '0 8px 22px rgba(15,23,41,0.25)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1v5l3 2"/><circle cx="6" cy="6" r="5"/>
          </svg>
          Você saiu da clínica · 180 m
        </div>
      </div>

      {/* Bottom prompt sheet — focus on completing */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -14px 36px rgba(15,23,41,0.18)',
        padding: '12px 18px 20px', fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: '#d1d5db', margin: '2px auto 14px' }}/>

        {/* Heading */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(198,134,27,0.14)', color: '#a76d14',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l5-9 5 9M8 7v4M8 13.5v.5"/><path d="M3 17h14"/>
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, marginBottom: 3 }}>
              Finalizou a visita?
            </div>
            <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.45 }}>
              Você está a 180 m do <b style={{ color: '#0f1729', fontWeight: 600 }}>Centro Ortopédico Paulista</b>. A visita começou há 14 minutos.
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 10,
          background: '#f7f9fc', border: '1px solid #eef0f3',
          marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: '#8a94a6' }}>
              Duração
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              14 min
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: '#eef0f3' }}/>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: '#8a94a6' }}>
              Distância
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              180 m
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: '#eef0f3' }}/>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: '#8a94a6' }}>
              Próx. parada
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', marginTop: 2 }}>
              C
            </div>
          </div>
        </div>

        {/* Primary: complete visit */}
        <button style={{
          width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)',
          color: '#fff', fontSize: 15, fontWeight: 700,
          boxShadow: '0 10px 24px rgba(22,163,115,0.40)',
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9l3.5 3.5L14 5"/></svg>
          Concluir visita e seguir rota
        </button>

        {/* Secondary */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #d7dbe3', background: '#fff',
            color: '#0f1729', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Ainda estou na visita</button>
          <button style={{
            flex: 1, height: 42, borderRadius: 12,
            border: '1px solid #f0d4d4', background: '#fff',
            color: '#b84545', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Cancelar visita</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Favoritos — clinics the rep has starred. Reached from the green
// FAB ("Favoritos"). Shows a static full-screen list with a
// "Ir ao perfil" affordance on each row + quick call / rota actions.
// ─────────────────────────────────────────────────────────────
const FAVORITE_CLINICS = [
  {
    id: 'f1', name: 'Clínica Santa Mônica', area: 'Itaim Bibi · 2,3 km',
    tag: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastVisit: 'Visitado há 6 dias', doctors: 3, hue: 218,
  },
  {
    id: 'f2', name: 'Clínica Ortopédica São Lucas', area: 'Jardim Paulista · 1,2 km',
    tag: { label: 'Alto potencial', color: '#a76d14', bg: 'rgba(198,134,27,0.14)' },
    lastVisit: 'Visitado há 12 dias', doctors: 2, hue: 38,
  },
  {
    id: 'f3', name: 'Centro Médico OrtoVita', area: 'Pinheiros · 3,1 km',
    tag: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastVisit: 'Visitado há 4 dias', doctors: 4, hue: 148,
  },
  {
    id: 'f4', name: 'Instituto CardioMed', area: 'Vila Olímpia · 2,0 km',
    tag: { label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
    lastVisit: 'Visitado há 18 dias', doctors: 2, hue: 280,
  },
  {
    id: 'f5', name: 'Clínica Vitalis', area: 'Moema · 2,6 km',
    tag: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastVisit: 'Visitado há 9 dias', doctors: 5, hue: 12,
  },
];

function FavoriteClinicRow({ clinic }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: '#fff', border: '1px solid #edeff3', borderRadius: 14,
      fontFamily: 'Inter, system-ui',
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
    }}>
      {/* clinic avatar (striped placeholder) */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0, position: 'relative',
        overflow: 'hidden', background: `hsl(${clinic.hue}, 45%, 72%)`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(40deg, hsl(${clinic.hue}, 45%, 72%) 0 6px, hsl(${clinic.hue}, 50%, 65%) 6px 12px)`,
        }}/>
        <svg viewBox="0 0 16 16" width="20" height="20" fill="none" stroke={`hsl(${clinic.hue}, 60%, 22%)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', top: 12, left: 12 }}>
          <rect x="2" y="5" width="12" height="9" rx="1"/><path d="M6 5V3h4v2M8 8v3M6.5 9.5h3"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontSize: 13.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{clinic.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
          <span style={{
            padding: '1px 7px', borderRadius: 999,
            background: clinic.tag.bg, color: clinic.tag.color,
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
          }}>{clinic.tag.label}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{clinic.area}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: '#6b7280', marginTop: 4,
        }}>
          <span>{clinic.lastVisit}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{clinic.doctors} médicos</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(30,64,175,0.10)', color: '#1e40af',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 14s5-5.2 5-9a5 5 0 00-10 0c0 3.8 5 9 5 9z"/><circle cx="8" cy="6" r="2"/>
          </svg>
        </button>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8a94a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ alignSelf: 'center' }}>
          <path d="M6 3l5 5-5 5"/>
        </svg>
      </div>
    </div>
  );
}

function MapScreen_Favoritos() {
  const total = FAVORITE_CLINICS.length;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f7f8fb', fontFamily: 'Inter, system-ui',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.92)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: '1px solid #eef0f3',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button style={{
          width: 38, height: 38, borderRadius: 12,
          background: '#fff', border: '1px solid #edeff3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#0f1729', padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8a94a6' }}>
            Mapa · Favoritos
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3, marginTop: 1 }}>
            Clínicas favoritas
          </div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(198,134,27,0.14)', color: '#a76d14',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><path d="M5.5 1l1.3 3 3.2.3-2.4 2.1.8 3.1L5.5 8l-2.9 1.5.8-3.1L1 4.3l3.2-.3L5.5 1z"/></svg>
          {total}
        </span>
      </div>

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 16px 8px', flexWrap: 'wrap',
      }}>
        {[
          { k: 'all', label: 'Todas', count: total, active: true },
          { k: 'ativa', label: 'Ativas', count: 3 },
          { k: 'neg', label: 'Em negociação', count: 1 },
          { k: 'pot', label: 'Alto potencial', count: 1 },
        ].map(p => (
          <button key={p.k} style={{
            padding: '6px 11px', borderRadius: 999,
            border: `1px solid ${p.active ? '#1e40af' : '#e5e7eb'}`,
            background: p.active ? '#1e40af' : '#fff',
            color: p.active ? '#fff' : '#374151',
            fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {p.label}
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '0 5px', borderRadius: 6,
              background: p.active ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
              color: p.active ? '#fff' : '#6b7280',
              fontVariantNumeric: 'tabular-nums',
            }}>{p.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{
        padding: '6px 14px 24px', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {FAVORITE_CLINICS.map(c => <FavoriteClinicRow key={c.id} clinic={c}/>)}
      </div>
    </div>
  );
}

Object.assign(window, {
  MapScreen1_Initial,
  MapScreen2_ClinicSelected,
  MapScreen3_NearbySheet,
  MapScreen4_RouteSummary,
  MapScreen5_RoutePlan,
  MapScreen6_RouteActive,
  MapScreen6b_NearClinicPrompt,
  MapScreen6c_VisitInProgress,
  MapScreen6d_LeftLocationPrompt,
  MapScreen7_DynamicSuggestion,
  MapScreen8_LogVisit,
  MapScreen9_Followups,
  MapScreen10_QuickMenu,
  MapScreen_Favoritos,
  ClinicBottomSheet,
});
