// ─────────────────────────────────────────────────────────────
// Price suggestion data + helper.
//
// When the rep is creating an order and the destination clinic
// has bought a product before, we surface the last commercial
// agreement (price + date) as the suggested unit price. This
// avoids the rep undercharging or over-quoting and locks the
// team to the negotiated tier.
//
// The data lives here so multiple components (the product
// order modal, the cart, future BI views) can consume the same
// source. The actual UI lives in atlas-product-order-sheet.jsx.
// ─────────────────────────────────────────────────────────────

// Mock: history of negotiated unit prices, keyed by `${clinicId}:${productId}`.
// Each entry is the chronological list of past commercial agreements
// (most recent first).
const CLINIC_PRICE_HISTORY = {
  // Clínica Santa Mônica — long history with AtlasMed (id c-0)
  'c-0:p1': [
    { date: '2026-04-12', unit: 79.90,  qty: 24, orderId: 'PED-2041', kind: 'recorrente' },
    { date: '2026-02-20', unit: 82.50,  qty: 18, orderId: 'PED-1987', kind: 'campanha'  },
    { date: '2025-12-08', unit: 89.90,  qty: 12, orderId: 'PED-1822', kind: 'tabela'    },
  ],
  'c-0:p4': [
    { date: '2026-03-04', unit: 132.00, qty: 10, orderId: 'PED-2003', kind: 'campanha'  },
    { date: '2025-11-22', unit: 138.00, qty: 8,  orderId: 'PED-1745', kind: 'recorrente' },
  ],
  'c-0:p6': [
    { date: '2026-04-12', unit: 38.90,  qty: 30, orderId: 'PED-2041', kind: 'recorrente' },
    { date: '2026-01-15', unit: 39.50,  qty: 24, orderId: 'PED-1903', kind: 'recorrente' },
    { date: '2025-10-30', unit: 42.30,  qty: 18, orderId: 'PED-1701', kind: 'tabela'    },
  ],
  // Hospital Central — bought once, smaller discount
  'c-1:p3': [
    { date: '2026-03-28', unit: 65.40,  qty: 15, orderId: 'PED-2018', kind: 'recorrente' },
  ],
  'c-1:p5': [
    { date: '2026-02-14', unit: 379.00, qty: 4,  orderId: 'PED-1955', kind: 'campanha'  },
  ],
};

// Returns null when the clinic never ordered this product.
function getSuggestedPrice(clinicId, productId, catalogUnit) {
  const key = `${clinicId}:${productId}`;
  const history = CLINIC_PRICE_HISTORY[key];
  if (!history || history.length === 0) return null;
  const last = history[0];
  const discount = catalogUnit > 0
    ? Math.round(((catalogUnit - last.unit) / catalogUnit) * 100)
    : 0;
  return {
    unit: last.unit,
    catalogUnit,
    date: last.date,
    orderId: last.orderId,
    kind: last.kind,
    history,
    discountPct: discount,
    isDiscounted: last.unit < catalogUnit,
  };
}

Object.assign(window, { CLINIC_PRICE_HISTORY, getSuggestedPrice });
