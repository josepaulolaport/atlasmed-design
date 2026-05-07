// ─────────────────────────────────────────────────────────────
// PresentationFiltersSheet — bottom-sheet filter panel for the
// Apresentações library. Multi-select for category, laboratory,
// availability; single-select for sort order.
// ─────────────────────────────────────────────────────────────

const PRESENTATION_FILTER_OPTIONS = {
  categories: [
    { id: 'cardio',    label: 'Cardiovascular',    icon: '❤️' },
    { id: 'diabetes',  label: 'Diabetes',          icon: '🩺' },
    { id: 'onco',      label: 'Oncologia',         icon: '🎗️' },
    { id: 'neuro',     label: 'Neurologia',        icon: '🧠' },
    { id: 'gastro',    label: 'Gastroenterologia', icon: '🫁' },
    { id: 'pediatria', label: 'Pediatria',         icon: '👶' },
    { id: 'gineco',    label: 'Ginecologia',       icon: '🌸' },
    { id: 'institucional', label: 'Institucional', icon: '🏛️' },
  ],
  laboratories: [
    { id: 'atlasmed',    label: 'AtlasMed' },
    { id: 'bayer',       label: 'Bayer' },
    { id: 'novartis',    label: 'Novartis' },
    { id: 'pfizer',      label: 'Pfizer' },
    { id: 'roche',       label: 'Roche' },
    { id: 'astrazeneca', label: 'AstraZeneca' },
    { id: 'sanofi',      label: 'Sanofi' },
    { id: 'eurofarma',   label: 'Eurofarma' },
  ],
  availability: [
    { id: 'in-stock',     label: 'Em estoque',     hint: 'Disponível agora' },
    { id: 'low-stock',    label: 'Estoque baixo',  hint: 'Menos de 50 unidades' },
    { id: 'out-of-stock', label: 'Sem estoque',    hint: 'Aguardando reposição' },
  ],
  sortOptions: [
    { id: 'name-asc',  label: 'Nome (A → Z)' },
    { id: 'name-desc', label: 'Nome (Z → A)' },
    { id: 'newest',    label: 'Mais recente' },
    { id: 'popular',   label: 'Mais popular' },
    { id: 'updated',   label: 'Atualizada recentemente' },
  ],
};

const DEFAULT_FILTERS = {
  categories: [],
  laboratories: [],
  availability: [],
  sortBy: 'name-asc',
};

