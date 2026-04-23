// atlas-bi.jsx — Business Intelligence / Performance screen for the rep.
//
// Design principles, drawn from the map screen:
//  - Warm off-white background (#eef1ec / #f7f8fb), white cards w/ soft shadow
//  - Navy (#0a2f7f / #1e40af), green (#16a373 / #0f8a5f), amber (#c6861b),
//    red (#b84545) — same palette as map pins & status tags
//  - Inter, tabular-nums for numbers, same SheetSection/PotentialTag rhythm
//  - Same floating hamburger FAB from the map (FloatingMenu) so the nav
//    affordance is identical across screens. User taps a single green
//    FAB bottom-right → expands into Sugestões / Rota / Follow-ups /
//    Desempenho / Favoritos. On BI we show the hamburger, but no top
//    nav bar — just a compact period filter header that doubles as the
//    only chrome on top.
//
// Structure (top → bottom):
//   1. Header — hamburger (left) · "Desempenho" · refresh · avatar
//   2. Period filter segmented control — Hoje / Semana / Mês / Personalizado
//   3. Hero snapshot — 4 big KPIs (visits today, week, follow-ups, new clinics)
//   4. Meta semanal — progress ring + bar
//   5. Funil de clínicas — horizontal stacked bar (Sem interação / Em
//      negociação / Ativa / Inativa / Rejeição) with tap-to-filter
//   6. Oportunidades — 4 opportunity blocks w/ CTAs to map/list
//   7. Atividade — daily bars last 14 days + "best day" highlight
//   8. Conversão — mini funnel (visitas → interesse → conversões)
//   9. Cobertura do território — % covered + mini heatmap
//  10. Qualidade dos dados — % complete, CTA
//  11. Insights — dynamic behavioral cards
//  12. Recomendações — contextual action chips
//  13. Base de clínicas — summary counts (dupes summary below funnel)

