// ─────────────────────────────────────────────────────────────
// TerritoryFullMapScreen — full-screen interactive territory map.
// Opens from "Ver mapa completo" on the Map screen. Shows all
// clinics & doctors with markers, supports filtering by type
// and visit status, search, popup details, and route handoff.
//
// Static design frame: the map is a stylized SVG canvas (not
// Leaflet) so the artboard renders crisply in screenshots and
// has no external dependencies.
// ─────────────────────────────────────────────────────────────

const TERRITORY_POINTS = [
  { id: 'clinic-1',  type: 'clinic', name: 'Clínica São Lucas',         address: 'Av. Paulista, 1000',         lat: -23.5614, lng: -46.6559, lastVisit: '2026-05-04', status: 'visited',  priority: 2, x: 0.42, y: 0.38 },
  { id: 'clinic-2',  type: 'clinic', name: 'Hospital Central',           address: 'Rua Augusta, 500',           lat: -23.5569, lng: -46.6623, lastVisit: null,         status: 'pending',  priority: 1, x: 0.38, y: 0.30 },
  { id: 'clinic-3',  type: 'clinic', name: 'Clínica Vida Plena',         address: 'Av. Rebouças, 300',          lat: -23.5684, lng: -46.6720, lastVisit: '2026-05-01', status: 'visited',  priority: 3, x: 0.30, y: 0.46 },
  { id: 'clinic-4',  type: 'clinic', name: 'Hospital Sírio-Libanês',     address: 'Rua Adma Jafet, 91',         lat: -23.5566, lng: -46.6537, lastVisit: '2026-04-28', status: 'visited',  priority: 2, x: 0.50, y: 0.32 },
  { id: 'clinic-5',  type: 'clinic', name: 'Clínica Santa Mônica',       address: 'R. Pinheiros, 410',          lat: -23.5670, lng: -46.6814, lastVisit: null,         status: 'priority', priority: 1, x: 0.22, y: 0.50 },
  { id: 'clinic-6',  type: 'clinic', name: 'Centro Médico Bela Vista',   address: 'Av. 9 de Julho, 1500',       lat: -23.5732, lng: -46.6432, lastVisit: '2026-04-22', status: 'visited',  priority: 3, x: 0.62, y: 0.55 },
  { id: 'clinic-7',  type: 'clinic', name: 'Clínica Jardim Europa',      address: 'R. Haddock Lobo, 220',       lat: -23.5604, lng: -46.6712, lastVisit: null,         status: 'pending',  priority: 2, x: 0.34, y: 0.40 },
  { id: 'clinic-8',  type: 'clinic', name: 'Hospital Albert Einstein',   address: 'Av. Albert Einstein, 627',   lat: -23.6010, lng: -46.7160, lastVisit: '2026-05-06', status: 'visited',  priority: 1, x: 0.18, y: 0.72 },
  { id: 'clinic-9',  type: 'clinic', name: 'Clínica Pinheiros',          address: 'R. dos Pinheiros, 870',      lat: -23.5641, lng: -46.6801, lastVisit: null,         status: 'priority', priority: 1, x: 0.26, y: 0.42 },
  { id: 'clinic-10', type: 'clinic', name: 'Clínica Vila Olímpia',       address: 'R. Funchal, 263',            lat: -23.5950, lng: -46.6890, lastVisit: '2026-04-18', status: 'visited',  priority: 3, x: 0.46, y: 0.66 },
  { id: 'clinic-11', type: 'clinic', name: 'Hospital São Camilo',        address: 'R. Pompeia, 144',            lat: -23.5311, lng: -46.6760, lastVisit: null,         status: 'pending',  priority: 2, x: 0.28, y: 0.18 },
  { id: 'clinic-12', type: 'clinic', name: 'Clínica Itaim',              address: 'R. Joaquim Floriano, 100',   lat: -23.5800, lng: -46.6810, lastVisit: '2026-05-02', status: 'visited',  priority: 2, x: 0.40, y: 0.60 },
  { id: 'doctor-1',  type: 'doctor', name: 'Dr. Roberto Alves',          specialty: 'Cardiologia',              clinic: 'Clínica São Lucas',     lat: -23.5614, lng: -46.6559, lastVisit: '2026-05-04', status: 'visited',  priority: 2, x: 0.44, y: 0.36 },
  { id: 'doctor-2',  type: 'doctor', name: 'Dra. Mariana Silva',         specialty: 'Endocrinologia',           clinic: 'Hospital Central',      lat: -23.5569, lng: -46.6623, lastVisit: null,         status: 'priority', priority: 1, x: 0.36, y: 0.28 },
  { id: 'doctor-3',  type: 'doctor', name: 'Dr. Felipe Oliveira',        specialty: 'Neurologia',               clinic: 'Hospital Sírio-Libanês', lat: -23.5566, lng: -46.6537, lastVisit: '2026-04-25', status: 'visited',  priority: 3, x: 0.52, y: 0.30 },
  { id: 'doctor-4',  type: 'doctor', name: 'Dra. Patrícia Costa',        specialty: 'Ginecologia',              clinic: 'Clínica Vida Plena',    lat: -23.5684, lng: -46.6720, lastVisit: null,         status: 'pending',  priority: 2, x: 0.32, y: 0.48 },
  { id: 'doctor-5',  type: 'doctor', name: 'Dr. Bento Carvalho',         specialty: 'Ortopedia',                clinic: 'Centro Médico Bela Vista', lat: -23.5732, lng: -46.6432, lastVisit: '2026-04-22', status: 'visited',  priority: 3, x: 0.64, y: 0.53 },
  { id: 'doctor-6',  type: 'doctor', name: 'Dra. Larissa Ribeiro',       specialty: 'Pediatria',                clinic: 'Hospital Albert Einstein', lat: -23.6010, lng: -46.7160, lastVisit: null,         status: 'priority', priority: 1, x: 0.20, y: 0.70 },
  { id: 'doctor-7',  type: 'doctor', name: 'Dr. Gustavo Mendes',         specialty: 'Dermatologia',             clinic: 'Clínica Itaim',         lat: -23.5800, lng: -46.6810, lastVisit: '2026-05-02', status: 'visited',  priority: 2, x: 0.42, y: 0.62 },
  { id: 'doctor-8',  type: 'doctor', name: 'Dra. Camila Tavares',        specialty: 'Oftalmologia',             clinic: 'Hospital São Camilo',   lat: -23.5311, lng: -46.6760, lastVisit: null,         status: 'pending',  priority: 2, x: 0.30, y: 0.20 },
];

