// ─────────────────────────────────────────────────────────────
// NearbyClinicsScreen — full list of clinics near the rep's
// current location, sorted by distance. Opens from the
// "Ver todas" CTA on the Map screen's "Clínicas próximas".
// ─────────────────────────────────────────────────────────────

const NEARBY_CLINICS = [
  { id: 'nc-1',  name: 'Clínica São Lucas',          address: 'Av. Paulista, 1000',         neighborhood: 'Bela Vista',     distance: 0.5, walkMin: 7,  lastVisit: '2026-05-04', status: 'visited',  priority: 2, doctors: 12, openNow: true  },
  { id: 'nc-2',  name: 'Hospital Central',           address: 'Rua Augusta, 500',           neighborhood: 'Consolação',     distance: 1.2, walkMin: 16, lastVisit: null,         status: 'pending',  priority: 1, doctors: 28, openNow: true  },
  { id: 'nc-3',  name: 'Clínica Vida Plena',         address: 'Av. Rebouças, 300',          neighborhood: 'Pinheiros',      distance: 2.1, walkMin: 28, lastVisit: '2026-05-01', status: 'visited',  priority: 3, doctors: 8,  openNow: true  },
  { id: 'nc-4',  name: 'Hospital Sírio-Libanês',     address: 'Rua Adma Jafet, 91',         neighborhood: 'Bela Vista',     distance: 2.4, walkMin: 32, lastVisit: '2026-04-28', status: 'visited',  priority: 2, doctors: 64, openNow: true  },
  { id: 'nc-5',  name: 'Clínica Santa Mônica',       address: 'R. Pinheiros, 410',          neighborhood: 'Pinheiros',      distance: 3.2, walkMin: 42, lastVisit: null,         status: 'priority', priority: 1, doctors: 14, openNow: false },
  { id: 'nc-6',  name: 'Centro Médico Bela Vista',   address: 'Av. 9 de Julho, 1500',       neighborhood: 'Bela Vista',     distance: 3.8, walkMin: 48, lastVisit: '2026-04-22', status: 'visited',  priority: 3, doctors: 22, openNow: true  },
  { id: 'nc-7',  name: 'Clínica Jardim Europa',      address: 'R. Haddock Lobo, 220',       neighborhood: 'Jardins',        distance: 4.1, walkMin: 52, lastVisit: null,         status: 'pending',  priority: 2, doctors: 9,  openNow: true  },
  { id: 'nc-8',  name: 'Hospital Albert Einstein',   address: 'Av. Albert Einstein, 627',   neighborhood: 'Morumbi',        distance: 6.5, walkMin: 84, lastVisit: '2026-05-06', status: 'visited',  priority: 1, doctors: 102, openNow: true  },
  { id: 'nc-9',  name: 'Clínica Pinheiros',          address: 'R. dos Pinheiros, 870',      neighborhood: 'Pinheiros',      distance: 2.8, walkMin: 36, lastVisit: null,         status: 'priority', priority: 1, doctors: 11, openNow: true  },
  { id: 'nc-10', name: 'Clínica Vila Olímpia',       address: 'R. Funchal, 263',            neighborhood: 'Vila Olímpia',   distance: 5.2, walkMin: 64, lastVisit: '2026-04-18', status: 'visited',  priority: 3, doctors: 16, openNow: true  },
  { id: 'nc-11', name: 'Hospital São Camilo',        address: 'R. Pompeia, 144',            neighborhood: 'Pompeia',        distance: 4.8, walkMin: 60, lastVisit: null,         status: 'pending',  priority: 2, doctors: 38, openNow: true  },
  { id: 'nc-12', name: 'Clínica Itaim',              address: 'R. Joaquim Floriano, 100',   neighborhood: 'Itaim Bibi',     distance: 4.4, walkMin: 56, lastVisit: '2026-05-02', status: 'visited',  priority: 2, doctors: 19, openNow: false },
  { id: 'nc-13', name: 'Clínica Higienópolis',       address: 'Av. Higienópolis, 880',      neighborhood: 'Higienópolis',   distance: 3.5, walkMin: 45, lastVisit: '2026-04-30', status: 'visited',  priority: 3, doctors: 7,  openNow: true  },
  { id: 'nc-14', name: 'Hospital 9 de Julho',        address: 'R. Peixoto Gomide, 625',     neighborhood: 'Cerqueira César',distance: 1.8, walkMin: 24, lastVisit: null,         status: 'priority', priority: 1, doctors: 45, openNow: true  },
  { id: 'nc-15', name: 'Clínica Moema',              address: 'Av. Ibirapuera, 2030',       neighborhood: 'Moema',          distance: 7.2, walkMin: 92, lastVisit: null,         status: 'pending',  priority: 2, doctors: 13, openNow: true  },
  { id: 'nc-16', name: 'Hospital Beneficência Portuguesa', address: 'R. Maestro Cardim, 769', neighborhood: 'Bela Vista',  distance: 2.6, walkMin: 34, lastVisit: '2026-04-20', status: 'visited',  priority: 2, doctors: 78, openNow: true  },
  { id: 'nc-17', name: 'Clínica Vila Nova',          address: 'R. José Maria Lisboa, 600',  neighborhood: 'Jardim Paulista', distance: 3.1, walkMin: 40, lastVisit: null,         status: 'priority', priority: 1, doctors: 5,  openNow: false },
  { id: 'nc-18', name: 'Clínica Brigadeiro',         address: 'Av. Brig. Luís Antônio, 4250', neighborhood: 'Jardim Paulista', distance: 2.9, walkMin: 38, lastVisit: '2026-04-25', status: 'visited',  priority: 3, doctors: 10, openNow: true  },
];