// ─────────────────────────────────────────────────────────────
// BI data (mock — would come from API)
// ─────────────────────────────────────────────────────────────
const BI_DATA = {
  period: 'semana',
  snapshot: {
    visitsToday: { value: 6, delta: +2, goal: 8 },
    visitsWeek: { value: 28, delta: +4, goal: 35 },
    followupsPending: { value: 12, delta: -3 },
    newClinics: { value: 4, delta: +1 },
  },
  goal: { current: 28, target: 35, pct: 80 },
  territory: {
    total: 142, active: 84, activePct: 59, inactive: 22, inactivePct: 15,
    // Mini heatmap of the rep's região — each cell is a bairro/sub-region,
    // tinted by the active / inactive ratio so the consultant instantly sees
    // where the healthy clusters and the problem pockets are.
    heatmap: [
      { name: 'Itaim',     a: 14, i: 1 },
      { name: 'Jardins',   a: 9,  i: 1 },
      { name: 'Pinheiros', a: 12, i: 3 },
      { name: 'V. Olímpia',a: 8,  i: 4 },
      { name: 'Moema',     a: 6,  i: 2 },
      { name: 'Morumbi',   a: 4,  i: 3 },
      { name: 'C. Belo',   a: 3,  i: 2 },
      { name: 'Brooklin',  a: 5,  i: 1 },
      { name: 'V. Mariana',a: 7,  i: 1 },
      { name: 'Liberdade', a: 4,  i: 1 },
      { name: 'Saúde',     a: 2,  i: 2 },
      { name: 'Ipiranga',  a: 3,  i: 0 },
      { name: 'Tatuapé',   a: 2,  i: 1 },
      { name: 'Santana',   a: 1,  i: 1 },
      { name: 'Lapa',      a: 2,  i: 0 },
      { name: 'Perdizes',  a: 2,  i: 0 },
    ],
  },
  funnel: [
    { k: 'sem', label: 'Sem interação', n: 18, pct: 13, color: '#8a94a6' },
    { k: 'neg', label: 'Em negociação', n: 22, pct: 15, color: '#c6861b' },
    { k: 'ativa', label: 'Ativa', n: 84, pct: 59, color: '#16a373' },
    { k: 'inativa', label: 'Inativa', n: 12, pct: 8, color: '#b84545' },
    { k: 'rej', label: 'Rejeição', n: 6, pct: 5, color: '#7a3737' },
  ],
  opportunities: [
    { k: 'sem', label: 'Sem interação', n: 18, pct: 13, color: '#1e40af', bg: 'rgba(30,64,175,0.10)',
      sub: 'Nunca abordadas', cta: 'Abrir no mapa' },
    { k: 'neg', label: 'Em negociação', n: 22, pct: 15, color: '#a76d14', bg: 'rgba(198,134,27,0.14)',
      sub: 'Prontas para fechamento', cta: 'Ver follow-ups' },
    { k: 'nunca', label: 'Nunca compraram', n: 31, pct: 22, color: '#7a3737', bg: 'rgba(184,69,69,0.12)',
      sub: 'Cadastro sem pedidos', cta: 'Abrir lista' },
    { k: 'incompl', label: 'Dados incompletos', n: 9, pct: 6, color: '#6b5a8a', bg: 'rgba(107,90,138,0.14)',
      sub: 'Faltam contato ou médicos', cta: 'Revisar cadastros' },
  ],
  // last 14 days, newest last; flag best day
  activity: [
    { d: 'Seg', n: 3 }, { d: 'Ter', n: 4 }, { d: 'Qua', n: 5 }, { d: 'Qui', n: 2 },
    { d: 'Sex', n: 6 }, { d: 'Sáb', n: 0 }, { d: 'Dom', n: 0 },
    { d: 'Seg', n: 5 }, { d: 'Ter', n: 7, best: true }, { d: 'Qua', n: 4 }, { d: 'Qui', n: 6 },
    { d: 'Sex', n: 6 }, { d: 'Sáb', n: 0 }, { d: 'Dom', n: 0 },
  ],
  conversion: {
    visits: 142, interest: 68, conversions: 21,
    interestRate: 48, conversionRate: 15,
  },
  coverage: { pct: 62, delta: +4 },
  dataQuality: { completePct: 78, filled: 111, incomplete: 31 },
  insights: [
    { tone: 'good', title: 'Melhor horário: manhã', body: 'Visitas antes das 11h têm 2× mais conversões.', icon: 'sun' },
    { tone: 'warn', title: '7 follow-ups vencidos', body: 'Última interação há mais de 10 dias. Priorize hoje.', icon: 'bell' },
    { tone: 'info', title: 'Padrão Ter → Qui', body: 'Sua cadência é mais consistente nos dias do meio.', icon: 'chart' },
  ],
  recommendations: [
    { tone: 'opp', title: 'Foque nas em negociação',
      body: '22 clínicas prontas para fechamento estão no seu raio de 3 km.',
      cta: 'Abrir no mapa', icon: 'route' },
    { tone: 'info', title: 'Explore clínicas sem interação',
      body: '18 clínicas novas no seu território — ainda não abordadas.',
      cta: 'Ver lista', icon: 'star' },
  ],
};

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────
const BI_COLOR = {
  navy: '#1e40af', navyDeep: '#0a2f7f',
  green: '#16a373', greenDeep: '#0f8a5f',
  amber: '#c6861b', amberText: '#a76d14',
  red: '#b84545',
  ink: '#0f1729', inkSoft: '#4b5563', muted: '#6b7280', faint: '#8a94a6',
  line: '#eef0f3', lineSoft: '#f2f4f7',
  paperBg: '#f7f8fb',
};

