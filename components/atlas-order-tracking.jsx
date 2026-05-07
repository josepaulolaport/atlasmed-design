// ─────────────────────────────────────────────────────────────
// OrderTrackingScreen — live tracking timeline for an order.
// Opens by tapping any order on the Pedidos screen. Shows the
// current status, full timeline, items, delivery driver (when
// shipped) and contextual actions (cancel, contact support).
// ─────────────────────────────────────────────────────────────

const TRACKING_STATUSES = {
  pending:   { label: 'Pendente',           icon: '⏱',   color: '#f59e0b', tone: '#fef3e1' },
  confirmed: { label: 'Confirmado',         icon: '✓',   color: '#16a373', tone: '#e7f6ef' },
  processing:{ label: 'Em preparação',      icon: '🔄',  color: '#1d4ed8', tone: '#eef2ff' },
  shipped:   { label: 'Saiu para entrega',  icon: '🚚',  color: '#8b5cf6', tone: '#f3eefe' },
  delivered: { label: 'Entregue',           icon: '📦',  color: '#16a373', tone: '#e7f6ef' },
  cancelled: { label: 'Cancelado',          icon: '✕',   color: '#ef4444', tone: '#fee2e2' },
};

const TRACKING_ORDER_DETAILS = {
  'ORD-2841': {
    id: 'ORD-2841',
    status: 'shipped',
    createdAt: '2026-05-05T10:30:00',
    estimatedDelivery: '2026-05-08',
    paymentMethod: 'Faturado · 30 dias',
    total: 'R$ 8.420,00',
    clinic: { id: 'c-1', name: 'Clínica Santa Mônica', address: 'Av. Pinheiros, 410 — São Paulo, SP' },
    items: [
      { id: 'i-1', productName: 'AtlasGel 50g',     code: 'ATG-050',  quantity: 30, unit: 'caixas', subtotal: 'R$ 4.200,00' },
      { id: 'i-2', productName: 'AtlasVit Cardio',  code: 'AVT-C20',  quantity: 20, unit: 'caixas', subtotal: 'R$ 2.840,00' },
      { id: 'i-3', productName: 'AtlasDerm Spray',  code: 'ADS-150',  quantity: 10, unit: 'frascos', subtotal: 'R$ 1.380,00' },
    ],
    timeline: [
      { status: 'confirmed',  timestamp: '2026-05-05T10:32:00', description: 'Pedido confirmado e enviado ao centro de distribuição.' },
      { status: 'processing', timestamp: '2026-05-05T14:18:00', description: 'Pedido separado e embalado · CD São Paulo.' },
      { status: 'shipped',    timestamp: '2026-05-07T08:05:00', description: 'Saiu para entrega · previsão para amanhã.' },
    ],
    driver: {
      name: 'Carlos Silva',
      vehicle: 'Fiat Strada · ABC-1J34',
      phone: '+55 11 98765-4321',
      rating: 4.9,
      eta: '14:30',
    },
  },
  'ORD-2839': {
    id: 'ORD-2839',
    status: 'processing',
    createdAt: '2026-05-07T09:12:00',
    estimatedDelivery: '2026-05-09',
    paymentMethod: 'Boleto bancário',
    total: 'R$ 4.820,00',
    clinic: { id: 'c-2', name: 'Hospital Central', address: 'Rua Augusta, 500 — São Paulo, SP' },
    items: [
      { id: 'i-1', productName: 'AtlasVit Cardio',  code: 'AVT-C20',  quantity: 30, unit: 'caixas', subtotal: 'R$ 4.260,00' },
      { id: 'i-2', productName: 'AtlasDerm Spray',  code: 'ADS-150',  quantity: 5,  unit: 'frascos', subtotal: 'R$ 560,00' },
    ],
    timeline: [
      { status: 'confirmed',  timestamp: '2026-05-07T09:14:00', description: 'Pedido confirmado.' },
      { status: 'processing', timestamp: '2026-05-07T11:42:00', description: 'Pedido em separação no centro de distribuição.' },
    ],
    driver: null,
  },
};

