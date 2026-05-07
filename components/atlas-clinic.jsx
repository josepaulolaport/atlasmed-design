// ClinicDetail — full clinic page opened when a rep taps a clinic row.
// Stacked sections (scrollable), designed for a salesperson's real workflow:
//   [Header] visual hero w/ status + priority cue
//   [Quick actions] call · WhatsApp · rota · nova visita · novo pedido
//   [Consultor responsável + tipo de cliente + localização]
//   [Alertas / sinais] opportunity signals, e.g. inativa há X, próxima visita
//   [Saúde comercial] financial + ordering cadence
//   [Produtos em uso] with 6-month trend bars + share of wallet
//   [Oportunidades] products not yet adopted · competitors
//   [Histórico de visitas] last 5 — data, consultor, anotação
//   [Médicos] mini-cards with personal info (faculdade, time, aniversario, interesses)
//   [Informações administrativas] CNPJ, endereço, horário

const CLINIC_DETAIL = {
  id: 'c-0',
  name: 'Clínica Santa Mônica',
  subtitle: 'Ortopedia · Cardiologia · Clínica Geral',
  address: 'R. Joaquim Floriano, 871 — Itaim Bibi, São Paulo · SP',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 3078-4522',
  hours: 'Seg–Sex 8h–19h · Sáb 8h–13h',
  email: 'contato@santamonica.com.br',
  website: '',

  status: { key: 'ativa', label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
  clientType: { key: 'inativa', label: 'Inativa', sub: 'sem pedido há 68 dias', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
  distance: 2.3,
  // Clinic map coordinates (normalized 0..1 within the viewport).
  coords: { x: 0.5, y: 0.5 },
  // Nearby clinics — used by the map section. x/y are relative to the center,
  // in kilometres; UI renders them on a stylized map dot-grid.
  nearby: [
    { id: 'c-14', name: 'Centro Médico OrtoVita', specialty: 'Ortopedia', distance: 0.6, dx: -0.4, dy: -0.3, status: 'ativa', statusLabel: 'Ativa', statusColor: '#16a373' },
    { id: 'c-27', name: 'Instituto CardioMed', specialty: 'Cardio', distance: 0.9, dx: 0.5, dy: -0.5, status: 'negociacao', statusLabel: 'Em negociação', statusColor: '#c6861b' },
    { id: 'c-33', name: 'Clínica Vitalis Itaim', specialty: 'Multi', distance: 1.4, dx: -0.7, dy: 0.6, status: 'ativa', statusLabel: 'Ativa', statusColor: '#16a373' },
    { id: 'c-41', name: 'Policlínica Primavera', specialty: 'Derm · Ped', distance: 1.8, dx: 0.9, dy: 0.4, status: 'inativa', statusLabel: 'Inativa', statusColor: '#b84545' },
    { id: 'c-52', name: 'Centro Médico Santa Clara', specialty: 'Ortopedia', distance: 2.6, dx: -1.1, dy: -0.9, status: 'nunca', statusLabel: 'Nunca comprou', statusColor: '#707079' },
    { id: 'c-61', name: 'Hospital Vida Nova', specialty: 'Multi', distance: 3.4, dx: 1.4, dy: -1.1, status: 'ativa', statusLabel: 'Ativa', statusColor: '#16a373' },
    { id: 'c-70', name: 'Clínica Recoleta', specialty: 'Gineco', distance: 4.2, dx: -1.8, dy: 1.3, status: 'negociacao', statusLabel: 'Em negociação', statusColor: '#c6861b' },
  ],

  // Clinic photos — a profile avatar + gallery (facade, reception, interior…).
  // Placeholders use subtle striped SVGs; the real app would attach salesman-uploaded shots.
  photo: { label: 'Fachada · fev/2026', placeholder: 'fachada', hue: 218 },
  gallery: [
    { label: 'Fachada', date: 'fev/2026', hue: 218, placeholder: 'fachada' },
    { label: 'Recepção', date: 'fev/2026', hue: 148, placeholder: 'recepção' },
    { label: 'Sala 3 · Ortopedia', date: 'mar/2026', hue: 38, placeholder: 'sala 3' },
    { label: 'Estoque amostras', date: 'mar/2026', hue: 280, placeholder: 'estoque' },
    { label: 'Entrada estac.', date: 'jan/2026', hue: 0, placeholder: 'estac.' },
  ],

  consultant: {
    name: 'Rafael Melo',
    role: 'Consultor responsável · desde mar/2023',
    initials: 'RM',
    hue: 220,
  },

  signals: [
    { kind: 'warn', title: 'Sem pedido há 68 dias', body: 'Ritmo usual é 35 dias. Retome contato antes de virar inativa.' },
    { kind: 'info', title: 'Próxima visita agendada', body: 'Quinta, 24/abr · 14h30 · com Dra. Mariana Silva' },
  ],

  health: {
    ltv: 'R$ 184.520',
    ltvSub: 'em 34 meses',
    avgTicket: 'R$ 3.840',
    avgTicketSub: 'últimos 6 pedidos',
    frequency: '35 dias',
    frequencySub: 'intervalo médio',
    payment: 'Pontual',
    paymentSub: '0 atrasos · 12m',
    credit: { used: 4800, limit: 15000 },
  },

  products: [
    { name: 'AtlasGel', share: 68, volume: 'R$ 128.400', trend: [32, 28, 34, 30, 38, 36], growth: +12 },
    { name: 'CardioFlex', share: 22, volume: 'R$ 40.600', trend: [18, 16, 14, 12, 10, 8], growth: -22 },
    { name: 'AtlasVit', share: 10, volume: 'R$ 15.520', trend: [4, 5, 6, 7, 8, 10], growth: +58 },
  ],

  opportunities: [
    { name: 'OrtoPlus', reason: 'Dra. Helena já prescreve em outra clínica', kind: 'upsell' },
    { name: 'DermaShield', reason: 'Dermato sem cobertura no portfólio atual', kind: 'upsell' },
  ],

  competitors: [
    { name: 'BioDerma Pro', category: 'Dermato', note: 'usado por Dr. Paulo' },
    { name: 'FlexMax', category: 'Orto', note: 'concorrente direto do OrtoPlus' },
  ],

  visits: [
    {
      date: '17/abr · qui',
      time: '14h30',
      duration: '42 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Reunião agendada',
      withWhom: 'Dra. Mariana Silva',
      note: 'Reunião com Dra. Mariana. Demonstração do novo AtlasGel 240g. Solicitou material impresso e amostras p/ 5 pacientes. Próximo pedido provável em 2 semanas.',
      outcome: 'positivo',
      orderValue: null,
      samples: ['AtlasGel 240g · 5un'],
    },
    {
      date: '02/abr · qua',
      time: '10h05',
      duration: '12 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Passagem rápida',
      withWhom: 'Recepção',
      note: 'Passagem rápida, recepção. Dra. Mariana em cirurgia — deixei amostras CardioFlex. Dra. Helena (nova) chega em 15 dias.',
      outcome: 'neutro',
      orderValue: null,
      samples: ['CardioFlex · 3un'],
    },
    {
      date: '14/mar · sex',
      time: '16h10',
      duration: '55 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Fechamento de pedido',
      withWhom: 'Dra. Mariana + Ana (compras)',
      note: 'Pedido fechado R$ 4.120. Cliente reclamou de atraso na entrega anterior. Verificar com logística.',
      outcome: 'misto',
      orderValue: 'R$ 4.120',
      samples: null,
    },
    {
      date: '28/fev · qua',
      time: '09h20',
      duration: '38 min',
      consultant: 'Bruno Araújo',
      consultantHue: 28,
      consultantInitials: 'BA',
      kind: 'Cobertura',
      withWhom: 'Recepção',
      note: 'Primeira visita de cobertura. Apresentei o portfólio. Clínica pediu tabela atualizada de preços.',
      outcome: 'neutro',
      orderValue: null,
      samples: null,
    },
    {
      date: '12/fev · qua',
      time: '14h00',
      duration: '1h 12min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Follow-up feira',
      withWhom: 'Dra. Mariana Silva',
      note: 'Follow-up da feira orto. Dra. Mariana interessada em trial do OrtoPlus — não fechou por limite de compra do mês.',
      outcome: 'positivo',
      orderValue: null,
      samples: ['OrtoPlus · trial'],
    },
    {
      date: '24/jan · sex',
      time: '11h40',
      duration: '28 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Entrega',
      withWhom: 'Ana (compras)',
      note: 'Entrega acompanhada do pedido de janeiro. Confirmado lote CardioFlex correto. Sem imprevistos.',
      outcome: 'positivo',
      orderValue: 'R$ 3.680',
      samples: null,
    },
    {
      date: '08/jan · qua',
      time: '15h15',
      duration: '20 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Prospecção',
      withWhom: 'Dr. Paulo Cardoso',
      note: 'Tentativa de aproximação com Dr. Paulo (cardio). Recebeu material, não comprometeu. Relação ainda fria.',
      outcome: 'negativo',
      orderValue: null,
      samples: ['CardioFlex · 2un'],
    },
    {
      date: '19/dez · qui',
      time: '10h00',
      duration: '47 min',
      consultant: 'Rafael Melo',
      consultantHue: 220,
      consultantInitials: 'RM',
      kind: 'Reunião agendada',
      withWhom: 'Dra. Mariana Silva',
      note: 'Planejamento do Q1. Cliente sinalizou aumento de 20% no volume de AtlasGel para jan/fev.',
      outcome: 'positivo',
      orderValue: null,
      samples: null,
    },
  ],

  doctors: [
    {
      initials: 'MS', hue: 12,
      name: 'Dra. Mariana Silva',
      role: 'Decisora · Ortopedia',
      crm: 'CRM/SP 142.801',
      faculty: 'USP (Medicina · 2008)',
      birthday: '14 de junho',
      team: 'Palmeiras',
      interests: 'Corrida de rua · vinho tinto',
      note: 'Prefere reuniões de manhã. Evita segundas.',
      isDecisor: true,
    },
    {
      initials: 'HF', hue: 280,
      name: 'Dra. Helena Ferreira',
      role: 'Ortopedia · nova (mar/2026)',
      crm: 'CRM/SP 198.442',
      faculty: 'UNIFESP (Medicina · 2014)',
      birthday: '02 de setembro',
      team: '—',
      interests: 'Yoga · literatura',
      note: 'Ainda não apresentada ao portfólio completo.',
      isNew: true,
    },
    {
      initials: 'PC', hue: 150,
      name: 'Dr. Paulo Cardoso',
      role: 'Cardiologia',
      crm: 'CRM/SP 087.211',
      faculty: 'Santa Casa SP (1996)',
      birthday: '22 de novembro',
      team: 'São Paulo FC',
      interests: 'Pesca · Fórmula 1',
      note: 'Prescreve BioDerma. Relação fria.',
      isCold: true,
    },
  ],

  // Fontes pagadoras — participação no faturamento da clínica (mix de convênios).
  // Valores somam 100%. As cores seguem a paleta Atlasmed (navy + green + amber + neutros).
  payers: [
    { name: 'Outras', share: 50, note: 'Particular + convênios menores' },
    { name: 'Sul America', share: 20 },
    { name: 'Amil', share: 10 },
    { name: 'Bradesco Saúde', share: 10 },
    { name: 'Porto Seguro Saúde', share: 10 },
  ],

  notes: [
    'Estacionamento difícil — usar Zona Azul na rua de trás.',
    'Recepcionista Ana é ótima ponte com Dra. Mariana.',
    'Pedidos sempre fechados até dia 20 (fechamento contábil).',
  ],
};

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────
function CSectionHeader({ title, subtitle, action }) {
  return (
    <div style={{
      padding: '20px 20px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      fontFamily: 'Inter, system-ui',
    }}>
      <div>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
          color: '#8a94a6', marginBottom: 2,
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: '#6b7280' }}>{subtitle}</div>}
      </div>
      {action && (
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#1e40af', fontSize: 12.5, fontWeight: 600,
          fontFamily: 'Inter, system-ui', padding: 0,
        }}>{action}</button>
      )}
    </div>
  );
}

