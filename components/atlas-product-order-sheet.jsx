// ─────────────────────────────────────────────────────────────
// ProductOrderSheet — bottom-sheet modal opened when the rep
// taps a product card on NewOrderProductsScreen. Lets the rep
// set quantity + unit price for that line. When the destination
// clinic has bought the product before, the last commercial
// agreement is surfaced as a suggested price (with a one-tap
// "Aplicar sugestão" button) and the negotiation history is
// shown inline.
// ─────────────────────────────────────────────────────────────

const _agreementMeta = {
  tabela:     { label: 'Tabela',             color: '#6b7280', bg: '#f3f4f6' },
  recorrente: { label: 'Cliente recorrente', color: '#0f7c5a', bg: '#e7f6ef' },
  campanha:   { label: 'Campanha',           color: '#a85a05', bg: '#fef3e1' },
};

function _posFormatBRL(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
}
function _posFormatDate(d) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}`;
}
function _posFormatDateLong(d) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function ProductOrderSheet({
  open = true,
  onClose = () => {},
  onConfirm = () => {},
  product = null,
  clinic = null,
  initialQty = 0,
  initialUnit = null,        // when null, defaults to suggestion or catalog
  initialMode = null,        // 'suggested' | 'catalog' | 'custom' (for showcase)
}) {
  if (!open || !product) return null;

  const suggestion = clinic && window.getSuggestedPrice
    ? window.getSuggestedPrice(clinic.id, product.id, product.unit)
    : null;

  // Initial mode picks: suggested if available, otherwise catalog.
  const startMode = initialMode || (suggestion ? 'suggested' : 'catalog');
  const startUnit =
    initialUnit ??
    (startMode === 'suggested' && suggestion ? suggestion.unit : product.unit);

  const [qty, setQty]       = React.useState(initialQty || 1);
  const [mode, setMode]     = React.useState(startMode);
  const [customUnit, setCustom] = React.useState(startUnit);

  const activeUnit =
    mode === 'suggested' && suggestion ? suggestion.unit :
    mode === 'catalog' ? product.unit :
    customUnit;

  const subtotal = activeUnit * qty;
  const isCustomBelowFloor = mode === 'custom' && suggestion && customUnit < suggestion.unit * 0.9;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'flex-end',
      animation: 'posFadeIn 200ms ease-out',
      fontFamily: 'Inter, system-ui',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.46)',
      }}/>
      <div style={{
        position: 'relative', width: '100%',
        background: '#fff',
        borderRadius: '22px 22px 0 0',
        animation: 'posSlideUp 280ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '92%',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 30px rgba(15,23,41,0.18)',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#e5e7eb',
          margin: '10px auto 0',
          flexShrink: 0,
        }}/>

        {/* Header — product identity + clinic context */}
        <div style={{
          padding: '12px 18px 14px',
          borderBottom: '1px solid #eef0f3',
          flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          {window.ProductIcon && <window.ProductIcon name={product.name} size={42}/>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Adicionar ao pedido
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2, marginTop: 2 }}>
              {product.name}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {product.sub}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{
            width: 30, height: 30, borderRadius: 15,
            background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
              <path d="M2 2l7 7M9 2l-7 7"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 4px' }}>
          {/* Clinic context strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 11px', borderRadius: 10,
            background: clinic ? '#eef2ff' : '#fef3e1',
            border: `1px solid ${clinic ? 'rgba(10,47,127,0.12)' : 'rgba(198,134,27,0.20)'}`,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 14 }}>{clinic ? '🏥' : '⚠️'}</span>
            <div style={{ flex: 1, fontSize: 11.5, lineHeight: 1.4 }}>
              {clinic ? (
                <>
                  <span style={{ color: '#6b7280' }}>Clínica destinatária · </span>
                  <span style={{ color: '#0f1729', fontWeight: 700 }}>{clinic.name}</span>
                </>
              ) : (
                <span style={{ color: '#a85a05', fontWeight: 600 }}>
                  Selecione uma clínica para ver preços negociados
                </span>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#8a94a6',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 9,
            }}>
              Quantidade
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              border: '1.5px solid #eef0f3', borderRadius: 12,
              background: '#fff',
            }}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: '1px solid #eef0f3', background: '#f7f8fb',
                  cursor: 'pointer', fontSize: 20, lineHeight: 1,
                  color: qty > 1 ? '#0a2f7f' : '#cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>−</button>
              <input
                type="number"
                value={qty}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n >= 1) setQty(n);
                }}
                style={{
                  flex: 1,
                  border: 'none', outline: 'none',
                  textAlign: 'center', background: 'transparent',
                  fontSize: 22, fontWeight: 800, color: '#0f1729',
                  letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => setQty(qty + 1)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: '1px solid #eef0f3', background: '#f7f8fb',
                  cursor: 'pointer', fontSize: 20, lineHeight: 1,
                  color: '#0a2f7f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[5, 10, 25, 50].map(preset => (
                <button
                  key={preset}
                  onClick={() => setQty(preset)}
                  style={{
                    flex: 1, padding: '7px 0',
                    border: `1px solid ${qty === preset ? '#0a2f7f' : '#eef0f3'}`,
                    borderRadius: 8,
                    background: qty === preset ? '#eef2ff' : '#fff',
                    color: qty === preset ? '#0a2f7f' : '#6b7280',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {preset}×
                </button>
              ))}
            </div>
          </div>

          {/* Unit price */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#8a94a6',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Preço unitário</span>
              {suggestion && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '2px 8px', borderRadius: 999,
                  background: '#e7f6ef', color: '#0f7c5a',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  textTransform: 'none',
                }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="4.5" cy="4.5" r="3.5"/>
                    <path d="M4.5 2.5v2l1.5 1"/>
                  </svg>
                  Histórico desta clínica
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestion && (
                <_POSPriceRow
                  active={mode === 'suggested'}
                  onClick={() => setMode('suggested')}
                  label="Preço sugerido"
                  hint={`Última agreement · ${_posFormatDateLong(suggestion.date)} · ${_agreementMeta[suggestion.kind].label}`}
                  price={_posFormatBRL(suggestion.unit)}
                  badge={
                    suggestion.isDiscounted ? `−${suggestion.discountPct}% vs tabela` : null
                  }
                  badgeTone="good"
                />
              )}
              <_POSPriceRow
                active={mode === 'catalog'}
                onClick={() => setMode('catalog')}
                label="Preço de tabela"
                hint="Tabela vigente para todos os clientes"
                price={_posFormatBRL(product.unit)}
              />
              <_POSPriceRow
                active={mode === 'custom'}
                onClick={() => setMode('custom')}
                label="Preço personalizado"
                hint={
                  isCustomBelowFloor
                    ? '⚠ Abaixo do teto de desconto · sujeito a aprovação'
                    : 'Definir manualmente'
                }
                hintTone={isCustomBelowFloor ? 'warn' : null}
                price={
                  <input
                    type="text"
                    value={customUnit.toFixed(2).replace('.', ',')}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d,.]/g, '').replace(',', '.');
                      const n = parseFloat(cleaned);
                      if (!isNaN(n)) setCustom(n);
                      setMode('custom');
                    }}
                    onClick={(e) => { e.stopPropagation(); setMode('custom'); }}
                    style={{
                      width: 92, textAlign: 'right',
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontSize: 14, fontWeight: 700,
                      color: mode === 'custom' ? '#0a2f7f' : '#0f1729',
                      fontFamily: 'inherit',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                }
                prefix="R$"
              />
            </div>
          </div>

          {/* History (collapsed when there's no suggestion) */}
          {suggestion && suggestion.history.length > 1 && (
            <details style={{
              border: '1px solid #eef0f3', borderRadius: 12,
              background: '#fff', marginBottom: 12, overflow: 'hidden',
            }}>
              <summary style={{
                padding: '11px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 12.5, fontWeight: 700, color: '#0f1729',
                listStyle: 'none',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
                    <circle cx="6.5" cy="6.5" r="5"/>
                    <path d="M6.5 4v3l2 1"/>
                  </svg>
                  Histórico de negociação
                </span>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                  {suggestion.history.length} agreements
                </span>
              </summary>
              <div style={{ borderTop: '1px solid #eef0f3' }}>
                {suggestion.history.map((h, i) => {
                  const meta = _agreementMeta[h.kind] || _agreementMeta.tabela;
                  return (
                    <div key={i} style={{
                      padding: '9px 14px',
                      borderTop: i === 0 ? 'none' : '1px solid #f3f4f6',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729', fontVariantNumeric: 'tabular-nums' }}>
                            {_posFormatBRL(h.unit)}
                          </span>
                          <span style={{
                            padding: '1px 6px', borderRadius: 5,
                            background: meta.bg, color: meta.color,
                            fontSize: 9, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: 0.4,
                          }}>{meta.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {_posFormatDateLong(h.date)} · {h.qty} un · {h.orderId}
                        </div>
                      </div>
                      {i === 0 && (
                        <span style={{
                          padding: '2px 7px', borderRadius: 999,
                          background: '#eef2ff', color: '#0a2f7f',
                          fontSize: 9.5, fontWeight: 700,
                        }}>última</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>

        {/* Footer with subtotal + CTA */}
        <div style={{
          padding: '12px 18px 18px',
          borderTop: '1px solid #eef0f3',
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#8a94a6', fontWeight: 600 }}>
                Subtotal · {qty} {qty === 1 ? 'unidade' : 'unidades'}
              </div>
              {mode === 'suggested' && suggestion && suggestion.isDiscounted && (
                <div style={{
                  fontSize: 10.5, color: '#0f7c5a', fontWeight: 600, marginTop: 2,
                }}>
                  Economia: {_posFormatBRL((product.unit - suggestion.unit) * qty)}
                </div>
              )}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: '#0a2f7f',
              letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums',
            }}>
              {_posFormatBRL(subtotal)}
            </div>
          </div>
          <button
            onClick={() => onConfirm({ qty, unit: activeUnit, mode })}
            style={{
              width: '100%', padding: '14px 16px',
              border: 'none', borderRadius: 14,
              background: '#0a2f7f', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(10,47,127,0.20)',
              fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h2l1.4 9a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.2l1-5.1H6"/>
              <circle cx="6.5" cy="14.5" r="1"/><circle cx="12.5" cy="14.5" r="1"/>
            </svg>
            {initialQty > 0 ? 'Atualizar item' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes posFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes posSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

function _POSPriceRow({ active, onClick, label, hint, hintTone, price, badge, badgeTone, prefix }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        padding: '12px 14px',
        borderRadius: 12,
        border: `1.5px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
        background: active ? '#eef2ff' : '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 10,
        border: `1.5px solid ${active ? '#0a2f7f' : '#cbd5e1'}`,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {active && <div style={{ width: 9, height: 9, borderRadius: 5, background: '#0a2f7f' }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: active ? '#0a2f7f' : '#0f1729' }}>
            {label}
          </span>
          {badge && (
            <span style={{
              padding: '1px 7px', borderRadius: 6,
              background: badgeTone === 'good' ? '#e7f6ef' : '#f3f4f6',
              color: badgeTone === 'good' ? '#0f7c5a' : '#6b7280',
              fontSize: 10, fontWeight: 700,
            }}>{badge}</span>
          )}
        </div>
        <div style={{
          fontSize: 11.5,
          color: hintTone === 'warn' ? '#a85a05' : '#6b7280',
          marginTop: 2, lineHeight: 1.4,
        }}>
          {hint}
        </div>
      </div>
      <div style={{
        fontSize: 14, fontWeight: 700,
        color: active ? '#0a2f7f' : '#0f1729',
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        {prefix && <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>{prefix}</span>}
        {price}
      </div>
    </button>
  );
}

Object.assign(window, { ProductOrderSheet });