function _ncRelativeTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date('2026-05-07');
  const diff = Math.floor((now - d) / 86400000);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7)   return `há ${diff} dias`;
  return `há ${Math.floor(diff/7)} sem.`;
}

function NearbyClinicsScreen({
  onBack = () => {},
  initialFilter = 'all',
  initialQuery = '',
  initialSort = 'distance',
}) {
  const [filter, setFilter]       = React.useState(initialFilter);
  const [searchQuery, setSearch]  = React.useState(initialQuery);
  const [sort, setSort]           = React.useState(initialSort);
  const [refreshing, setRefreshing] = React.useState(false);

  const filtered = React.useMemo(() => {
    let result = [...NEARBY_CLINICS];
    if (filter === 'visited')  result = result.filter(c => c.status === 'visited');
    if (filter === 'pending')  result = result.filter(c => c.status === 'pending');
    if (filter === 'priority') result = result.filter(c => c.priority === 1);
    if (filter === 'open')     result = result.filter(c => c.openNow);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q)
      );
    }
    if (sort === 'distance')      result.sort((a, b) => a.distance - b.distance);
    else if (sort === 'priority') result.sort((a, b) => a.priority - b.priority);
    else if (sort === 'name')     result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'recent')   result.sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0));
    return result;
  }, [filter, searchQuery, sort]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  };

  const filterCounts = {
    all:      NEARBY_CLINICS.length,
    visited:  NEARBY_CLINICS.filter(c => c.status === 'visited').length,
    pending:  NEARBY_CLINICS.filter(c => c.status === 'pending').length,
    priority: NEARBY_CLINICS.filter(c => c.priority === 1).length,
    open:     NEARBY_CLINICS.filter(c => c.openNow).length,
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Voltar" style={_ncIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Mapa
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2 }}>
            Clínicas próximas
          </div>
        </div>
        <button
          onClick={() => setSort(sort === 'distance' ? 'priority' : 'distance')}
          aria-label="Ordenar"
          style={_ncIconBtn}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h10M5 8h6M7 12h2"/>
          </svg>
        </button>
      </div>

      {/* Location card */}
      <div style={{
        padding: '12px 16px', background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#eef2ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 16s5-4 5-8.5a5 5 0 1 0-10 0c0 4.5 5 8.5 5 8.5z"/>
            <circle cx="9" cy="7" r="2"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#8a94a6', fontWeight: 600, marginBottom: 2 }}>
            Sua localização
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1729', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Av. Paulista, 1500 · Bela Vista
          </div>
        </div>
        <button
          onClick={handleRefresh}
          aria-label="Atualizar localização"
          style={{
            width: 36, height: 36, borderRadius: 11,
            border: '1px solid #eef0f3', background: '#fff',
            cursor: refreshing ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a2f7f',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{
            animation: refreshing ? 'ncSpin 0.8s linear infinite' : 'none',
            transformOrigin: 'center',
          }}>
            <path d="M14 5a6 6 0 1 0 0 6"/>
            <path d="M14 2v3h-3"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div style={{
        padding: '12px 16px 8px', background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#f7f8fb', border: '1px solid #eef0f3',
          borderRadius: 12, padding: '9px 12px',
        }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="#8a94a6" strokeWidth="1.7">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clínica ou bairro…"
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
      </div>

      {/* Filter pills */}
      <div style={{
        padding: '10px 16px 12px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', gap: 6, overflowX: 'auto',
        flexShrink: 0,
      }}>
        {[
          { key: 'all',      label: 'Todas' },
          { key: 'priority', label: 'Prioritárias' },
          { key: 'pending',  label: 'Pendentes' },
          { key: 'visited',  label: 'Visitadas' },
          { key: 'open',     label: 'Abertas agora' },
        ].map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 11px', borderRadius: 999,
                border: `1px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
                background: active ? '#0a2f7f' : '#fff',
                color: active ? '#fff' : '#374151',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                flexShrink: 0, whiteSpace: 'nowrap',
              }}
            >
              {f.label}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px',
                borderRadius: 6,
                background: active ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
                color: active ? '#fff' : '#6b7280', lineHeight: 1.2,
              }}>{filterCounts[f.key]}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        <div style={{ fontSize: 12, color: '#8a94a6', fontWeight: 500, marginBottom: 10 }}>
          {filtered.length} {filtered.length === 1 ? 'clínica' : 'clínicas'} · ordenado por {sort === 'distance' ? 'distância' : sort === 'priority' ? 'prioridade' : sort === 'name' ? 'nome' : 'visita recente'}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 40, color: '#9ca3af' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 30, background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M11 20s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z"/>
                <circle cx="11" cy="8" r="3"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', marginBottom: 4 }}>
              Nenhuma clínica encontrada
            </div>
            <div style={{ fontSize: 12 }}>Ajuste os filtros ou a busca.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => <_NearbyCard key={c.id} clinic={c}/>)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ncSpin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

function _NearbyCard({ clinic }) {
  const isPriority = clinic.priority === 1;
  return (
    <div style={{
      padding: 14,
      background: '#fff',
      border: '1px solid #eef0f3',
      borderRadius: 14,
      cursor: 'pointer',
      transition: 'transform 120ms, box-shadow 120ms',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,41,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: isPriority ? '#fee2e2' : '#dbeafe',
          color: isPriority ? '#b91c1c' : '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          🏥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <div style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {clinic.name}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#0a2f7f',
              fontVariantNumeric: 'tabular-nums', flexShrink: 0,
            }}>
              {clinic.distance.toFixed(1)} km
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
            {clinic.address} · {clinic.neighborhood}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {isPriority && (
              <_NCChip color="#ef4444" bg="#fee2e2" label="Prioridade alta"/>
            )}
            {clinic.lastVisit ? (
              <_NCChip color="#0f7c5a" bg="#e7f6ef" label={`Visitado ${_ncRelativeTime(clinic.lastVisit)}`}/>
            ) : (
              <_NCChip color="#a85a05" bg="#fef3e1" label="Nunca visitado"/>
            )}
            <_NCChip color={clinic.openNow ? '#0f7c5a' : '#6b7280'} bg={clinic.openNow ? '#e7f6ef' : '#f3f4f6'} label={clinic.openNow ? 'Aberto agora' : 'Fechado'}/>
            <_NCChip color="#6b7280" bg="#f3f4f6" label={`${clinic.doctors} médicos`}/>
          </div>
        </div>
      </div>

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
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.5l9-4-3.5 9-1-3.5L2 6.5z"/>
          </svg>
          Rota · {clinic.walkMin} min
        </button>
      </div>
    </div>
  );
}

function _NCChip({ color, bg, label }) {
  return (
    <span style={{
      padding: '3px 8px', borderRadius: 7,
      background: bg, color,
      fontSize: 10.5, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

const _ncIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

Object.assign(window, { NearbyClinicsScreen, NEARBY_CLINICS });