function CCard({ children, style = {} }) {
  return (
    <div style={{
      margin: '0 16px 0', padding: 16,
      background: '#fff',
      border: '1px solid #edeff3',
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      ...style,
    }}>{children}</div>
  );
}

function CStat({ label, value, sub, tone = 'default', compact = false }) {
  const tones = {
    default: { color: '#0f1729' },
    good: { color: '#117a55' },
    warn: { color: '#b5751c' },
    bad:  { color: '#b84545' },
  };
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
        color: '#8a94a6', marginBottom: 4, fontFamily: 'Inter, system-ui',
      }}>{label}</div>
      <div style={{
        fontSize: compact ? 15 : 18, fontWeight: 700, letterSpacing: -0.3,
        color: tones[tone].color, fontFamily: 'Inter, system-ui',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#8a94a6', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Suggest-edit primitives
// Changes made here are *suggestions* — sent for administrative review
// before they go live. Used across the clinic + doctor profiles.
// ─────────────────────────────────────────────────────────────
function PencilIcon({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.8l2.2 2.2-6 6H2V7.8l6-6z"/>
      <path d="M7 2.8l2.2 2.2"/>
    </svg>
  );
}

function EditPencilButton({
  onClick, title = 'Sugerir edição',
  fieldKey = 'clinicPhone',
  currentValue = '—',
  entityType = 'clinic',
  entityId = 'c-0',
  entityName = '',
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        aria-label={title}
        onClick={(e) => {
          if (e?.stopPropagation) e.stopPropagation();
          if (onClick) onClick(e);
          setOpen(true);
        }}
        style={{
          width: 22, height: 22, borderRadius: 11,
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#8a94a6', padding: 0, flexShrink: 0,
        }}
      >
        <PencilIcon/>
      </button>
      <EditSuggestionModal
        open={open}
        onClose={() => setOpen(false)}
        fieldKey={fieldKey}
        currentValue={currentValue}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
      />
    </>
  );
}

function EmptyChip({
  label = 'Completar', onClick,
  fieldKey = 'clinicPhone',
  entityType = 'clinic',
  entityId = 'c-0',
  entityName = '',
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          if (e?.stopPropagation) e.stopPropagation();
          if (onClick) onClick(e);
          setOpen(true);
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 999,
          background: 'rgba(198,134,27,0.12)',
          border: '1px dashed #c6861b',
          color: '#8a5a0f', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
        }}
      >
        <span style={{ fontSize: 12, lineHeight: 0.8, fontWeight: 700 }}>+</span>
        {label}
      </button>
      <EditSuggestionModal
        open={open}
        onClose={() => setOpen(false)}
        fieldKey={fieldKey}
        currentValue="—"
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
      />
    </>
  );
}

