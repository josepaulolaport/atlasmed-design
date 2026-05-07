// ─────────────────────────────────────────────────────────────
// Doctor Selector — bottom sheet for picking the prescribing
// doctor at the previously selected clinic. Filters its list by
// the clinic ID passed in.
// ─────────────────────────────────────────────────────────────

const MOCK_DOCTORS_FOR_SELECTOR = [
  {
    id: 'd-0',  name: 'Dra. Mariana Silva',     initials: 'MS', hue: 12,
    specialty: 'Ortopedia',     crm: 'CRM/SP 142.801',
    clinics: ['c-0', 'c-14'], role: 'Decisora',
  },
  {
    id: 'd-1',  name: 'Dr. Paulo Cardoso',      initials: 'PC', hue: 150,
    specialty: 'Cardiologia',   crm: 'CRM/SP 087.211',
    clinics: ['c-0', 'c-27'],
  },
  {
    id: 'd-2',  name: 'Dra. Helena Ferreira',   initials: 'HF', hue: 280,
    specialty: 'Ortopedia',     crm: 'CRM/SP 198.442',
    clinics: ['c-0', 'c-14'], role: 'Influenciadora',
  },
  {
    id: 'd-3',  name: 'Dr. Eduardo Moraes',     initials: 'EM', hue: 38,
    specialty: 'Reumatologia',  crm: 'CRM/SP 074.110',
    clinics: ['c-0'],
  },
  {
    id: 'd-4',  name: 'Dra. Carolina Albuquerque', initials: 'CA', hue: 218,
    specialty: 'Fisiatria',     crm: 'CRM/SP 211.802',
    clinics: ['c-0', 'c-31'],
  },
  {
    id: 'd-5',  name: 'Dr. Bruno Tavares',      initials: 'BT', hue: 0,
    specialty: 'Ortopedia · joelho', crm: 'CRM/SP 156.770',
    clinics: ['c-14', 'c-44'], role: 'Decisor',
  },
  {
    id: 'd-6',  name: 'Dra. Renata Sá',         initials: 'RS', hue: 188,
    specialty: 'Cardiologia',   crm: 'CRM/SP 112.045',
    clinics: ['c-14'],
  },
  {
    id: 'd-7',  name: 'Dr. Gustavo Lima',       initials: 'GL', hue: 248,
    specialty: 'Clínico geral', crm: 'CRM/SP 099.318',
    clinics: ['c-14', 'c-27', 'c-31'],
  },
  {
    id: 'd-8',  name: 'Dra. Patrícia Nunes',    initials: 'PN', hue: 322,
    specialty: 'Reumatologia',  crm: 'CRM/SP 230.115',
    clinics: ['c-27'],
  },
  {
    id: 'd-9',  name: 'Dr. Lucas Pereira',      initials: 'LP', hue: 108,
    specialty: 'Ortopedia · coluna', crm: 'CRM/SP 168.992',
    clinics: ['c-31', 'c-44'],
  },
  {
    id: 'd-10', name: 'Dra. Ana Beatriz Rios',  initials: 'AR', hue: 72,
    specialty: 'Geriatria',     crm: 'CRM/SP 145.501',
    clinics: ['c-31'],
  },
  {
    id: 'd-11', name: 'Dr. Felipe Andrade',     initials: 'FA', hue: 168,
    specialty: 'Ortopedia · pé', crm: 'CRM/SP 187.330',
    clinics: ['c-44'],
  },
  {
    id: 'd-12', name: 'Dra. Beatriz Costa',     initials: 'BC', hue: 322,
    specialty: 'Cardiologia',   crm: 'CRM/SP 172.901',
    clinics: ['c-44', 'c-101'],
  },
];

function DoctorAvatar({ initials, hue, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0,
      background: `hsl(${hue}, 64%, 58%)`,
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size / 3.2, fontWeight: 700, letterSpacing: -0.2,
      boxShadow: `inset 0 -2px 6px hsla(${hue}, 64%, 32%, 0.45)`,
    }}>{initials}</div>
  );
}

