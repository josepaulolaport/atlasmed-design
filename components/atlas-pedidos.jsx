// Pedidos (Orders) screens — Atlasmed design system.

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PEDIDO_PRODUCTS = [
  { id: 'p1', name: 'AtlasGel',    sub: 'Gel ortopédico · 240g',             unit: 89.90,  category: 'Ortopedia',     tag: 'top' },
  { id: 'p2', name: 'AtlasDerm',   sub: 'Creme dermatológico · 60g',         unit: 124.50, category: 'Dermatologia',  tag: null },
  { id: 'p3', name: 'CardioFlex',  sub: 'Suplemento cardiovascular · 30cp',  unit: 67.80,  category: 'Cardiologia',   tag: null },
  { id: 'p4', name: 'OrtoPlus',    sub: 'Solução ortopédica · 100ml',        unit: 145.00, category: 'Ortopedia',     tag: 'novo' },
  { id: 'p5', name: 'VitalScan',   sub: 'Kit diagnóstico rápido',            unit: 389.00, category: 'Diagnóstico',   tag: 'premium' },
  { id: 'p6', name: 'AtlasVit',    sub: 'Vitaminas complexo B · 60cp',       unit: 42.30,  category: 'Suplementação', tag: null },
  { id: 'p7', name: 'DermaShield', sub: 'Protetor dermatológico · 50g',      unit: 98.60,  category: 'Dermatologia',  tag: null },
];

const ORDER_STATUSES = {
  pendente:  { label: 'Pendente',      color: '#c6861b', bg: 'rgba(198,134,27,0.13)' },
  separacao: { label: 'Em separação',  color: '#1e40af', bg: 'rgba(30,64,175,0.11)' },
  transito:  { label: 'Em trânsito',   color: '#0a2f7f', bg: 'rgba(10,47,127,0.10)' },
  entregue:  { label: 'Entregue',      color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
  cancelado: { label: 'Cancelado',     color: '#b84545', bg: 'rgba(184,69,69,0.12)' },
};

const MOCK_ORDERS = [
  { id: 'PED-2041', clinic: 'Clínica Santa Mônica',       doctor: 'Dra. Mariana Silva',   date: '17 abr', value: 'R$ 4.120', status: 'transito',  items: 3 },
  { id: 'PED-2038', clinic: 'Centro Ortopédico Paulista', doctor: 'Dr. Paulo Cardoso',    date: '14 abr', value: 'R$ 1.780', status: 'entregue',  items: 2 },
  { id: 'PED-2035', clinic: 'Instituto CardioMed',        doctor: 'Dra. Fernanda Costa',  date: '10 abr', value: 'R$ 2.350', status: 'entregue',  items: 4 },
  { id: 'PED-2029', clinic: 'Clínica Vitalis Itaim',      doctor: 'Dr. Rafael Souza',     date: '02 abr', value: 'R$ 890',   status: 'pendente',  items: 1 },
  { id: 'PED-2021', clinic: 'Policlínica Primavera',      doctor: 'Dra. Beatriz Lima',    date: '24 mar', value: 'R$ 3.640', status: 'cancelado', items: 5 },
];

const SAMPLE_CART = [
  { id: 'p1', qty: 2 },
  { id: 'p4', qty: 1 },
  { id: 'p6', qty: 3 },
];

// ─── BRL formatter ───────────────────────────────────────────────────────────
function brl(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
}

// ─── Helper Components ───────────────────────────────────────────────────────

function PStatusChip({ status }) {
  const s = ORDER_STATUSES[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
      {s.label}
    </span>
  );
}

function PTag({ tag }) {
  if (!tag) return null;
  const map = {
    top:     { bg: 'rgba(22,163,115,0.12)',  color: '#0f8a5f', label: 'Top' },
    novo:    { bg: 'rgba(30,64,175,0.10)',   color: '#1e40af', label: 'Novo' },
    premium: { bg: 'rgba(198,134,27,0.12)', color: '#b07a10', label: 'Premium' },
  };
  const s = map[tag] || { bg: '#f3f4f6', color: '#6b7280', label: tag };
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 10,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
    }}>{s.label}</span>
  );
}