function BICard({ children, style = {}, pad = 16 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${BI_COLOR.line}`,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
      padding: pad, fontFamily: 'Inter, system-ui',
      ...style,
    }}>{children}</div>
  );
}

function BISectionTitle({ title, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '0 2px 10px', fontFamily: 'Inter, system-ui',
    }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
        color: BI_COLOR.faint,
      }}>{title}</span>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BIHeader — minimalist chrome: hamburger (opens nav) · title · refresh
//   The hamburger here opens the FloatingMenu by toggling its state.
//   We integrate it by rendering a subtle inline chevron on the left
//   that the user taps → scrolls nothing, just fires the same FAB.
//   To keep parity with the map (where the FAB sits bottom-right), we
//   ALSO keep the FAB on-screen. The header button is the secondary,
//   context-specific entry point. Tapping either one opens the menu.
// ─────────────────────────────────────────────────────────────
function BIHeader({ onMenuOpen, onRefresh }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 4,
      background: 'rgba(247,248,251,0.92)',
      backdropFilter: 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: 'blur(14px) saturate(180%)',
      borderBottom: `1px solid ${BI_COLOR.line}`,
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Hamburger — same shape as the one inside map's search bar,
          but here it sits as its own button at the top-left */}
      <button onClick={onMenuOpen} style={{
        width: 40, height: 40, borderRadius: 12,
        background: '#fff', border: `1px solid ${BI_COLOR.line}`,
        boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 5h12M3 9h12M3 13h8"/></svg>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: BI_COLOR.faint }}>
          Portal · Desempenho
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1 }}>
          Olá, Rafael
        </div>
      </div>

      <button onClick={onRefresh} style={{
        width: 36, height: 36, borderRadius: 12,
        background: '#fff', border: `1px solid ${BI_COLOR.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 8a6 6 0 11-2-4.5"/><path d="M14 2v3h-3"/>
        </svg>
      </button>

      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
      }}>RM</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PeriodFilter — segmented control
// ─────────────────────────────────────────────────────────────
function PeriodFilter({ value, onChange }) {
  const opts = [
    { k: 'hoje', l: 'Hoje' },
    { k: 'semana', l: 'Esta semana' },
    { k: 'mes', l: 'Este mês' },
    { k: 'custom', l: 'Personalizado' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4, borderRadius: 12,
      background: '#eef0f3', fontFamily: 'Inter, system-ui',
    }}>
      {opts.map(o => {
        const on = o.k === value;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            flex: 1, height: 34, borderRadius: 9, border: 'none',
            background: on ? '#fff' : 'transparent',
            color: on ? BI_COLOR.navyDeep : BI_COLOR.muted,
            fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            boxShadow: on ? '0 1px 3px rgba(15,23,41,0.08)' : 'none',
            fontFamily: 'Inter, system-ui', letterSpacing: -0.05,
            transition: 'all 160ms',
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPIBlock — one of the four hero stats (visits today/week/etc.)
// ─────────────────────────────────────────────────────────────
function KPIBlock({ label, value, delta, suffix, tone = 'navy' }) {
  const positive = delta > 0;
  const negative = delta < 0;
  const deltaColor = positive ? BI_COLOR.green : negative ? BI_COLOR.red : BI_COLOR.faint;
  const tones = {
    navy:  { bar: '#1e40af', bg: 'rgba(30,64,175,0.06)' },
    green: { bar: '#16a373', bg: 'rgba(22,163,115,0.07)' },
    amber: { bar: '#c6861b', bg: 'rgba(198,134,27,0.08)' },
    plum:  { bar: '#6b5a8a', bg: 'rgba(107,90,138,0.08)' },
  };
  const t = tones[tone];
  return (
    <div style={{
      position: 'relative', background: '#fff',
      border: `1px solid ${BI_COLOR.line}`, borderRadius: 14,
      padding: '14px 14px 12px',
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      overflow: 'hidden',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
        borderRadius: 2, background: t.bar,
      }}/>
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: BI_COLOR.faint }}>
          {label}
        </div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.8,
          fontVariantNumeric: 'tabular-nums', marginTop: 4,
          display: 'flex', alignItems: 'baseline', gap: 4,
        }}>
          {value}
          {suffix && <span style={{ fontSize: 12, fontWeight: 500, color: BI_COLOR.muted }}>{suffix}</span>}
        </div>
        {delta != null && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: deltaColor, marginTop: 3,
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {positive && <path d="M2 7l3-4 3 4"/>}
              {negative && <path d="M2 3l3 4 3-4"/>}
              {delta === 0 && <path d="M2 5h6"/>}
            </svg>
            {positive ? '+' : ''}{delta} vs sem. anterior
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GoalRing — compact SVG ring + label + bar for weekly goal
// ─────────────────────────────────────────────────────────────
function GoalCard({ current, target, pct }) {
  const r = 28, c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <BICard>
      <BISectionTitle title="Meta desta semana"
        right={<a style={{ fontSize: 11.5, color: BI_COLOR.navy, fontWeight: 600, textDecoration: 'none' }} href="#">Ver todas</a>}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
          <circle cx="36" cy="36" r={r} stroke="#eef0f3" strokeWidth="8" fill="none"/>
          <circle cx="36" cy="36" r={r} stroke="#16a373" strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
            transform="rotate(-90 36 36)"/>
          <text x="36" y="40" textAnchor="middle" fontFamily="Inter, system-ui"
            fontWeight="700" fontSize="15" fill={BI_COLOR.ink}
            style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</text>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 20, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.4,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {current}<span style={{ color: BI_COLOR.faint, fontWeight: 500 }}> / {target}</span>
          </div>
          <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2 }}>
            visitas · faltam {target - current} para bater a meta
          </div>
          <div style={{ height: 6, background: '#eef0f3', borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, #16a373, #0f8a5f)',
              borderRadius: 3,
            }}/>
          </div>
        </div>
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// TerritoryHeatmap — bairros tinted by active / inactive ratio.
// Green = healthy cluster; amber = at risk; red = dominated by
// inactive clinics; gray = empty cell (no clinics cadastradas).
// ─────────────────────────────────────────────────────────────
const HEATMAP_SCALE = [
  { stop: 0.85, fill: '#0f8a5f', text: '#fff' }, // strong active
  { stop: 0.65, fill: '#16a373', text: '#fff' }, // active
  { stop: 0.45, fill: '#c6861b', text: '#fff' }, // mixed
  { stop: 0.20, fill: '#cf6c4b', text: '#fff' }, // inactive-leaning
  { stop: 0,    fill: '#b84545', text: '#fff' }, // mostly inactive
];
function heatmapColor(a, i) {
  const total = a + i;
  if (total === 0) return { fill: '#eef0f3', text: '#8a94a6' };
  const ratio = a / total;
  return HEATMAP_SCALE.find(s => ratio >= s.stop) || HEATMAP_SCALE[HEATMAP_SCALE.length - 1];
}

function TerritoryHeatmap({ cells }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5,
        fontFamily: 'Inter, system-ui',
      }}>
        {cells.map((c, idx) => {
          const tone = heatmapColor(c.a, c.i);
          const total = c.a + c.i;
          return (
            <div key={idx} style={{
              position: 'relative', aspectRatio: '1.35',
              borderRadius: 7, background: tone.fill, color: tone.text,
              padding: '5px 7px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: total === 0
                ? 'inset 0 0 0 1px #e5e7eb'
                : 'inset 0 0 0 1px rgba(255,255,255,0.22)',
            }}>
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: 0.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textShadow: total === 0 ? 'none' : '0 1px 2px rgba(0,0,0,0.18)',
              }}>{c.name}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}>{c.a}</span>
                <span style={{
                  fontSize: 9, opacity: 0.85,
                  fontVariantNumeric: 'tabular-nums',
                }}>/ {total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* gradient legend */}
      <div style={{
        marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'Inter, system-ui',
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: BI_COLOR.muted, letterSpacing: 0.2 }}>
          Inativas
        </span>
        <div style={{
          flex: 1, height: 8, borderRadius: 4,
          background: 'linear-gradient(90deg, #b84545 0%, #cf6c4b 25%, #c6861b 50%, #16a373 75%, #0f8a5f 100%)',
        }}/>
        <span style={{ fontSize: 10, fontWeight: 600, color: BI_COLOR.muted, letterSpacing: 0.2 }}>
          Ativas
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FunnelBar — horizontal stacked bar + legend, tap to filter
// ─────────────────────────────────────────────────────────────
function FunnelCard({ data, total }) {
  return (
    <BICard>
      <BISectionTitle title="Clínicas"
        right={<span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{total} no total</span>}/>
      {/* stacked bar */}
      <div style={{
        display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden',
        background: '#eef0f3', marginBottom: 14,
      }}>
        {data.map(s => (
          <div key={s.k} style={{
            width: `${s.pct}%`, background: s.color,
            borderRight: '1px solid rgba(255,255,255,0.5)',
          }} title={`${s.label}: ${s.n} (${s.pct}%)`}/>
        ))}
      </div>
      {/* legend rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map(s => (
          <button key={s.k} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0', borderBottom: `1px solid ${BI_COLOR.lineSoft}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, flexShrink: 0 }}/>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: BI_COLOR.ink }}>{s.label}</span>
            <span style={{
              fontSize: 12.5, fontWeight: 700, color: BI_COLOR.ink,
              fontVariantNumeric: 'tabular-nums',
            }}>{s.n}</span>
            <span style={{
              fontSize: 11, color: BI_COLOR.muted, minWidth: 32, textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>{s.pct}%</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={BI_COLOR.faint} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
          </button>
        ))}
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// OpportunityBlock — colored tile w/ CTA
// ─────────────────────────────────────────────────────────────
function OpportunityBlock({ label, n, pct, color, bg, sub, cta }) {
  return (
    <button style={{
      all: 'unset', cursor: 'pointer',
      background: '#fff', border: `1px solid ${BI_COLOR.line}`, borderRadius: 14,
      padding: 14, fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
    }}>
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color,
      }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{
          fontSize: 24, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.6,
          fontVariantNumeric: 'tabular-nums',
        }}>{n}</span>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
          background: bg, color,
          fontVariantNumeric: 'tabular-nums',
        }}>{pct}%</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: BI_COLOR.ink, letterSpacing: -0.1 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: BI_COLOR.muted, lineHeight: 1.35 }}>{sub}</div>
      <div style={{
        marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BI_COLOR.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11.5, fontWeight: 600, color,
      }}>
        {cta}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ActivityChart — 14-day visit bars
// ─────────────────────────────────────────────────────────────
function ActivityCard({ data }) {
  const max = Math.max(...data.map(d => d.n), 1);
  const total = data.reduce((a, b) => a + b.n, 0);
  const avg = (total / data.filter(d => d.d !== 'Sáb' && d.d !== 'Dom').length).toFixed(1);
  return (
    <BICard>
      <BISectionTitle title="Atividade (14 dias)"
        right={
          <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
            Média <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{avg}</b> · Total <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{total}</b>
          </span>
        }/>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 4, height: 90,
        padding: '0 2px', marginBottom: 8,
      }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.n / max) * 84);
          const weekend = d.d === 'Sáb' || d.d === 'Dom';
          const color = d.best ? BI_COLOR.green : weekend ? '#d7dbe3' : '#1e40af';
          const bg = d.best ? 'rgba(22,163,115,0.18)' : weekend ? 'transparent' : 'rgba(30,64,175,0.12)';
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              alignItems: 'center', height: '100%', position: 'relative',
            }}>
              {d.best && (
                <div style={{
                  position: 'absolute', top: -2,
                  fontSize: 9, fontWeight: 700, color: BI_COLOR.green,
                  letterSpacing: 0.4, textTransform: 'uppercase',
                }}>best</div>
              )}
              <div style={{
                width: '100%', height: h, borderRadius: 4,
                background: d.n === 0 ? bg : `linear-gradient(180deg, ${color}, ${color}cc)`,
                border: d.n === 0 ? `1px dashed ${weekend ? '#d7dbe3' : '#c9cfd9'}` : 'none',
                position: 'relative',
              }}>
                {d.best && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10, fontWeight: 700, color: BI_COLOR.green,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{d.n}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '0 2px' }}>
        {data.map((d, i) => (
          <div key={i} style={{
            flex: 1, fontSize: 9.5, textAlign: 'center',
            color: (d.d === 'Sáb' || d.d === 'Dom') ? '#c9cfd9' : BI_COLOR.faint,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui',
          }}>{d.d[0]}</div>
        ))}
      </div>

      <button style={{
        marginTop: 14, width: '100%',
        padding: '10px 0', borderRadius: 10,
        background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`,
        color: BI_COLOR.navy, fontSize: 12.5, fontWeight: 600,
        fontFamily: 'Inter, system-ui', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Ver mais
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
      </button>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// ConversionCard — mini funnel visits → interest → conversion
// ─────────────────────────────────────────────────────────────
function ConversionCard({ data }) {
  const maxW = 100;
  const steps = [
    { k: 'v', label: 'Visitas', n: data.visits, color: '#1e40af', w: maxW },
    { k: 'i', label: 'Interesse', n: data.interest, color: '#c6861b', w: (data.interest / data.visits) * maxW },
    { k: 'c', label: 'Conversões', n: data.conversions, color: '#16a373', w: (data.conversions / data.visits) * maxW },
  ];
  return (
    <BICard>
      <BISectionTitle title="Conversão"/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={s.k}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              fontFamily: 'Inter, system-ui', marginBottom: 4,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: BI_COLOR.ink }}>{s.label}</span>
              <span style={{
                fontSize: 13, fontWeight: 700, color: BI_COLOR.ink,
                fontVariantNumeric: 'tabular-nums',
              }}>{s.n}</span>
            </div>
            <div style={{ height: 8, background: '#eef0f3', borderRadius: 4 }}>
              <div style={{
                width: `${s.w}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                transition: 'width 400ms ease',
              }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BI_COLOR.lineSoft}`,
      }}>
        <RatePill label="Taxa de interesse" value={data.interestRate} color="#c6861b"/>
        <RatePill label="Taxa de conversão" value={data.conversionRate} color="#16a373"/>
      </div>
    </BICard>
  );
}

function RatePill({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 10,
      background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`,
    }}>
      <div style={{
        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        color: BI_COLOR.faint,
      }}>{label}</div>
      <div style={{
        fontSize: 17, fontWeight: 700, color, letterSpacing: -0.3,
        fontVariantNumeric: 'tabular-nums', marginTop: 2,
      }}>{value}%</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CoverageCard — % covered + mini heatmap
// ─────────────────────────────────────────────────────────────
function CoverageCard({ pct, delta }) {
  // 6x6 stylised grid. Values 0-3 map to intensity.
  const cells = [
    3,3,2,2,1,0,
    3,3,3,2,1,0,
    2,3,3,2,1,1,
    1,2,3,3,2,1,
    0,1,2,3,2,1,
    0,0,1,2,1,0,
  ];
  return (
    <BICard>
      <BISectionTitle title="Cobertura do território"
        right={<span style={{ fontSize: 11, color: BI_COLOR.green, fontWeight: 600 }}>+{delta}% vs mês</span>}/>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div>
          <div style={{
            fontSize: 32, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.8,
            fontVariantNumeric: 'tabular-nums',
          }}>{pct}<span style={{ fontSize: 16, color: BI_COLOR.muted, fontWeight: 500 }}>%</span></div>
          <div style={{ fontSize: 11.5, color: BI_COLOR.muted }}>da região visitada</div>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10,
            fontSize: 11.5, fontWeight: 600, color: BI_COLOR.navy,
            textDecoration: 'none',
          }}>
            Abrir mapa
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
          </a>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3,
          flex: 1, aspectRatio: '1', maxWidth: 132,
        }}>
          {cells.map((v, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 3,
              background: v === 0 ? '#eef0f3'
                : v === 1 ? 'rgba(22,163,115,0.22)'
                : v === 2 ? 'rgba(22,163,115,0.5)'
                : 'rgba(22,163,115,0.85)',
            }}/>
          ))}
        </div>
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// DataQualityCard — % complete + CTA
// ─────────────────────────────────────────────────────────────
function DataQualityCard({ completePct, filled, incomplete }) {
  return (
    <BICard>
      <BISectionTitle title="Qualidade dos dados"/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontSize: 26, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.6,
            fontVariantNumeric: 'tabular-nums',
          }}>{completePct}<span style={{ fontSize: 14, color: BI_COLOR.muted, fontWeight: 500 }}>%</span></div>
          <div style={{ fontSize: 11.5, color: BI_COLOR.muted }}>clínicas com cadastro completo</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
            <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{filled}</b> preenchidas
          </div>
          <div style={{ fontSize: 11, color: BI_COLOR.red, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {incomplete} incompletas
          </div>
        </div>
      </div>
      <div style={{ height: 8, background: '#eef0f3', borderRadius: 4, marginBottom: 12 }}>
        <div style={{
          width: `${completePct}%`, height: '100%', borderRadius: 4,
          background: 'linear-gradient(90deg, #1e40af, #2850c8)',
        }}/>
      </div>
      <button style={{
        width: '100%', height: 38, borderRadius: 10, border: `1px solid ${BI_COLOR.line}`,
        background: '#f7f9fc', color: BI_COLOR.navy,
        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Inter, system-ui',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Revisar cadastros incompletos
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
      </button>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// InsightCard — behavioral insights
// ─────────────────────────────────────────────────────────────
const INSIGHT_TONE = {
  good: { bg: 'rgba(22,163,115,0.10)', color: '#117a55' },
  warn: { bg: 'rgba(198,134,27,0.14)', color: '#a76d14' },
  info: { bg: 'rgba(30,64,175,0.10)', color: '#1e40af' },
};
const INSIGHT_ICON = {
  sun: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12V7a5 5 0 0110 0v5"/><path d="M2 12h12M7 14a2 2 0 002 0"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14h12"/><path d="M4 12V8M8 12V5M12 12V9"/></svg>,
};

function InsightsCard({ items }) {
  return (
    <BICard>
      <BISectionTitle title="Insights"
        right={<a href="#" style={{ fontSize: 11.5, color: BI_COLOR.navy, fontWeight: 600, textDecoration: 'none' }}>Ver mais</a>}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => {
          const t = INSIGHT_TONE[it.tone];
          return (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: 12,
              borderRadius: 12, background: '#f7f9fc',
              border: `1px solid ${BI_COLOR.line}`,
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: t.bg, color: t.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{INSIGHT_ICON[it.icon]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.1 }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{it.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// RecommendationCard — contextual suggested actions
// ─────────────────────────────────────────────────────────────
const REC_ICON = {
  route: <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="17" cy="16" r="2"/><path d="M7 6h6a4 4 0 010 8H9a4 4 0 000 8"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5l2.1 4.5 4.9.5-3.7 3.3 1.1 4.7L9 12l-4.4 2.5 1.1-4.7-3.7-3.3 4.9-.5L9 1.5z"/></svg>,
};
const REC_TONE = {
  opp:  { bg: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff', subColor: 'rgba(255,255,255,0.75)', ctaBg: '#fff', ctaColor: '#0a2f7f' },
  info: { bg: '#fff', color: BI_COLOR.ink, subColor: BI_COLOR.muted, ctaBg: BI_COLOR.navy, ctaColor: '#fff' },
};

function RecommendationsCard({ items }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui' }}>
      <div style={{
        display: 'flex', padding: '0 2px 10px',
        fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
        color: BI_COLOR.faint,
      }}>Recomendações</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => {
          const t = REC_TONE[it.tone];
          const isDark = it.tone === 'opp';
          return (
            <div key={i} style={{
              borderRadius: 16, padding: 16, background: t.bg,
              border: isDark ? 'none' : `1px solid ${BI_COLOR.line}`,
              color: t.color, boxShadow: isDark
                ? '0 12px 28px rgba(10,47,127,0.30)'
                : '0 1px 2px rgba(15,23,41,0.03)',
              display: 'flex', gap: 12,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(30,64,175,0.10)',
                color: isDark ? '#fff' : BI_COLOR.navy,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{REC_ICON[it.icon]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>{it.title}</div>
                <div style={{ fontSize: 11.5, marginTop: 3, color: t.subColor, lineHeight: 1.45 }}>{it.body}</div>
                <button style={{
                  marginTop: 10, padding: '7px 12px', borderRadius: 10,
                  background: t.ctaBg, color: t.ctaColor, border: 'none',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, system-ui',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {it.cta}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BaseSummaryCard — absolute + percentage counts for each state
// ─────────────────────────────────────────────────────────────
function BaseSummaryCard({ funnel, total }) {
  const extras = [
    { k: 'fill', label: 'Preenchidas', n: 111, pct: 78, color: '#6b5a8a' },
  ];
  return (
    <BICard>
      <BISectionTitle title="Base de clínicas"
        right={<span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>Total {total}</span>}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[...funnel, ...extras].map(s => (
          <div key={s.k} style={{
            padding: '10px 12px', borderRadius: 10,
            background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
              borderRadius: 2, background: s.color,
            }}/>
            <div style={{ paddingLeft: 8 }}>
              <div style={{ fontSize: 10.5, color: BI_COLOR.faint, fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
              <div style={{
                fontSize: 15, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3,
                fontVariantNumeric: 'tabular-nums', marginTop: 1,
                display: 'flex', alignItems: 'baseline', gap: 5,
              }}>
                {s.n}
                <span style={{ fontSize: 10.5, color: BI_COLOR.muted, fontWeight: 500 }}>· {s.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// BIScreen — compose it all together
// ─────────────────────────────────────────────────────────────
function BIScreen() {
  const [period, setPeriod] = React.useState('semana');
  const d = BI_DATA;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: BI_COLOR.paperBg, fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}>
        <BIHeader onMenuOpen={() => {}} onRefresh={() => {}}/>

        {/* Period filter + live indicator */}
        <div style={{ padding: '14px 16px 10px' }}>
          <PeriodFilter value={period} onChange={setPeriod}/>
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, color: BI_COLOR.faint, fontFamily: 'Inter, system-ui',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 3, background: BI_COLOR.green,
              boxShadow: `0 0 0 3px rgba(22,163,115,0.2)`,
            }}/>
            Atualizado agora · 22 abr, 14:02
          </div>
        </div>

        {/* Hero KPIs */}
        <div style={{ padding: '4px 16px 12px' }}>
          <BISectionTitle title="Resumo"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <KPIBlock label="Visitas hoje" value={d.snapshot.visitsToday.value} delta={d.snapshot.visitsToday.delta} suffix={`/ ${d.snapshot.visitsToday.goal}`} tone="navy"/>
            <KPIBlock label="Visitas na semana" value={d.snapshot.visitsWeek.value} delta={d.snapshot.visitsWeek.delta} suffix={`/ ${d.snapshot.visitsWeek.goal}`} tone="green"/>
            <KPIBlock label="Follow-ups pendentes" value={d.snapshot.followupsPending.value} delta={d.snapshot.followupsPending.delta} tone="amber"/>
            <KPIBlock label="Novas clínicas" value={d.snapshot.newClinics.value} delta={d.snapshot.newClinics.delta} tone="plum"/>
          </div>
        </div>

        {/* Goal */}
        <div style={{ padding: '4px 16px 12px' }}>
          <GoalCard {...d.goal}/>
        </div>

        {/* Territory — ativas/inativas + heatmap per bairro */}
        <div style={{ padding: '4px 16px 12px' }}>
          <BISectionTitle title="Território"
            right={<span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{d.territory.total} clínicas</span>}/>
          <BICard>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{
                background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`, borderRadius: 12,
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: 10, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Ativas</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: BI_COLOR.green, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{d.territory.active}</span>
                  <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{d.territory.activePct}%</span>
                </div>
              </div>
              <div style={{
                background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`, borderRadius: 12,
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: 10, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Inativas</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: BI_COLOR.red, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{d.territory.inactive}</span>
                  <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{d.territory.inactivePct}%</span>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 14, paddingTop: 14,
              borderTop: `1px solid ${BI_COLOR.lineSoft}`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 10, fontFamily: 'Inter, system-ui',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: BI_COLOR.faint }}>
                  Mapa de calor · {d.territory.heatmap.length} bairros
                </span>
                <span style={{ fontSize: 10.5, color: BI_COLOR.muted }}>
                  ativas / total
                </span>
              </div>
              <TerritoryHeatmap cells={d.territory.heatmap}/>
            </div>
          </BICard>
        </div>

        {/* Funnel */}
        <div style={{ padding: '4px 16px 12px' }}>
          <FunnelCard data={d.funnel} total={d.territory.total}/>
        </div>

        {/* Opportunities */}
        <div style={{ padding: '4px 16px 12px' }}>
          <BISectionTitle title="Oportunidades"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {d.opportunities.map(o => <OpportunityBlock key={o.k} {...o}/>)}
          </div>
        </div>

        {/* Activity */}
        <div style={{ padding: '4px 16px 12px' }}>
          <ActivityCard data={d.activity}/>
        </div>

        {/* Conversion + Coverage side-by-side on mobile = stacked */}
        <div style={{ padding: '4px 16px 12px' }}>
          <ConversionCard data={d.conversion}/>
        </div>
        <div style={{ padding: '4px 16px 12px' }}>
          <CoverageCard {...d.coverage}/>
        </div>

        {/* Data quality */}
        <div style={{ padding: '4px 16px 12px' }}>
          <DataQualityCard {...d.dataQuality}/>
        </div>

        {/* Base summary */}
        <div style={{ padding: '4px 16px 24px' }}>
          <BaseSummaryCard funnel={d.funnel} total={d.territory.total}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BIScreen });