const _orderTimelineSteps = ['confirmed', 'processing', 'shipped', 'delivered'];

function OrderTrackingScreen({
  orderId = 'ORD-2841',
  onBack = () => {},
  onOpenSupport = () => {},
}) {
  const order = TRACKING_ORDER_DETAILS[orderId] || TRACKING_ORDER_DETAILS['ORD-2841'];
  const [refreshing, setRefreshing] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const status = TRACKING_STATUSES[order.status];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.status);
  const currentStepIdx = _orderTimelineSteps.indexOf(order.status);

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
        <button onClick={onBack} aria-label="Voltar" style={_otIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Acompanhar pedido
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2 }}>
            #{order.id}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          aria-label="Atualizar"
          style={_otIconBtn}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{
            animation: refreshing ? 'otSpin 0.8s linear infinite' : 'none',
            transformOrigin: 'center',
          }}>
            <path d="M14 5a6 6 0 1 0 0 6"/>
            <path d="M14 2v3h-3"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {/* Status hero */}
        <div style={{
          padding: 18,
          background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}c0 100%)`,
          borderRadius: 16,
          color: '#fff',
          marginBottom: 12,
          boxShadow: `0 6px 18px ${status.color}40`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 23,
              background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {status.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Status atual
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3, marginTop: 2 }}>
                {status.label}
              </div>
            </div>
          </div>
          {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="12" height="11" rx="2"/>
                <path d="M2 7h12M5 1v3M11 1v3"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>Previsão de entrega</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>
                  {new Date(order.estimatedDelivery).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div style={{
          padding: 16, marginBottom: 12,
          background: '#fff',
          border: '1px solid #eef0f3', borderRadius: 14,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
            Linha do tempo
          </div>
          <div style={{ position: 'relative' }}>
            {_orderTimelineSteps.map((step, idx) => {
              const evt = order.timeline.find(t => t.status === step);
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;
              const meta = TRACKING_STATUSES[step];
              return (
                <div key={step} style={{
                  display: 'flex', gap: 12, position: 'relative',
                  paddingBottom: idx < _orderTimelineSteps.length - 1 ? 18 : 0,
                }}>
                  {idx < _orderTimelineSteps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: 13.5, top: 28,
                      width: 2, bottom: 0,
                      background: isCompleted ? meta.color : '#e5e7eb',
                    }}/>
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    border: `2px solid ${isFuture ? '#e5e7eb' : meta.color}`,
                    background: isCurrent ? meta.color : isCompleted ? meta.color : '#fff',
                    color: isFuture ? '#cbd5e1' : (isCurrent || isCompleted) ? '#fff' : meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    zIndex: 1,
                    boxShadow: isCurrent ? `0 0 0 4px ${meta.color}25` : 'none',
                  }}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1, paddingTop: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: isCurrent ? 700 : 600,
                      color: isFuture ? '#9ca3af' : '#0f1729',
                      letterSpacing: -0.1,
                    }}>
                      {meta.label}
                    </div>
                    {evt ? (
                      <>
                        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                          {new Date(evt.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {evt.description && (
                          <div style={{ fontSize: 12, color: '#374151', marginTop: 5, lineHeight: 1.5 }}>
                            {evt.description}
                          </div>
                        )}
                      </>
                    ) : isFuture ? (
                      <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
                        Aguardando…
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver card (when shipped) */}
        {order.driver && (
          <div style={{
            padding: 14, marginBottom: 12,
            background: '#fff', border: '1px solid #eef0f3',
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Entrega · em rota
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 23,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, letterSpacing: -0.4,
              }}>
                CS
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f1729' }}>
                  {order.driver.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {order.driver.vehicle} · ⭐ {order.driver.rating}
                </div>
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 8,
                background: '#eef2ff',
                color: '#0a2f7f',
                fontSize: 12, fontWeight: 700,
              }}>
                ETA {order.driver.eta}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                flex: 1, padding: '9px 12px',
                border: '1px solid #eef0f3', borderRadius: 10,
                background: '#fff', color: '#0a2f7f',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h9v5H2zM2 4l4.5 3 4.5-3"/>
                </svg>
                Mensagem
              </button>
              <button style={{
                flex: 1, padding: '9px 12px',
                border: 'none', borderRadius: 10,
                background: '#0a2f7f', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 2h2.5l1.5 3-1.5 1.5a8 8 0 0 0 4 4L10.5 9l3 1.5V13c0 .3-.2.5-.5.5C7 13.5 1 7.5 1 1.5c0-.3.2-.5.5-.5h1z"/>
                </svg>
                Ligar
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{
          padding: 14, marginBottom: 12,
          background: '#fff', border: '1px solid #eef0f3',
          borderRadius: 14,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#8a94a6',
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Produtos</span>
            <span>{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</span>
          </div>
          {order.items.map((item, i) => (
            <div key={item.id} style={{
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid #f3f4f6',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: '#f7f8fb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>💊</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1729' }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>
                  Cód. {item.code}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>
                  {item.quantity}× <span style={{ fontWeight: 500, color: '#6b7280' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>
                  {item.subtotal}
                </div>
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 10, paddingTop: 12,
            borderTop: '1px dashed #e5e7eb',
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Total</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f1729', letterSpacing: -0.3 }}>
              {order.total}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#8a94a6', marginTop: 4, textAlign: 'right' }}>
            {order.paymentMethod}
          </div>
        </div>

        {/* Address */}
        <div style={{
          padding: 14, marginBottom: 12,
          background: '#fff', border: '1px solid #eef0f3',
          borderRadius: 14,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Endereço de entrega
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#dbeafe', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🏥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729' }}>
                {order.clinic.name}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.5 }}>
                {order.clinic.address}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {canCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              style={{
                flex: 1, padding: '12px 14px',
                border: '1px solid #fecaca', borderRadius: 12,
                background: '#fff', color: '#b91c1c',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancelar pedido
            </button>
          )}
          <button
            onClick={onOpenSupport}
            style={{
              flex: 1, padding: '12px 14px',
              border: 'none', borderRadius: 12,
              background: '#0a2f7f', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h9v6.5H4L2 11z"/>
            </svg>
            Suporte
          </button>
        </div>
      </div>

      {/* Cancel confirmation */}
      {confirmCancel && (
        <_OTConfirmDialog
          onClose={() => setConfirmCancel(false)}
          onConfirm={() => setConfirmCancel(false)}
        />
      )}

      <style>{`
        @keyframes otSpin { to { transform: rotate(360deg) } }
        @keyframes otFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes otScaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

function _OTConfirmDialog({ onClose, onConfirm }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'otFadeIn 200ms ease-out',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.46)',
      }}/>
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 320,
        background: '#fff',
        borderRadius: 18,
        padding: 22,
        animation: 'otScaleIn 220ms cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 18px 40px rgba(15,23,41,0.22)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 23,
          background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 0 14px',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 7v5M11 15.5h.01"/>
            <circle cx="11" cy="11" r="9"/>
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2, marginBottom: 6 }}>
          Cancelar pedido?
        </div>
        <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, marginBottom: 18 }}>
          Esta ação não pode ser desfeita. O pedido será cancelado e a clínica notificada automaticamente.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 14px',
            border: '1px solid #eef0f3', borderRadius: 11,
            background: '#fff', color: '#0f1729',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Voltar
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px 14px',
            border: 'none', borderRadius: 11,
            background: '#b91c1c', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const _otIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

Object.assign(window, { OrderTrackingScreen, TRACKING_STATUSES, TRACKING_ORDER_DETAILS });