function _tfmRelativeTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date('2026-05-07');
  const diff = Math.floor((now - d) / 86400000);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7)   return `há ${diff} dias`;
  if (diff < 30)  return `há ${Math.floor(diff/7)} sem.`;
  return `há ${Math.floor(diff/30)} meses`;
}

function TerritoryFullMapScreen({
  onBack = () => {},
  initialFilterOpen = false,
  initialSelectedId = null,
}) {
  const [filter, setFilter]     = React.useState({ showClinics: true, showDoctors: true, status: 'all' });
  const [searchQuery, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(initialSelectedId);
  const [filterOpen, setFilterOpen] = React.useState(initialFilterOpen);

  const visiblePoints = TERRITORY_POINTS.filter(p => {
    if (!filter.showClinics && p.type === 'clinic') return false;
    if (!filter.showDoctors && p.type === 'doctor') return false;
    if (filter.status !== 'all' && p.status !== filter.status) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = (p.name + ' ' + (p.address || '') + ' ' + (p.specialty || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const selected = visiblePoints.find(p => p.id === selectedId) || null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#e6e9ec',
      fontFamily: 'Inter, system-ui',
      overflow: 'hidden',
      animation: 'tfmFadeIn 220ms ease-out',
    }}>
      {/* Stylized map canvas (SVG) */}
      <_TFMMapCanvas
        points={visiblePoints}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Top controls */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12,
        display: 'flex', gap: 8, alignItems: 'center',
        zIndex: 5,
      }}>
        <button onClick={onBack} aria-label="Voltar" style={_tfmIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{
          flex: 1, height: 40, borderRadius: 12,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 2px 10px rgba(15,23,41,0.10)',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="#8a94a6" strokeWidth="1.7">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar local…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13.5, color: '#0f1729',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearch('')} aria-label="Limpar" style={{
              width: 18, height: 18, borderRadius: 9, background: '#e5e7eb',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/>
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Filtros"
          style={{
            ..._tfmIconBtn,
            position: 'relative',
            background: filterOpen ? '#0a2f7f' : 'rgba(255,255,255,0.96)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={filterOpen ? '#fff' : '#0a2f7f'} strokeWidth="1.7" strokeLinecap="round">
            <path d="M2 4h12M4 8h8M6 12h4"/>
          </svg>
          {(filter.status !== 'all' || !filter.showClinics || !filter.showDoctors) && (
            <div style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: 4,
              background: '#16a373', border: '2px solid #fff',
            }}/>
          )}
        </button>
      </div>

      {/* Result count chip */}
      <div style={{
        position: 'absolute', top: 64, left: 12, zIndex: 4,
        padding: '6px 11px', borderRadius: 999,
        background: 'rgba(15,23,41,0.86)',
        color: '#fff', fontSize: 11.5, fontWeight: 600,
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34d399' }}/>
        {visiblePoints.length} {visiblePoints.length === 1 ? 'local' : 'locais'}
      </div>

      {/* Right side controls */}
      <div style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4,
      }}>
        <button style={_tfmZoomBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0a2f7f" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10"/>
          </svg>
        </button>
        <div style={{ height: 1, background: '#e5e7eb', margin: '0 8px' }}/>
        <button style={_tfmZoomBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0a2f7f" strokeWidth="2" strokeLinecap="round">
            <path d="M2 7h10"/>
          </svg>
        </button>
      </div>

      {/* My location button */}
      <button
        aria-label="Minha localização"
        style={{
          position: 'absolute', right: 12, bottom: 132,
          width: 44, height: 44, borderRadius: 22,
          background: '#fff', border: 'none',
          boxShadow: '0 3px 10px rgba(15,23,41,0.18)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 4,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0a2f7f" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="9" cy="9" r="3"/><path d="M9 1v3M9 14v3M1 9h3M14 9h3"/>
        </svg>
      </button>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, right: 12,
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(15,23,41,0.10)',
        display: 'flex', gap: 14, flexWrap: 'wrap',
        fontSize: 11, color: '#374151',
        zIndex: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#3b82f6', boxShadow: '0 0 0 2px #fff, 0 0 0 3px #3b82f6' }}/>
          <span style={{ fontWeight: 500 }}>Clínicas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#8b5cf6', boxShadow: '0 0 0 2px #fff, 0 0 0 3px #8b5cf6' }}/>
          <span style={{ fontWeight: 500 }}>Médicos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#16a373' }}/>
          <span>Visitado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#ef4444' }}/>
          <span>Prioridade</span>
        </div>
      </div>

      {/* Marker popup */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 88, left: '50%',
          transform: 'translateX(-50%)',
          width: 290,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(15,23,41,0.22)',
          padding: 14,
          zIndex: 6,
          animation: 'tfmPopup 200ms cubic-bezier(.2,.8,.2,1)',
        }}>
          <button
            onClick={() => setSelectedId(null)}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 26, height: 26, borderRadius: 13,
              background: '#f3f4f6', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
              <path d="M1.5 1.5l6 6M7.5 1.5l-6 6"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: selected.type === 'clinic' ? '#dbeafe' : '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {selected.type === 'clinic' ? '🏥' : '👨‍⚕️'}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                {selected.address || selected.specialty}
              </div>
            </div>
          </div>
          {selected.lastVisit ? (
            <div style={{ fontSize: 12, color: '#16a373', fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>✓</span> Visitado {_tfmRelativeTime(selected.lastVisit)}
            </div>
          ) : selected.status === 'priority' ? (
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>⚠</span> Prioridade alta
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500, marginBottom: 12 }}>
              ◎ Aguardando visita
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, padding: '9px 12px',
              border: '1px solid #eef0f3', borderRadius: 10,
              background: '#fff', color: '#0a2f7f',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Ver detalhes
            </button>
            <button style={{
              flex: 1, padding: '9px 12px',
              border: 'none', borderRadius: 10,
              background: '#0a2f7f', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 12s5-3.6 5-7.5a5 5 0 1 0-10 0c0 3.9 5 7.5 5 7.5z"/>
                <circle cx="6.5" cy="4.5" r="1.6"/>
              </svg>
              Rota
            </button>
          </div>
        </div>
      )}

      {/* Filter sheet */}
      {filterOpen && (
        <_TFMFilterSheet
          filter={filter}
          onChange={setFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}

      <style>{`
        @keyframes tfmFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tfmPopup { from { opacity: 0; transform: translate(-50%, 12px) } to { opacity: 1; transform: translate(-50%, 0) } }
        @keyframes tfmSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

const _tfmIconBtn = {
  width: 40, height: 40, borderRadius: 12,
  background: 'rgba(255,255,255,0.96)',
  border: '1px solid rgba(0,0,0,0.04)',
  boxShadow: '0 2px 10px rgba(15,23,41,0.10)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

const _tfmZoomBtn = {
  width: 40, height: 40, border: 'none',
  background: '#fff',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 0,
};

function _TFMMapCanvas({ points, selectedId, onSelect }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Base */}
      <defs>
        <radialGradient id="tfmBg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#f0f2f5"/>
          <stop offset="100%" stopColor="#dde2e6"/>
        </radialGradient>
        <pattern id="tfmGrid" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6 0H0V6" fill="none" stroke="rgba(15,23,41,0.04)" strokeWidth="0.2"/>
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#tfmBg)"/>
      <rect width="100" height="100" fill="url(#tfmGrid)"/>

      {/* Major roads */}
      <path d="M0,30 Q40,28 60,40 T100,46" stroke="#cdd2d8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M0,30 Q40,28 60,40 T100,46" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M30,0 Q34,30 26,55 T34,100" stroke="#cdd2d8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M30,0 Q34,30 26,55 T34,100" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M0,72 Q30,68 50,76 T100,72" stroke="#cdd2d8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M0,72 Q30,68 50,76 T100,72" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M70,0 L66,55 L72,100" stroke="#cdd2d8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M70,0 L66,55 L72,100" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round"/>

      {/* Park / green areas */}
      <path d="M58,12 Q72,10 80,22 Q82,32 70,34 Q56,32 58,12 Z" fill="#dcebd6" opacity="0.85"/>
      <path d="M10,60 Q22,55 28,68 Q26,80 14,80 Q4,75 10,60 Z" fill="#dcebd6" opacity="0.7"/>
      {/* Water */}
      <path d="M82,68 Q92,72 96,84 Q92,96 82,94 Q74,82 82,68 Z" fill="#cfe3ee" opacity="0.85"/>

      {/* User location */}
      <circle cx="50" cy="50" r="3.5" fill="#1d4ed8" fillOpacity="0.18"/>
      <circle cx="50" cy="50" r="1.6" fill="#1d4ed8" stroke="#fff" strokeWidth="0.5"/>

      {/* Markers */}
      {points.map(p => {
        const cx = p.x * 100;
        const cy = p.y * 100;
        const isSel = p.id === selectedId;
        const color = p.type === 'clinic' ? '#3b82f6' : '#8b5cf6';
        const badge =
          p.status === 'visited'  ? '#16a373' :
          p.status === 'priority' ? '#ef4444' : null;
        return (
          <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(p.id)}>
            {isSel && <circle cx={cx} cy={cy} r="5" fill={color} fillOpacity="0.22"/>}
            <circle cx={cx} cy={cy} r={isSel ? 3.4 : 2.6} fill={color} stroke="#fff" strokeWidth="0.8"/>
            {badge && <circle cx={cx + 1.6} cy={cy - 1.6} r="0.9" fill={badge} stroke="#fff" strokeWidth="0.3"/>}
          </g>
        );
      })}
    </svg>
  );
}

function _TFMFilterSheet({ filter, onChange, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.36)',
        animation: 'tfmFadeIn 180ms ease-out',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px 18px',
        animation: 'tfmSheetUp 260ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '80%',
        overflowY: 'auto',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: '#e5e7eb',
          margin: '0 auto 14px',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>Filtros</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 15,
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
              <path d="M2 2l7 7M9 2l-7 7"/>
            </svg>
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#8a94a6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6, marginBottom: 8 }}>Tipo</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <_TFMToggleChip
            active={filter.showClinics}
            color="#3b82f6"
            label="Clínicas"
            onClick={() => onChange({ ...filter, showClinics: !filter.showClinics })}
          />
          <_TFMToggleChip
            active={filter.showDoctors}
            color="#8b5cf6"
            label="Médicos"
            onClick={() => onChange({ ...filter, showDoctors: !filter.showDoctors })}
          />
        </div>

        <div style={{ fontSize: 11, color: '#8a94a6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6, marginBottom: 8 }}>Status</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {[
            { key: 'all',      label: 'Todos',       color: '#0a2f7f' },
            { key: 'visited',  label: 'Visitado',    color: '#16a373' },
            { key: 'pending',  label: 'Pendente',    color: '#f59e0b' },
            { key: 'priority', label: 'Prioritário', color: '#ef4444' },
          ].map(s => {
            const active = filter.status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onChange({ ...filter, status: s.key })}
                style={{
                  padding: '8px 14px', borderRadius: 999,
                  border: `1px solid ${active ? s.color : '#eef0f3'}`,
                  background: active ? s.color : '#fff',
                  color: active ? '#fff' : '#0f1729',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '13px 16px',
            background: '#0a2f7f', color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

function _TFMToggleChip({ active, color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 14px',
        borderRadius: 12,
        border: `1.5px solid ${active ? color : '#eef0f3'}`,
        background: active ? `${color}10` : '#fff',
        color: active ? color : '#6b7280',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <div style={{
        width: 10, height: 10, borderRadius: 5,
        background: active ? color : '#d1d5db',
      }}/>
      {label}
    </button>
  );
}

Object.assign(window, { TerritoryFullMapScreen, TERRITORY_POINTS });