function PresentationFiltersSheet({
  open = true,
  onClose = () => {},
  currentFilters = DEFAULT_FILTERS,
  onApplyFilters = () => {},
}) {
  const [filters, setFilters] = React.useState({
    categories:   [...(currentFilters.categories   || [])],
    laboratories: [...(currentFilters.laboratories || [])],
    availability: [...(currentFilters.availability || [])],
    sortBy:       currentFilters.sortBy || 'name-asc',
  });

  if (!open) return null;

  const toggle = (key, id) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter(x => x !== id)
        : [...prev[key], id],
    }));
  };

  const setSort = (id) => setFilters(prev => ({ ...prev, sortBy: id }));

  const handleClear = () => setFilters({ ...DEFAULT_FILTERS });
  const handleApply = () => { onApplyFilters(filters); onClose(); };

  const activeCount =
    filters.categories.length +
    filters.laboratories.length +
    filters.availability.length;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'flex-end',
      animation: 'pfFadeIn 200ms ease-out',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.42)',
      }}/>
      <div style={{
        position: 'relative', width: '100%',
        height: '88%',
        background: '#fff',
        borderRadius: '22px 22px 0 0',
        animation: 'pfSlideUp 280ms cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui',
        boxShadow: '0 -10px 30px rgba(15,23,41,0.18)',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#e5e7eb',
          margin: '10px auto 0',
          flexShrink: 0,
        }}/>

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #eef0f3',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
              Filtros
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {activeCount > 0
                ? `${activeCount} ${activeCount === 1 ? 'filtro ativo' : 'filtros ativos'}`
                : 'Refine sua busca'}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{
            width: 32, height: 32, borderRadius: 16,
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
              <path d="M2 2l7 7M9 2l-7 7"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 14px' }}>
          {/* Categories */}
          <_PFSection title="Categoria" count={filters.categories.length}>
            <div style={{
              padding: '0 16px',
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
            }}>
              {PRESENTATION_FILTER_OPTIONS.categories.map(cat => {
                const checked = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggle('categories', cat.id)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: 12,
                      border: `1.5px solid ${checked ? '#0a2f7f' : '#eef0f3'}`,
                      background: checked ? '#eef2ff' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 9,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 140ms',
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{cat.icon}</div>
                    <div style={{
                      flex: 1,
                      fontSize: 13, fontWeight: checked ? 700 : 500,
                      color: checked ? '#0a2f7f' : '#0f1729',
                    }}>
                      {cat.label}
                    </div>
                    <_PFCheck checked={checked}/>
                  </button>
                );
              })}
            </div>
          </_PFSection>

          {/* Laboratories */}
          <_PFSection title="Laboratório" count={filters.laboratories.length}>
            <div style={{
              padding: '0 16px',
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {PRESENTATION_FILTER_OPTIONS.laboratories.map(lab => {
                const checked = filters.laboratories.includes(lab.id);
                return (
                  <button
                    key={lab.id}
                    onClick={() => toggle('laboratories', lab.id)}
                    style={{
                      padding: '7px 13px', borderRadius: 999,
                      border: `1px solid ${checked ? '#0a2f7f' : '#eef0f3'}`,
                      background: checked ? '#0a2f7f' : '#fff',
                      color: checked ? '#fff' : '#374151',
                      fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {lab.label}
                  </button>
                );
              })}
            </div>
          </_PFSection>

          {/* Availability */}
          <_PFSection title="Disponibilidade" count={filters.availability.length}>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRESENTATION_FILTER_OPTIONS.availability.map(av => {
                const checked = filters.availability.includes(av.id);
                return (
                  <button
                    key={av.id}
                    onClick={() => toggle('availability', av.id)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${checked ? '#0a2f7f' : '#eef0f3'}`,
                      background: checked ? '#eef2ff' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <_PFCheck checked={checked}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1729' }}>{av.label}</div>
                      <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>{av.hint}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </_PFSection>

          {/* Sort */}
          <_PFSection title="Ordenar por" badge="Único">
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRESENTATION_FILTER_OPTIONS.sortOptions.map(opt => {
                const selected = filters.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSort(opt.id)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${selected ? '#0a2f7f' : '#eef0f3'}`,
                      background: selected ? '#eef2ff' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <_PFRadio selected={selected}/>
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: selected ? 700 : 500, color: selected ? '#0a2f7f' : '#0f1729' }}>
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </_PFSection>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px 18px',
          borderTop: '1px solid #eef0f3',
          background: '#fff',
          display: 'flex', gap: 10,
          flexShrink: 0,
        }}>
          <button
            onClick={handleClear}
            disabled={activeCount === 0 && filters.sortBy === 'name-asc'}
            style={{
              flex: 1, padding: '13px 16px',
              border: '1px solid #eef0f3', borderRadius: 12,
              background: '#fff', color: '#374151',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Limpar tudo
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 2, padding: '13px 16px',
              border: 'none', borderRadius: 12,
              background: '#0a2f7f', color: '#fff',
              fontSize: 14.5, fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Aplicar filtros
            {activeCount > 0 && (
              <span style={{
                padding: '1px 8px', borderRadius: 7,
                background: 'rgba(255,255,255,0.22)',
                fontSize: 11, fontWeight: 700,
              }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pfFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pfSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

function _PFSection({ title, count, badge, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        padding: '0 20px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#8a94a6',
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          {title}
        </div>
        {count !== undefined && count > 0 && (
          <div style={{
            padding: '1px 6px', borderRadius: 6,
            background: '#0a2f7f', color: '#fff',
            fontSize: 10, fontWeight: 700,
          }}>
            {count}
          </div>
        )}
        {badge && (
          <div style={{
            padding: '1px 6px', borderRadius: 6,
            background: '#f3f4f6', color: '#6b7280',
            fontSize: 10, fontWeight: 600,
          }}>
            {badge}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function _PFCheck({ checked }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: 6,
      border: `1.5px solid ${checked ? '#0a2f7f' : '#cbd5e1'}`,
      background: checked ? '#0a2f7f' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 140ms',
    }}>
      {checked && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.5l2.5 2.5L9 3"/>
        </svg>
      )}
    </div>
  );
}

function _PFRadio({ selected }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: 10,
      border: `1.5px solid ${selected ? '#0a2f7f' : '#cbd5e1'}`,
      background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 140ms',
    }}>
      {selected && (
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#0a2f7f' }}/>
      )}
    </div>
  );
}

Object.assign(window, {
  PresentationFiltersSheet,
  PRESENTATION_FILTER_OPTIONS,
  DEFAULT_PRESENTATION_FILTERS: DEFAULT_FILTERS,
});
