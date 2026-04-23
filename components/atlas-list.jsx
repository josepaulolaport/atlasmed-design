// ListScreen — unified list for clinics & doctors.
// Structure:
//   [Header: brand bar + tab toggle]
//   [Fixed search + filter button + sort chip]
//   [Active filters chip row (animated in when filters apply)]
//   [Infinite-scroll list, shimmer skeletons on load]
//   [FilterSheet — bottom sheet, animated]
//   [SortSheet — bottom sheet]

// ─────────────────────────────────────────────────────────────
// StatusChip
// ─────────────────────────────────────────────────────────────
function StatusChip({ status, label, color, bg, small = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '2px 8px' : '3px 9px',
      borderRadius: 999,
      background: bg, color,
      fontSize: small ? 10.5 : 11, fontWeight: 600,
      fontFamily: 'Inter, system-ui',
      letterSpacing: 0.1, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color }}/>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// ClinicRow
// ─────────────────────────────────────────────────────────────
function ClinicRow({ clinic, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none', background: 'transparent',
      padding: '14px 20px', textAlign: 'left', cursor: 'pointer',
      borderBottom: '1px solid #eef0f3',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      fontFamily: 'Inter, system-ui',
      transition: 'background 140ms',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f9fc')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {/* Clinic glyph */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'linear-gradient(135deg, #dbeafe, #eef4ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1e40af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="16" height="14" rx="2"/>
          <path d="M11 8v6M8 11h6"/>
          <path d="M7 5V3h8v2"/>
        </svg>
        {clinic.priority && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 14, height: 14, borderRadius: 7,
            background: '#e11d48',
            border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2" fill="#fff"/></svg>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 15, fontWeight: 600, color: '#0f1729',
            letterSpacing: -0.15, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>{clinic.name}</span>
          <span style={{
            fontSize: 11.5, color: '#6b7280', fontWeight: 500, flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}>{clinic.distance} km</span>
        </div>
        <div style={{
          fontSize: 12.5, color: '#6b7280', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5.5 10s3.5-3 3.5-6a3.5 3.5 0 00-7 0c0 3 3.5 6 3.5 6z"/><circle cx="5.5" cy="4" r="1.2"/></svg>
          {clinic.city}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusChip label={clinic.statusLabel} color={clinic.statusColor} bg={clinic.statusBg} small/>
          <span style={{ fontSize: 11.5, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v2.5l1.8 1"/></svg>
            {formatLastVisit(clinic.lastVisitDays)}
          </span>
          <span style={{ fontSize: 11.5, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="3.8" r="1.8"/><path d="M2 9.5c.7-1.6 2-2.5 3.5-2.5s2.8.9 3.5 2.5"/></svg>
            {clinic.doctorCount} {clinic.doctorCount === 1 ? 'médico' : 'médicos'}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// DoctorRow
// ─────────────────────────────────────────────────────────────
function DoctorRow({ doctor, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none', background: 'transparent',
      padding: '14px 20px', textAlign: 'left', cursor: 'pointer',
      borderBottom: '1px solid #eef0f3',
      display: 'flex', gap: 12, alignItems: 'center',
      fontFamily: 'Inter, system-ui',
      transition: 'background 140ms',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f9fc')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: `hsl(${doctor.hue}, 48%, 88%)`,
        color: `hsl(${doctor.hue}, 55%, 32%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 700,
        flexShrink: 0, position: 'relative',
      }}>
        {doctor.initials}
        {doctor.priority && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 12, height: 12, borderRadius: 6,
            background: '#e11d48', border: '2px solid #fff',
          }}/>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontSize: 15, fontWeight: 600, color: '#0f1729',
            letterSpacing: -0.15, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>{doctor.name}</span>
          <span style={{
            fontSize: 11.5, color: '#6b7280', fontWeight: 500, flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}>{doctor.distance} km</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#1e40af', fontWeight: 500, marginBottom: 3 }}>
          {doctor.specialty}
        </div>
        <div style={{ fontSize: 11.5, color: '#6b7280', display: 'flex', gap: 10 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doctor.clinic}</span>
          <span>·</span>
          <span style={{ flexShrink: 0 }}>{doctor.crm}</span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Shimmer skeleton row
// ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{
      padding: '14px 20px', display: 'flex', gap: 12,
      borderBottom: '1px solid #eef0f3',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(90deg, #eef0f3, #f7f9fc, #eef0f3)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
        <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'linear-gradient(90deg, #eef0f3, #f7f9fc, #eef0f3)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
        <div style={{ width: '40%', height: 10, borderRadius: 4, background: 'linear-gradient(90deg, #eef0f3, #f7f9fc, #eef0f3)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
        <div style={{ width: '80%', height: 10, borderRadius: 4, background: 'linear-gradient(90deg, #eef0f3, #f7f9fc, #eef0f3)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TabToggle — Clínicas / Médicos
// ─────────────────────────────────────────────────────────────
function TabToggle({ value, onChange, counts }) {
  const opts = [
    { k: 'clinic', label: 'Clínicas', count: counts.clinic },
    { k: 'doctor', label: 'Médicos', count: counts.doctor },
  ];
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #eef0f3',
      position: 'relative',
      padding: '0 20px',
    }}>
      {opts.map(o => {
        const on = value === o.k;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            position: 'relative',
            border: 'none', background: 'transparent',
            padding: '12px 0',
            marginRight: 24,
            fontSize: 14, fontWeight: 600,
            color: on ? '#0a2f7f' : '#9ca3af',
            cursor: 'pointer', fontFamily: 'Inter, system-ui',
            transition: 'color 200ms',
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            {o.label}
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              padding: '1px 6px', borderRadius: 999,
              background: on ? '#eef2ff' : '#f3f4f6',
              color: on ? '#0a2f7f' : '#9ca3af',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 22, textAlign: 'center',
              transition: 'all 200ms',
            }}>{o.count}</span>
            {on && (
              <span style={{
                position: 'absolute', left: 0, right: 0, bottom: -1,
                height: 2, background: '#0a2f7f',
                borderRadius: '2px 2px 0 0',
                animation: 'tabIn 260ms cubic-bezier(.2,.8,.2,1)',
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onFilter, filterCount = 0, placeholder }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{
        flex: 1, height: 44, borderRadius: 12,
        background: '#fff',
        border: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 14, fontFamily: 'Inter, system-ui',
            color: '#0f1729', background: 'transparent',
          }}
        />
        {value && (
          <button onClick={() => onChange('')} style={{
            width: 20, height: 20, borderRadius: 10, border: 'none',
            background: '#e5e7eb', color: '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
      <button onClick={onFilter} style={{
        width: 44, height: 44, borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: filterCount > 0 ? '#1e40af' : '#fff',
        color: filterCount > 0 ? '#fff' : '#1e40af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'all 180ms',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h14M4 9h10M7 14h4"/>
        </svg>
        {filterCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
            background: '#e11d48', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, system-ui',
            border: '1.5px solid #0a2f7f',
          }}>{filterCount}</span>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SortChipRow — shows active sort below search bar
// ─────────────────────────────────────────────────────────────
function SortRow({ sort, onSort, onToggleFilter, filterChips, onRemoveChip }) {
  const sortLabels = {
    'name-asc': 'Nome A–Z',
    'distance': 'Mais próximos',
    'oldest-visit': 'Sem visita há mais tempo',
    'last-contact': 'Sem contato há mais tempo',
  };
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', padding: '0 20px 2px',
      scrollbarWidth: 'none',
    }}>
      <button onClick={onSort} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 10px', borderRadius: 999,
        background: '#fff', border: '1px solid #e5e7eb',
        fontSize: 12, fontWeight: 500, color: '#0f1729',
        fontFamily: 'Inter, system-ui',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 2v8M3 10l-2-2M3 10l2-2M9 10V2M9 2L7 4M9 2l2 2"/></svg>
        {sortLabels[sort]}
      </button>
      {filterChips.map(chip => (
        <button key={chip.key} onClick={() => onRemoveChip(chip)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', borderRadius: 999,
          background: '#eef2ff', border: '1px solid #c7d2fe',
          fontSize: 12, fontWeight: 500, color: '#1e3a8a',
          fontFamily: 'Inter, system-ui',
          cursor: 'pointer', flexShrink: 0,
          animation: 'slideUp 300ms cubic-bezier(.2,.8,.2,1)',
        }}>
          {chip.label}
          <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomSheet — generic
// ─────────────────────────────────────────────────────────────
function BottomSheet({ open, onClose, title, children, height = 'auto' }) {
  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!mounted) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 40,
        background: 'rgba(15, 23, 41, 0.5)',
        backdropFilter: 'blur(2px)',
        opacity: open ? 1 : 0,
        transition: 'opacity 280ms ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        background: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 28px',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.2)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '80%', overflowY: 'auto',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#d1d5db', margin: '0 auto 16px',
        }}/>
        {title && (
          <div style={{
            padding: '0 24px 12px',
            fontSize: 17, fontWeight: 700, color: '#0f1729',
            fontFamily: 'Inter, system-ui', letterSpacing: -0.2,
          }}>{title}</div>
        )}
        {children}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterSheet
// ─────────────────────────────────────────────────────────────
function FilterSheet({ open, onClose, kind, filters, setFilters }) {
  const [local, setLocal] = React.useState(filters);
  React.useEffect(() => { if (open) setLocal(filters); }, [open]);
  const toggle = (key, val) => {
    setLocal(l => {
      const arr = l[key] || [];
      const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
      return { ...l, [key]: next };
    });
  };
  const apply = () => { setFilters(local); onClose(); };
  const clear = () => setLocal({ status: [], products: [] });

  const count = (local.status?.length || 0) + (local.products?.length || 0);

  return (
    <BottomSheet open={open} onClose={onClose} title="Filtros">
      {kind === 'clinic' && (
        <>
          <div style={{ padding: '8px 24px 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', fontFamily: 'Inter, system-ui' }}>Status</div>
          <div style={{ padding: '8px 24px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATUSES.map(s => {
              const on = (local.status || []).includes(s.key);
              return (
                <button key={s.key} onClick={() => toggle('status', s.key)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 10,
                  background: on ? s.bg : '#f3f4f6',
                  border: `1px solid ${on ? s.color : 'transparent'}`,
                  color: on ? s.color : '#374151',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'Inter, system-ui', cursor: 'pointer',
                  transition: 'all 160ms',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: s.color }}/>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '8px 24px 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', fontFamily: 'Inter, system-ui' }}>Produto em uso</div>
          <div style={{ padding: '8px 24px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRODUCTS.map(p => {
              const on = (local.products || []).includes(p);
              return (
                <button key={p} onClick={() => toggle('products', p)} style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: on ? '#1e40af' : '#f3f4f6',
                  border: `1px solid ${on ? '#1e40af' : 'transparent'}`,
                  color: on ? '#fff' : '#374151',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'Inter, system-ui', cursor: 'pointer',
                  transition: 'all 160ms',
                }}>{p}</button>
              );
            })}
          </div>
        </>
      )}

      {kind === 'doctor' && (
        <>
          <div style={{ padding: '8px 24px 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', fontFamily: 'Inter, system-ui' }}>Especialidade</div>
          <div style={{ padding: '8px 24px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Cardiologia','Ortopedia','Dermatologia','Pediatria','Ginecologia','Neurologia','Endocrinologia'].map(s => {
              const on = (local.specialties || []).includes(s);
              return (
                <button key={s} onClick={() => toggle('specialties', s)} style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: on ? '#1e40af' : '#f3f4f6',
                  border: `1px solid ${on ? '#1e40af' : 'transparent'}`,
                  color: on ? '#fff' : '#374151',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'Inter, system-ui', cursor: 'pointer',
                }}>{s}</button>
              );
            })}
          </div>
        </>
      )}

      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10, borderTop: '1px solid #eef0f3' }}>
        <button onClick={clear} style={{
          flex: 1, height: 46, borderRadius: 12, border: '1px solid #e5e7eb',
          background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600,
          fontFamily: 'Inter, system-ui', cursor: 'pointer',
        }}>Limpar</button>
        <button onClick={apply} style={{
          flex: 2, height: 46, borderRadius: 12, border: 'none',
          background: '#1e40af', color: '#fff', fontSize: 14, fontWeight: 600,
          fontFamily: 'Inter, system-ui', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(30,64,175,0.3)',
        }}>Aplicar {count > 0 && `(${count})`}</button>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// SortSheet
// ─────────────────────────────────────────────────────────────
function SortSheet({ open, onClose, kind, sort, setSort }) {
  const opts = kind === 'clinic' ? [
    { k: 'name-asc', label: 'Nome A–Z', sub: 'Ordem alfabética' },
    { k: 'distance', label: 'Mais próximos', sub: 'Menor distância primeiro' },
    { k: 'oldest-visit', label: 'Sem visita há mais tempo', sub: 'Priorize clínicas ativas sem atenção' },
  ] : [
    { k: 'name-asc', label: 'Nome A–Z', sub: 'Ordem alfabética' },
    { k: 'distance', label: 'Mais próximos', sub: 'Menor distância primeiro' },
    { k: 'last-contact', label: 'Sem contato há mais tempo', sub: 'Retome relacionamentos' },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="Ordenar por">
      <div style={{ padding: '4px 12px 0' }}>
        {opts.map(o => (
          <button key={o.k} onClick={() => { setSort(o.k); onClose(); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12,
            border: 'none', background: sort === o.k ? '#eef2ff' : 'transparent',
            cursor: 'pointer', textAlign: 'left', marginBottom: 4,
            fontFamily: 'Inter, system-ui',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              border: `2px solid ${sort === o.k ? '#1e40af' : '#d1d5db'}`,
              background: sort === o.k ? '#1e40af' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 160ms',
            }}>
              {sort === o.k && <div style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729' }}>{o.label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{o.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// ListScreen — main export
// ─────────────────────────────────────────────────────────────
function ListScreen({ initialKind = 'clinic', initialFilterOpen = false, initialSortOpen = false, initialQuery = '', initialFilters = null, initialSort = null }) {
  const [kind, setKind] = React.useState(initialKind);
  const [query, setQuery] = React.useState(initialQuery);
  const [filters, setFilters] = React.useState({
    clinic: initialFilters && initialKind === 'clinic' ? initialFilters : { status: [], products: [] },
    doctor: initialFilters && initialKind === 'doctor' ? initialFilters : { specialties: [] },
  });
  const [sort, setSort] = React.useState({
    clinic: initialKind === 'clinic' && initialSort ? initialSort : 'distance',
    doctor: initialKind === 'doctor' && initialSort ? initialSort : 'distance',
  });
  const [filterOpen, setFilterOpen] = React.useState(initialFilterOpen);
  const [sortOpen, setSortOpen] = React.useState(initialSortOpen);
  const [visible, setVisible] = React.useState(12);
  const [loadingMore, setLoadingMore] = React.useState(false);

  React.useEffect(() => { setVisible(12); }, [kind, query, filters, sort]);

  const all = kind === 'clinic' ? CLINICS_ALL : DOCTORS_ALL;
  const f = filters[kind];
  const s = sort[kind];
  const q = query.trim().toLowerCase();

  const filtered = all.filter(item => {
    if (q) {
      const hay = kind === 'clinic'
        ? `${item.name} ${item.city}`.toLowerCase()
        : `${item.name} ${item.specialty} ${item.clinic}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (kind === 'clinic') {
      if (f.status?.length && !f.status.includes(item.status)) return false;
      if (f.products?.length && !f.products.some(p => item.products.includes(p))) return false;
    } else {
      if (f.specialties?.length && !f.specialties.includes(item.specialty)) return false;
    }
    return true;
  });

  const sorted = filtered.slice().sort((a, b) => {
    if (s === 'name-asc') return a.name.localeCompare(b.name);
    if (s === 'distance') return a.distance - b.distance;
    if (s === 'oldest-visit') return (b.lastVisitDays ?? 9999) - (a.lastVisitDays ?? 9999);
    if (s === 'last-contact') return (b.lastContactDays ?? 0) - (a.lastContactDays ?? 0);
    return 0;
  });

  const displayed = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  const scrollRef = React.useRef(null);
  const sentinelRef = React.useRef(null);
  React.useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisible(v => v + 10);
          setLoadingMore(false);
        }, 600);
      }
    }, { root: scrollRef.current, threshold: 0.1 });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, loadingMore, displayed.length]);

  // Build chip list for active filters
  const chips = [];
  if (kind === 'clinic') {
    (f.status || []).forEach(k => {
      const st = STATUSES.find(s => s.key === k);
      if (st) chips.push({ key: `s-${k}`, label: st.label, onRemove: () => setFilters(F => ({ ...F, clinic: { ...F.clinic, status: F.clinic.status.filter(x => x !== k) } })) });
    });
    (f.products || []).forEach(p => {
      chips.push({ key: `p-${p}`, label: p, onRemove: () => setFilters(F => ({ ...F, clinic: { ...F.clinic, products: F.clinic.products.filter(x => x !== p) } })) });
    });
  } else {
    (f.specialties || []).forEach(sp => {
      chips.push({ key: `sp-${sp}`, label: sp, onRemove: () => setFilters(F => ({ ...F, doctor: { ...F.doctor, specialties: F.doctor.specialties.filter(x => x !== sp) } })) });
    });
  }

  const filterCount = chips.length;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: '#fff',
      fontFamily: 'Inter, system-ui',
    }}>
      <AtlasTopBar page="Explorar" active="explorar"/>

      {/* Header — clean white, title only */}
      <div style={{
        padding: '12px 20px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff',
      }}>
        <div style={{
          fontSize: 22, fontWeight: 700,
          letterSpacing: -0.5, color: '#0f1729',
        }}>Explorar</div>
      </div>

      {/* Search — directly below title, breathing room */}
      <div style={{ padding: '2px 20px 12px', background: '#fff' }}>
        <SearchBar
          value={query} onChange={setQuery}
          onFilter={() => setFilterOpen(true)}
          filterCount={filterCount}
          placeholder={kind === 'clinic' ? 'Buscar clínica, bairro…' : 'Buscar médico, especialidade…'}
        />
      </div>

      {/* Tabs — subtle underline style */}
      <TabToggle
        value={kind}
        onChange={setKind}
        counts={{ clinic: CLINICS_ALL.length, doctor: DOCTORS_ALL.length }}
      />

      {/* Sort + active filter chips */}
      <div style={{ padding: '10px 0 4px', background: '#fff' }}>
        <SortRow
          sort={s} onSort={() => setSortOpen(true)}
          onToggleFilter={() => setFilterOpen(true)}
          filterChips={chips}
          onRemoveChip={(chip) => chip.onRemove()}
        />
      </div>

      {/* Result count — minimal, inline */}
      <div style={{
        padding: '0 20px 8px', fontSize: 12,
        color: '#9ca3af', fontWeight: 500,
        fontFamily: 'Inter, system-ui',
      }}>
        {sorted.length} {kind === 'clinic' ? (sorted.length === 1 ? 'clínica' : 'clínicas') : (sorted.length === 1 ? 'médico' : 'médicos')}
      </div>

      {/* List */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: '#fff', paddingBottom: 4 }}>
        {sorted.length === 0 ? (
          <EmptyState query={query} kind={kind}/>
        ) : (
          <>
            {displayed.map(item =>
              kind === 'clinic'
                ? <ClinicRow key={item.id} clinic={item} onClick={() => {}}/>
                : <DoctorRow key={item.id} doctor={item} onClick={() => {}}/>
            )}
            {hasMore && (
              <div ref={sentinelRef}>
                <SkeletonRow/>
                <SkeletonRow/>
              </div>
            )}
            {!hasMore && sorted.length > 5 && (
              <div style={{
                padding: '20px', textAlign: 'center',
                color: '#9ca3af', fontSize: 12, fontWeight: 500,
              }}>Você chegou ao fim da lista</div>
            )}
          </>
        )}
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} kind={kind}
        filters={f}
        setFilters={(next) => setFilters(F => ({ ...F, [kind]: next }))}/>
      <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} kind={kind}
        sort={s}
        setSort={(next) => setSort(S => ({ ...S, [kind]: next }))}/>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes tabIn { from { transform: scaleX(0.4); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function SideNav({ open, onClose, active = 'explorar' }) {
  const items = [
    { k: 'inicio', label: 'Início', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10l8-6 8 6v9a1 1 0 01-1 1h-4v-6h-6v6H4a1 1 0 01-1-1v-9z"/>
      </svg>
    )},
    { k: 'explorar', label: 'Explorar', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="6.5"/><path d="M15 15l4 4"/>
      </svg>
    )},
    { k: 'agenda', label: 'Agenda', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="16" height="14" rx="2"/>
        <path d="M3 9h16M8 3v4M14 3v4"/>
      </svg>
    )},
    { k: 'relatorios', label: 'Relatórios', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18V8M10 18V4M16 18v-7"/>
        <path d="M3 19h16"/>
      </svg>
    )},
    { k: 'perfil', label: 'Perfil', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="8" r="3.5"/>
        <path d="M4 19c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5"/>
      </svg>
    )},
  ];
  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t); }
  }, [open]);
  if (!mounted) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(15,23,41,0.45)',
        opacity: open ? 1 : 0,
        transition: 'opacity 260ms ease',
      }}/>
      <aside style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '78%', maxWidth: 320, zIndex: 51,
        background: '#fff',
        boxShadow: '10px 0 40px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui',
      }}>
        {/* Drawer header — brand band */}
        <div style={{
          background: 'linear-gradient(165deg, #0a2f7f 0%, #1e40af 100%)',
          padding: '28px 22px 24px',
          color: '#fff',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12,
          }}>RM</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>Rafael Melo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>rafael.melo@atlasmed.com</div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {items.map(it => {
            const on = it.k === active;
            const color = on ? '#0a2f7f' : '#374151';
            return (
              <button key={it.k} onClick={onClose} style={{
                width: '100%', border: 'none',
                background: on ? '#eef2ff' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 12, marginBottom: 2,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Inter, system-ui',
                transition: 'background 140ms',
              }}>
                {it.icon(color)}
                <span style={{
                  fontSize: 14, fontWeight: on ? 600 : 500,
                  color, letterSpacing: -0.1,
                }}>{it.label}</span>
                {on && <span style={{ flex: 1, textAlign: 'right', color: '#0a2f7f', fontSize: 11, fontWeight: 600 }}>•</span>}
              </button>
            );
          })}
        </div>

        {/* Footer — version + logout */}
        <div style={{ padding: '14px 16px 22px', borderTop: '1px solid #eef0f3' }}>
          <button style={{
            width: '100%', border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
            color: '#b84545', fontSize: 13.5, fontWeight: 600,
            fontFamily: 'Inter, system-ui',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 3H4a1 1 0 00-1 1v10a1 1 0 001 1h7"/>
              <path d="M8 9h9M14 6l3 3-3 3"/>
            </svg>
            Sair
          </button>
          <div style={{ fontSize: 10.5, color: '#9ca3af', textAlign: 'center', marginTop: 10, fontWeight: 500, letterSpacing: 0.3 }}>
            Atlasmed · v2.4.1
          </div>
        </div>
      </aside>
    </>
  );
}

function EmptyState({ query, kind }) {
  return (
    <div style={{
      padding: '60px 40px', textAlign: 'center',
      color: '#6b7280', fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 36, margin: '0 auto 20px',
        background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"><circle cx="13" cy="13" r="8"/><path d="M20 20l7 7"/></svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0f1729', marginBottom: 6 }}>
        Nada encontrado{query ? ` para "${query}"` : ''}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 260, margin: '0 auto' }}>
        Tente outra busca ou remova alguns filtros para ampliar o resultado.
      </div>
    </div>
  );
}

Object.assign(window, { ListScreen, ClinicRow, DoctorRow, FilterSheet, SortSheet, TabToggle, SearchBar, SideNav });
