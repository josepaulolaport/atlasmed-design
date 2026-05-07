// ─────────────────────────────────────────────────────────────
// ActivityFullListScreen — full-screen log of every activity the
// representative has performed. Opens from the "Ver todas" CTA
// on Desempenho › Atividades Recentes.
//
// Includes search, type pills, date-range pills, sort toggle,
// and a floating export button that downloads filtered rows.
// ─────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = {
  visit:        { icon: '🏥', label: 'Visita',        color: '#0a2f7f' },
  call:         { icon: '📞', label: 'Ligação',       color: '#8b5cf6' },
  order:        { icon: '📦', label: 'Pedido',        color: '#16a373' },
  presentation: { icon: '📊', label: 'Apresentação',  color: '#f59e0b' },
  email:        { icon: '✉️', label: 'E-mail',        color: '#6b7280' },
  followup:     { icon: '🔔', label: 'Follow-up',     color: '#ef4444' },
};

const ALL_ACTIVITIES = [
  { id: 'a-1',  type: 'visit',        title: 'Reunião com Dr. João Silva',                entity: { type: 'clinic', id: 'c-1', name: 'Clínica Santa Mônica' },     timestamp: '2026-05-07T15:30:00', status: 'completed', outcome: 'positive', notes: 'Cliente interessado no novo AtlasGel — pediu material em PDF.' },
  { id: 'a-2',  type: 'call',         title: 'Follow-up pedido #PED-2841',                entity: { type: 'doctor', id: 'd-1', name: 'Dr. Roberto Alves' },         timestamp: '2026-05-07T11:15:00', status: 'completed', outcome: 'neutral', duration: '12 min' },
  { id: 'a-3',  type: 'order',        title: 'Pedido de reposição AtlasVit',              entity: { type: 'clinic', id: 'c-2', name: 'Hospital Central' },         timestamp: '2026-05-07T10:05:00', status: 'completed', outcome: 'positive', notes: 'R$ 4.820 · 30 caixas.' },
  { id: 'a-4',  type: 'presentation', title: 'Apresentação · Linha Cardio',               entity: { type: 'doctor', id: 'd-3', name: 'Dra. Mariana Silva' },        timestamp: '2026-05-07T09:00:00', status: 'completed', outcome: 'positive' },
  { id: 'a-5',  type: 'visit',        title: 'Visita relâmpago · cumprimento',            entity: { type: 'clinic', id: 'c-3', name: 'Clínica Vida Plena' },       timestamp: '2026-05-06T17:42:00', status: 'completed', outcome: 'neutral', notes: 'Médico em cirurgia, deixei material com a recepção.' },
  { id: 'a-6',  type: 'followup',     title: 'Confirmar agendamento de demonstração',     entity: { type: 'clinic', id: 'c-4', name: 'Hospital Sírio-Libanês' },   timestamp: '2026-05-06T16:00:00', status: 'pending' },
  { id: 'a-7',  type: 'email',        title: 'Envio de catálogo institucional',           entity: { type: 'doctor', id: 'd-2', name: 'Dr. Felipe Oliveira' },       timestamp: '2026-05-06T14:25:00', status: 'completed', outcome: 'neutral' },
  { id: 'a-8',  type: 'call',         title: 'Confirmar logística de entrega',            entity: { type: 'clinic', id: 'c-5', name: 'Centro Médico Bela Vista' },  timestamp: '2026-05-06T11:10:00', status: 'completed', outcome: 'neutral', duration: '6 min' },
  { id: 'a-9',  type: 'order',        title: 'Novo pedido AtlasGel + AtlasVit',           entity: { type: 'clinic', id: 'c-6', name: 'Clínica Pinheiros' },        timestamp: '2026-05-06T09:55:00', status: 'completed', outcome: 'positive', notes: 'R$ 12.340 · entrega em 2 dias úteis.' },
  { id: 'a-10', type: 'visit',        title: 'Apresentação completa · Cardio',            entity: { type: 'doctor', id: 'd-5', name: 'Dr. Bento Carvalho' },        timestamp: '2026-05-05T16:30:00', status: 'completed', outcome: 'positive', notes: 'Boa receptividade, agendou nova reunião para fechar pedido.' },
  { id: 'a-11', type: 'presentation', title: 'Demonstração · Linha Endócrina',           entity: { type: 'clinic', id: 'c-7', name: 'Clínica Jardim Europa' },    timestamp: '2026-05-05T14:00:00', status: 'completed', outcome: 'neutral' },
  { id: 'a-12', type: 'visit',        title: 'Visita semanal · Hospital Albert Einstein', entity: { type: 'clinic', id: 'c-8', name: 'Hospital Albert Einstein' },  timestamp: '2026-05-05T10:15:00', status: 'completed', outcome: 'positive', notes: 'Atualizei o pedido recorrente.' },
  { id: 'a-13', type: 'call',         title: 'Negociação de desconto trimestral',         entity: { type: 'clinic', id: 'c-9', name: 'Hospital São Camilo' },      timestamp: '2026-05-04T17:55:00', status: 'completed', outcome: 'positive', duration: '23 min' },
  { id: 'a-14', type: 'followup',     title: 'Reagendar visita cancelada',                entity: { type: 'doctor', id: 'd-6', name: 'Dra. Patrícia Costa' },       timestamp: '2026-05-04T15:00:00', status: 'pending' },
  { id: 'a-15', type: 'email',        title: 'Resposta dúvida posologia',                 entity: { type: 'doctor', id: 'd-4', name: 'Dr. Gustavo Mendes' },        timestamp: '2026-05-04T11:42:00', status: 'completed' },
  { id: 'a-16', type: 'order',        title: 'Pedido pequeno · amostras grátis',          entity: { type: 'clinic', id: 'c-10', name: 'Clínica Itaim' },           timestamp: '2026-05-04T09:20:00', status: 'completed', outcome: 'neutral', notes: 'R$ 480 · cortesia.' },
  { id: 'a-17', type: 'visit',        title: 'Apresentação produto novo',                 entity: { type: 'clinic', id: 'c-11', name: 'Clínica Vila Olímpia' },    timestamp: '2026-05-03T16:10:00', status: 'completed', outcome: 'positive', notes: 'Agendou nova reunião para o time todo.' },
  { id: 'a-18', type: 'call',         title: 'Cobertura de pedido em atraso',             entity: { type: 'clinic', id: 'c-2',  name: 'Hospital Central' },         timestamp: '2026-05-03T14:45:00', status: 'completed', outcome: 'neutral', duration: '9 min' },
  { id: 'a-19', type: 'presentation', title: 'Treinamento · Equipe de enfermagem',        entity: { type: 'clinic', id: 'c-1', name: 'Clínica Santa Mônica' },     timestamp: '2026-05-02T11:00:00', status: 'completed', outcome: 'positive' },
  { id: 'a-20', type: 'visit',        title: 'Reunião mensal de fechamento',              entity: { type: 'clinic', id: 'c-3', name: 'Clínica Vida Plena' },       timestamp: '2026-05-02T09:30:00', status: 'completed', outcome: 'positive', notes: 'Pedido fechado · maior ticket do mês.' },
];