function DoctorSelectorSheet({ open, onClose, onSelect, selectedClinic, preSelected = null }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (open) setSearchQuery('');
  }, [open]);

  if (!open) return null;

  const clinicId = selectedClinic?.id;
  const clinicDoctors = clinicId
    ? MOCK_DOCTORS_FOR_SELECTOR.filter(d => d.clinics.includes(clinicId))
    : MOCK_DOCTORS_FOR_SELECTOR;

  const q = searchQuery.trim().toLowerCase();
  const filtered = clinicDoctors
    .filter(d => !q
      || d.name.toLowerCase().includes(q)
      || d.specialty.toLowerCase().includes(q)
      || d.crm.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const handleSelect = (doctor) => {
    if (onSelect) onSelect(doctor);
    if (onClose) onClose();
  };

  const isClinicEmpty = clinicDoctors.length === 0;
  const isSearchEmpty = !isClinicEmpty && filtered.length === 0;

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
        height: '75%',
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
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3 }}>
              Selecionar médico
            </div>
            <div style={{
              fontSize: 12, color: '#6b7280', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {selectedClinic?.name || 'Clínica não selecionada'}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 34, height: 34, borderRadius: 17,
              border: 'none', background: '#f1f3f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#374151', flexShrink: 0,
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
              placeholder="Buscar médico, especialidade…"
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

        {/* Count */}
        {!isClinicEmpty && !isSearchEmpty && (
          <div style={{
            padding: '0 22px 8px', fontSize: 11, fontWeight: 600,
            color: '#8a94a6', letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {filtered.length} {filtered.length === 1 ? 'médico' : 'médicos'} {selectedClinic?.name ? 'nesta clínica' : 'cadastrados'}
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
          {isClinicEmpty ? (
            <DoctorSelectorEmptyClinic clinic={selectedClinic}/>
          ) : isSearchEmpty ? (
            <DoctorSelectorEmptySearch searchQuery={searchQuery}/>
          ) : filtered.map(doctor => (
            <DoctorSelectorRow
              key={doctor.id}
              doctor={doctor}
              selected={preSelected?.id === doctor.id}
              onClick={() => handleSelect(doctor)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorSelectorRow({ doctor, selected, onClick }) {
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
      <DoctorAvatar initials={doctor.initials} hue={doctor.hue}/>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{doctor.name}</span>
          {doctor.role && (
            <span style={{
              padding: '1px 7px', borderRadius: 999,
              background: 'rgba(30,64,175,0.10)', color: '#1e40af',
              fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
              flexShrink: 0,
            }}>{doctor.role}</span>
          )}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: '#1e40af',
          marginBottom: 2,
        }}>{doctor.specialty}</div>
        <div style={{
          fontSize: 11, color: '#9ca3af',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
        }}>{doctor.crm}</div>
      </div>

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3l4 4-4 4"/>
      </svg>
    </button>
  );
}

function DoctorSelectorEmptyClinic({ clinic }) {
  return (
    <div style={{
      padding: '40px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32,
        background: '#eef2ff', color: '#1e40af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="14" cy="10" r="4"/>
          <path d="M6 22c1.5-4 5-6 8-6s6.5 2 8 6"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
          Nenhum médico cadastrado nesta clínica
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 240, lineHeight: 1.5 }}>
          {clinic?.name && `Ainda não temos médicos vinculados a ${clinic.name}.`}
        </div>
      </div>
      <button style={{
        padding: '10px 18px', borderRadius: 12,
        background: '#0a2f7f', color: '#fff', border: 'none',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Inter, system-ui',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M7 2v10M2 7h10"/>
        </svg>
        Adicionar médico
      </button>
    </div>
  );
}

function DoctorSelectorEmptySearch({ searchQuery }) {
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
        Nenhum médico encontrado
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 220, lineHeight: 1.5 }}>
        Não encontramos resultados para "{searchQuery}". Tente outra busca.
      </div>
    </div>
  );
}

Object.assign(window, {
  DoctorSelectorSheet,
  MOCK_DOCTORS_FOR_SELECTOR,
});
