// ─────────────────────────────────────────────────────────────
// BIDrilldownScreen — detailed analytics view for a BI metric.
// Opens by tapping a metric card on Desempenho. Shows summary
// cards, an interactive chart (line/bar), filters and a
// detailed data table.
// ─────────────────────────────────────────────────────────────

const BI_METRICS = {
  sales: {
    id: 'sales',
    name: 'Vendas',
    icon: '💰',
    accent: '#16a373',
    unit: 'R$',
    period: 'Maio · 2026',
    data: [
      { date: '2026-04-22', value: 4820 }, { date: '2026-04-23', value: 5310 },
      { date: '2026-04-24', value: 4220 }, { date: '2026-04-25', value: 6140 },
      { date: '2026-04-26', value: 0    }, { date: '2026-04-27', value: 0    },
      { date: '2026-04-28', value: 5680 }, { date: '2026-04-29', value: 7240 },
      { date: '2026-04-30', value: 6890 }, { date: '2026-05-01', value: 5120 },
      { date: '2026-05-02', value: 4640 }, { date: '2026-05-03', value: 0    },
      { date: '2026-05-04', value: 7510 }, { date: '2026-05-05', value: 8120 },
      { date: '2026-05-06', value: 6440 }, { date: '2026-05-07', value: 9180 },
    ],
    total: 81320,
    average: 5421,
    growth: 12.4,
    breakdown: [
      { label: 'AtlasGel',   value: 28400, share: 35 },
      { label: 'AtlasVit',   value: 22800, share: 28 },
      { label: 'AtlasDerm',  value: 15600, share: 19 },
      { label: 'AtlasFlex',  value: 9100,  share: 11 },
      { label: 'Outros',     value: 5420,  share: 7  },
    ],
  },
  visits: {
    id: 'visits',
    name: 'Visitas',
    icon: '🏥',
    accent: '#1d4ed8',
    unit: '',
    period: 'Maio · 2026',
    data: [
      { date: '2026-04-22', value: 8 }, { date: '2026-04-23', value: 11 },
      { date: '2026-04-24', value: 9 }, { date: '2026-04-25', value: 12 },
      { date: '2026-04-26', value: 0 }, { date: '2026-04-27', value: 0  },
      { date: '2026-04-28', value: 10}, { date: '2026-04-29', value: 13 },
      { date: '2026-04-30', value: 14}, { date: '2026-05-01', value: 9  },
      { date: '2026-05-02', value: 7 }, { date: '2026-05-03', value: 0  },
      { date: '2026-05-04', value: 11}, { date: '2026-05-05', value: 13 },
      { date: '2026-05-06', value: 12}, { date: '2026-05-07', value: 14 },
    ],
    total: 143,
    average: 9.5,
    growth: -3.2,
    breakdown: [
      { label: 'Visitas positivas', value: 92, share: 64 },
      { label: 'Visitas mistas',    value: 31, share: 22 },
      { label: 'Visitas negativas', value: 14, share: 10 },
      { label: 'Sem desfecho',      value: 6,  share: 4  },
    ],
  },
  orders: {
    id: 'orders',
    name: 'Pedidos',
    icon: '📦',
    accent: '#8b5cf6',
    unit: '',
    period: 'Maio · 2026',
    data: [
      { date: '2026-04-22', value: 3 }, { date: '2026-04-23', value: 5 },
      { date: '2026-04-24', value: 4 }, { date: '2026-04-25', value: 6 },
      { date: '2026-04-26', value: 0 }, { date: '2026-04-27', value: 0 },
      { date: '2026-04-28', value: 4 }, { date: '2026-04-29', value: 7 },
      { date: '2026-04-30', value: 6 }, { date: '2026-05-01', value: 5 },
      { date: '2026-05-02', value: 4 }, { date: '2026-05-03', value: 0 },
      { date: '2026-05-04', value: 6 }, { date: '2026-05-05', value: 8 },
      { date: '2026-05-06', value: 5 }, { date: '2026-05-07', value: 7 },
    ],
    total: 70,
    average: 4.7,
    growth: 22.8,
    breakdown: [
      { label: 'Confirmados',    value: 48, share: 69 },
      { label: 'Em preparação',  value: 14, share: 20 },
      { label: 'Em rota',        value: 6,  share: 8  },
      { label: 'Cancelados',     value: 2,  share: 3  },
    ],
  },
  conversion: {
    id: 'conversion',
    name: 'Conversão',
    icon: '🎯',
    accent: '#f59e0b',
    unit: '%',
    period: 'Maio · 2026',
    data: [
      { date: '2026-04-22', value: 42 }, { date: '2026-04-23', value: 45 },
      { date: '2026-04-24', value: 41 }, { date: '2026-04-25', value: 48 },
      { date: '2026-04-26', value: 0  }, { date: '2026-04-27', value: 0  },
      { date: '2026-04-28', value: 49 }, { date: '2026-04-29', value: 52 },
      { date: '2026-04-30', value: 55 }, { date: '2026-05-01', value: 50 },
      { date: '2026-05-02', value: 47 }, { date: '2026-05-03', value: 0  },
      { date: '2026-05-04', value: 53 }, { date: '2026-05-05', value: 58 },
      { date: '2026-05-06', value: 56 }, { date: '2026-05-07', value: 61 },
    ],
    total: 51,
    average: 51,
    growth: 8.1,
    breakdown: [
      { label: 'Visitas → Pedido',     value: 61, share: 61 },
      { label: 'Pedido → Pago',        value: 89, share: 89 },
      { label: 'Cliente novo → ativo', value: 42, share: 42 },
    ],
  },
};

