// ─────────────────────────────────────────────────────────────
// ProductsFullListScreen — full-screen catalog of products in
// use at a clinic, with sortable rows, expandable monthly
// breakdown, and an "Oportunidades" section for products not
// yet adopted. Opens from clinic detail "Ver todos →".
// ─────────────────────────────────────────────────────────────

const ALL_PRODUCTS_MOCK = [
  {
    id: 'prod-1',
    name: 'AtlasGel',
    share: 58,
    volume: 'R$ 128.400',
    volumeRaw: 128400,
    trend: [32, 28, 34, 30, 38, 36],
    growth: 12,
    category: 'Ortopedia',
    sku: 'AG-240',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 18.400', growth: null },
      { month: 'Dez/25', volume: 'R$ 20.200', growth: 9.8 },
      { month: 'Jan/26', volume: 'R$ 19.600', growth: -3.0 },
      { month: 'Fev/26', volume: 'R$ 22.100', growth: 12.8 },
      { month: 'Mar/26', volume: 'R$ 23.800', growth: 7.7 },
      { month: 'Abr/26', volume: 'R$ 24.300', growth: 2.1 },
    ],
  },
  {
    id: 'prod-2',
    name: 'CardioFlex',
    share: 18,
    volume: 'R$ 40.600',
    volumeRaw: 40600,
    trend: [18, 16, 14, 12, 10, 8],
    growth: -22,
    category: 'Cardiologia',
    sku: 'CF-50',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 9.200', growth: null },
      { month: 'Dez/25', volume: 'R$ 8.100', growth: -12.0 },
      { month: 'Jan/26', volume: 'R$ 7.400', growth: -8.6 },
      { month: 'Fev/26', volume: 'R$ 6.200', growth: -16.2 },
      { month: 'Mar/26', volume: 'R$ 5.100', growth: -17.7 },
      { month: 'Abr/26', volume: 'R$ 4.600', growth: -9.8 },
    ],
  },
  {
    id: 'prod-3',
    name: 'AtlasVit',
    share: 12,
    volume: 'R$ 26.840',
    volumeRaw: 26840,
    trend: [4, 5, 6, 7, 8, 10],
    growth: 58,
    category: 'Suplementação',
    sku: 'AV-30',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 1.200',  growth: null },
      { month: 'Dez/25', volume: 'R$ 1.600',  growth: 33.3 },
      { month: 'Jan/26', volume: 'R$ 2.100',  growth: 31.3 },
      { month: 'Fev/26', volume: 'R$ 2.800',  growth: 33.3 },
      { month: 'Mar/26', volume: 'R$ 3.600',  growth: 28.6 },
      { month: 'Abr/26', volume: 'R$ 4.220',  growth: 17.2 },
    ],
  },
  {
    id: 'prod-4',
    name: 'AtlasDerm',
    share: 8,
    volume: 'R$ 18.220',
    volumeRaw: 18220,
    trend: [10, 11, 9, 12, 11, 13],
    growth: 6,
    category: 'Dermatologia',
    sku: 'AD-100',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 2.700', growth: null },
      { month: 'Dez/25', volume: 'R$ 3.000', growth: 11.1 },
      { month: 'Jan/26', volume: 'R$ 2.800', growth: -6.7 },
      { month: 'Fev/26', volume: 'R$ 3.200', growth: 14.3 },
      { month: 'Mar/26', volume: 'R$ 3.150', growth: -1.6 },
      { month: 'Abr/26', volume: 'R$ 3.370', growth: 7.0 },
    ],
  },
  {
    id: 'prod-5',
    name: 'AtlasFlex',
    share: 4,
    volume: 'R$ 9.480',
    volumeRaw: 9480,
    trend: [3, 3, 4, 3, 4, 4],
    growth: 2,
    category: 'Ortopedia',
    sku: 'AF-15',
    monthlyBreakdown: [
      { month: 'Nov/25', volume: 'R$ 1.500', growth: null },
      { month: 'Dez/25', volume: 'R$ 1.480', growth: -1.3 },
      { month: 'Jan/26', volume: 'R$ 1.620', growth: 9.5 },
      { month: 'Fev/26', volume: 'R$ 1.560', growth: -3.7 },
      { month: 'Mar/26', volume: 'R$ 1.660', growth: 6.4 },
      { month: 'Abr/26', volume: 'R$ 1.660', growth: 0.0 },
    ],
  },
  {
    id: 'prod-6',
    name: 'OrtoPlus',
    share: 0,
    volume: 'R$ 0',
    volumeRaw: 0,
    trend: [0, 0, 0, 0, 0, 0],
    growth: 0,
    category: 'Ortopedia',
    opportunity: true,
    monthlyBreakdown: [],
  },
  {
    id: 'prod-7',
    name: 'CardioMax',
    share: 0,
    volume: 'R$ 0',
    volumeRaw: 0,
    trend: [0, 0, 0, 0, 0, 0],
    growth: 0,
    category: 'Cardiologia',
    opportunity: true,
    monthlyBreakdown: [],
  },
  {
    id: 'prod-8',
    name: 'AtlasNeuro',
    share: 0,
    volume: 'R$ 0',
    volumeRaw: 0,
    trend: [0, 0, 0, 0, 0, 0],
    growth: 0,
    category: 'Neurologia',
    opportunity: true,
    monthlyBreakdown: [],
  },
];