function ProductIcon({ name, size = 40 }) {
  const palettes = [
    { key: 'Atlas',  hue: 220 },
    { key: 'Cardio', hue: 355 },
    { key: 'Orto',   hue: 145 },
    { key: 'Vital',  hue: 270 },
    { key: 'Derma',  hue: 315 },
  ];
  const match = palettes.find(p => name.startsWith(p.key));
  const hue = match ? match.hue : 220;
  const r = size / 4;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: `hsl(${hue},52%,93%)`,
      border: `1px solid hsl(${hue},38%,84%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.3, fontWeight: 700,
        color: `hsl(${hue},52%,35%)`,
        letterSpacing: -0.5,
      }}>{name.slice(0, 2)}</span>
    </div>
  );
}

function Stepper({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid #eef0f3', borderRadius: 10,
      overflow: 'hidden', background: '#f7f8fb', flexShrink: 0,
    }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 32, height: 32, border: 'none', background: 'transparent',
          cursor: 'pointer', fontSize: 18, lineHeight: 1,
          color: value > 0 ? '#0a2f7f' : '#d1d5db',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>−</button>
      <span style={{
        width: 28, textAlign: 'center',
        fontSize: 14, fontWeight: 600, color: '#1f2937',
      }}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 32, height: 32, border: 'none', background: 'transparent',
          cursor: 'pointer', fontSize: 18, lineHeight: 1,
          color: '#0a2f7f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
    </div>
  );
}

function CartBadge({ cart, onClick }) {
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalValue = cart.reduce((s, i) => {
    const p = PEDIDO_PRODUCTS.find(p => p.id === i.id);
    return s + (p ? p.unit * i.qty : 0);
  }, 0);
  const active = totalQty > 0;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: active ? '#0a2f7f' : 'transparent',
      border: `1.5px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
      borderRadius: 12, padding: active ? '6px 12px 6px 8px' : '6px 10px',
      cursor: 'pointer', color: active ? '#fff' : '#9ca3af',
      transition: 'all 200ms',
    }}>
      <div style={{ position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1h3.5l2.2 10h9l2.3-7H6.5"/>
          <circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none"/>
        </svg>
        {active && (
          <span style={{
            position: 'absolute', top: -7, right: -7,
            width: 16, height: 16, borderRadius: 8,
            background: '#16a373', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fff',
          }}>{totalQty}</span>
        )}
      </div>
      {active && (
        <span style={{ fontSize: 12, fontWeight: 600 }}>{brl(totalValue)}</span>
      )}
    </button>
  );
}

function SelectorField({ label, value, placeholder }) {
  return (
    <div style={{
      border: '1px solid #eef0f3', borderRadius: 12,
      background: '#fff', padding: '11px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer',
    }}>
      <div>
        <div style={{
          fontSize: 10, color: '#9ca3af', fontWeight: 600,
          letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3,
        }}>{label}</div>
        <div style={{ fontSize: 14, color: value ? '#1f2937' : '#c4c9d2', fontWeight: value ? 500 : 400 }}>
          {value || placeholder}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c4c9d2" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 6l4 4 4-4"/>
      </svg>
    </div>
  );
}

