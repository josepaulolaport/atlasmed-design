// ─────────────────────────────────────────────────────────────
// Clinic Selector — bottom sheet for picking a destination clinic
// during checkout. Tabs: Recentes / Todas. Search filters by name,
// address, or city.
// ─────────────────────────────────────────────────────────────

const MOCK_CLINICS_FOR_SELECTOR = [
  {
    id: 'c-0',
    name: 'Clínica Santa Mônica',
    address: 'R. Joaquim Floriano, 871 — Itaim Bibi',
    city: 'São Paulo',
    distance: 2.3,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '17 abr',
    lastOrderTs: 20260417,
    isRecent: true,
    hue: 218,
  },
  {
    id: 'c-14',
    name: 'Centro Médico OrtoVita',
    address: 'Av. Paulista, 1578 — Bela Vista',
    city: 'São Paulo',
    distance: 1.8,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '14 abr',
    lastOrderTs: 20260414,
    isRecent: true,
    hue: 148,
  },
  {
    id: 'c-27',
    name: 'Instituto CardioMed',
    address: 'R. Augusta, 2410 — Jardins',
    city: 'São Paulo',
    distance: 3.1,
    status: { label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
    lastOrder: '02 abr',
    lastOrderTs: 20260402,
    isRecent: true,
    hue: 38,
  },
  {
    id: 'c-31',
    name: 'Clínica Vida Plena',
    address: 'Av. Brig. Faria Lima, 3477 — Itaim Bibi',
    city: 'São Paulo',
    distance: 2.6,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '28 mar',
    lastOrderTs: 20260328,
    isRecent: true,
    hue: 280,
  },
  {
    id: 'c-44',
    name: 'Hospital Sírio-Libanês',
    address: 'R. Adma Jafet, 91 — Bela Vista',
    city: 'São Paulo',
    distance: 4.2,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '24 mar',
    lastOrderTs: 20260324,
    isRecent: true,
    hue: 12,
  },
  {
    id: 'c-58',
    name: 'Centro Ortopédico Pinheiros',
    address: 'R. dos Pinheiros, 1240 — Pinheiros',
    city: 'São Paulo',
    distance: 4.7,
    status: { label: 'Em risco', color: '#b84545', bg: 'rgba(184,69,69,0.12)' },
    isRecent: false,
    hue: 0,
  },
  {
    id: 'c-62',
    name: 'Clínica NeoSaúde Moema',
    address: 'Av. Ibirapuera, 2907 — Moema',
    city: 'São Paulo',
    distance: 5.4,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    isRecent: false,
    hue: 188,
  },
  {
    id: 'c-71',
    name: 'OrtoCenter Tatuapé',
    address: 'R. Tuiuti, 1980 — Tatuapé',
    city: 'São Paulo',
    distance: 8.9,
    status: { label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
    isRecent: false,
    hue: 248,
  },
  {
    id: 'c-83',
    name: 'Hospital Albert Einstein',
    address: 'Av. Albert Einstein, 627 — Morumbi',
    city: 'São Paulo',
    distance: 11.4,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    isRecent: false,
    hue: 218,
  },
  {
    id: 'c-90',
    name: 'Clínica São Lucas Granja',
    address: 'Rod. Raposo Tavares, km 22 — Granja Viana',
    city: 'Cotia',
    distance: 18.2,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    isRecent: false,
    hue: 72,
  },
  {
    id: 'c-94',
    name: 'Centro Médico Alphaville',
    address: 'Al. Mamoré, 511 — Alphaville',
    city: 'Barueri',
    distance: 22.5,
    status: { label: 'Sem interação', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    isRecent: false,
    hue: 108,
  },
  {
    id: 'c-101',
    name: 'Hospital Santa Catarina',
    address: 'Av. Paulista, 200 — Bela Vista',
    city: 'São Paulo',
    distance: 1.5,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    isRecent: false,
    hue: 322,
  },
  {
    id: 'c-112',
    name: 'Clínica OrthoLife Vila Olímpia',
    address: 'R. Funchal, 538 — Vila Olímpia',
    city: 'São Paulo',
    distance: 3.8,
    status: { label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
    isRecent: false,
    hue: 168,
  },
];

function ClinicMonogram({ name, hue }) {
  const initials = (name || '')
    .replace(/[^A-Za-zÀ-ú\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: `hsl(${hue || 218}, 38%, 92%)`,
      color: `hsl(${hue || 218}, 56%, 32%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
      border: `1px solid hsl(${hue || 218}, 38%, 86%)`,
    }}>{initials || '·'}</div>
  );
}

function ClinicSelectorSheet({ open, onClose, onSelect, preSelected = null, initialTab = 'recentes' }) {
  const [tab, setTab] = React.useState(initialTab);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setTab(initialTab);
      setSearchQuery('');
    }
  }, [open, initialTab]);

  if (!open) return null;

  const filtered = MOCK_CLINICS_FOR_SELECTOR
    .filter(c => {
      const matchTab = tab === 'recentes' ? c.isRecent : true;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q
        || c.name.toLowerCase().includes(q)
        || c.address.toLowerCase().includes(q)
        || c.city.toLowerCase().includes(q);
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      if (tab === 'recentes') return (b.lastOrderTs || 0) - (a.lastOrderTs || 0);
      return a.distance - b.distance;
    });

  const handleSelect = (clinic) => {
    if (onSelect) onSelect(clinic);
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,41,0.42)',
          animation: 'atlasFadeIn 200ms ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '85%',
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -12px 40px rgba(15,23,41,0.18)',
        animation: 'atlasSlideUp 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db' }}/>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 18px 12px',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3 }}>
              Selecionar clínica
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Para onde enviar este pedido
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 34, height: 34, borderRadius: 17,
              border: 'none', background: '#f1f3f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#374151',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{
            position: 'relative',
            background: '#f3f4f6', borderRadius: 12, height: 44,
            display: 'flex', alignItems: 'center', padding: '0 12px',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8a94a6" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5"/>
              <path d="M10.5 10.5L13 13"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar clínica, bairro…"
              style={{
                flex: 1, marginLeft: 10,
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: '#1f2937',
                fontFamily: 'Inter, system-ui',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                style={{
                  width: 22, height: 22, borderRadius: 11,
                  border: 'none', background: '#d1d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 18px 10px', display: 'flex', gap: 8 }}>
          {[
            { key: 'recentes', label: 'Recentes' },
            { key: 'todas',    label: 'Todas' },
          ].map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: active ? 'none' : '1px solid #e5ebf3',
                  background: active ? '#0a2f7f' : 'transparent',
                  color: active ? '#fff' : '#6b7280',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, system-ui',
                  letterSpacing: 0.1,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 24px' }}>
          {filtered.length === 0 ? (
            <ClinicSelectorEmpty searchQuery={searchQuery}/>
          ) : filtered.map(clinic => (
            <ClinicSelectorRow
              key={clinic.id}
              clinic={clinic}
              selected={preSelected?.id === clinic.id}
              onClick={() => handleSelect(clinic)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClinicSelectorRow({ clinic, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        background: selected ? 'rgba(10,47,127,0.05)' : 'transparent',
        border: selected ? '1px solid rgba(10,47,127,0.18)' : '1px solid transparent',
        borderRadius: 12, padding: '10px 8px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', fontFamily: 'Inter, system-ui',
        marginBottom: 2,
      }}
    >
      <ClinicMonogram name={clinic.name} hue={clinic.hue}/>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{clinic.name}</span>
        </div>
        <div style={{
          fontSize: 12, color: '#6b7280',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>{clinic.address}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 999,
            background: clinic.status.bg, color: clinic.status.color,
            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.1,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: 3, background: clinic.status.color,
            }}/>
            {clinic.status.label}
          </span>
          {clinic.lastOrder && (
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
              · Último pedido {clinic.lastOrder}
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        flexShrink: 0, gap: 4,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#374151',
          background: '#f3f4f6', padding: '3px 7px', borderRadius: 6,
        }}>{clinic.distance.toFixed(1)} km</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3l4 4-4 4"/>
        </svg>
      </div>
    </button>
  );
}

function ClinicSelectorEmpty({ searchQuery }) {
  return (
    <div style={{
      padding: '48px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32,
        background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9ca3af',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="8"/>
          <path d="M18 18l5 5"/>
        </svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
        Nenhuma clínica encontrada
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 220, lineHeight: 1.5 }}>
        {searchQuery
          ? `Não encontramos resultados para "${searchQuery}". Tente outra busca.`
          : 'Tente outra busca ou troque de aba.'}
      </div>
    </div>
  );
}

Object.assign(window, {
  ClinicSelectorSheet,
  MOCK_CLINICS_FOR_SELECTOR,
});