function _afRelativeTime(ts) {
  const now = new Date('2026-05-07T18:00:00');
  const date = new Date(ts);
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1)    return 'agora';
  if (diffMin < 60)   return `há ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24)         return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ontem';
  if (d < 7)   return `há ${d} dias`;
  return `há ${Math.floor(d/7)} sem.`;
}

function ActivityFullListScreen({
  onBack = () => {},
  initialFilter = 'all',
  initialDateRange = '7days',
  initialQuery = '',
}) {
  const [filter, setFilter]       = React.useState(initialFilter);
  const [dateRange, setDateRange] = React.useState(initialDateRange);
  const [searchQuery, setSearch]  = React.useState(initialQuery);
  const [sortDesc, setSortDesc]   = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [toast, setToast]         = React.useState(null);

  const filtered = React.useMemo(() => {
    let result = [...ALL_ACTIVITIES];
    if (filter !== 'all') result = result.filter(a => a.type === filter);
    if (dateRange !== 'all') {
      const now = new Date('2026-05-07T18:00:00');
      const cutoff = new Date(now);
      if (dateRange === 'today')      cutoff.setHours(0, 0, 0, 0);
      else if (dateRange === '7days') cutoff.setDate(now.getDate() - 7);
      else if (dateRange === '30days') cutoff.setDate(now.getDate() - 30);
      result = result.filter(a => new Date(a.timestamp) >= cutoff);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.entity.name.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      const da = new Date(a.timestamp), db = new Date(b.timestamp);
      return sortDesc ? db - da : da - db;
    });
    return result;
  }, [filter, dateRange, searchQuery, sortDesc]);

  const handleExport = () => {
    setExporting(true);
    setToast({ message: 'Exportando CSV…', kind: 'info' });
    setTimeout(() => {
      setExporting(false);
      setToast({ message: `${filtered.length} atividades exportadas ✓`, kind: 'success' });
      setTimeout(() => setToast(null), 1900);
    }, 900);
  };

  // Group by day
  const grouped = React.useMemo(() => {
    const out = [];
    let lastKey = '';
    filtered.forEach(a => {
      const d = new Date(a.timestamp);
      const key = d.toDateString();
      if (key !== lastKey) {
        out.push({ kind: 'header', key, label: _formatDateHeader(d) });
        lastKey = key;
      }
      out.push({ kind: 'row', activity: a });
    });
    return out;
  }, [filtered]);

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
        <button onClick={onBack} aria-label="Voltar" style={_afIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Atividades
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2 }}>
            Histórico completo
          </div>
        </div>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          aria-label="Ordenar"
          style={_afIconBtn}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {sortDesc ? (
              <>
                <path d="M4 3v10M4 13l-2-2M4 13l2-2"/>
                <path d="M9 4h5M9 8h4M9 12h3"/>
              </>
            ) : (
              <>
                <path d="M4 13V3M4 3l-2 2M4 3l2 2"/>
                <path d="M9 4h3M9 8h4M9 12h5"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        padding: '14px 16px 12px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {filtered.length}
          </div>
          <div style={{ fontSize: 10.5, color: '#8a94a6', marginTop: 3, fontWeight: 500 }}>atividades</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a373', letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {filtered.filter(a => a.outcome === 'positive').length}
          </div>
          <div style={{ fontSize: 10.5, color: '#8a94a6', marginTop: 3, fontWeight: 500 }}>resultados +</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f1729', letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {filtered.filter(a => a.status === 'pending').length}
          </div>
          <div style={{ fontSize: 10.5, color: '#8a94a6', marginTop: 3, fontWeight: 500 }}>pendentes</div>
        </div>
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
            placeholder="Buscar atividade, cliente, anotação…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13.5, color: '#0f1729',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearch('')} aria-label="Limpar busca" style={{
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

      {/* Type pills */}
      <div style={{
        padding: '10px 16px 8px', background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', gap: 6, overflowX: 'auto',
        flexShrink: 0,
      }}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'visit', label: 'Visitas' },
          { key: 'call', label: 'Ligações' },
          { key: 'order', label: 'Pedidos' },
          { key: 'presentation', label: 'Apresentações' },
          { key: 'followup', label: 'Follow-ups' },
          { key: 'email', label: 'E-mails' },
        ].map(f => {
          const active = filter === f.key;
          const count = f.key === 'all' ? ALL_ACTIVITIES.length : ALL_ACTIVITIES.filter(a => a.type === f.key).length;
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
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Date pills */}
      <div style={{
        padding: '8px 16px 10px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', gap: 6, flexShrink: 0,
      }}>
        {[
          { key: 'today',  label: 'Hoje' },
          { key: '7days',  label: '7 dias' },
          { key: '30days', label: '30 dias' },
          { key: 'all',    label: 'Tudo' },
        ].map(d => {
          const active = dateRange === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setDateRange(d.key)}
              style={{
                padding: '4px 10px', borderRadius: 7,
                border: `1px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
                background: active ? '#eef2ff' : '#fff',
                color: active ? '#0a2f7f' : '#6b7280',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {filtered.length === 0 ? (
          <_AFEmpty/>
        ) : (
          grouped.map((g, i) =>
            g.kind === 'header' ? (
              <div key={`h-${g.key}`} style={{
                fontSize: 11, fontWeight: 700, color: '#8a94a6',
                textTransform: 'uppercase', letterSpacing: 0.8,
                margin: i === 0 ? '0 0 10px' : '18px 0 10px',
              }}>
                {g.label}
              </div>
            ) : (
              <_ActivityRow key={g.activity.id} activity={g.activity}/>
            )
          )
        )}
      </div>

      {/* Floating export */}
      <button
        onClick={handleExport}
        disabled={exporting || filtered.length === 0}
        aria-label="Exportar atividades"
        style={{
          position: 'absolute', right: 16, bottom: 24,
          height: 48, padding: '0 18px', borderRadius: 24,
          background: filtered.length === 0 ? '#cbd5e1' : (exporting ? '#5b6cf6' : '#0a2f7f'),
          color: '#fff', border: 'none',
          fontSize: 14, fontWeight: 700,
          boxShadow: '0 8px 22px rgba(10,47,127,0.32)',
          cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          zIndex: 10,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2.5v7.5"/><path d="M5 7l3 3 3-3"/><path d="M3 13.2h10"/>
        </svg>
        {exporting ? 'Exportando…' : 'Exportar'}
      </button>

      {toast && (
        <div style={{
          position: 'absolute', top: 64, left: '50%',
          transform: 'translateX(-50%)',
          padding: '9px 16px', borderRadius: 999,
          background: toast.kind === 'success' ? '#16a373' : '#0a2f7f',
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 22px rgba(15,23,41,0.20)',
          animation: 'afToast 240ms cubic-bezier(.2,.8,.2,1)',
          zIndex: 20,
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes afToast { from { opacity: 0; transform: translate(-50%, -8px) } to { opacity: 1; transform: translate(-50%, 0) } }
      `}</style>
    </div>
  );
}

function _formatDateHeader(d) {
  const today = new Date('2026-05-07');
  const ts = d.toDateString();
  if (ts === today.toDateString()) return 'Hoje';
  const y = new Date(today); y.setDate(today.getDate() - 1);
  if (ts === y.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

const _afIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#0a2f7f', cursor: 'pointer', flexShrink: 0,
};

function _ActivityRow({ activity }) {
  const meta = ACTIVITY_TYPES[activity.type];
  const time = new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{
      padding: 14, marginBottom: 10,
      background: '#fff', border: '1px solid #eef0f3',
      borderRadius: 14,
      display: 'flex', gap: 12,
      cursor: 'pointer',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,41,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: `${meta.color}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {meta.label}
          </span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activity.entity.name}
          </span>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, marginBottom: 4 }}>
          {activity.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#6b7280' }}>
          <span>{time}</span>
          <span>·</span>
          <span>{_afRelativeTime(activity.timestamp)}</span>
          {activity.duration && (<><span>·</span><span>{activity.duration}</span></>)}
        </div>
        {activity.status === 'completed' && activity.outcome === 'positive' && (
          <div style={{
            marginTop: 8, fontSize: 11.5, color: '#0f7c5a',
            background: '#e7f6ef', padding: '4px 9px', borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600,
          }}>
            ✓ Resultado positivo
          </div>
        )}
        {activity.status === 'pending' && (
          <div style={{
            marginTop: 8, fontSize: 11.5, color: '#a85a05',
            background: '#fef3e1', padding: '4px 9px', borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600,
          }}>
            ◎ Pendente
          </div>
        )}
        {activity.notes && (
          <div style={{
            marginTop: 8, fontSize: 12.5, color: '#374151',
            background: '#f7f8fb', padding: '8px 10px', borderRadius: 8,
            borderLeft: '3px solid #eef0f3', lineHeight: 1.5,
          }}>
            "{activity.notes}"
          </div>
        )}
      </div>
      <div style={{
        alignSelf: 'center', color: '#cbd0d8', fontSize: 18, fontWeight: 300,
      }}>›</div>
    </div>
  );
}

function _AFEmpty() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60, color: '#9ca3af' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32, background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="6" width="20" height="16" rx="2"/>
          <path d="M4 11h20M10 3v6M18 3v6"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginBottom: 4 }}>
        Nenhuma atividade encontrada
      </div>
      <div style={{ fontSize: 12.5 }}>Ajuste os filtros ou a busca</div>
    </div>
  );
}

Object.assign(window, { ActivityFullListScreen, ALL_ACTIVITIES, ACTIVITY_TYPES });