function BackChevron() {
  return (
    <button style={{
      width: 36, height: 36, borderRadius: 10,
      border: '1px solid #eef0f3', background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3l-5 5 5 5"/>
      </svg>
    </button>
  );
}

// ─── Screen 1: Meus Pedidos ──────────────────────────────────────────────────
function MeusOrdersScreen({ emptyState = false }) {
  const orders = emptyState ? [] : MOCK_ORDERS;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Header */}
      <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.5 }}>Meus Pedidos</h1>

        {/* Summary strip */}
        {!emptyState && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[
              { label: 'Em trânsito', value: 1, color: '#0a2f7f' },
              { label: 'Pendentes',   value: 1, color: '#c6861b' },
              { label: 'Entregues',   value: 2, color: '#16a373' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: '#fff',
                border: '1px solid #eef0f3', borderRadius: 12,
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, marginTop: 3, lineHeight: 1.2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips */}
      {!emptyState && (
        <div style={{
          display: 'flex', gap: 6, padding: '14px 16px 8px',
          overflowX: 'auto', flexShrink: 0,
        }}>
          {['Todos', 'Em trânsito', 'Pendente', 'Entregue', 'Cancelado'].map((f, i) => (
            <button key={f} style={{
              padding: '5px 13px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
              background: i === 0 ? '#0a2f7f' : '#fff',
              color: i === 0 ? '#fff' : '#6b7280',
              border: i === 0 ? '1.5px solid #0a2f7f' : '1.5px solid #eef0f3',
              fontSize: 12, fontWeight: 500,
            }}>{f}</button>
          ))}
        </div>
      )}

      {/* List or empty state */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 120px' }}>
        {emptyState ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 100, gap: 14,
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: 24,
              background: 'rgba(10,47,127,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0a2f7f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>Nenhum pedido ainda</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 5, lineHeight: 1.5 }}>
                Toque em "Novo pedido" abaixo para<br/>fazer seu primeiro pedido.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: '#fff', border: '1px solid #eef0f3',
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500, letterSpacing: 0.2 }}>
                      {order.id} · {order.date}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginTop: 3, lineHeight: 1.3 }}>
                      {order.clinic}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{order.doctor}</div>
                  </div>
                  <PStatusChip status={order.status}/>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f3f6',
                }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    {order.items} {order.items === 1 ? 'item' : 'itens'} · toque para detalhes
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0a2f7f' }}>{order.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating primary CTA — always visible, centralized */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '20px 16px 26px',
        background: 'linear-gradient(180deg, rgba(247,248,251,0) 0%, rgba(247,248,251,0.92) 38%, #f7f8fb 70%)',
        pointerEvents: 'none',
        display: 'flex', justifyContent: 'center',
      }}>
        <button style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 320, height: 54, borderRadius: 16,
          background: '#0a2f7f', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 700, letterSpacing: 0.2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          boxShadow: '0 14px 28px -10px rgba(10,47,127,0.55), 0 6px 12px -4px rgba(10,47,127,0.25)',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M7.5 1.5v12M1.5 7.5h12"/>
          </svg>
          Novo pedido
        </button>
      </div>
    </div>
  );
}

// ─── Screen 1b: Detalhes do Pedido ───────────────────────────────────────────
const ORDER_DETAILS = {
  'PED-2041': {
    id: 'PED-2041',
    placedAt: '17 abr · 09:42',
    clinic: 'Clínica Santa Mônica',
    clinicAddress: 'Av. Paulista, 1578 · Bela Vista · São Paulo, SP · 01310-200',
    doctor: 'Dra. Mariana Silva',
    doctorCrm: 'CRM-SP 148.732',
    status: 'transito',
    items: [
      { id: 'p1', qty: 2 },
      { id: 'p4', qty: 1 },
      { id: 'p6', qty: 3 },
    ],
    shipping: 0,
    paymentMethod: 'Faturado · 30 dias',
    invoice: 'NF-e 00148732',
    tracking: 'BR847291538LK',
    estimate: '19 a 22 de abril de 2026',
    timeline: [
      { step: 'Pedido confirmado', date: '17 abr · 09:42', done: true },
      { step: 'Em separação',      date: '17 abr · 14:20', done: true },
      { step: 'Em trânsito',       date: '18 abr · 07:15', done: true, current: true },
      { step: 'Entregue',          date: 'Previsto: 19 a 22 abr', done: false },
    ],
  },
  'PED-2038': {
    id: 'PED-2038',
    placedAt: '14 abr · 11:08',
    clinic: 'Centro Ortopédico Paulista',
    clinicAddress: 'R. Augusta, 2410 · Jardins · São Paulo, SP · 01412-100',
    doctor: 'Dr. Paulo Cardoso',
    doctorCrm: 'CRM-SP 121.455',
    status: 'entregue',
    items: [
      { id: 'p4', qty: 1 },
      { id: 'p2', qty: 1 },
    ],
    shipping: 0,
    paymentMethod: 'Faturado · 30 dias',
    invoice: 'NF-e 00148605',
    tracking: 'BR847290224LK',
    estimate: 'Entregue em 16 de abril · 10:55',
    timeline: [
      { step: 'Pedido confirmado', date: '14 abr · 11:08', done: true },
      { step: 'Em separação',      date: '14 abr · 15:30', done: true },
      { step: 'Em trânsito',       date: '15 abr · 08:12', done: true },
      { step: 'Entregue',          date: '16 abr · 10:55', done: true, current: true },
    ],
  },
};