const BI_DATE_RANGES = [
  { id: 'today',   label: 'Hoje' },
  { id: '7days',   label: '7 dias' },
  { id: '30days',  label: '30 dias' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'ytd',     label: 'YTD' },
];

function BIDrilldownScreen({ metricId = 'sales', onBack = () => {}, initialChartType = 'line' }) {
  const metric = BI_METRICS[metricId] || BI_METRICS.sales;
  const [dateRange, setDateRange] = React.useState('30days');
  const [chartType, setChartType] = React.useState(initialChartType);
  const [exporting, setExporting] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(metric.data.length - 1);
  const [tableOpen, setTableOpen] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1100);
  };

  const max = Math.max(...metric.data.map(d => d.value));
  const positiveGrowth = metric.growth >= 0;
  const formatVal = (v) => {
    if (metric.unit === 'R$') return `R$ ${(v / 1000).toFixed(1)}k`;
    if (metric.unit === '%')  return `${v}%`;
    return v.toLocaleString('pt-BR');
  };
  const formatTotal = (v) => {
    if (metric.unit === 'R$') return `R$ ${v.toLocaleString('pt-BR')}`;
    if (metric.unit === '%')  return `${v}%`;
    return v.toLocaleString('pt-BR');
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
        <button onClick={onBack} aria-label="Voltar" style={_bdIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Desempenho · detalhe
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{metric.icon}</span>
            {metric.name}
          </div>
        </div>
        <button
          onClick={handleExport}
          aria-label="Exportar"
          style={_bdIconBtn}
        >
          {exporting ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="2">
              <circle cx="8" cy="8" r="6" strokeDasharray="20 14" style={{ animation: 'bdSpin 0.8s linear infinite', transformOrigin: 'center' }}/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5v7.5"/><path d="M5 7l3 3 3-3"/><path d="M3 13.2h10"/>
            </svg>
          )}
        </button>
      </div>

      {/* Date range pills */}
      <div style={{
        padding: '12px 16px 12px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', gap: 6, overflowX: 'auto',
        flexShrink: 0,
      }}>
        {BI_DATE_RANGES.map(r => {
          const active = dateRange === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setDateRange(r.id)}
              style={{
                padding: '7px 13px', borderRadius: 9,
                border: `1px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
                background: active ? '#0a2f7f' : '#fff',
                color: active ? '#fff' : '#374151',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {/* Hero metric */}
        <div style={{
          padding: 18, marginBottom: 12,
          background: `linear-gradient(135deg, ${metric.accent} 0%, ${metric.accent}cc 100%)`,
          borderRadius: 16,
          color: '#fff',
          boxShadow: `0 6px 18px ${metric.accent}40`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Total · {metric.period}
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {formatTotal(metric.total)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{
              padding: '3px 9px', borderRadius: 999,
              background: 'rgba(255,255,255,0.22)',
              fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span>{positiveGrowth ? '↑' : '↓'}</span>
              {Math.abs(metric.growth)}%
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              vs período anterior
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          marginBottom: 12,
        }}>
          <_BDStat label="Média/dia"  value={formatVal(metric.average)} hint="período"/>
          <_BDStat label="Pico"       value={formatVal(max)}            hint="melhor dia"/>
          <_BDStat label="Tendência"  value={`${positiveGrowth ? '+' : ''}${metric.growth}%`} valueColor={positiveGrowth ? '#16a373' : '#ef4444'} hint="vs anterior"/>
        </div>

        {/* Chart */}
        <div style={{
          padding: 16, marginBottom: 12,
          background: '#fff',
          border: '1px solid #eef0f3', borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Evolução diária
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: '#f3f4f6', borderRadius: 8 }}>
              {[
                { id: 'line', label: 'Linha' },
                { id: 'bar',  label: 'Barra' },
              ].map(t => {
                const active = chartType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setChartType(t.id)}
                    style={{
                      padding: '5px 11px', borderRadius: 6,
                      border: 'none',
                      background: active ? '#fff' : 'transparent',
                      color: active ? '#0f1729' : '#6b7280',
                      fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                      boxShadow: active ? '0 1px 2px rgba(15,23,41,0.1)' : 'none',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <_BDChart
            data={metric.data}
            max={max}
            chartType={chartType}
            accent={metric.accent}
            activeIdx={activeIdx}
            onHover={setActiveIdx}
            formatVal={formatVal}
          />

          <div style={{
            marginTop: 10,
            paddingTop: 12,
            borderTop: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {new Date(metric.data[activeIdx].date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: metric.accent, fontVariantNumeric: 'tabular-nums' }}>
              {formatVal(metric.data[activeIdx].value)}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{
          padding: 16, marginBottom: 12,
          background: '#fff',
          border: '1px solid #eef0f3', borderRadius: 14,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            Composição
          </div>
          {metric.breakdown.map((b, i) => (
            <div key={i} style={{ marginBottom: i === metric.breakdown.length - 1 ? 0 : 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1729' }}>{b.label}</span>
                <span style={{ fontSize: 12.5, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
                  {metric.unit === 'R$' ? `R$ ${b.value.toLocaleString('pt-BR')}` : metric.unit === '%' ? `${b.value}%` : b.value.toLocaleString('pt-BR')} <span style={{ color: '#9ca3af' }}>· {b.share}%</span>
                </span>
              </div>
              <div style={{
                width: '100%', height: 6, borderRadius: 3,
                background: '#f3f4f6', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${b.share}%`, height: '100%',
                  background: metric.accent,
                  borderRadius: 3,
                  transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Data table accordion */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <button
            onClick={() => setTableOpen(!tableOpen)}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 9,
              background: '#f7f8fb', color: '#0a2f7f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M2 3h9M2 6.5h9M2 10h9"/>
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: '#0f1729' }}>
              Dados detalhados
            </div>
            <span style={{ fontSize: 11, color: '#8a94a6', marginRight: 6 }}>
              {metric.data.length} registros
            </span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" style={{
              transform: tableOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 200ms',
            }}>
              <path d="M2 4l3.5 3.5L9 4"/>
            </svg>
          </button>
          {tableOpen && (
            <div style={{
              borderTop: '1px solid #eef0f3',
              maxHeight: 240, overflowY: 'auto',
            }}>
              <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Data</th>
                    <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{metric.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...metric.data].reverse().map((d, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 14px', color: '#374151' }}>
                        {new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#0f1729', fontVariantNumeric: 'tabular-nums' }}>
                        {d.value === 0 ? <span style={{ color: '#cbd0d8' }}>—</span> : formatVal(d.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bdSpin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

function _BDStat({ label, value, valueColor = '#0f1729', hint }) {
  return (
    <div style={{
      padding: '12px 12px',
      background: '#fff', border: '1px solid #eef0f3',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: valueColor, marginTop: 4, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
        {hint}
      </div>
    </div>
  );
}

function _BDChart({ data, max, chartType, accent, activeIdx, onHover, formatVal }) {
  const W = 320;
  const H = 140;
  const PAD_Y = 8;
  const innerH = H - PAD_Y * 2;
  const stepX = W / Math.max(1, data.length - 1);

  if (chartType === 'bar') {
    const barW = (W - 8) / data.length - 4;
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, overflow: 'visible' }}>
          {[0.25, 0.5, 0.75].map(g => (
            <line key={g} x1="0" y1={PAD_Y + innerH * g} x2={W} y2={PAD_Y + innerH * g} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 3"/>
          ))}
          {data.map((d, i) => {
            const h = max === 0 ? 0 : (d.value / max) * innerH;
            const x = i * stepX + 2 - barW / 2;
            const y = PAD_Y + innerH - h;
            const active = i === activeIdx;
            return (
              <rect
                key={i}
                x={x} y={y}
                width={barW} height={h}
                rx={2}
                fill={active ? accent : `${accent}aa`}
                style={{ cursor: 'pointer', transition: 'fill 140ms' }}
                onMouseEnter={() => onHover(i)}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Line chart
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = max === 0 ? PAD_Y + innerH : PAD_Y + innerH - (d.value / max) * innerH;
    return { x, y, value: d.value };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const areaPath = `${path} L${pts[pts.length-1].x},${PAD_Y + innerH} L${pts[0].x},${PAD_Y + innerH} Z`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`bdArea-${accent.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(g => (
          <line key={g} x1="0" y1={PAD_Y + innerH * g} x2={W} y2={PAD_Y + innerH * g} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 3"/>
        ))}
        <path d={areaPath} fill={`url(#bdArea-${accent.replace('#','')})`}/>
        <path d={path} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => {
          const active = i === activeIdx;
          return (
            <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => onHover(i)}>
              <circle cx={p.x} cy={p.y} r={active ? 5 : 0} fill={accent} stroke="#fff" strokeWidth="2"/>
              <rect x={p.x - stepX/2} y={0} width={stepX} height={H} fill="transparent"/>
            </g>
          );
        })}
        {/* Active vertical line */}
        {activeIdx >= 0 && pts[activeIdx] && (
          <line x1={pts[activeIdx].x} y1={PAD_Y} x2={pts[activeIdx].x} y2={PAD_Y + innerH} stroke={accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.4"/>
        )}
      </svg>
    </div>
  );
}

const _bdIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

Object.assign(window, { BIDrilldownScreen, BI_METRICS, BI_DATE_RANGES });