// Inline wrapper: shows value + pencil, or a "Completar" chip if empty.
// `isEmpty(val)` is customizable (default: falsy or '—' / '-').
function Editable({
  value, mono = false, placeholder = 'Completar',
  style = {}, valueStyle = {},
  fieldKey = 'clinicPhone',
  entityType = 'clinic',
  entityId = 'c-0',
  entityName = '',
}) {
  const empty = !value || value === '—' || value === '-';
  if (empty) {
    return (
      <span style={{ display: 'inline-flex', ...style }}>
        <EmptyChip
          label={placeholder}
          fieldKey={fieldKey} entityType={entityType}
          entityId={entityId} entityName={entityName}
        />
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      minWidth: 0, ...style,
    }}>
      <span style={{
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
        ...valueStyle,
      }}>{value}</span>
      <EditPencilButton
        fieldKey={fieldKey} currentValue={value}
        entityType={entityType} entityId={entityId} entityName={entityName}
      />
    </span>
  );
}

// One-time banner hint: shown near the top of each profile so the user
// understands edits are suggestions, not direct writes.
function SuggestEditBanner() {
  return (
    <div style={{
      margin: '16px 16px 0',
      padding: '10px 12px',
      background: '#fff',
      border: '1px solid #e5ebf3',
      borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'Inter, system-ui',
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 15, flexShrink: 0,
        background: '#eef2ff', color: '#1e40af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PencilIcon size={14}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1 }}>
          Sugerir alterações no perfil
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1, lineHeight: 1.35 }}>
          Toque o lápis em qualquer campo. Sugestões passam por revisão administrativa antes de entrar no perfil.
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3l4 4-4 4"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fotos — compact tap-through row that replaces the inline gallery.
// Stacked thumbnails + meta + chevron.
// ─────────────────────────────────────────────────────────────
function PhotosButton({ gallery = [], title = 'Fotos', subtitle, initialOpen = false }) {
  const preview = gallery.slice(0, 3);
  const last = gallery[0];
  const [galleryOpen, setGalleryOpen] = React.useState(initialOpen);
  return (
    <div style={{ margin: '16px 16px 0' }}>
      <button
        onClick={() => gallery.length > 0 && setGalleryOpen(true)}
        style={{
        width: '100%', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#fff', border: '1px solid #edeff3', borderRadius: 14,
        cursor: gallery.length > 0 ? 'pointer' : 'default',
        fontFamily: 'Inter, system-ui', textAlign: 'left',
        boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      }}>
        {/* stacked thumbs */}
        <div style={{ position: 'relative', width: 74, height: 42, flexShrink: 0 }}>
          {preview.length === 0 ? (
            <div style={{
              width: 42, height: 42, borderRadius: 8,
              background: '#f3f4f6', border: '1px dashed #d1d5db',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8a94a6',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="4" width="13" height="10" rx="1.5"/>
                <circle cx="9" cy="9.3" r="2.5"/>
                <path d="M6.5 4l1-1.3h3L11.5 4"/>
              </svg>
            </div>
          ) : preview.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: i * 16, top: 0,
              width: 42, height: 42, borderRadius: 8,
              background: `hsl(${p.hue}, 40%, 72%)`,
              border: '2px solid #fff',
              overflow: 'hidden', zIndex: 3 - i,
              boxShadow: '0 1px 3px rgba(15,23,41,0.12)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `repeating-linear-gradient(45deg, hsl(${p.hue}, 46%, 70%) 0 4px, hsl(${p.hue}, 42%, 76%) 4px 8px)`,
              }}/>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>
            {title} <span style={{ fontWeight: 500, color: '#6b7280' }}>· {gallery.length}</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle || (last ? `Última: ${last.label} · ${last.date}` : 'Nenhuma foto ainda')}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8a94a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5"/>
        </svg>
      </button>
      <PhotoGalleryViewer
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={gallery}
        title={title}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Header — hero with title, status, distance, priority dot
// ─────────────────────────────────────────────────────────────
function ClinicHeader({ clinic, onBack }) {
  const lastVisit = clinic.visits?.[0];
  const outcomeColor = lastVisit
    ? (OUTCOME_META[lastVisit.outcome]?.color || '#86efac')
    : '#86efac';
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(165deg, #0a2f7f 0%, #1e40af 70%, #2850c8 110%)',
      color: '#fff',
      padding: '14px 16px 22px',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* soft orb for texture */}
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110,
        background: 'radial-gradient(circle, rgba(147,197,253,0.35) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      {/* top row — back + kebab */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={iconCircleStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.9l-3.6 1.9.7-4.1-3-2.9 4.1-.6L8 2.5z"/>
            </svg>
          </button>
          <button style={iconCircleStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
          </button>
        </div>
      </div>

      {/* title block — avatar + text side-by-side */}
      <div style={{ position: 'relative', marginTop: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <ClinicAvatar clinic={clinic} size={72}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.22)',
            fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
            marginBottom: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: clinic.status.color, boxShadow: `0 0 0 3px ${clinic.status.color}22` }}/>
            {clinic.status.label} · {clinic.clientType.label}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15,
            marginBottom: 6,
          }}>{clinic.name}</div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.78)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 11s4-3.4 4-6.8a4 4 0 00-8 0C2 7.6 6 11 6 11z"/><circle cx="6" cy="4.3" r="1.3"/></svg>
              Itaim Bibi · {clinic.distance} km
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{clinic.subtitle}</div>
        </div>
      </div>

      {/* At-a-glance ribbon — last interaction + full address, so the consultant
          knows where they stand the moment the profile opens. */}
      <div style={{
        position: 'relative', marginTop: 14,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {lastVisit && (
          <div style={{
            alignSelf: 'flex-start',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 11px 5px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            fontSize: 11.5, color: '#fff', fontWeight: 600,
            letterSpacing: 0.1,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: 4, background: outcomeColor,
              boxShadow: `0 0 0 3px ${outcomeColor}44`,
            }}/>
            <span>Última interação · {lastVisit.date.split(' ·')[0]}</span>
            <span style={{ opacity: 0.7, fontWeight: 500 }}>· {lastVisit.kind}</span>
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M6.5 12s4.5-3.8 4.5-7.5a4.5 4.5 0 00-9 0C2 8.2 6.5 12 6.5 12z"/>
            <circle cx="6.5" cy="4.8" r="1.6"/>
          </svg>
          <span style={{ flex: 1, minWidth: 0 }}>{clinic.address}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Clinic avatar — "profile picture" used in the header.
// Uses a subtly-striped SVG placeholder with the clinic's initials on top.
// ─────────────────────────────────────────────────────────────
function ClinicAvatar({ clinic, size = 72 }) {
  const initials = clinic.name
    .replace(/^Clínica\s+/i, '')
    .split(/\s+/).slice(0, 2)
    .map(s => s[0]).join('').toUpperCase();
  const hue = clinic.photo?.hue ?? 218;
  return (
    <div
      role="button"
      aria-label="Foto da clínica"
      style={{
        width: size, height: size, borderRadius: size / 2,
        flexShrink: 0, position: 'relative', overflow: 'hidden',
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        background: `hsl(${hue}, 40%, 72%)`,
        cursor: 'pointer',
      }}
    >
      {/* diagonal stripe placeholder */}
      <svg width="100%" height="100%" viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`stripes-${hue}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="8" height="8" fill={`hsl(${hue}, 40%, 72%)`}/>
            <rect width="4" height="8" fill={`hsl(${hue}, 45%, 66%)`}/>
          </pattern>
        </defs>
        <rect width="72" height="72" fill={`url(#stripes-${hue})`}/>
        <circle cx="36" cy="36" r="20" fill={`hsl(${hue}, 45%, 92%)`} fillOpacity="0.9"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.32, fontWeight: 700, letterSpacing: -0.5,
        color: `hsl(${hue}, 55%, 28%)`, fontFamily: 'Inter, system-ui',
      }}>{initials}</div>
      {/* camera badge */}
      <div style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 22, height: 22, borderRadius: 11,
        background: '#fff', color: '#1e40af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 3.5h2l1-1.3h3l1 1.3h2a1 1 0 011 1v4.7a1 1 0 01-1 1H1.5a1 1 0 01-1-1V4.5a1 1 0 011-1z"/>
          <circle cx="6" cy="6.8" r="2"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Clinic photo gallery — horizontally-scrolling strip of photos
// ─────────────────────────────────────────────────────────────
function PhotoTile({ photo, size = 128 }) {
  // Striped-SVG placeholder with a monospace caption — users replace with real shots.
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      border: '1px solid #edeff3',
      background: `hsl(${photo.hue}, 40%, 88%)`,
      fontFamily: 'Inter, system-ui',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`pstripes-${photo.hue}-${photo.label}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <rect width="10" height="10" fill={`hsl(${photo.hue}, 42%, 88%)`}/>
            <rect width="5" height="10" fill={`hsl(${photo.hue}, 48%, 80%)`}/>
          </pattern>
        </defs>
        <rect width="128" height="128" fill={`url(#pstripes-${photo.hue}-${photo.label})`}/>
      </svg>
      {/* monospace caption explainer */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        padding: '2px 6px', borderRadius: 4,
        background: 'rgba(255,255,255,0.85)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 9, color: `hsl(${photo.hue}, 55%, 28%)`,
        letterSpacing: 0.2,
      }}>{photo.placeholder}</div>
      {/* caption footer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 8px 8px',
        background: 'linear-gradient(180deg, rgba(15,23,41,0) 0%, rgba(15,23,41,0.72) 100%)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: -0.1, lineHeight: 1.1 }}>{photo.label}</div>
        <div style={{ fontSize: 9.5, opacity: 0.85, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{photo.date}</div>
      </div>
    </div>
  );
}

function ClinicGallery({ gallery }) {
  return (
    <>
      <CSectionHeader title={`Fotos · ${gallery.length}`} subtitle="tocadas pelo consultor em visita" action="Adicionar"/>
      <div style={{
        display: 'flex', gap: 10, padding: '0 16px 2px',
        overflowX: 'auto', overflowY: 'hidden',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
      }}>
        {gallery.map((p, i) => (
          <div key={i} style={{ scrollSnapAlign: 'start' }}>
            <PhotoTile photo={p}/>
          </div>
        ))}
        {/* add-photo tile */}
        <button style={{
          width: 128, height: 128, borderRadius: 12, flexShrink: 0,
          background: '#fff', border: '1px dashed #c7d2fe',
          color: '#1e40af', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: 'Inter, system-ui',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6h3l1.5-2h7L15 6h3a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1z"/>
            <circle cx="11" cy="11.5" r="3.2"/>
            <path d="M11 9.5v4M9 11.5h4"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Tirar foto</span>
        </button>
      </div>
    </>
  );
}

const iconCircleStyle = {
  width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(255,255,255,0.22)',
  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', cursor: 'pointer',
};

// ─────────────────────────────────────────────────────────────
// Quick-action bar — floats between header and content
// ─────────────────────────────────────────────────────────────
function ClinicQuickActions() {
  const actions = [
    { k: 'call', label: 'Ligar', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12.5v2.2a1.5 1.5 0 01-1.6 1.5c-2.3-.2-4.5-1-6.3-2.4a13 13 0 01-4-4A13 13 0 011 3.6 1.5 1.5 0 012.5 2H5l1.4 3.3L5 6.5a9 9 0 004 4l1.2-1.4L13.5 10l1.5 2.5z"/></svg> },
    { k: 'wa', label: 'WhatsApp', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 9a6.5 6.5 0 01-9.6 5.7L2 16l1.3-3.8A6.5 6.5 0 1115.5 9z"/><path d="M6 7.5c.5 2 2 3.5 4 4 .5 0 1-.3 1.3-.7l.5-.6c.3-.3.7-.4 1-.2l1 .5c.4.2.5.7.3 1-.5 1-1.6 1.5-2.7 1.4a7.5 7.5 0 01-6-6c-.1-1 .4-2.2 1.4-2.7.3-.2.8-.1 1 .3l.5 1c.2.3.1.7-.2 1l-.6.5c-.4.3-.5.8-.5 1.2z"/></svg> },
    { k: 'route', label: 'Rota', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 16s5-5.2 5-9a5 5 0 00-10 0c0 3.8 5 9 5 9z"/><circle cx="9" cy="7" r="2"/></svg> },
    { k: 'visit', label: 'Nova visita', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4" width="13" height="11" rx="2"/><path d="M2.5 7h13M6 2.5v3M12 2.5v3M9 9v4M7 11h4"/></svg> },
    { k: 'order', label: 'Novo pedido', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l1.2 9a1.5 1.5 0 001.5 1.3h5.8a1.5 1.5 0 001.5-1.2l1-5.1H6"/><circle cx="7" cy="15.5" r="1"/><circle cx="13" cy="15.5" r="1"/></svg> },
  ];
  return (
    <div style={{
      margin: '-14px 16px 0', position: 'relative', zIndex: 2,
      padding: '10px 6px',
      background: '#fff',
      border: '1px solid #edeff3',
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(15,23,41,0.08)',
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'Inter, system-ui',
    }}>
      {actions.map(a => (
        <button key={a.k} style={{
          flex: 1, border: 'none', background: 'transparent',
          padding: '4px 0', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          color: '#1e40af',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1e40af',
          }}>{a.icon}</div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#1e3a8a', letterSpacing: 0.1 }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Consultor + tipo de cliente + localização
// ─────────────────────────────────────────────────────────────
function ClinicContextCard({ clinic }) {
  const c = clinic.consultant;
  return (
    <CCard style={{ marginTop: 16 }}>
      {/* Consultor responsável row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 21,
          background: `hsl(${c.hue}, 48%, 86%)`, color: `hsl(${c.hue}, 55%, 28%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontFamily: 'Inter, system-ui',
          flexShrink: 0,
        }}>{c.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 2 }}>Consultor responsável</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.15 }}>{c.name}</div>
          <div style={{ fontSize: 11.5, color: '#6b7280' }}>{c.role}</div>
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 16,
          background: '#f3f4f6', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6b7280',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2l4 4-8 8H0v-4l8-8z"/></svg>
        </button>
      </div>

      <div style={{ height: 1, background: '#eef0f3', margin: '12px -16px 12px' }}/>

      {/* Client type + freshness */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 6 }}>Tipo de cliente</div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 9px', borderRadius: 999,
            background: clinic.clientType.bg, color: clinic.clientType.color,
            fontSize: 12, fontWeight: 600, fontFamily: 'Inter, system-ui',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: clinic.clientType.color }}/>
            {clinic.clientType.label}
          </span>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{clinic.clientType.sub}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 6 }}>Cidade / região</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>Itaim Bibi</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>São Paulo · SP · Z. Sul</div>
        </div>
      </div>
    </CCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Signals (alertas/oportunidades rápidas)
// ─────────────────────────────────────────────────────────────
function ClinicSignals({ signals }) {
  const tones = {
    warn: { dot: '#c6861b', bg: 'rgba(198,134,27,0.10)', border: 'rgba(198,134,27,0.3)', icon: '!' },
    good: { dot: '#16a373', bg: 'rgba(22,163,115,0.10)', border: 'rgba(22,163,115,0.3)', icon: '+' },
    info: { dot: '#1e40af', bg: 'rgba(30,64,175,0.08)', border: 'rgba(30,64,175,0.25)', icon: 'i' },
  };
  return (
    <>
      <CSectionHeader title="Avisos · últimos 30 dias"/>
      <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Inter, system-ui' }}>
        {signals.map((s, i) => {
          const t = tones[s.kind];
          return (
            <div key={i} style={{
              padding: '12px 14px',
              background: t.bg, border: `1px solid ${t.border}`,
              borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                background: t.dot, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, fontFamily: 'Inter, system-ui',
              }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.45 }}>{s.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Saúde comercial — LTV · Ticket médio · Frequência
// ─────────────────────────────────────────────────────────────
function ClinicHealth({ health }) {
  return (
    <>
      <CSectionHeader title="Saúde comercial" action="Ver histórico"/>
      <CCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <CStat label="LTV" value={health.ltv} sub={health.ltvSub} compact/>
          <CStat label="Ticket médio" value={health.avgTicket} sub={health.avgTicketSub} compact/>
          <CStat label="Frequência" value={health.frequency} sub={health.frequencySub} compact/>
        </div>
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Produtos em uso — com mini barrinhas + share
// ─────────────────────────────────────────────────────────────
function ProductRow({ product }) {
  const max = Math.max(...product.trend);
  const positive = product.growth >= 0;
  return (
    <div style={{ padding: '12px 0', fontFamily: 'Inter, system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>{product.name}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{product.volume} / 6m</span>
        </div>
        <span style={{
          fontSize: 11.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          color: positive ? '#117a55' : '#b84545',
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          {positive ? '▲' : '▼'} {Math.abs(product.growth)}%
        </span>
      </div>

      {/* trend bars + share bar side-by-side */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28, flexShrink: 0 }}>
          {product.trend.map((v, i) => (
            <div key={i} style={{
              width: 5, height: `${(v / max) * 100}%`, minHeight: 3,
              background: i === product.trend.length - 1 ? '#1e40af' : '#c7d2fe',
              borderRadius: 2,
            }}/>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#6b7280', marginBottom: 3, fontVariantNumeric: 'tabular-nums' }}>
            <span>Share na clínica</span>
            <span style={{ fontWeight: 600, color: '#0f1729' }}>{product.share}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: '#eef0f3', overflow: 'hidden' }}>
            <div style={{ width: `${product.share}%`, height: '100%', background: '#1e40af', borderRadius: 3 }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicProducts({ products }) {
  return (
    <>
      <CSectionHeader title="Produtos em uso" subtitle="últimos 6 meses" action="Ver todos"/>
      <CCard>
        {products.map((p, i) => (
          <React.Fragment key={p.name}>
            {i > 0 && <div style={{ height: 1, background: '#eef0f3', margin: '0 -16px' }}/>}
            <ProductRow product={p}/>
          </React.Fragment>
        ))}
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Oportunidades + Concorrentes
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Add to today's route — prominent CTA
// ─────────────────────────────────────────────────────────────
function AddToRouteButton({ clinic }) {
  const [added, setAdded] = React.useState(false);
  return (
    <div style={{ margin: '16px 16px 0', fontFamily: 'Inter, system-ui' }}>
      <button
        onClick={() => setAdded(a => !a)}
        style={{
          width: '100%', padding: '14px 16px',
          borderRadius: 14,
          border: added ? '1px solid rgba(22,163,115,0.35)' : '1px solid transparent',
          background: added
            ? 'rgba(22,163,115,0.10)'
            : 'linear-gradient(135deg, #1e40af 0%, #2850c8 100%)',
          color: added ? '#117a55' : '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
          boxShadow: added ? 'none' : '0 6px 16px rgba(30,64,175,0.25)',
          transition: 'all 180ms',
        }}
      >
        {added ? (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l4 4 8-8"/>
            </svg>
            <span>Na rota de hoje · posição 3</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 16s5-5.2 5-9a5 5 0 00-10 0c0 3.8 5 9 5 9z"/>
              <circle cx="9" cy="7" r="2"/>
              <path d="M14 13h3M15.5 11.5v3"/>
            </svg>
            <span>Adicionar à rota de hoje</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mapa e clínicas próximas
// ─────────────────────────────────────────────────────────────
function ClinicNearby({ clinic }) {
  const [radius, setRadius] = React.useState(2.5);
  const nearby = clinic.nearby.filter(n => n.distance <= radius);
  const maxKm = 5;

  return (
    <>
      <CSectionHeader title="Mapa e clínicas próximas" subtitle={`${nearby.length} dentro de ${radius.toFixed(1)} km`}/>
      <CCard>
        {/* Map visual */}
        <div style={{
          position: 'relative', height: 200, borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(180deg, #eef3fb 0%, #e2ebf6 100%)',
          border: '1px solid #e5ebf3',
        }}>
          {/* Dot grid for "map" texture */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
            <defs>
              <pattern id="mapdots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.9" fill="#b8c5d8"/>
              </pattern>
              <pattern id="maproads" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M0 30 H60 M30 0 V60" stroke="#cbd5e1" strokeWidth="0.6" fill="none"/>
                <path d="M0 0 L60 60" stroke="#d8e0ea" strokeWidth="0.4" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#maproads)"/>
            <rect width="100%" height="100%" fill="url(#mapdots)"/>
          </svg>

          {/* Radius ring */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: `${(radius / maxKm) * 90}%`, aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1.5px dashed rgba(30,64,175,0.45)',
            background: 'radial-gradient(circle, rgba(30,64,175,0.08) 0%, rgba(30,64,175,0.02) 70%, transparent 100%)',
          }}/>

          {/* Nearby pins */}
          {clinic.nearby.map((n) => {
            const inRange = n.distance <= radius;
            const left = 50 + (n.dx / maxKm) * 45;
            const top = 50 + (n.dy / maxKm) * 45;
            return (
              <div key={n.id} style={{
                position: 'absolute', left: `${left}%`, top: `${top}%`,
                transform: 'translate(-50%, -100%)',
                opacity: inRange ? 1 : 0.32,
                transition: 'opacity 180ms',
              }}>
                <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                  <path d="M9 23 C9 23 1.5 14 1.5 8.5 a7.5 7.5 0 0115 0 C16.5 14 9 23 9 23z"
                    fill={n.statusColor} stroke="#fff" strokeWidth="1.5"/>
                  <circle cx="9" cy="8.5" r="3" fill="#fff"/>
                </svg>
              </div>
            );
          })}

          {/* Center pin (current clinic) */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              padding: '3px 9px', borderRadius: 999,
              background: '#0f1729', color: '#fff',
              fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(15,23,41,0.25)',
              fontFamily: 'Inter, system-ui',
            }}>Você está aqui</div>
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              <path d="M12 31 C12 31 2 19 2 11.5 a10 10 0 0120 0 C22 19 12 31 12 31z"
                fill="#1e40af" stroke="#fff" strokeWidth="2"/>
              <circle cx="12" cy="11.5" r="4" fill="#fff"/>
            </svg>
          </div>

          {/* Recenter button */}
          <button style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: 17,
            background: '#fff', border: '1px solid #e5ebf3',
            boxShadow: '0 2px 6px rgba(15,23,41,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#1e40af',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Radius slider */}
        <div style={{ marginTop: 14, fontFamily: 'Inter, system-ui' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6' }}>Raio de busca</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', fontVariantNumeric: 'tabular-nums' }}>{radius.toFixed(1)} km</div>
          </div>
          <input
            type="range" min="0.5" max={maxKm} step="0.1" value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            style={{
              width: '100%', accentColor: '#1e40af', height: 4, cursor: 'pointer',
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: '#8a94a6', fontVariantNumeric: 'tabular-nums', marginTop: 2,
          }}>
            <span>0.5 km</span><span>{maxKm} km</span>
          </div>
        </div>

        <div style={{ height: 1, background: '#eef0f3', margin: '14px -16px' }}/>

        {/* Nearby list */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 8, fontFamily: 'Inter, system-ui' }}>
          Clínicas no raio
        </div>
        {nearby.length === 0 ? (
          <div style={{ padding: '18px 0', textAlign: 'center', color: '#8a94a6', fontSize: 12, fontFamily: 'Inter, system-ui' }}>
            Nenhuma clínica neste raio.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {nearby.sort((a,b) => a.distance - b.distance).map((n, i) => (
              <button
                key={n.id}
                onClick={() => { /* would navigate to clinic page */ }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid #eef0f3' : 'none',
                  background: 'transparent', border: 'none',
                  borderTopLeftRadius: 0, borderTopRightRadius: 0,
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                  fontFamily: 'Inter, system-ui',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: 4, background: n.statusColor, flexShrink: 0,
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                    {n.specialty} · {n.statusLabel}
                  </div>
                </div>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: '#1e40af',
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>{n.distance.toFixed(1)} km</div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3l4 4-4 4"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Histórico de visitas — last 5
// ─────────────────────────────────────────────────────────────
const OUTCOME_META = {
  positivo: { color: '#16a373', label: 'Positivo', bg: 'rgba(22,163,115,0.12)' },
  neutro:   { color: '#8a94a6', label: 'Neutro',   bg: 'rgba(138,148,166,0.14)' },
  misto:    { color: '#c6861b', label: 'Misto',    bg: 'rgba(198,134,27,0.14)' },
  negativo: { color: '#b84545', label: 'Negativo', bg: 'rgba(184,69,69,0.12)' },
};

function VisitItem({ visit, isLast }) {
  const meta = OUTCOME_META[visit.outcome] || OUTCOME_META.neutro;
  return (
    <div style={{ display: 'flex', gap: 12, fontFamily: 'Inter, system-ui', position: 'relative' }}>
      {/* timeline rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14, flexShrink: 0 }}>
        <div style={{
          width: 10, height: 10, borderRadius: 5, background: meta.color,
          marginTop: 5, boxShadow: `0 0 0 3px ${meta.color}22`,
        }}/>
        {!isLast && <div style={{ flex: 1, width: 2, background: '#eef0f3', marginTop: 3, minHeight: 20 }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 2 : 16 }}>
        {/* Top row — date + consultant avatar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1 }}>{visit.date}</span>
            <span style={{ fontSize: 11, color: '#8a94a6', fontVariantNumeric: 'tabular-nums' }}>
              {visit.time} · {visit.duration}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 9,
              background: `hsl(${visit.consultantHue}, 48%, 86%)`, color: `hsl(${visit.consultantHue}, 55%, 28%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>{visit.consultantInitials}</div>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{visit.consultant}</span>
          </div>
        </div>

        {/* Kind · with whom chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: meta.bg, color: meta.color,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.2,
          }}>{visit.kind}</span>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: '#f3f4f6', color: '#4b5563',
            fontSize: 10.5, fontWeight: 500,
          }}>com {visit.withWhom}</span>
          {visit.orderValue && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(22,163,115,0.12)', color: '#117a55',
              fontSize: 10.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            }}>pedido · {visit.orderValue}</span>
          )}
          {visit.samples && visit.samples.map((s, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(30,64,175,0.08)', color: '#1e40af',
              fontSize: 10.5, fontWeight: 500,
            }}>amostra · {s}</span>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5, marginTop: 6, textWrap: 'pretty' }}>{visit.note}</div>
      </div>
    </div>
  );
}

function ClinicVisits({ visits }) {
  const [filter, setFilter] = React.useState('todas');
  const filters = [
    { key: 'todas', label: 'Todas', count: visits.length },
    { key: 'positivo', label: 'Positivas', count: visits.filter(v => v.outcome === 'positivo').length },
    { key: 'misto', label: 'Mistas', count: visits.filter(v => v.outcome === 'misto').length },
    { key: 'negativo', label: 'Negativas', count: visits.filter(v => v.outcome === 'negativo').length },
  ];
  const matching = filter === 'todas' ? visits : visits.filter(v => v.outcome === filter);
  // Surface the 3 most recent so the card closes cleanly; the full log lives
  // behind "Ver histórico completo →".
  const filtered = matching.slice(0, 3);
  const hiddenCount = matching.length - filtered.length;

  // Quick stats across all visits
  const orderCount = visits.filter(v => v.orderValue).length;
  const totalValue = visits
    .filter(v => v.orderValue)
    .reduce((sum, v) => sum + parseFloat(v.orderValue.replace(/[^\d,]/g, '').replace(',', '.')), 0);
  const avgDuration = Math.round(
    visits.reduce((s, v) => {
      const m = v.duration.match(/(\d+)\s*h?\s*(\d+)?/);
      const h = v.duration.includes('h') ? parseInt(m[1]) * 60 : 0;
      const min = v.duration.includes('h') ? (m[2] ? parseInt(m[2]) : 0) : parseInt(m[1]);
      return s + h + min;
    }, 0) / visits.length
  );

  return (
    <>
      <CSectionHeader
        title="Histórico de visitas"
        subtitle={`${visits.length} registradas · última em ${visits[0].date.split(' ·')[0]}`}
        action="Ver todas"
      />
      <CCard>
        {/* summary strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          padding: '4px 0 14px', borderBottom: '1px solid #eef0f3', marginBottom: 12,
        }}>
          <CStat label="Visitas" value={visits.length} sub="últimos 4 meses" compact/>
          <CStat label="Pedidos" value={orderCount} sub={`R$ ${totalValue.toLocaleString('pt-BR')}`} tone="good" compact/>
          <CStat label="Duração média" value={`${avgDuration} min`} sub="por visita" compact/>
        </div>

        {/* filter pills */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
          fontFamily: 'Inter, system-ui',
        }}>
          {filters.map(f => {
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: '5px 11px', borderRadius: 999,
                border: `1px solid ${active ? '#1e40af' : '#e5e7eb'}`,
                background: active ? '#1e40af' : '#fff',
                color: active ? '#fff' : '#374151',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {f.label}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '0 5px', borderRadius: 6,
                  background: active ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
                  color: active ? '#fff' : '#6b7280',
                  fontVariantNumeric: 'tabular-nums',
                }}>{f.count}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#8a94a6', fontSize: 12 }}>
            Nenhuma visita deste tipo.
          </div>
        ) : (
          filtered.map((v, i) => (
            <VisitItem key={i} visit={v} isLast={i === filtered.length - 1}/>
          ))
        )}

        {/* see-all footer */}
        <button style={{
          marginTop: 10, width: '100%',
          padding: '10px 0', borderRadius: 10,
          background: '#f7f9fc', border: '1px solid #eef0f3',
          color: '#1e40af', fontSize: 12.5, fontWeight: 600,
          fontFamily: 'Inter, system-ui', cursor: 'pointer',
        }}>
          {hiddenCount > 0
            ? `Ver histórico completo · +${hiddenCount} visita${hiddenCount === 1 ? '' : 's'} →`
            : 'Ver histórico completo →'}
        </button>
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Médicos — personal cards
// ─────────────────────────────────────────────────────────────
function DoctorCard({ doctor }) {
  const tag = doctor.isDecisor
    ? { text: 'Decisora', bg: 'rgba(30,64,175,0.10)', color: '#1e40af' }
    : doctor.isNew
    ? { text: 'Nova', bg: 'rgba(22,163,115,0.10)', color: '#117a55' }
    : doctor.isCold
    ? { text: 'Fria', bg: 'rgba(184,69,69,0.10)', color: '#b84545' }
    : null;
  return (
    <div style={{
      padding: 14, borderRadius: 12,
      background: '#fff', border: '1px solid #edeff3',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20,
          background: `hsl(${doctor.hue}, 48%, 88%)`, color: `hsl(${doctor.hue}, 55%, 30%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{doctor.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
            <span style={{
              fontSize: 13.5, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{doctor.name}</span>
            {tag && (
              <span style={{
                padding: '1px 7px', borderRadius: 999,
                background: tag.bg, color: tag.color,
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
                flexShrink: 0,
              }}>{tag.text}</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280' }}>{doctor.role} · {doctor.crm}</div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 6, columnGap: 10,
        padding: '8px 0', borderTop: '1px solid #eef0f3',
      }}>
        <PersonalBit icon="🎓" label="Formação" value={doctor.faculty}/>
        <PersonalBit icon="🎂" label="Aniversário" value={doctor.birthday}/>
        <PersonalBit icon="⚽" label="Time" value={doctor.team}/>
        <PersonalBit icon="♡" label="Interesses" value={doctor.interests}/>
      </div>

      {doctor.note && (
        <div style={{
          marginTop: 6, padding: '8px 10px', borderRadius: 8,
          background: '#fffbe8', border: '1px solid #fde68a',
          fontSize: 11.5, color: '#713f12', lineHeight: 1.4,
          display: 'flex', gap: 7, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 11 }}>📌</span>
          <span>{doctor.note}</span>
        </div>
      )}

      {/* jump to full doctor profile */}
      <button style={{
        marginTop: 10, width: '100%',
        padding: '8px 10px', borderRadius: 8,
        background: '#f7f9fc', border: '1px solid #eef0f3',
        color: '#1e40af', fontSize: 12, fontWeight: 600,
        fontFamily: 'Inter, system-ui', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>Ver perfil completo</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2l4 4-4 4"/>
        </svg>
      </button>
    </div>
  );
}

function PersonalBit({ icon, label, value }) {
  // Emojis kept minimal and personal — only on doctor mini-cards.
  // Empty values ('—' or blank) become a "Completar" chip so the consultant
  // can suggest the missing detail for admin review.
  const empty = !value || value === '—' || value === '-';
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 2 }}>{label}</div>
      {empty ? (
        <EmptyChip/>
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: '100%',
        }}>
          <span style={{
            fontSize: 11.5, color: '#0f1729', fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{value}</span>
          <EditPencilButton/>
        </div>
      )}
    </div>
  );
}

function ClinicDoctors({ doctors }) {
  // Fit ~2 cards visible at once — the rest reachable by vertical scroll.
  // Each card has its own "Ver perfil completo →" affordance.
  return (
    <>
      <CSectionHeader title={`Médicos · ${doctors.length}`} subtitle="role para ver mais" action="Adicionar"/>
      <div style={{
        margin: '0 16px',
        maxHeight: 420,
        overflowY: 'auto',
        border: '1px solid #eef0f3',
        borderRadius: 14,
        background: '#f7f8fb',
        padding: 10,
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative',
      }}>
        {doctors.map(d => <DoctorCard key={d.name} doctor={d}/>)}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Notas de campo (pins)
// ─────────────────────────────────────────────────────────────
function ClinicNotes({ notes }) {
  return (
    <>
      <CSectionHeader title="Notas de campo" subtitle="só você vê"/>
      <CCard>
        {notes.map((n, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '8px 0',
            borderBottom: i < notes.length - 1 ? '1px solid #eef0f3' : 'none',
            fontFamily: 'Inter, system-ui',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
              background: '#eef2ff', color: '#1e40af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{i + 1}</div>
            <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.45 }}>{n}</div>
          </div>
        ))}
        <button style={{
          marginTop: 4, width: '100%',
          padding: '10px 0', borderRadius: 10,
          background: 'transparent', border: '1px dashed #c7d2fe',
          color: '#1e40af', fontSize: 12.5, fontWeight: 600,
          fontFamily: 'Inter, system-ui', cursor: 'pointer',
        }}>+ Adicionar nota</button>
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Administrativo
// ─────────────────────────────────────────────────────────────
function ClinicAdmin({ clinic }) {
  const rows = [
    { k: 'CNPJ', v: clinic.cnpj, mono: true },
    { k: 'Endereço', v: clinic.address },
    { k: 'Telefone', v: clinic.phone, mono: true },
    { k: 'E-mail', v: clinic.email },
    { k: 'Site', v: clinic.website },
    { k: 'Horário', v: clinic.hours },
  ];
  return (
    <>
      <CSectionHeader title="Informações administrativas" subtitle="alterações passam por revisão" action="Sugerir edição"/>
      <CCard style={{ marginBottom: 24 }}>
        {rows.map((r, i) => (
          <div key={r.k} style={{
            display: 'flex', gap: 12, padding: '10px 0',
            alignItems: 'center',
            borderBottom: i < rows.length - 1 ? '1px solid #eef0f3' : 'none',
            fontFamily: 'Inter, system-ui',
          }}>
            <div style={{ width: 84, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', color: '#8a94a6', flexShrink: 0 }}>{r.k}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#0f1729', lineHeight: 1.4 }}>
              <Editable value={r.v} mono={r.mono}/>
            </div>
          </div>
        ))}
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main screen — stitched
// ─────────────────────────────────────────────────────────────
function ClinicDetailScreen({ clinic = CLINIC_DETAIL, onBack = () => {} }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f7f8fb',
      overflowY: 'auto',
      fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Explorar" active="explorar"/>
      <ClinicHeader clinic={clinic} onBack={onBack}/>
      <ClinicQuickActions/>
      <SuggestEditBanner/>
      <ClinicContextCard clinic={clinic}/>
      <AddToRouteButton clinic={clinic}/>
      <PhotosButton gallery={clinic.gallery} title="Fotos da clínica"/>
      <ClinicSignals signals={clinic.signals}/>
      <ClinicHealth health={clinic.health}/>
      <ClinicProducts products={clinic.products}/>
      <ClinicPayers payers={clinic.payers}/>
      <ClinicNearby clinic={clinic}/>
      <ClinicVisits visits={clinic.visits}/>
      <ClinicDoctors doctors={clinic.doctors}/>
      <ClinicNotes notes={clinic.notes}/>
      <ClinicAdmin clinic={clinic}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fontes pagadoras — payer mix (convênios)
// Donut chart anchored to the brand palette, paired with an ordered
// list of rows. Pencil icon on the card header signals "editable"
// (matching the reference screenshot from the user), but the real
// editor lives elsewhere.
// ─────────────────────────────────────────────────────────────
const PAYER_PALETTE = [
  { fill: '#1e40af', soft: 'rgba(30,64,175,0.12)' },   // navy — dominant brand
  { fill: '#16a373', soft: 'rgba(22,163,115,0.14)' },  // atlas green
  { fill: '#c6861b', soft: 'rgba(198,134,27,0.14)' },  // amber
  { fill: '#0a2f7f', soft: 'rgba(10,47,127,0.12)' },   // deep navy
  { fill: '#6d7a90', soft: 'rgba(109,122,144,0.14)' }, // slate
  { fill: '#8b5cf6', soft: 'rgba(139,92,246,0.14)' },  // accent (reserved)
];

function PayerDonut({ payers, size = 148, thickness = 22 }) {
  // Build arc segments. SVG is 0..2π clockwise starting at 12 o'clock.
  const total = payers.reduce((s, p) => s + p.share, 0) || 100;
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - thickness) / 2;
  const inner = r - thickness / 2;
  const outer = r + thickness / 2;

  let acc = 0;
  const segs = payers.map((p, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2; // rotate so 0 is top
    acc += p.share;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const largeArc = p.share / total > 0.5 ? 1 : 0;
    const p1 = { x: cx + outer * Math.cos(start), y: cy + outer * Math.sin(start) };
    const p2 = { x: cx + outer * Math.cos(end),   y: cy + outer * Math.sin(end)   };
    const p3 = { x: cx + inner * Math.cos(end),   y: cy + inner * Math.sin(end)   };
    const p4 = { x: cx + inner * Math.cos(start), y: cy + inner * Math.sin(start) };
    const d = [
      `M ${p1.x} ${p1.y}`,
      `A ${outer} ${outer} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${inner} ${inner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');
    return { d, fill: PAYER_PALETTE[i % PAYER_PALETTE.length].fill };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0f3" strokeWidth={thickness}/>
      {/* segments */}
      {segs.map((s, i) => (
        <path key={i} d={s.d} fill={s.fill} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
      ))}
      {/* center total */}
      <text x={cx} y={cy - 4} textAnchor="middle"
        fontFamily="Inter, system-ui" fontWeight="700" fontSize="22"
        fill="#0f1729" letterSpacing="-0.5">100%</text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        fontFamily="Inter, system-ui" fontWeight="600" fontSize="9"
        fill="#8a94a6" letterSpacing="1.2">FATURAMENTO</text>
    </svg>
  );
}

function ClinicPayers({ payers }) {
  // sorted copy so the largest segment renders first and gets the dominant color
  const sorted = [...payers].sort((a, b) => b.share - a.share);
  const top = sorted[0];
  return (
    <>
      <CSectionHeader
        title="Fontes pagadoras"
        subtitle="participação no faturamento"
        action="Editar"
      />
      <CCard>
        {/* Top row — donut + headline stat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Inter, system-ui' }}>
          <div style={{ flexShrink: 0 }}>
            <PayerDonut payers={sorted}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 4 }}>
              Principal fonte
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{top.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{
                fontSize: 22, fontWeight: 700, color: PAYER_PALETTE[0].fill,
                letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
              }}>{top.share}%</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>do faturamento</span>
            </div>
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 8,
              background: '#f7f9fc', border: '1px solid #eef0f3',
              fontSize: 11, color: '#4b5563', lineHeight: 1.4,
            }}>
              {sorted.length} fontes cadastradas · atualizado há 14 dias
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#eef0f3', margin: '14px -16px 12px' }}/>

        {/* Payer rows */}
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
          {sorted.map((p, i) => {
            const color = PAYER_PALETTE[i % PAYER_PALETTE.length];
            return (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i > 0 ? '1px solid #eef0f3' : 'none',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3, background: color.fill, flexShrink: 0,
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{p.name}</div>
                  {/* thin share bar */}
                  <div style={{ height: 4, borderRadius: 2, background: '#eef0f3', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${p.share}%`, height: '100%',
                      background: color.fill, borderRadius: 2,
                    }}/>
                  </div>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#0f1729',
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  minWidth: 38, textAlign: 'right',
                }}>{p.share}%</span>
              </div>
            );
          })}
        </div>
      </CCard>
    </>
  );
}

Object.assign(window, {
  ClinicDetailScreen, CLINIC_DETAIL,
  ClinicHeader, ClinicAvatar, ClinicGallery, PhotoTile,
  ClinicQuickActions, ClinicContextCard, ClinicSignals,
  ClinicHealth, ClinicProducts, ClinicPayers, ClinicNearby,
  ClinicVisits, ClinicDoctors,
  ClinicNotes, ClinicAdmin, AddToRouteButton,
  // Shared edit/suggestion + photo primitives — also used on the Doctor page.
  Editable, EmptyChip, EditPencilButton, SuggestEditBanner, PhotosButton, PencilIcon,
});