function OrderDetailScreen({ orderId = 'PED-2041' }) {
  const order = ORDER_DETAILS[orderId] || ORDER_DETAILS['PED-2041'];
  const items = order.items
    .map(i => ({ ...i, product: PEDIDO_PRODUCTS.find(p => p.id === i.id) }))
    .filter(i => i.product);
  const subtotal = items.reduce((s, i) => s + i.product.unit * i.qty, 0);
  const total = subtotal + order.shipping;
  const isDelivered = order.status === 'entregue';
  const isTransit = order.status === 'transito';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Header */}
      <div style={{
        padding: '14px 16px 14px', flexShrink: 0,
        background: '#fff', borderBottom: '1px solid #eef0f3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackChevron/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Pedido</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.3 }}>{order.id}</span>
              <span style={{ fontSize: 11.5, color: '#9ca3af' }}>· {order.placedAt}</span>
            </div>
          </div>
          <PStatusChip status={order.status}/>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {/* Timeline */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 16, marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>Acompanhamento</div>
          {order.timeline.map((step, i) => {
            const isLast = i === order.timeline.length - 1;
            const nextDone = !isLast && order.timeline[i + 1].done;
            return (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 10,
                    background: step.done ? (step.current ? '#0a2f7f' : '#16a373') : '#fff',
                    border: step.done ? 'none' : '1.5px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: step.current ? '0 0 0 4px rgba(10,47,127,0.14)' : 'none',
                  }}>
                    {step.done && !step.current && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.8 5l2 2 4.4-4.4"/>
                      </svg>
                    )}
                    {step.current && (
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }}/>
                    )}
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, background: nextDone ? '#16a373' : '#e5e7eb', marginTop: 3, minHeight: 18 }}/>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: step.current ? 700 : 500,
                    color: step.done ? (step.current ? '#0a2f7f' : '#1f2937') : '#9ca3af',
                  }}>{step.step}</div>
                  <div style={{ fontSize: 11.5, color: step.current ? '#0a2f7f' : '#9ca3af', marginTop: 2 }}>{step.date}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tracking code (only for in-transit) */}
        {isTransit && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #eef0f3',
            borderRadius: 12, padding: '11px 14px', marginBottom: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(10,47,127,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3.5" width="10" height="7" rx="1"/>
                <path d="M11 6h2.5L15 8v2.5h-4"/>
                <circle cx="4" cy="12" r="1.3"/>
                <circle cx="12" cy="12" r="1.3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Código de rastreio</div>
              <div style={{ fontSize: 13, color: '#1f2937', fontWeight: 600, marginTop: 2, fontFamily: 'monospace', letterSpacing: 0.3 }}>{order.tracking}</div>
            </div>
            <button style={{
              border: '1.5px solid #eef0f3', background: '#fff',
              borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#0a2f7f',
              cursor: 'pointer', flexShrink: 0,
            }}>Copiar</button>
          </div>
        )}

        {/* Destination */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Destino</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'rgba(10,47,127,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0a2f7f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="14" height="11" rx="1.5"/>
                <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h7a.5.5 0 0 1 .5.5V4"/>
                <path d="M6 9h6M6 12h3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{order.clinic}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.45 }}>{order.clinicAddress}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f3f6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: 'hsl(220,52%,93%)', border: '1px solid hsl(220,38%,84%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(220,52%,35%)' }}>
                {order.doctor.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{order.doctor}</div>
              <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 1 }}>{order.doctorCrm}</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>Itens</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {items.length} {items.length === 1 ? 'produto' : 'produtos'}
            </div>
          </div>
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              paddingTop: i === 0 ? 0 : 10, paddingBottom: i === items.length - 1 ? 0 : 10,
              borderBottom: i === items.length - 1 ? 'none' : '1px solid #f5f6f8',
            }}>
              <ProductIcon name={item.product.name} size={36}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1f2937' }}>{item.product.name}</div>
                <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.sub}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3 }}>
                  {brl(item.product.unit)} · × {item.qty}
                </div>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0a2f7f' }}>
                {brl(item.product.unit * item.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Payment + totals */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Pagamento</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{order.paymentMethod}</span>
            <span style={{ fontSize: 11.5, color: '#9ca3af', fontFamily: 'monospace' }}>{order.invoice}</span>
          </div>
          <div style={{ paddingTop: 11, borderTop: '1px solid #f1f3f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{brl(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, color: '#6b7280' }}>Frete</span>
              <span style={{ fontSize: 12.5, color: order.shipping === 0 ? '#16a373' : '#374151', fontWeight: 600 }}>
                {order.shipping === 0 ? 'Grátis' : brl(order.shipping)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f3f6' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0a2f7f' }}>{brl(total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery estimate */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: isDelivered ? 'rgba(22,163,115,0.08)' : 'rgba(10,47,127,0.05)',
          border: `1px solid ${isDelivered ? 'rgba(22,163,115,0.22)' : 'rgba(10,47,127,0.14)'}`,
          borderRadius: 12, padding: '12px 14px', marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={isDelivered ? '#16a373' : '#0a2f7f'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7.5"/>
            <path d="M9 5v4l2.5 2.5"/>
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDelivered ? '#0f8a5f' : '#0a2f7f' }}>
              {isDelivered ? 'Entregue' : 'Previsão de entrega'}
            </div>
            <div style={{ fontSize: 12, color: isDelivered ? '#0f8a5f' : '#0a2f7f', opacity: 0.82, marginTop: 1 }}>{order.estimate}</div>
          </div>
        </div>

        {/* Secondary actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 44, borderRadius: 12,
            background: '#fff', color: '#0a2f7f',
            border: '1.5px solid #eef0f3',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 7a5 5 0 1 1-1.5-3.5"/>
              <path d="M12 1.5V4.5H9"/>
            </svg>
            Repetir pedido
          </button>
          <button style={{
            flex: 1, height: 44, borderRadius: 12,
            background: '#fff', color: '#374151',
            border: '1.5px solid #eef0f3',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 3.5a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 1.9"/>
              <circle cx="7" cy="10.5" r="0.7" fill="currentColor" stroke="none"/>
            </svg>
            Suporte
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Novo Pedido — Produtos ────────────────────────────────────────
function NewOrderProductsScreen({ cart = [], searchQuery = '', selectedCategory = 'Todos' }) {
  const categories = ['Todos', 'Ortopedia', 'Dermatologia', 'Cardiologia', 'Diagnóstico', 'Suplementação'];

  const filtered = PEDIDO_PRODUCTS.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchQ   = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sub.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <BackChevron/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Novo Pedido</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.3, marginTop: 2 }}>Produtos</div>
          </div>
          <CartBadge cart={cart} onClick={() => {}}/>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#fff', border: `1.5px solid ${searchQuery ? 'rgba(10,47,127,0.3)' : '#eef0f3'}`,
          borderRadius: 12, padding: '10px 14px', marginBottom: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={searchQuery ? '#0a2f7f' : '#9ca3af'} strokeWidth="1.7" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
          </svg>
          <span style={{ fontSize: 14, color: searchQuery ? '#1f2937' : '#9ca3af', fontWeight: searchQuery ? 500 : 400 }}>
            {searchQuery ? searchQuery : 'Buscar produto…'}
          </span>
          {searchQuery && (
            <div style={{
              marginLeft: 'auto', width: 18, height: 18, borderRadius: 9,
              background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1l7 7M8 1L1 8"/>
              </svg>
            </div>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
          {categories.map(cat => (
            <button key={cat} style={{
              padding: '5px 13px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
              background: cat === selectedCategory ? '#0a2f7f' : '#fff',
              color: cat === selectedCategory ? '#fff' : '#6b7280',
              border: cat === selectedCategory ? '1.5px solid #0a2f7f' : '1.5px solid #eef0f3',
              fontSize: 11, fontWeight: 500,
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', paddingBottom: totalQty > 0 ? 80 : 24 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Nenhum produto encontrado</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(product => {
              const cartItem = cart.find(c => c.id === product.id);
              const qty = cartItem ? cartItem.qty : 0;
              return (
                <div key={product.id} style={{
                  background: '#fff',
                  border: `1.5px solid ${qty > 0 ? 'rgba(10,47,127,0.22)' : '#eef0f3'}`,
                  borderRadius: 12, padding: '12px 12px 12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: qty > 0 ? '0 0 0 3px rgba(10,47,127,0.05)' : 'none',
                }}>
                  <ProductIcon name={product.name}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{product.name}</span>
                      <PTag tag={product.tag}/>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.sub}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2f7f' }}>
                      {brl(product.unit)}
                    </div>
                  </div>
                  <Stepper value={qty} onChange={() => {}}/>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating cart CTA */}
      {totalQty > 0 && (
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <button style={{
            width: '100%', height: 50, borderRadius: 14,
            background: '#0a2f7f', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Ver carrinho · {totalQty} {totalQty === 1 ? 'item' : 'itens'}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12l5-5-5-5"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Screen 3: Carrinho ───────────────────────────────────────────────────────
function CartScreen({ cart = SAMPLE_CART }) {
  const items = cart
    .map(c => ({ ...c, product: PEDIDO_PRODUCTS.find(p => p.id === c.id) }))
    .filter(c => c.product);
  const subtotal = items.reduce((s, i) => s + i.product.unit * i.qty, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Header */}
      <div style={{ padding: '14px 16px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackChevron/>
          <div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Novo Pedido</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.3, marginTop: 2 }}>Carrinho</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: '#fff', border: '1px solid #eef0f3',
              borderRadius: 12, padding: '12px 12px 12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <ProductIcon name={item.product.name}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{item.product.name}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>{item.product.sub}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2f7f', marginTop: 4 }}>
                  {brl(item.product.unit * item.qty)}
                </div>
              </div>
              <Stepper value={item.qty} onChange={() => {}}/>
            </div>
          ))}
        </div>

        {/* Summary card */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 16, marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12, letterSpacing: 0.2 }}>Resumo</div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.product.name} × {item.qty}</span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                {brl(item.product.unit * item.qty)}
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 11, marginTop: 4, borderTop: '1px solid #f1f3f6',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0a2f7f' }}>{brl(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 28px', flexShrink: 0 }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 14,
          background: '#0a2f7f', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>
          Finalizar pedido
        </button>
      </div>
    </div>
  );
}