function ProductsFullListScreen({
  clinicName = 'Clínica Santa Mônica',
  products = ALL_PRODUCTS_MOCK,
  onBack = () => {},
  initialSort = 'share',
  initialExpandedId = null,
  initialSortSheetOpen = false,
}) {
  const [sortBy, setSortBy] = React.useState(initialSort);
  const [sortSheetOpen, setSortSheetOpen] = React.useState(initialSortSheetOpen);
  const [expanded, setExpanded] = React.useState(() =>
    initialExpandedId ? new Set([initialExpandedId]) : new Set()
  );

  const activeProducts = products.filter(p => !p.opportunity && p.volumeRaw > 0);
  const opportunities  = products.filter(p => p.opportunity || p.volumeRaw === 0);

  const sorted = [...activeProducts].sort((a, b) => {
    if (sortBy === 'growth') return b.growth - a.growth;
    if (sortBy === 'volume') return b.volumeRaw - a.volumeRaw;
    if (sortBy === 'share')  return b.share - a.share;
    if (sortBy === 'name')   return a.name.localeCompare(b.name);
    return 0;
  });

  const totalProducts = activeProducts.length;
  const totalVolume   = activeProducts.reduce((s, p) => s + p.volumeRaw, 0);
  const avgGrowth     = totalProducts === 0 ? 0 : Math.round(
    activeProducts.reduce((s, p) => s + p.growth, 0) / totalProducts
  );

  const toggleExpand = (productId) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const sortLabels = {
    share:  'Maior share',
    growth: 'Maior crescimento',
    volume: 'Maior volume',
    name:   'Nome A-Z',
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'pflSlideInRight 300ms cubic-bezier(.2,.8,.2,1)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 36, height: 36, borderRadius: 11,
          border: '1px solid #eef0f3', background: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: '#0a2f7f',
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, color: '#8a94a6', fontWeight: 700,
            letterSpacing: 0.8, textTransform: 'uppercase',
          }}>
            Produtos em uso · 6m
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: '#0f1729',
            marginTop: 1, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {clinicName}
          </div>
        </div>

        <button
          onClick={() => setSortSheetOpen(true)}
          aria-label="Ordenar produtos"
          style={{
            height: 36, borderRadius: 11,
            border: '1px solid #eef0f3', background: '#fff',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0 10px',
            flexShrink: 0,
            color: '#0a2f7f',
            fontFamily: 'Inter, system-ui',
            fontSize: 12, fontWeight: 600,
          }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M2 4h10M3 7h8M5 10h4"/>
          </svg>
          {sortLabels[sortBy] || 'Ordenar'}
        </button>
      </div>

      {/* Summary card */}
      <div style={{
        padding: '14px 16px 12px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
        flexShrink: 0,
      }}>
        <PFLStat
          value={String(totalProducts)}
          color="#0a2f7f"
          label="produtos ativos"
        />
        <PFLStat
          value={`R$ ${(totalVolume / 1000).toFixed(0)}k`}
          color="#16a373"
          label="volume 6m"
        />
        <PFLStat
          value={`${avgGrowth >= 0 ? '+' : ''}${avgGrowth}%`}
          color={avgGrowth >= 0 ? '#16a373' : '#b84545'}
          label="crescimento médio"
        />
      </div>

      {/* Product list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px 32px',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {sorted.map((product, i) => (
            <FullProductRow
              key={product.id}
              product={product}
              isExpanded={expanded.has(product.id)}
              onToggle={() => toggleExpand(product.id)}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>

        {opportunities.length > 0 && (
          <>
            <div style={{
              fontSize: 10.5, fontWeight: 800, color: '#b07a10',
              letterSpacing: 0.8, textTransform: 'uppercase',
              padding: '22px 4px 10px',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2v4l2.5 2.5"/>
                <circle cx="6" cy="6" r="5"/>
              </svg>
              Oportunidades · {opportunities.length}
            </div>
            <div style={{
              background: '#fffdf7',
              border: '1px dashed rgba(198,134,27,0.45)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              {opportunities.map((product, i) => (
                <FullOpportunityRow
                  key={product.id}
                  product={product}
                  isLast={i === opportunities.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {sortSheetOpen && (
        <ProductsSortBottomSheet
          currentSort={sortBy}
          onSelect={(sort) => {
            setSortBy(sort);
            setSortSheetOpen(false);
          }}
          onClose={() => setSortSheetOpen(false)}
        />
      )}

      <style>{`
        @keyframes pflSlideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes pflSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pflFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pflExpandDown {
          from { max-height: 0; opacity: 0; }
          to   { max-height: 600px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function PFLStat({ value, label, color }) {
  return (
    <div>
      <div style={{
        fontSize: 18, fontWeight: 700, color,
        letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ fontSize: 10.5, color: '#8a94a6', marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FullProductRow({ product, isExpanded, onToggle, isLast }) {
  const max = Math.max(...product.trend, 1);
  const positive = product.growth >= 0;

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid #f1f3f6',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'Inter, system-ui',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <FullProductIcon name={product.name} size={36}/>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
                {product.name}
              </span>
              <span style={{ fontSize: 10.5, color: '#8a94a6', fontWeight: 500 }}>
                {product.category}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {product.volume} <span style={{ color: '#c8cdd5' }}>·</span> 6m
            </div>
          </div>

          <span style={{
            fontSize: 11.5, fontWeight: 700,
            color: positive ? '#117a55' : '#b84545',
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '3px 8px',
            borderRadius: 999,
            background: positive ? 'rgba(22,163,115,0.10)' : 'rgba(184,69,69,0.10)',
            whiteSpace: 'nowrap',
          }}>
            {positive ? '▲' : '▼'} {Math.abs(product.growth)}%
          </span>

          <svg
            width="13" height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="#8a94a6"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 200ms',
              flexShrink: 0,
            }}
          >
            <path d="M3 5.5l4 4 4-4"/>
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {/* Mini trend chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30, flexShrink: 0 }}>
            {product.trend.map((v, i) => (
              <div key={i} style={{
                width: 5,
                height: `${Math.max((v / max) * 100, 8)}%`,
                background: i === product.trend.length - 1 ? '#1e40af' : '#c7d2fe',
                borderRadius: 2,
              }}/>
            ))}
          </div>

          {/* Share bar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: '#8a94a6',
              marginBottom: 4,
              fontWeight: 500,
            }}>
              <span>Share</span>
              <span style={{ fontWeight: 700, color: '#0f1729', fontVariantNumeric: 'tabular-nums' }}>
                {product.share}%
              </span>
            </div>
            <div style={{
              height: 5,
              borderRadius: 3,
              background: '#eef0f3',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${product.share}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0a2f7f 0%, #1e40af 100%)',
                borderRadius: 3,
                transition: 'width 240ms',
              }}/>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && product.monthlyBreakdown.length > 0 && (
        <div style={{
          padding: '0 16px 16px',
          animation: 'pflExpandDown 240ms ease',
          overflow: 'hidden',
        }}>
          <div style={{
            background: '#f7f8fb',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid #eef0f3',
          }}>
            <div style={{
              fontSize: 9.5,
              fontWeight: 800,
              color: '#8a94a6',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Detalhamento mensal
            </div>

            {product.monthlyBreakdown.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 0',
                  borderTop: i === 0 ? 'none' : '1px solid #eef0f3',
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 500 }}>
                  {m.month}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#0f1729', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {m.volume}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: m.growth === null ? '#c8cdd5' : (m.growth >= 0 ? '#117a55' : '#b84545'),
                    minWidth: 52,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {m.growth === null
                      ? '—'
                      : `${m.growth >= 0 ? '+' : ''}${m.growth.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FullOpportunityRow({ product, isLast }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid rgba(198,134,27,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <FullProductIcon name={product.name} size={36}/>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
            {product.name}
          </span>
          <span style={{
            padding: '1px 7px',
            borderRadius: 999,
            background: 'rgba(198,134,27,0.14)',
            color: '#b07a10',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Oportunidade
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: '#8a6f29' }}>
          Não comprado ainda · {product.category}
        </div>
      </div>

      <button style={{
        padding: '7px 12px',
        borderRadius: 10,
        border: '1px solid rgba(198,134,27,0.4)',
        background: '#fff',
        color: '#b07a10',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Inter, system-ui',
        whiteSpace: 'nowrap',
      }}>
        Apresentar
      </button>
    </div>
  );
}

function FullProductIcon({ name, size = 40 }) {
  const palettes = [
    { key: 'AtlasGel',   hue: 220 },
    { key: 'AtlasVit',   hue: 270 },
    { key: 'AtlasDerm',  hue: 195 },
    { key: 'AtlasFlex',  hue: 145 },
    { key: 'AtlasNeuro', hue: 320 },
    { key: 'Atlas',      hue: 220 },
    { key: 'Cardio',     hue: 355 },
    { key: 'Orto',       hue: 145 },
    { key: 'Vital',      hue: 270 },
  ];
  const match = palettes.find(p => name.startsWith(p.key));
  const hue = match ? match.hue : 220;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size / 4,
      background: `hsl(${hue},52%,93%)`,
      border: `1px solid hsl(${hue},38%,84%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.32,
        fontWeight: 800,
        color: `hsl(${hue},52%,32%)`,
        letterSpacing: -0.4,
      }}>
        {name.slice(0, 2)}
      </span>
    </div>
  );
}

function ProductsSortBottomSheet({ currentSort, onSelect, onClose }) {
  const options = [
    { key: 'share',  label: 'Maior share',       sub: 'Participação na clínica' },
    { key: 'growth', label: 'Maior crescimento', sub: 'Expansão nos últimos 6 meses' },
    { key: 'volume', label: 'Maior volume',      sub: 'Faturamento em R$' },
    { key: 'name',   label: 'Nome A-Z',          sub: 'Ordem alfabética' },
  ];

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 50,
        animation: 'pflFadeIn 220ms ease',
      }}/>
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        zIndex: 51,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '12px 16px 28px',
        animation: 'pflSlideUp 280ms cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.20)',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#d1d5db',
          margin: '0 auto 16px',
        }}/>

        <div style={{
          fontSize: 16, fontWeight: 700, color: '#0f1729',
          marginBottom: 14, letterSpacing: -0.2,
        }}>
          Ordenar produtos por
        </div>

        {options.map(opt => {
          const isActive = currentSort === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              style={{
                width: '100%',
                padding: '12px 12px',
                border: 'none',
                borderRadius: 12,
                background: isActive ? 'rgba(10,47,127,0.06)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, system-ui',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 10,
                border: `2px solid ${isActive ? '#0a2f7f' : '#d1d5db'}`,
                background: isActive ? '#0a2f7f' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms',
              }}>
                {isActive && (
                  <div style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: '#fff',
                  }}/>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: '#0f1729',
                  letterSpacing: -0.2,
                }}>
                  {opt.label}
                </div>
                <div style={{
                  fontSize: 11.5, color: '#6b7280', marginTop: 2,
                }}>
                  {opt.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, {
  ProductsFullListScreen,
  FullProductRow,
  FullOpportunityRow,
  FullProductIcon,
  ProductsSortBottomSheet,
  ALL_PRODUCTS_MOCK,
});