// ─── Screen 4: Checkout ───────────────────────────────────────────────────────
function CheckoutScreen({ prefilled = false, cart = SAMPLE_CART }) {
  const items = cart
    .map(c => ({ ...c, product: PEDIDO_PRODUCTS.find(p => p.id === c.id) }))
    .filter(c => c.product);
  const subtotal = items.reduce((s, i) => s + i.product.unit * i.qty, 0);
  const clinic  = prefilled ? 'Clínica Santa Mônica' : '';
  const doctor  = prefilled ? 'Dra. Mariana Silva'   : '';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Header */}
      <div style={{ padding: '14px 16px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackChevron/>
          <div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Novo Pedido</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.3, marginTop: 2 }}>Checkout</div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          {['Produtos', 'Carrinho', 'Checkout'].map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 && <div style={{ flex: 1, height: 1, background: i < 2 ? '#0a2f7f' : '#eef0f3' }}/>}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10,
                  background: i < 2 ? '#0a2f7f' : 'rgba(10,47,127,0.12)',
                  color: i < 2 ? '#fff' : '#0a2f7f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {i < 2 ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1.5 5l2.5 2.5 5-5"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: i === 2 ? 700 : 500, color: i === 2 ? '#0a2f7f' : '#9ca3af' }}>{step}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Destination section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, letterSpacing: 0.2 }}>Para quem?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SelectorField label="Clínica" value={clinic} placeholder="Selecionar clínica…"/>
            <SelectorField label="Médico responsável" value={doctor} placeholder="Selecionar médico…"/>
          </div>
        </div>

        {/* Order summary */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12, letterSpacing: 0.2 }}>Itens do pedido</div>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            }}>
              <ProductIcon name={item.product.name} size={32}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item.product.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.product.sub}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>× {item.qty}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {brl(item.product.unit * item.qty)}
                </div>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 11, borderTop: '1px solid #f1f3f6',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0a2f7f' }}>{brl(subtotal)}</span>
          </div>
        </div>

        {/* Delivery note (only when prefilled) */}
        {prefilled && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,115,0.07)', border: '1px solid rgba(22,163,115,0.2)',
            borderRadius: 10, padding: '10px 13px', marginBottom: 16,
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#16a373" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7.5l3.5 3.5 7-7"/>
            </svg>
            <span style={{ fontSize: 12, color: '#0f8a5f', fontWeight: 500 }}>
              Entrega estimada em 3–5 dias úteis
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 28px', flexShrink: 0 }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 14,
          background: prefilled ? '#0a2f7f' : 'rgba(10,47,127,0.28)',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600,
          cursor: prefilled ? 'pointer' : 'default',
          transition: 'background 200ms',
        }}>
          Confirmar pedido
        </button>
        {!prefilled && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
            Selecione clínica e médico para continuar
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 5: Confirmação ────────────────────────────────────────────────────
function OrderSuccessScreen({ cart = SAMPLE_CART }) {
  const items = cart
    .map(c => ({ ...c, product: PEDIDO_PRODUCTS.find(p => p.id === c.id) }))
    .filter(c => c.product);
  const subtotal = items.reduce((s, i) => s + i.product.unit * i.qty, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
      alignItems: 'stretch',
    }}>
      <AtlasTopBar page="Pedidos" active="pedidos"/>

      {/* Success hero */}
      <div style={{
        padding: '28px 24px 28px', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(22,163,115,0.09) 0%, transparent 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 28,
          background: 'rgba(22,163,115,0.10)',
          border: '2px solid rgba(22,163,115,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="#16a373" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 19l8 8 16-16"/>
          </svg>
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1f2937', letterSpacing: -0.4, textAlign: 'center' }}>
          Pedido realizado!
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
          Seu pedido foi confirmado e está<br/>sendo processado.
        </p>
        <div style={{
          marginTop: 18, padding: '7px 20px', borderRadius: 20,
          background: '#fff', border: '1px solid #eef0f3',
          fontSize: 12, fontWeight: 700, color: '#0a2f7f', letterSpacing: 0.4,
        }}>PED-2042</div>
      </div>

      {/* Details */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {/* Destination */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Destino</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'rgba(10,47,127,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0a2f7f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="14" height="11" rx="1.5"/>
                <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h7a.5.5 0 0 1 .5.5V4"/>
                <path d="M6 9h6M6 12h3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Clínica Santa Mônica</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Dra. Mariana Silva</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Itens</div>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ProductIcon name={item.product.name} size={28}/>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.product.name} × {item.qty}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                {brl(item.product.unit * item.qty)}
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: 10, borderTop: '1px solid #f1f3f6',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0a2f7f' }}>{brl(subtotal)}</span>
          </div>
        </div>

        {/* Delivery estimate */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(22,163,115,0.07)', border: '1px solid rgba(22,163,115,0.18)',
          borderRadius: 12, padding: '12px 14px', marginBottom: 24,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#16a373" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="7.5"/>
            <path d="M9 5v4l2.5 2.5"/>
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f8a5f' }}>Previsão de entrega</div>
            <div style={{ fontSize: 12, color: '#0f8a5f', opacity: 0.85, marginTop: 1 }}>25 a 29 de abril de 2026</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 28px', flexShrink: 0 }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 14,
          background: '#0a2f7f', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>
          Ver meus pedidos
        </button>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
Object.assign(window, {
  PEDIDO_PRODUCTS, ORDER_STATUSES, MOCK_ORDERS, SAMPLE_CART, ORDER_DETAILS,
  PStatusChip, PTag, ProductIcon, Stepper, CartBadge, SelectorField, BackChevron,
  MeusOrdersScreen, OrderDetailScreen, NewOrderProductsScreen, CartScreen, CheckoutScreen, OrderSuccessScreen,
});
