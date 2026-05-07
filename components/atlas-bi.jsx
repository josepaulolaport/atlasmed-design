// atlas-bi.jsx — Business Intelligence / Performance screen for the rep.
//
// Iteration goals (this revision):
//  - Same visual rhythm as before (warm bg, white cards, navy/green/amber/red).
//  - Resumo: existing 4 KPIs + 3 commercial KPIs (Pedidos, Receita, Ticket
//    médio). Every KPI is clickable → metric detail screen.
//  - Meta: pace indicator (acima/abaixo do esperado para o ponto do período)
//    + projeção simples baseada no ritmo atual. CTA "Ver atividade" abre a
//    tela de atividade detalhada.
//  - Território: ativas / em risco / nunca compraram + cobertura explícita
//    "X de Y clínicas visitadas". Card é clicável.
//  - Clínicas (funil): mantém estrutura, mas cada status é clicável e abre
//    a lista filtrada com filtros adicionais (região, última interação).
//  - Oportunidades: organizado como funil progressivo
//    (sem interação → visitada → em negociação → pedido) com indicador de
//    valor potencial em R$.
//  - Atividade: linha de meta diária sobre o gráfico + média do período.
//  - Conversão: definição explícita + ícone de info ("visitas que geraram
//    pedidos").
//  - Qualidade dos dados: CTA forte "Corrigir cadastros" → tela de ação.
//  - Base de clínicas: removida (redundante com seção de Clínicas).
//  - Camada de inteligência: banner contextual no topo + insights inline
//    discretos próximos das seções relevantes.
//  - Timestamps relativos: "Atualizado há X minutos".
//  - Estados de vazio, loading, erro e offline disponíveis (StateBlock).
//
// Navegação para detalhes: managed via React.useState({ type, ... }) inside
// BIScreen. A DetailScreen overlay slides over the dashboard with a back
// button. Each detail screen has a period filter + a list of items + basic
// filtering chips. We keep them simple but functional so the design clearly
// shows the navigation pattern.

// ─────────────────────────────────────────────────────────────
// BI data (mock — would come from API)
// ─────────────────────────────────────────────────────────────
const BI_DATA = {
  period: 'semana',
  // Period progress: how far we are into "this week" — used by pace + projection.
  // 4 days of 7 elapsed → 57% do período.
  periodProgressPct: 57,
  updatedMinutesAgo: 3,
  online: true,
  snapshot: {
    visitsToday: { value: 6, delta: +2, goal: 8 },
    visitsWeek: { value: 28, delta: +4, goal: 35 },
    followupsPending: { value: 12, delta: -3 },
    newClinics: { value: 4, delta: +1 },
    pedidos: { value: 19, delta: +6 },
    receita: { value: 'R$ 142k', deltaPct: +12, raw: 142000 },
    ticketMedio: { value: 'R$ 7,4k', deltaPct: -3, raw: 7470 },
  },
  // Goal: enriched with pace + projection.
  goal: {
    current: 28, target: 35, pct: 80,
    expectedAtPoint: 20,        // expected at this point of the period (57%)
    paceDeltaPct: +40,          // 28 vs 20 expected → +40% above pace
    projection: 49,             // mantendo o ritmo atual: 49 visitas até o fim
    daysLeftLabel: '3 dias restantes',
  },
  territory: {
    total: 142,
    ativas: 84, ativasPct: 59,
    risco: 18, riscoPct: 13,
    nuncaCompraram: 31, nuncaCompraramPct: 22,
    coverage: { visited: 88, total: 142, pct: 62 },
  },
  funnel: [
    { k: 'sem',     label: 'Sem interação', n: 18, pct: 13, color: '#8a94a6' },
    { k: 'neg',     label: 'Em negociação', n: 22, pct: 15, color: '#c6861b' },
    { k: 'ativa',   label: 'Ativa',         n: 84, pct: 59, color: '#16a373' },
    { k: 'risco',   label: 'Em risco',      n: 12, pct: 8,  color: '#cf6c4b' },
    { k: 'rej',     label: 'Rejeição',      n: 6,  pct: 5,  color: '#7a3737' },
  ],
  activity: [
    { d: 'Seg', n: 3 }, { d: 'Ter', n: 4 }, { d: 'Qua', n: 5 }, { d: 'Qui', n: 2 },
    { d: 'Sex', n: 6 }, { d: 'Sáb', n: 0 }, { d: 'Dom', n: 0 },
    { d: 'Seg', n: 5 }, { d: 'Ter', n: 7, best: true }, { d: 'Qua', n: 4 }, { d: 'Qui', n: 6 },
    { d: 'Sex', n: 6 }, { d: 'Sáb', n: 0 }, { d: 'Dom', n: 0 },
  ],
  dailyGoal: 5,
  conversion: {
    visits: 142, interest: 68, conversions: 21,
    interestRate: 48, conversionRate: 15,
  },
  dataQuality: { completePct: 78, filled: 111, incomplete: 31 },
};

// Mock detail-screen rows.
const DETAIL_ROWS = {
  visitsToday: [
    { title: 'Clínica Itaim Bibi',   sub: '09:12 · Dr. Almeida',          tag: 'Concluída', tagTone: 'good' },
    { title: 'Centro Médico Jardins', sub: '10:30 · Dra. Carvalho',       tag: 'Concluída', tagTone: 'good' },
    { title: 'Pinheiros Saúde',      sub: '11:45 · sem médico responsável', tag: 'Em rota', tagTone: 'info' },
    { title: 'Vila Olímpia Clinic',  sub: '13:10 · Dr. Bernardes',        tag: 'Concluída', tagTone: 'good' },
    { title: 'Moema Pediatria',      sub: '14:30 · Dra. Tomé',            tag: 'Em rota',   tagTone: 'info' },
    { title: 'Brooklin Saúde',       sub: '16:00 · sem responsável',      tag: 'Pendente',  tagTone: 'warn' },
  ],
  visitsWeek: [
    { title: '28 visitas em 4 dias', sub: 'Seg–Qui · média 7/dia',         tag: '+4 vs sem.', tagTone: 'good' },
  ],
  followupsPending: [
    { title: 'Centro Médico Jardins', sub: 'Última visita há 14 dias',    tag: 'Vencido',  tagTone: 'warn' },
    { title: 'Morumbi Médico',        sub: 'Última visita há 11 dias',    tag: 'Vencido',  tagTone: 'warn' },
    { title: 'Saúde Ipiranga',        sub: 'Última visita há 9 dias',     tag: 'Hoje',     tagTone: 'info' },
    { title: 'Tatuapé Clínica',       sub: 'Última visita há 7 dias',     tag: 'Em 2 dias',tagTone: 'info' },
  ],
  newClinics: [
    { title: 'Clínica Vila Mariana', sub: 'Cadastrada há 3 dias',         tag: 'Nova',     tagTone: 'good' },
    { title: 'Liberdade Saúde',      sub: 'Cadastrada há 5 dias',         tag: 'Nova',     tagTone: 'good' },
    { title: 'Lapa Clinic',          sub: 'Cadastrada há 9 dias',         tag: 'Nova',     tagTone: 'good' },
    { title: 'Perdizes Médico',      sub: 'Cadastrada há 12 dias',        tag: 'Nova',     tagTone: 'good' },
  ],
  pedidos: [
    { title: 'Itaim Bibi · #2841',    sub: 'Hoje · R$ 12.400',             tag: 'Faturado', tagTone: 'good' },
    { title: 'Pinheiros · #2837',     sub: 'Ontem · R$ 8.900',             tag: 'Faturado', tagTone: 'good' },
    { title: 'Vila Olímpia · #2832',  sub: 'há 2 dias · R$ 14.700',        tag: 'Aprovado', tagTone: 'info' },
    { title: 'Moema · #2828',         sub: 'há 3 dias · R$ 6.200',         tag: 'Aprovado', tagTone: 'info' },
  ],
  receita: [
    { title: 'Itaim Bibi',           sub: '4 pedidos · ticket R$ 11k',     tag: 'R$ 44k',   tagTone: 'good' },
    { title: 'Vila Olímpia',         sub: '3 pedidos · ticket R$ 9k',      tag: 'R$ 27k',   tagTone: 'good' },
    { title: 'Pinheiros',            sub: '5 pedidos · ticket R$ 5k',      tag: 'R$ 25k',   tagTone: 'good' },
    { title: 'Moema',                sub: '2 pedidos · ticket R$ 8k',      tag: 'R$ 16k',   tagTone: 'good' },
  ],
  ticketMedio: [
    { title: 'Vila Olímpia Clinic',  sub: 'Ticket médio · 3 pedidos',      tag: 'R$ 9.0k',  tagTone: 'good' },
    { title: 'Itaim Bibi',           sub: 'Ticket médio · 4 pedidos',      tag: 'R$ 11.0k', tagTone: 'good' },
    { title: 'Brooklin Saúde',       sub: 'Ticket médio · 1 pedido',       tag: 'R$ 4.2k',  tagTone: 'warn' },
    { title: 'Moema Pediatria',      sub: 'Ticket médio · 2 pedidos',      tag: 'R$ 8.1k',  tagTone: 'good' },
  ],
};

// Mock clinic lists per status (for the funnel drilldown).
const STATUS_CLINICS = {
  sem: [
    { title: 'Clínica Saúde Brasil',  sub: 'Itaim · ainda não abordada',     tag: 'Sem interação', tagTone: 'muted' },
    { title: 'CardioVida Pinheiros',  sub: 'Pinheiros · sem visita',         tag: 'Sem interação', tagTone: 'muted' },
    { title: 'Pediatria Moema',       sub: 'Moema · cadastro recente',       tag: 'Sem interação', tagTone: 'muted' },
    { title: 'Saúde Berrini',         sub: 'Berrini · cadastrada 24 abr',    tag: 'Sem interação', tagTone: 'muted' },
  ],
  neg: [
    { title: 'Centro Médico Jardins', sub: '3 visitas · proposta enviada',   tag: 'Em negociação', tagTone: 'warn' },
    { title: 'Vila Olímpia Clinic',   sub: '2 visitas · aguarda decisão',    tag: 'Em negociação', tagTone: 'warn' },
    { title: 'Saúde Higienópolis',    sub: '1 visita · interessado',         tag: 'Em negociação', tagTone: 'warn' },
  ],
  ativa: [
    { title: 'Itaim Bibi',           sub: '4 pedidos no mês · ativa',        tag: 'Ativa', tagTone: 'good' },
    { title: 'Pinheiros Saúde',      sub: '3 pedidos no mês · ativa',        tag: 'Ativa', tagTone: 'good' },
    { title: 'Moema Pediatria',      sub: '2 pedidos no mês · ativa',        tag: 'Ativa', tagTone: 'good' },
    { title: 'Vila Olímpia Clinic',  sub: '5 pedidos no mês · ativa',        tag: 'Ativa', tagTone: 'good' },
    { title: 'Brooklin Saúde',       sub: '2 pedidos no mês · ativa',        tag: 'Ativa', tagTone: 'good' },
  ],
  risco: [
    { title: 'Morumbi Médico',       sub: 'Sem pedido há 45 dias',           tag: 'Em risco', tagTone: 'warn' },
    { title: 'C. Belo Saúde',        sub: 'Sem pedido há 38 dias',           tag: 'Em risco', tagTone: 'warn' },
    { title: 'Tatuapé Clínica',      sub: 'Sem pedido há 32 dias',           tag: 'Em risco', tagTone: 'warn' },
  ],
  rej: [
    { title: 'Saúde Total',          sub: 'Recusou proposta · 12/03',        tag: 'Rejeição', tagTone: 'bad' },
    { title: 'Lapa Clinic',          sub: 'Recusou proposta · 28/02',        tag: 'Rejeição', tagTone: 'bad' },
  ],
};

// Territory clinics (visited / not-visited)
const TERRITORY_CLINICS = [
  { title: 'Itaim Bibi',           sub: 'Itaim · 2 visitas no período',  tag: 'Visitada',     tagTone: 'good' },
  { title: 'Centro Médico Jardins', sub: 'Jardins · 1 visita',           tag: 'Visitada',     tagTone: 'good' },
  { title: 'Pinheiros Saúde',      sub: 'Pinheiros · 3 visitas',         tag: 'Visitada',     tagTone: 'good' },
  { title: 'Morumbi Médico',       sub: 'Morumbi · sem visita há 45 d',  tag: 'Não visitada', tagTone: 'warn' },
  { title: 'Saúde Ipiranga',       sub: 'Ipiranga · sem visita há 22 d', tag: 'Não visitada', tagTone: 'warn' },
  { title: 'Tatuapé Clínica',      sub: 'Tatuapé · sem visita há 30 d',  tag: 'Não visitada', tagTone: 'warn' },
  { title: 'Santana Médico',       sub: 'Santana · nunca visitada',      tag: 'Não visitada', tagTone: 'muted' },
];

const INCOMPLETE_CLINICS = [
  { id: 'card-pinh', kind: 'clinic',
    title: 'CardioVida Pinheiros',
    sub: 'Faltam contato e médico responsável',
    subtitle: 'Pinheiros · São Paulo',
    tag: '2 campos', tagTone: 'warn',
    missing: ['contato', 'medicos'],
    filled: {
      nome:     'CardioVida Pinheiros',
      endereco: 'R. Teodoro Sampaio, 800 — Pinheiros',
      cnpj:     '12.345.678/0001-90',
      horario:  'Seg–Sex 08h–19h',
      email:    'contato@cardiovida.com.br',
    },
  },
  { id: 'ped-moema', kind: 'clinic',
    title: 'Pediatria Moema',
    sub: 'Falta CNPJ',
    subtitle: 'Moema · São Paulo',
    tag: '1 campo', tagTone: 'warn',
    missing: ['cnpj'],
    filled: {
      nome:     'Pediatria Moema',
      endereco: 'Av. Ibirapuera, 1500 — Moema',
      medicos:  'Dra. Tomé · Pediatria',
      horario:  'Seg–Sáb 09h–18h',
      contato:  '(11) 4555-1234',
      email:    'contato@pedmoema.com.br',
    },
  },
  { id: 'brk-saud', kind: 'clinic',
    title: 'Brooklin Saúde',
    sub: 'Faltam horário e médico responsável',
    subtitle: 'Brooklin · São Paulo',
    tag: '2 campos', tagTone: 'warn',
    missing: ['horario', 'medicos'],
    filled: {
      nome:     'Brooklin Saúde',
      endereco: 'R. Verbo Divino, 500 — Brooklin',
      cnpj:     '98.765.432/0001-10',
      contato:  '(11) 5566-3344',
      email:    'oi@brooklinsaude.com.br',
    },
  },
  { id: 'sau-tot', kind: 'clinic',
    title: 'Saúde Total',
    sub: 'Falta endereço completo',
    subtitle: 'Lapa · São Paulo',
    tag: '1 campo', tagTone: 'warn',
    missing: ['endereco'],
    filled: {
      nome:     'Saúde Total',
      cnpj:     '11.222.333/0001-44',
      contato:  '(11) 3344-5566',
      medicos:  'Dr. Albuquerque · Clínico Geral',
      horario:  'Seg–Sex 08h–18h',
      email:    'contato@saudetotal.com.br',
    },
  },
  { id: 'dr-bento', kind: 'doctor',
    title: 'Dr. Felipe Bento',
    sub: 'Faltam CRM e e-mail',
    subtitle: 'Pinheiros Saúde · Cardiologia',
    tag: '2 campos', tagTone: 'warn',
    missing: ['crm', 'email'],
    filled: {
      nome:          'Dr. Felipe Bento',
      especialidade: 'Cardiologia',
      telefone:      '(11) 99876-5432',
    },
  },
  { id: 'dr-tome', kind: 'doctor',
    title: 'Dra. Beatriz Tomé',
    sub: 'Falta especialidade detalhada',
    subtitle: 'Moema Pediatria · Pediatria',
    tag: '1 campo', tagTone: 'warn',
    missing: ['especialidade'],
    filled: {
      nome:     'Dra. Beatriz Tomé',
      crm:      'CRM-SP 156.872',
      telefone: '(11) 99123-4567',
      email:    'beatriz.tome@moema.com.br',
    },
  },
];

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

function BICard({ children, style = {}, pad = 16, onClick, role }) {
  const clickable = !!onClick;
  return (
    <div onClick={onClick} role={role || (clickable ? 'button' : undefined)} style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${BI_COLOR.line}`,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
      padding: pad, fontFamily: 'Inter, system-ui',
      cursor: clickable ? 'pointer' : 'default',
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

function ChevronRight({ size = 12, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none"
      stroke={color || 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2l4 4-4 4"/>
    </svg>
  );
}

function InfoIcon({ size = 12, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none"
      stroke={color || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 5.5v2.5M6 4v.1"/>
    </svg>
  );
}

const TAG_TONE = {
  good:  { bg: 'rgba(22,163,115,0.12)',  color: '#117a55' },
  warn:  { bg: 'rgba(198,134,27,0.16)',  color: '#a76d14' },
  bad:   { bg: 'rgba(184,69,69,0.14)',   color: '#a13c3c' },
  info:  { bg: 'rgba(30,64,175,0.10)',   color: '#1e40af' },
  muted: { bg: '#eef0f3',                color: '#6b7280' },
};

function Tag({ children, tone = 'info' }) {
  const t = TAG_TONE[tone] || TAG_TONE.info;
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      background: t.bg, color: t.color, whiteSpace: 'nowrap',
      letterSpacing: 0.1,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// BIHeader — minimalist chrome
// ─────────────────────────────────────────────────────────────
function BIHeader({ onMenuOpen, onRefresh, leftIcon = 'menu', leftLabel, kicker, title, right }) {
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
      <button onClick={onMenuOpen} aria-label={leftLabel || 'Abrir menu'} style={{
        width: 40, height: 40, borderRadius: 12,
        background: '#fff', border: `1px solid ${BI_COLOR.line}`,
        boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
      }}>
        {leftIcon === 'back' ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4l-5 5 5 5"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 5h12M3 9h12M3 13h8"/></svg>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: BI_COLOR.faint }}>
          {kicker || 'Portal · Desempenho'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title || 'Olá, Rafael'}
        </div>
      </div>

      {right || (
        <>
          <button onClick={onRefresh} aria-label="Atualizar" style={{
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
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PeriodFilter — segmented control (also reused inside detail screens)
// ─────────────────────────────────────────────────────────────
function PeriodFilter({ value, onChange, compact = false }) {
  // "Total" = todo o período (sem recorte temporal). Aparece junto aos
  // recortes temporais para que o vendedor possa comparar a performance
  // da semana/mês contra o histórico completo.
  const opts = [
    { k: 'hoje',   l: 'Hoje' },
    { k: 'semana', l: 'Semana' },
    { k: 'mes',    l: 'Mês' },
    { k: 'total',  l: 'Total' },
    { k: 'custom', l: 'Custom' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4, borderRadius: 12,
      background: '#eef0f3', fontFamily: 'Inter, system-ui',
    }}>
      {opts.map(o => {
        const on = o.k === value;
        return (
          <button key={o.k} onClick={() => onChange && onChange(o.k)} style={{
            flex: 1, height: compact ? 30 : 34, borderRadius: 9, border: 'none',
            background: on ? '#fff' : 'transparent',
            color: on ? BI_COLOR.navyDeep : BI_COLOR.muted,
            fontSize: compact ? 11 : 11.5, fontWeight: 600, cursor: 'pointer',
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
// LiveStatus — relative timestamp, online/offline pill
// ─────────────────────────────────────────────────────────────
function LiveStatus({ minutesAgo = 0, online = true }) {
  if (!online) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10.5, color: '#a13c3c', fontFamily: 'Inter, system-ui',
        fontWeight: 600,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3, background: '#b84545',
        }}/>
        Offline · exibindo dados em cache
      </div>
    );
  }
  const label = minutesAgo <= 0
    ? 'Atualizado agora'
    : minutesAgo < 60
      ? `Atualizado há ${minutesAgo} min`
      : `Atualizado há ${Math.floor(minutesAgo/60)} h`;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 10.5, color: BI_COLOR.faint, fontFamily: 'Inter, system-ui',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 3, background: BI_COLOR.green,
        boxShadow: `0 0 0 3px rgba(22,163,115,0.2)`,
      }}/>
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPIBlock — clickable; supports raw or pre-formatted values
// ─────────────────────────────────────────────────────────────
function KPIBlock({ label, value, delta, deltaPct, deltaLabel = 'vs período anterior', suffix, tone = 'navy', onClick }) {
  const change = delta != null ? delta : deltaPct;
  const positive = change > 0;
  const negative = change < 0;
  const deltaColor = positive ? BI_COLOR.green : negative ? BI_COLOR.red : BI_COLOR.faint;
  const tones = {
    navy:  { bar: '#1e40af', bg: 'rgba(30,64,175,0.06)' },
    green: { bar: '#16a373', bg: 'rgba(22,163,115,0.07)' },
    amber: { bar: '#c6861b', bg: 'rgba(198,134,27,0.08)' },
    plum:  { bar: '#6b5a8a', bg: 'rgba(107,90,138,0.08)' },
    teal:  { bar: '#0e7c8a', bg: 'rgba(14,124,138,0.08)' },
    rose:  { bar: '#b3477a', bg: 'rgba(179,71,122,0.08)' },
    slate: { bar: '#4b5563', bg: 'rgba(75,85,99,0.07)' },
  };
  const t = tones[tone] || tones.navy;
  const formattedDelta = deltaPct != null
    ? `${positive ? '+' : ''}${deltaPct}%`
    : `${positive ? '+' : ''}${delta}`;
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: onClick ? 'pointer' : 'default',
      position: 'relative', background: '#fff',
      border: `1px solid ${BI_COLOR.line}`, borderRadius: 14,
      padding: '14px 14px 12px',
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      overflow: 'hidden', display: 'block',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
        borderRadius: 2, background: t.bar,
      }}/>
      <div style={{ paddingLeft: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: BI_COLOR.faint }}>
            {label}
          </div>
          {onClick && <ChevronRight color={BI_COLOR.faint}/>}
        </div>
        <div style={{
          fontSize: 24, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.7,
          fontVariantNumeric: 'tabular-nums', marginTop: 4,
          display: 'flex', alignItems: 'baseline', gap: 4,
        }}>
          {value}
          {suffix && <span style={{ fontSize: 12, fontWeight: 500, color: BI_COLOR.muted }}>{suffix}</span>}
        </div>
        {change != null && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: deltaColor, marginTop: 3,
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {positive && <path d="M2 7l3-4 3 4"/>}
              {negative && <path d="M2 3l3 4 3-4"/>}
              {change === 0 && <path d="M2 5h6"/>}
            </svg>
            {formattedDelta} {deltaLabel}
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ResumoGroup — agrupamento de KPIs em torno de uma métrica-âncora.
//
// O resumo do dashboard é dividido em dois grupos coesos (Comercial e
// Atividade) em vez de uma grade de 7 cards independentes. Cada grupo:
//   - tem uma métrica-âncora maior no topo (clicável → detalhe),
//   - exibe a variação vs período anterior padronizada como tag,
//   - lista métricas secundárias relacionadas em uma linha-rodapé com
//     divisores verticais para preservar a leitura horizontal.
// O resultado é menos peso visual e leitura mais fluida.
// ─────────────────────────────────────────────────────────────
function ResumoGroup({ kicker, hero, sub, deltaText, deltaTone = 'good', onHeroClick, items = [] }) {
  return (
    <BICard pad={0}>
      <button onClick={onHeroClick} style={{
        all: 'unset', cursor: onHeroClick ? 'pointer' : 'default',
        display: 'block', width: '100%', boxSizing: 'border-box',
        padding: '14px 16px 14px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
            textTransform: 'uppercase', color: BI_COLOR.faint,
          }}>{kicker}</span>
          {onHeroClick && <ChevronRight color={BI_COLOR.faint}/>}
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          gap: 10, marginTop: 4,
        }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.8,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.05,
          }}>{hero}</span>
          {deltaText && <Tag tone={deltaTone}>{deltaText}</Tag>}
        </div>
        {sub && (
          <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 3 }}>
            {sub}
          </div>
        )}
      </button>
      {items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          borderTop: `1px solid ${BI_COLOR.lineSoft}`,
        }}>
          {items.map((it, i) => (
            <button key={it.k} onClick={it.onClick} style={{
              all: 'unset', cursor: it.onClick ? 'pointer' : 'default',
              padding: '10px 12px',
              borderLeft: i > 0 ? `1px solid ${BI_COLOR.lineSoft}` : 'none',
              display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0,
            }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6,
                textTransform: 'uppercase', color: BI_COLOR.faint,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 15, fontWeight: 700, color: BI_COLOR.ink,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
                }}>{it.value}</span>
                {it.delta && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: it.deltaTone === 'good' ? BI_COLOR.green
                      : it.deltaTone === 'bad' ? BI_COLOR.red
                      : BI_COLOR.muted,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{it.delta}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// MetaAtividadeCard — fusão das seções "Meta da semana" e "Atividade".
//
// A meta semanal e o ritmo diário contam a mesma história: onde o
// vendedor está vs onde precisa chegar, e em qual cadência. Em vez de
// exibir esses sinais em dois cards separados (e repetir o conceito de
// meta/dia em ambos), agrupamos tudo em um único card com seções
// internas separadas por divisores:
//   1. Hero — anel de progresso + numeração + barra de pace com marcador
//      do esperado para este ponto do período.
//   2. Linha de stats (3 colunas): Ritmo · Projeção · Meta diária. A meta
//      diária deixa de ser um detalhe oculto no cabeçalho da Atividade
//      e ganha o mesmo peso visual do Ritmo e da Projeção.
//   3. Gráfico de 14 dias com a linha de meta sobreposta.
//   4. CTA único "Ver atividade detalhada" → tela de análise.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// AtividadesPreviewCard — preview rápido das atividades recentes
// (visitas, ligações, pedidos, apresentações). Cada linha mostra
// ícone tipado, título, cliente e horário. CTA "Ver todas" abre
// o histórico completo (ActivityFullListScreen, Phase 3).
// ─────────────────────────────────────────────────────────────
const ATIVIDADES_PREVIEW = [
  { type: 'visit',        icon: '🏥', tone: '#1e40af', title: 'Reunião com Dr. João Silva',         entity: 'Clínica Santa Mônica', time: '15:30',           tag: 'Positiva',   tagTone: 'good' },
  { type: 'order',        icon: '📦', tone: '#16a373', title: 'Pedido de reposição',                entity: 'Hospital Central',     time: '10:05',           tag: 'R$ 4,8k',    tagTone: 'good' },
  { type: 'call',         icon: '📞', tone: '#8b5cf6', title: 'Follow-up pedido #PED-2841',         entity: 'Dr. Roberto Alves',    time: '11:15',           tag: '12 min',     tagTone: 'info' },
  { type: 'presentation', icon: '📊', tone: '#c6861b', title: 'Apresentação · Linha Cardio',        entity: 'Dra. Mariana Silva',   time: 'Ontem 09:00',     tag: 'Positiva',   tagTone: 'good' },
];

function AtividadesPreviewCard({ onSeeAll }) {
  return (
    <BICard pad={14}>
      <BISectionTitle title="Atividades recentes"
        right={
          <button onClick={onSeeAll} style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, color: BI_COLOR.navy,
          }}>
            Ver todas <ChevronRight/>
          </button>
        }/>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ATIVIDADES_PREVIEW.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${BI_COLOR.lineSoft}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `${a.tone}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              {a.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: BI_COLOR.ink, letterSpacing: -0.1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {a.title}
              </div>
              <div style={{
                fontSize: 11, color: BI_COLOR.muted, marginTop: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {a.entity} · {a.time}
              </div>
            </div>
            <Tag tone={a.tagTone}>{a.tag}</Tag>
          </div>
        ))}
      </div>
      <button onClick={onSeeAll} style={{
        width: '100%', marginTop: 12, padding: '10px 14px',
        border: `1px solid ${BI_COLOR.line}`, borderRadius: 10,
        background: '#fff', color: BI_COLOR.navy,
        fontSize: 12.5, fontWeight: 700,
        fontFamily: 'Inter, system-ui',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Ver histórico completo <ChevronRight color={BI_COLOR.navy}/>
      </button>
    </BICard>
  );
}

function MetaAtividadeCard({ goal, activity, dailyGoal, onActivity }) {
  const r = 28, c = 2 * Math.PI * r;
  const off = c - (goal.pct / 100) * c;
  const ahead = goal.paceDeltaPct >= 0;
  const paceColor = ahead ? BI_COLOR.green : BI_COLOR.red;

  const max = Math.max(...activity.map(d => d.n), dailyGoal, 1);
  const total = activity.reduce((a, b) => a + b.n, 0);
  const businessDays = activity.filter(d => d.d !== 'Sáb' && d.d !== 'Dom').length || 1;
  const avg = (total / businessDays).toFixed(1);
  const goalY = 84 - (dailyGoal / max) * 84;

  return (
    <BICard>
      {/* Header */}
      <BISectionTitle title="Meta e atividade"
        right={
          <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
            {goal.daysLeftLabel}
          </span>
        }/>

      {/* Hero — ring + numbers + pace bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
          <circle cx="36" cy="36" r={r} stroke="#eef0f3" strokeWidth="8" fill="none"/>
          <circle cx="36" cy="36" r={r} stroke="#16a373" strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
            transform="rotate(-90 36 36)"/>
          <text x="36" y="40" textAnchor="middle" fontFamily="Inter, system-ui"
            fontWeight="700" fontSize="15" fill={BI_COLOR.ink}
            style={{ fontVariantNumeric: 'tabular-nums' }}>{goal.pct}%</text>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 20, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.4,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {goal.current}<span style={{ color: BI_COLOR.faint, fontWeight: 500 }}> / {goal.target}</span>
            <span style={{ fontSize: 11.5, color: BI_COLOR.muted, fontWeight: 500, marginLeft: 6 }}>visitas</span>
          </div>
          {/* Pace bar with expected-at-point marker */}
          <div style={{ position: 'relative', height: 8, background: '#eef0f3', borderRadius: 4, marginTop: 10 }}>
            <div style={{
              width: `${goal.pct}%`, height: '100%',
              background: 'linear-gradient(90deg, #16a373, #0f8a5f)',
              borderRadius: 4,
            }}/>
            <div title="Esperado para este ponto do período" style={{
              position: 'absolute', top: -3, height: 14,
              left: `${(goal.expectedAtPoint / goal.target) * 100}%`,
              width: 2, background: BI_COLOR.ink, borderRadius: 1,
              transform: 'translateX(-1px)',
            }}/>
          </div>
        </div>
      </div>

      {/* Stats — Ritmo · Projeção · Meta diária */}
      <div style={{
        marginTop: 12, paddingTop: 12,
        borderTop: `1px solid ${BI_COLOR.lineSoft}`,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>
            Ritmo
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 700, color: paceColor, marginTop: 3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              {ahead ? <path d="M2 7l3-4 3 4"/> : <path d="M2 3l3 4 3-4"/>}
            </svg>
            {ahead ? '+' : ''}{goal.paceDeltaPct}%
          </div>
          <div style={{ fontSize: 10.5, color: BI_COLOR.muted, marginTop: 1 }}>
            {ahead ? 'acima' : 'abaixo'} do esperado
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>
            Projeção
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: BI_COLOR.ink, marginTop: 3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {goal.projection} visitas
          </div>
          <div style={{ fontSize: 10.5, color: BI_COLOR.muted, marginTop: 1 }}>
            mantendo o ritmo
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>
            Meta diária
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: BI_COLOR.green, marginTop: 3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {dailyGoal} / dia
          </div>
          <div style={{ fontSize: 10.5, color: BI_COLOR.muted, marginTop: 1 }}>
            média atual {avg}
          </div>
        </div>
      </div>

      {/* Activity chart — 14 days with goal line overlay */}
      <div style={{
        marginTop: 14, paddingTop: 14,
        borderTop: `1px solid ${BI_COLOR.lineSoft}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: BI_COLOR.faint }}>
            Atividade · últimos 14 dias
          </span>
          <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
            Total <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{total}</b>
          </span>
        </div>
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'flex-end', gap: 4, height: 90,
          padding: '6px 2px 0', marginBottom: 8,
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', left: 2, right: 2, top: 6 + goalY, height: 0,
            borderTop: `1px dashed ${BI_COLOR.green}`, opacity: 0.7,
            pointerEvents: 'none',
          }}/>
          <span style={{
            position: 'absolute', right: 2, top: goalY - 4,
            fontSize: 9, fontWeight: 700, color: BI_COLOR.green, letterSpacing: 0.3,
            background: '#fff', padding: '0 3px',
          }}>meta {dailyGoal}</span>
          {activity.map((d, i) => {
            const h = Math.max(4, (d.n / max) * 84);
            const weekend = d.d === 'Sáb' || d.d === 'Dom';
            const aboveGoal = d.n >= dailyGoal && !weekend;
            const color = d.best ? BI_COLOR.green : weekend ? '#d7dbe3' : aboveGoal ? '#16a373' : '#1e40af';
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
          {activity.map((d, i) => (
            <div key={i} style={{
              flex: 1, fontSize: 9.5, textAlign: 'center',
              color: (d.d === 'Sáb' || d.d === 'Dom') ? '#c9cfd9' : BI_COLOR.faint,
              fontWeight: 600,
              fontFamily: 'Inter, system-ui',
            }}>{d.d[0]}</div>
          ))}
        </div>
      </div>

      <button onClick={onActivity} style={{
        marginTop: 14, width: '100%', padding: '10px 0', borderRadius: 10,
        background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`,
        color: BI_COLOR.navy, fontSize: 12.5, fontWeight: 600,
        fontFamily: 'Inter, system-ui', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Ver atividade detalhada <ChevronRight/>
      </button>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// TerritoryCard — strategic categories + cobertura banner
// ─────────────────────────────────────────────────────────────
function TerritoryCategoryTile({ label, value, pct, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: onClick ? 'pointer' : 'default',
      background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`, borderRadius: 12,
      padding: '10px 12px', display: 'block', position: 'relative',
    }}>
      <div style={{ fontSize: 9.5, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>
    </button>
  );
}

function CoverageBanner({ visited, total, pct, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: onClick ? 'pointer' : 'default',
      width: '100%', boxSizing: 'border-box',
      background: 'linear-gradient(165deg, #eef3ff, #f7f9ff)',
      border: '1px solid #dbe4ff', borderRadius: 12,
      padding: '12px 14px', marginTop: 10,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#fff', color: BI_COLOR.navy,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(15,23,41,0.06)',
        fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums',
        letterSpacing: -0.3,
      }}>{pct}%</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9.5, color: BI_COLOR.navy, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Cobertura do território
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: BI_COLOR.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.1 }}>
          {visited} de {total} clínicas visitadas
        </div>
        {/* mini bar */}
        <div style={{ height: 4, background: 'rgba(30,64,175,0.18)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #1e40af, #2850c8)' }}/>
        </div>
      </div>
      <ChevronRight color={BI_COLOR.navy}/>
    </button>
  );
}

// Inline funil de status — used inside the Território card.
// (Replaces the standalone Clínicas/FunnelCard section.)
function FunnelStatusList({ data, total, onStatus }) {
  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10, fontFamily: 'Inter, system-ui',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: BI_COLOR.faint }}>
          Status das clínicas
        </span>
        <span style={{ fontSize: 10.5, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
          {total} no total
        </span>
      </div>
      <div style={{
        display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden',
        background: '#eef0f3', marginBottom: 10,
      }}>
        {data.map(s => (
          <div key={s.k} style={{
            width: `${s.pct}%`, background: s.color,
            borderRight: '1px solid rgba(255,255,255,0.5)',
          }} title={`${s.label}: ${s.n} (${s.pct}%)`}/>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.map((s, i) => (
          <button key={s.k} onClick={() => onStatus && onStatus(s.k, s.label)} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 0',
            borderBottom: i < data.length - 1 ? `1px solid ${BI_COLOR.lineSoft}` : 'none',
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
            <ChevronRight color={BI_COLOR.faint}/>
          </button>
        ))}
      </div>
    </>
  );
}

function TerritoryCard({ territory, funnel, onCategory, onCoverage, onStatus }) {
  return (
    <BICard>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <TerritoryCategoryTile label="Ativas" value={territory.ativas} pct={territory.ativasPct}
          color={BI_COLOR.green} onClick={() => onCategory && onCategory('ativa')}/>
        <TerritoryCategoryTile label="Em risco" value={territory.risco} pct={territory.riscoPct}
          color="#cf6c4b" onClick={() => onCategory && onCategory('risco')}/>
        <TerritoryCategoryTile label="Nunca compraram" value={territory.nuncaCompraram} pct={territory.nuncaCompraramPct}
          color={BI_COLOR.red} onClick={() => onCategory && onCategory('nunca')}/>
      </div>

      <CoverageBanner {...territory.coverage} onClick={onCoverage}/>

      {funnel && funnel.length > 0 && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: `1px solid ${BI_COLOR.lineSoft}`,
        }}>
          <FunnelStatusList data={funnel} total={territory.total} onStatus={onStatus}/>
        </div>
      )}
    </BICard>
  );
}


// ─────────────────────────────────────────────────────────────
// ActivityCard — 14-day bars + meta diária + média do período.
// Used inside ActivityDetailScreen only; the dashboard uses the
// combined MetaAtividadeCard.
// ─────────────────────────────────────────────────────────────
function ActivityCard({ data, dailyGoal }) {
  const max = Math.max(...data.map(d => d.n), dailyGoal, 1);
  const total = data.reduce((a, b) => a + b.n, 0);
  const businessDays = data.filter(d => d.d !== 'Sáb' && d.d !== 'Dom').length || 1;
  const avg = (total / businessDays).toFixed(1);
  const goalY = 84 - (dailyGoal / max) * 84; // y in 84-tall plot
  return (
    <BICard>
      <BISectionTitle title="Atividade · últimos 14 dias"
        right={
          <span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
            Média <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{avg}</b>
            {' · '}
            Meta diária <b style={{ color: BI_COLOR.green, fontWeight: 700 }}>{dailyGoal}</b>
          </span>
        }/>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'flex-end', gap: 4, height: 90,
        padding: '6px 2px 0', marginBottom: 8,
      }}>
        {/* daily-goal line */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: 2, right: 2, top: 6 + goalY, height: 0,
          borderTop: `1px dashed ${BI_COLOR.green}`, opacity: 0.7,
          pointerEvents: 'none',
        }}/>
        <span style={{
          position: 'absolute', right: 2, top: goalY - 4,
          fontSize: 9, fontWeight: 700, color: BI_COLOR.green, letterSpacing: 0.3,
          background: '#fff', padding: '0 3px',
        }}>meta {dailyGoal}</span>

        {data.map((d, i) => {
          const h = Math.max(4, (d.n / max) * 84);
          const weekend = d.d === 'Sáb' || d.d === 'Dom';
          const aboveGoal = d.n >= dailyGoal && !weekend;
          const color = d.best ? BI_COLOR.green : weekend ? '#d7dbe3' : aboveGoal ? '#16a373' : '#1e40af';
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

      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${BI_COLOR.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 8, height: 2, background: BI_COLOR.green, borderRadius: 1, borderTop: 'none' }}/>
          Meta diária {dailyGoal}
        </span>
        <span style={{ color: BI_COLOR.line }}>·</span>
        <span>Total <b style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{total}</b></span>
      </div>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// ConversionCard — definição + funnel + clickable
// ─────────────────────────────────────────────────────────────
function ConversionCard({ data, onOpen }) {
  const maxW = 100;
  const steps = [
    { k: 'v', label: 'Visitas',     n: data.visits,      color: '#1e40af', w: maxW },
    { k: 'i', label: 'Interesse',   n: data.interest,    color: '#c6861b', w: (data.interest / data.visits) * maxW },
    { k: 'c', label: 'Conversões',  n: data.conversions, color: '#16a373', w: (data.conversions / data.visits) * maxW },
  ];
  return (
    <BICard onClick={onOpen}>
      <BISectionTitle title="Conversão"
        right={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: BI_COLOR.navy, fontWeight: 600 }}>
            Análise <ChevronRight/>
          </span>
        }/>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 6,
        padding: '8px 10px', borderRadius: 10,
        background: 'rgba(30,64,175,0.06)',
        border: '1px solid rgba(30,64,175,0.14)',
        marginBottom: 12,
      }}>
        <span style={{ color: BI_COLOR.navy, marginTop: 1 }}><InfoIcon size={13}/></span>
        <span style={{ fontSize: 11, color: BI_COLOR.inkSoft, lineHeight: 1.4 }}>
          Conversão = visitas que geraram pedido no período.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s) => (
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
// DataQualityCard — strong CTA "Corrigir cadastros"
// ─────────────────────────────────────────────────────────────
function DataQualityCard({ completePct, filled, incomplete, onFix }) {
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
      <button onClick={onFix} style={{
        width: '100%', height: 40, borderRadius: 10, border: 'none',
        background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'Inter, system-ui',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: '0 6px 16px rgba(10,47,127,0.22)',
      }}>
        Corrigir cadastros
        <ChevronRight color="#fff"/>
      </button>
    </BICard>
  );
}

// ─────────────────────────────────────────────────────────────
// Generic state blocks: empty / loading / error / offline
// ─────────────────────────────────────────────────────────────
function StateBlock({ kind = 'empty', title, body, onRetry }) {
  const tone = {
    empty:   { bg: '#f7f9fc',                          color: BI_COLOR.muted,   icon: 'empty' },
    loading: { bg: '#f7f9fc',                          color: BI_COLOR.navy,    icon: 'loading' },
    error:   { bg: 'rgba(184,69,69,0.06)',             color: '#a13c3c',        icon: 'error' },
    offline: { bg: 'rgba(75,85,99,0.06)',              color: '#4b5563',        icon: 'offline' },
  }[kind] || {};
  return (
    <div style={{
      padding: 18, borderRadius: 12, background: tone.bg,
      border: `1px dashed ${BI_COLOR.line}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      fontFamily: 'Inter, system-ui', gap: 6,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: '#fff', color: tone.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(15,23,41,0.06)',
      }}>
        {tone.icon === 'loading' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 2a8 8 0 018 8" style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }}/>
          </svg>
        )}
        {tone.icon === 'empty' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="14" height="11" rx="2"/><path d="M3 9h14M7 13h6"/></svg>
        )}
        {tone.icon === 'error' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"/><path d="M10 6v5M10 13.5v.1"/></svg>
        )}
        {tone.icon === 'offline' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a12 12 0 0116 0M5 10a8 8 0 0110 0M8 13a4 4 0 014 0M10 16v.1"/></svg>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: BI_COLOR.ink }}>{title}</div>
      {body && <div style={{ fontSize: 11.5, color: BI_COLOR.muted, lineHeight: 1.4, maxWidth: 260 }}>{body}</div>}
      {kind === 'error' && (
        <button onClick={onRetry} style={{
          marginTop: 6, padding: '8px 14px', borderRadius: 10,
          border: `1px solid ${BI_COLOR.line}`, background: '#fff',
          color: BI_COLOR.navy, fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Tentar novamente</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterChips — used on detail screens
// ─────────────────────────────────────────────────────────────
function FilterChips({ value, onChange, options }) {
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0',
      WebkitOverflowScrolling: 'touch',
    }}>
      {options.map(o => {
        const on = o.k === value;
        return (
          <button key={o.k} onClick={() => onChange && onChange(o.k)} style={{
            border: `1px solid ${on ? BI_COLOR.navy : BI_COLOR.line}`,
            background: on ? 'rgba(30,64,175,0.10)' : '#fff',
            color: on ? BI_COLOR.navy : BI_COLOR.inkSoft,
            padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600,
            fontFamily: 'Inter, system-ui', whiteSpace: 'nowrap',
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ItemRow — generic list row used by all detail screens
// ─────────────────────────────────────────────────────────────
function ItemRow({ title, sub, tag, tagTone, onClick, action }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', background: '#fff',
      border: `1px solid ${BI_COLOR.line}`, borderRadius: 12,
      width: '100%', boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 1, lineHeight: 1.35 }}>{sub}</div>
      </div>
      {tag && <Tag tone={tagTone}>{tag}</Tag>}
      {action || <ChevronRight color={BI_COLOR.faint}/>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// DetailShell — common chrome for every detail screen
//   Header (back button) + sub-header (title kicker, period, summary)
//   + scrollable body + optional footer.
// ─────────────────────────────────────────────────────────────
function DetailShell({ kicker, title, summary, children, period, onPeriod, filters, filterValue, onFilter, onBack, footer }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      <BIHeader leftIcon="back" leftLabel="Voltar" onMenuOpen={onBack}
        kicker={kicker} title={title}
        right={
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        }/>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: footer ? 100 : 24 }}>
        <div style={{ padding: '14px 16px 8px' }}>
          {summary && (
            <div style={{
              padding: 14, borderRadius: 14, background: '#fff',
              border: `1px solid ${BI_COLOR.line}`,
              boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
              marginBottom: 12,
            }}>{summary}</div>
          )}
          {period !== undefined && <PeriodFilter value={period} onChange={onPeriod} compact/>}
          {filters && (
            <div style={{ marginTop: 10 }}>
              <FilterChips value={filterValue} onChange={onFilter} options={filters}/>
            </div>
          )}
        </div>
        <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      </div>

      {footer && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '12px 16px 14px',
          background: 'linear-gradient(180deg, rgba(247,248,251,0), rgba(247,248,251,0.95) 30%)',
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MetricDetail — generic list of items composing a KPI
// ─────────────────────────────────────────────────────────────
const METRIC_META = {
  visitsToday:      { kicker: 'KPI · Visitas hoje',         title: 'Visitas hoje',         summaryValue: '6 / 8',     summaryLabel: 'Visitas registradas hoje',          delta: '+2 vs ontem',          tone: 'good' },
  visitsWeek:       { kicker: 'KPI · Visitas na semana',    title: 'Visitas na semana',    summaryValue: '28 / 35',   summaryLabel: 'Visitas registradas na semana',     delta: '+4 vs sem. anterior',  tone: 'good' },
  followupsPending: { kicker: 'KPI · Follow-ups',           title: 'Follow-ups pendentes', summaryValue: '12',        summaryLabel: 'Follow-ups em aberto',              delta: '-3 vs sem. anterior',  tone: 'good' },
  newClinics:       { kicker: 'KPI · Novas clínicas',       title: 'Novas clínicas',       summaryValue: '4',         summaryLabel: 'Cadastradas no período',            delta: '+1 vs sem. anterior',  tone: 'good' },
  pedidos:          { kicker: 'KPI · Pedidos',              title: 'Pedidos',              summaryValue: '19',        summaryLabel: 'Pedidos no período',                delta: '+6 vs sem. anterior',  tone: 'good' },
  receita:          { kicker: 'KPI · Receita',              title: 'Receita',              summaryValue: 'R$ 142k',   summaryLabel: 'Receita acumulada no período',      delta: '+12% vs sem. anterior', tone: 'good' },
  ticketMedio:      { kicker: 'KPI · Ticket médio',         title: 'Ticket médio',         summaryValue: 'R$ 7,4k',   summaryLabel: 'Ticket médio do período',           delta: '-3% vs sem. anterior',  tone: 'warn' },
};

function MetricDetailScreen({ metric, onBack }) {
  const meta = METRIC_META[metric] || METRIC_META.visitsToday;
  const rows = DETAIL_ROWS[metric] || [];
  const [period, setPeriod] = React.useState('semana');
  const [filter, setFilter] = React.useState('todas');
  const filters = [
    { k: 'todas', l: 'Todas' },
    { k: 'concluidas', l: 'Concluídas' },
    { k: 'pendentes', l: 'Pendentes' },
    { k: 'rota', l: 'Em rota' },
  ];
  const summary = (
    <div>
      <div style={{ fontSize: 9.5, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {meta.summaryLabel}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>
          {meta.summaryValue}
        </span>
        <Tag tone={meta.tone}>{meta.delta}</Tag>
      </div>
    </div>
  );
  return (
    <DetailShell kicker={meta.kicker} title={meta.title} summary={summary}
      period={period} onPeriod={setPeriod}
      filters={filters} filterValue={filter} onFilter={setFilter}
      onBack={onBack}>
      {rows.length > 0
        ? rows.map((r, i) => <ItemRow key={i} {...r}/>)
        : <StateBlock kind="empty" title="Sem registros" body="Nenhum item encontrado para este filtro."/>}
    </DetailShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desempenho Comercial — substitui as 3 telas separadas
// (Receita / Pedidos / Ticket médio) por uma só tela focada,
// estilo app de trading: um KPI ativo por vez, gráfico de linha
// com scrub interativo, métricas relacionadas em baixo-relevo,
// e um feed cronológico que explica o que moveu o número.
// ─────────────────────────────────────────────────────────────
const COM_KPI_LIST = [
  { k: 'receita',     label: 'Receita' },
  { k: 'pedidos',     label: 'Pedidos' },
  { k: 'ticketMedio', label: 'Ticket médio' },
];

const COM_TONE = {
  receita:     { color: '#0f8a5f' },
  pedidos:     { color: '#1e40af' },
  ticketMedio: { color: '#7a4cb1' },
};

const COM_FMT = {
  receita: (n) => {
    if (n >= 1000000) return 'R$ ' + (n / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (n >= 10000)   return 'R$ ' + Math.round(n / 1000) + 'k';
    if (n >= 1000)    return 'R$ ' + (n / 1000).toFixed(1).replace('.', ',') + 'k';
    return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  },
  pedidos:     (n) => Math.round(n).toLocaleString('pt-BR'),
  ticketMedio: (n) => 'R$ ' + (Math.round(n / 100) / 10).toFixed(1).replace('.', ',') + 'k',
};

const COM_FMT_FULL_RECEITA = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');

const COM_PERIOD_TO_SCOPE = {
  hoje: '1D', semana: '1W', mes: '1M', total: '1A', custom: 'custom',
};
const COM_SCOPE_TO_PERIOD = {
  '1D': 'hoje', '1W': 'semana', '1M': 'mes', '3M': null, '1A': 'total', 'custom': 'custom',
};

const COM_SCOPE_LABEL = {
  '1D':     'Hoje · qui, 30 abr',
  '1W':     'Esta semana · 27 abr — 3 mai',
  '1M':     'Este mês · 1 — 30 abr',
  '3M':     'Últimos 90 dias',
  '1A':     'Últimos 12 meses',
  'custom': 'Personalizado · 23 — 29 abr',
};

// Deterministic noise so the mock data is stable between renders.
function _comNoise(seed, n) {
  const out = [];
  let s = (seed >>> 0) || 1;
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out.push(((s >>> 8) % 1000) / 1000);
  }
  return out;
}

function _comGen(scope, kpi) {
  const cfg = ({
    '1M':     { n: 30, axis: (i) => (i === 0 || i === 9 || i === 19 || i === 29) ? String(i + 1) : '',
                full: (i) => (i + 1) + ' abr · ' + ['ter','qua','qui','sex','sáb','dom','seg'][i % 7] },
    '3M':     { n: 12, axis: (i) => i % 3 === 0 ? `S${i + 1}` : '',
                full: (i) => `Semana ${i + 1} · fev–abr` },
    '1A':     { n: 12, axis: (i) => {
                  const months = ['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr'];
                  return i % 2 === 0 ? months[i] : '';
                },
                full: (i) => {
                  const months = ['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr'];
                  return months[i] + ' ' + (i < 8 ? '2025' : '2026');
                } },
    'custom': { n: 7,
                axis: (i) => (i === 0 || i === 6) ? ['23','24','25','26','27','28','29'][i] : '',
                full: (i) => ['23 abr · qua','24 abr · qui','25 abr · sex','26 abr · sáb','27 abr · dom','28 abr · seg','29 abr · ter'][i] },
  })[scope];
  const base  = ({ receita: { '1M': 18000, '3M': 135000, '1A': 480000, 'custom': 12700 },
                   pedidos: { '1M': 2.5,   '3M': 18,     '1A': 70,     'custom': 1.7  },
                   ticketMedio: { '1M': 7100, '3M': 7300, '1A': 6800, 'custom': 7400 } })[kpi][scope];
  const swing = ({ receita: { '1M': 14000, '3M': 60000, '1A': 220000, 'custom': 8000 },
                   pedidos: { '1M': 4,     '3M': 10,    '1A': 30,     'custom': 2    },
                   ticketMedio: { '1M': 2400, '3M': 1500, '1A': 1500, 'custom': 1400 } })[kpi][scope];
  const seed  = (kpi === 'receita' ? 11 : kpi === 'pedidos' ? 22 : 33)
              + (scope === '1M' ? 100 : scope === '3M' ? 200 : scope === '1A' ? 300 : 400);
  const noise = _comNoise(seed, cfg.n);
  return noise.map((r, i) => {
    let v = base + (r - 0.5) * swing;
    // For pedidos at fine granularity (1M), fewer "weekend" zeros to keep
    // the curve recognizable as activity.
    if (kpi === 'pedidos' && scope === '1M' && (i % 7 === 5 || i % 7 === 6)) v *= 0.25;
    if (v < 0) v = 0;
    return { t: cfg.axis(i), tFull: cfg.full(i), v: kpi === 'pedidos' ? Math.round(v) : Math.round(v) };
  });
}

const COM_DATA = {
  receita: {
    total:    { '1D': 18200, '1W': 142000, '1M': 540000, '3M': 1620000, '1A': 5800000, 'custom': 89000 },
    deltaPct: { '1D': 18,    '1W': 12,     '1M': 9,      '3M': 14,      '1A': 24,     'custom': 5     },
    series: {
      // Point-delta form (per-bucket new receita). Hours/days with no
      // order have v=0 so per-bucket ticket médio is well-defined.
      '1D': [
        { t: '09', tFull: '09:00', v: 0     },
        { t: '',   tFull: '10:00', v: 0     },
        { t: '11', tFull: '11:00', v: 4400  },
        { t: '',   tFull: '12:00', v: 0     },
        { t: '13', tFull: '13:00', v: 0     },
        { t: '',   tFull: '14:00', v: 2700  },
        { t: '15', tFull: '15:00', v: 1200  },
        { t: '',   tFull: '16:00', v: 0     },
        { t: '17', tFull: '17:00', v: 9900  },
        { t: '18', tFull: '18:00', v: 0     },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 28000 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 32000 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 24000 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 28200 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 18000 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 11800 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 0     },
      ],
      '1M':     _comGen('1M', 'receita'),
      '3M':     _comGen('3M', 'receita'),
      '1A':     _comGen('1A', 'receita'),
      'custom': _comGen('custom', 'receita'),
    },
  },
  pedidos: {
    total:    { '1D': 4, '1W': 19, '1M': 76, '3M': 220, '1A': 840, 'custom': 12 },
    deltaPct: { '1D': 0, '1W': 32, '1M': 8,  '3M': 11,  '1A': 18,  'custom': 9  },
    series: {
      // Point-delta form (per-bucket new orders).
      '1D': [
        { t: '09', tFull: '09:00', v: 0 },
        { t: '',   tFull: '10:00', v: 0 },
        { t: '11', tFull: '11:00', v: 1 },
        { t: '',   tFull: '12:00', v: 0 },
        { t: '13', tFull: '13:00', v: 0 },
        { t: '',   tFull: '14:00', v: 1 },
        { t: '15', tFull: '15:00', v: 1 },
        { t: '',   tFull: '16:00', v: 0 },
        { t: '17', tFull: '17:00', v: 1 },
        { t: '18', tFull: '18:00', v: 0 },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 4 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 5 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 3 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 4 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 2 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 1 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 0 },
      ],
      '1M':     _comGen('1M', 'pedidos'),
      '3M':     _comGen('3M', 'pedidos'),
      '1A':     _comGen('1A', 'pedidos'),
      'custom': _comGen('custom', 'pedidos'),
    },
  },
  ticketMedio: {
    total:    { '1D': 4550, '1W': 7470, '1M': 7100, '3M': 7360, '1A': 6900, 'custom': 7400 },
    deltaPct: { '1D': -3,   '1W': -3,   '1M': 5,    '3M': 7,    '1A': 12,   'custom': -2   },
    series: {
      '1D': [
        { t: '09', tFull: '09:00', v: 4400 },
        { t: '',   tFull: '10:00', v: 4400 },
        { t: '11', tFull: '11:00', v: 4400 },
        { t: '',   tFull: '12:00', v: 4600 },
        { t: '13', tFull: '13:00', v: 4500 },
        { t: '',   tFull: '14:00', v: 4400 },
        { t: '15', tFull: '15:00', v: 4400 },
        { t: '',   tFull: '16:00', v: 4500 },
        { t: '17', tFull: '17:00', v: 4550 },
        { t: '18', tFull: '18:00', v: 4550 },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 7000 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 6400 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 8000 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 7050 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 9000 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 8000 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 3800 },
      ],
      '1M':     _comGen('1M', 'ticketMedio'),
      '3M':     _comGen('3M', 'ticketMedio'),
      '1A':     _comGen('1A', 'ticketMedio'),
      'custom': _comGen('custom', 'ticketMedio'),
    },
  },
};

// Build the two views the chart can render:
//   .pt[scope]  — point/individual values per bucket (what's NEW in that
//                 bucket only). For ticket médio, the per-bucket value is
//                 derived as receita_bucket / pedidos_bucket.
//   .agg[scope] — running aggregate within the period. Receita/pedidos
//                 cumulate by sum; ticket médio is the running mean
//                 receita_cum / pedidos_cum so it is numerically
//                 consistent with the other two KPIs at every point.
// Period totals are re-derived from the last aggregate value so the
// header number always matches the chart's end point exactly.
(function _comBuildAgg() {
  const scopes = ['1D', '1W', '1M', '3M', '1A', 'custom'];

  // .pt for receita and pedidos is just the existing point-delta series.
  for (const kpi of ['receita', 'pedidos']) {
    COM_DATA[kpi].pt = {};
    COM_DATA[kpi].agg = {};
    for (const sc of scopes) {
      const src = COM_DATA[kpi].series[sc];
      COM_DATA[kpi].pt[sc] = src.map(row => ({ t: row.t, tFull: row.tFull, v: row.v }));
      let acc = 0;
      const out = src.map(row => {
        acc += row.v;
        return { t: row.t, tFull: row.tFull, v: Math.round(acc) };
      });
      COM_DATA[kpi].agg[sc] = out;
      COM_DATA[kpi].total[sc] = out[out.length - 1].v;
    }
  }

  // .pt for ticket médio: receita_bucket / pedidos_bucket. Buckets with
  // zero orders show v=0 (the bar is hidden in the chart).
  COM_DATA.ticketMedio.pt = {};
  COM_DATA.ticketMedio.agg = {};
  for (const sc of scopes) {
    const recPts = COM_DATA.receita.series[sc];
    const pedPts = COM_DATA.pedidos.series[sc];
    const tmPts  = COM_DATA.ticketMedio.series[sc];

    COM_DATA.ticketMedio.pt[sc] = tmPts.map((row, i) => {
      const r = (recPts[i] && recPts[i].v) || 0;
      const p = (pedPts[i] && pedPts[i].v) || 0;
      return { t: row.t, tFull: row.tFull, v: p > 0 ? Math.round(r / p) : 0 };
    });

    let r = 0, p = 0, last = 0;
    const out = tmPts.map((row, i) => {
      r += (recPts[i] && recPts[i].v) || 0;
      p += (pedPts[i] && pedPts[i].v) || 0;
      let v;
      if (p > 0) { v = Math.round(r / p); last = v; }
      else       { v = last; }
      return { t: row.t, tFull: row.tFull, v };
    });
    COM_DATA.ticketMedio.agg[sc] = out;
    COM_DATA.ticketMedio.total[sc] = out[out.length - 1].v;
  }
})();

const COM_EVENTS = [
  { dateKey: 'hoje',  date: 'Hoje',
    items: [
      { time: '14:35', clinic: 'Itaim Bibi',           value: 12400, status: 'Faturado' },
      { time: '11:20', clinic: 'Vila Olímpia Clinic',  value: 8900,  status: 'Aprovado' },
      { time: '10:05', clinic: 'Pinheiros Saúde',      value: 6200,  status: 'Em rota'  },
    ] },
  { dateKey: 'ontem', date: 'Ontem',
    items: [
      { time: '16:42', clinic: 'Centro Médico Jardins', value: 14700, status: 'Faturado' },
      { time: '13:18', clinic: 'Moema Pediatria',       value: 4800,  status: 'Aprovado' },
      { time: '09:55', clinic: 'Brooklin Saúde',        value: 9300,  status: 'Faturado' },
    ] },
  { dateKey: '28abr', date: 'ter, 28 abr',
    items: [
      { time: '15:20', clinic: 'Itaim Bibi',          value: 11200, status: 'Faturado' },
      { time: '11:30', clinic: 'Tatuapé Clínica',     value: 5800,  status: 'Aprovado' },
    ] },
  { dateKey: '27abr', date: 'seg, 27 abr',
    items: [
      { time: '14:10', clinic: 'Pinheiros',           value: 18900, status: 'Faturado' },
      { time: '10:45', clinic: 'Saúde Ipiranga',      value: 7200,  status: 'Pendente' },
    ] },
  { dateKey: '25abr', date: 'sáb, 25 abr',
    items: [
      { time: '11:20', clinic: 'Lapa Clinic',         value: 4200,  status: 'Faturado' },
    ] },
  { dateKey: '24abr', date: 'sex, 24 abr',
    items: [
      { time: '15:00', clinic: 'Moema Pediatria',     value: 8100,  status: 'Faturado' },
      { time: '11:15', clinic: 'Vila Olímpia Clinic', value: 14000, status: 'Faturado' },
      { time: '09:40', clinic: 'Perdizes Médico',     value: 3500,  status: 'Em rota'  },
    ] },
];

function _comFilterStatus(filter, status) {
  if (filter === 'todas')      return true;
  if (filter === 'concluidas') return status === 'Faturado';
  if (filter === 'pendentes')  return status === 'Aprovado' || status === 'Pendente';
  if (filter === 'rota')       return status === 'Em rota';
  return true;
}

function _comStatusTone(s) {
  if (s === 'Faturado') return 'good';
  if (s === 'Aprovado') return 'info';
  if (s === 'Em rota')  return 'warn';
  return 'muted';
}

// ── Period filter (top of screen): 5 buttons including "Personalizado".
//    Reuses the visual language of the existing PeriodFilter but with the
//    full Portuguese label the spec calls for.
function ComercialPeriodFilter({ value, onChange }) {
  const opts = [
    { k: 'hoje',   l: 'Hoje' },
    { k: 'semana', l: 'Semana' },
    { k: 'mes',    l: 'Mês' },
    { k: 'total',  l: 'Total' },
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
            flex: o.k === 'custom' ? 1.6 : 1,
            height: 32, borderRadius: 9, border: 'none',
            background: on ? '#fff' : 'transparent',
            color: on ? BI_COLOR.navyDeep : BI_COLOR.muted,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            boxShadow: on ? '0 1px 3px rgba(15,23,41,0.08)' : 'none',
            fontFamily: 'Inter, system-ui',
            whiteSpace: 'nowrap', padding: '0 4px',
            letterSpacing: -0.05,
            transition: 'all 160ms',
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

// ── KPI selector: one active at a time, drives the entire screen.
function ComercialKpiTabs({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: 4, borderRadius: 14,
      background: '#fff', border: `1px solid ${BI_COLOR.line}`,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      fontFamily: 'Inter, system-ui',
    }}>
      {COM_KPI_LIST.map(o => {
        const on = o.k === value;
        const tone = COM_TONE[o.k];
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            flex: 1, height: 40, borderRadius: 10, border: 'none',
            background: on ? tone.color : 'transparent',
            color: on ? '#fff' : BI_COLOR.muted,
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
            letterSpacing: -0.1,
            boxShadow: on ? `0 4px 12px ${tone.color}33` : 'none',
            transition: 'all 160ms',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ── Granularity (chart-only): 1D · 1W · 1M · 3M · 1A.
function ComercialGranularity({ value, onChange }) {
  // The 6th option opens a custom date range. The standard scopes get
  // equal weight; "Personalizado" is wider so the label fits cleanly.
  const opts = [
    { k: '1D',     l: '1D',           flex: 1   },
    { k: '1W',     l: '1W',           flex: 1   },
    { k: '1M',     l: '1M',           flex: 1   },
    { k: '3M',     l: '3M',           flex: 1   },
    { k: '1A',     l: '1A',           flex: 1   },
    { k: 'custom', l: '', flex: 1, icon: 'cal' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 0, padding: 3, borderRadius: 10,
      background: '#f1f3f6', fontFamily: 'Inter, system-ui',
    }}>
      {opts.map(o => {
        const on = o.k === value;
        const c  = on ? BI_COLOR.navyDeep : BI_COLOR.muted;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            flex: o.flex, height: 28, borderRadius: 7, border: 'none',
            background: on ? '#fff' : 'transparent', color: c,
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
            letterSpacing: 0.2,
            boxShadow: on ? '0 1px 3px rgba(15,23,41,0.08)' : 'none',
            transition: 'all 160ms',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, padding: '0 6px', whiteSpace: 'nowrap',
          }}>
            {o.icon === 'cal' && (
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
                stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="10" height="9" rx="1.5"/>
                <path d="M5 1.5v3M9 1.5v3M2 6h10"/>
              </svg>
            )}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

// ── Mode toggle: Acumulado (line) vs Individual (bars). The chart's
//    visual form (line vs bars) reinforces what the data means.
function ComercialChartMode({ value, onChange }) {
  const opts = [
    { k: 'agg',   l: 'Acumulado',  icon: 'line' },
    { k: 'point', l: 'Individual', icon: 'bars' },
  ];
  return (
    <div style={{
      display: 'inline-flex', gap: 0, padding: 3, borderRadius: 9,
      background: '#f1f3f6', fontFamily: 'Inter, system-ui',
    }}>
      {opts.map(o => {
        const on = o.k === value;
        const c  = on ? BI_COLOR.navyDeep : BI_COLOR.muted;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 26, padding: '0 10px', borderRadius: 6, border: 'none',
            background: on ? '#fff' : 'transparent',
            color: c,
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
            boxShadow: on ? '0 1px 3px rgba(15,23,41,0.08)' : 'none',
            transition: 'all 160ms',
          }}>
            {o.icon === 'line' ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 9 L4 6 L7 8 L11 3" stroke={c} strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="6"   width="2" height="5" rx="0.5" fill={c}/>
                <rect x="5"   y="3"   width="2" height="8" rx="0.5" fill={c}/>
                <rect x="8.5" y="5"   width="2" height="6" rx="0.5" fill={c}/>
              </svg>
            )}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

// ── Interactive chart with scrubbing. Two modes:
//    'agg'   → smooth line + area fill, cumulative within the period.
//    'point' → bars, one per bucket, showing the standalone contribution
//              of that bucket. Bars with v=0 are hidden (e.g. an hour with
//              no orders) so the visualization stays honest.
//    Pointer/touch handlers report the closest index back to the parent
//    so the header KPI updates in real time during scrub.
function ComercialChart({ mode = 'agg', series, color, scrubIndex, onScrub, goalLine = null, goalLabel = null }) {
  // The chart fills its container by default; if there are too many
  // buckets to fit comfortably (≥ 32px each), it grows beyond the
  // viewport and the wrapper scrolls horizontally. Keeps short scopes
  // (1D, 1W, custom) visually clean while letting long scopes breathe.
  const VIEW_W = 326;
  const PX_PER_BUCKET = 32;
  const n = series.length;
  const W = Math.max(VIEW_W, n * PX_PER_BUCKET);
  const H = 184;
  const PADX = 6, PADT = 18, PADB = 28;
  const innerW = W - PADX * 2;
  const innerH = H - PADT - PADB;

  if (n === 0) return null;

  const vals = series.map(d => d.v);
  // If a goal line is shown, expand the value range so the dashed
  // reference is always visible inside the chart area.
  const allVals = goalLine != null ? vals.concat([goalLine]) : vals;
  const minV = Math.min.apply(null, allVals);
  const maxV = Math.max.apply(null, allVals);
  const pad = (maxV - minV) * 0.18 || (maxV * 0.1) || 1;
  // Bars anchor at zero so the visual size reads as a magnitude. The
  // line chart can use a tighter window because the curve carries the
  // shape on its own.
  const lo = mode === 'point' ? 0 : Math.max(0, minV - pad);
  const hi = maxV + pad;
  const range = (hi - lo) || 1;
  const goalY = goalLine != null
    ? PADT + innerH - ((goalLine - lo) / range) * innerH
    : null;

  const xs = series.map((_, i) => PADX + (i / Math.max(n - 1, 1)) * innerW);
  const ys = series.map(d => PADT + innerH - ((d.v - lo) / range) * innerH);
  const baseY = PADT + innerH;

  // Smooth path (split-control cubic) for agg mode.
  let path = '';
  for (let i = 0; i < n; i++) {
    if (i === 0) { path += `M ${xs[i].toFixed(2)} ${ys[i].toFixed(2)}`; continue; }
    const x0 = xs[i - 1], y0 = ys[i - 1];
    const x1 = xs[i],     y1 = ys[i];
    const cx1 = x0 + (x1 - x0) * 0.45;
    const cx2 = x0 + (x1 - x0) * 0.55;
    path += ` C ${cx1.toFixed(2)} ${y0.toFixed(2)}, ${cx2.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  const fillPath = `${path} L ${xs[n - 1].toFixed(2)} ${baseY.toFixed(2)} L ${xs[0].toFixed(2)} ${baseY.toFixed(2)} Z`;

  // Bar width for point mode — leaves a small visual gap between buckets.
  const stepW = innerW / Math.max(n, 1);
  const barW  = Math.max(4, stepW * 0.62);

  const gradId = 'com-grad-' + color.replace('#', '');
  const idx = scrubIndex >= 0 && scrubIndex < n ? scrubIndex : -1;

  const pickIndexFromClientX = (clientX, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const sx = ((clientX - rect.left) / rect.width) * W;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(xs[i] - sx);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  };

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto', overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ width: W, height: H, position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        preserveAspectRatio="none"
        style={{ display: 'block', touchAction: 'pan-x pan-y', userSelect: 'none', WebkitUserSelect: 'none' }}
        onPointerDown={(e) => {
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
          onScrub(pickIndexFromClientX(e.clientX, e.currentTarget));
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' || e.buttons || e.pressure) {
            onScrub(pickIndexFromClientX(e.clientX, e.currentTarget));
          }
        }}
        onPointerUp={(e) => {
          try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
          if (e.pointerType !== 'mouse') onScrub(-1);
        }}
        onPointerLeave={() => onScrub(-1)}
        onPointerCancel={() => onScrub(-1)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={color} stopOpacity="0.20"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <line x1={PADX} y1={baseY + 0.5} x2={W - PADX} y2={baseY + 0.5}
          stroke={BI_COLOR.line} strokeWidth="1"/>

        {goalY != null && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={PADX} x2={W - PADX} y1={goalY} y2={goalY}
              stroke={BI_COLOR.faint} strokeWidth="1.2" strokeDasharray="5 4"
              opacity="0.7"/>
            <text x={PADX + 6} y={goalY - 5}
              fontSize="9.5" fontWeight="700"
              fill={BI_COLOR.faint}
              style={{ fontFamily: 'Inter, system-ui', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {goalLabel || `Meta ${goalLine}`}
            </text>
          </g>
        )}

        {mode === 'agg' && (
          <g>
            <path d={fillPath} fill={`url(#${gradId})`}/>
            <path d={path} fill="none" stroke={color} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        )}

        {mode === 'point' && series.map((d, i) => {
          if (d.v === 0) return null;
          const h = Math.max(1.5, baseY - ys[i]);
          return (
            <rect key={i}
              x={xs[i] - barW / 2}
              y={baseY - h}
              width={barW}
              height={h}
              rx={Math.min(2.5, barW / 3)}
              fill={color}
              opacity={idx === i ? 1 : (idx === -1 ? 0.85 : 0.45)}
              style={{ transition: 'opacity 120ms' }}
            />
          );
        })}

        {idx >= 0 && (
          <g>
            <line x1={xs[idx]} y1={PADT - 4} x2={xs[idx]} y2={baseY + 4}
              stroke={BI_COLOR.ink} strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
            {mode === 'agg' && (
              <g>
                <circle cx={xs[idx]} cy={ys[idx]} r="8" fill={color} opacity="0.18"/>
                <circle cx={xs[idx]} cy={ys[idx]} r="5" fill="#fff"
                  stroke={color} strokeWidth="2.4"/>
              </g>
            )}
          </g>
        )}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 4,
        display: 'flex', padding: `0 ${PADX}px`,
        fontSize: 10, fontWeight: 600, color: BI_COLOR.faint,
        fontFamily: 'Inter, system-ui',
        pointerEvents: 'none',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {series.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: 'center', opacity: d.t ? 1 : 0 }}>{d.t}</span>
        ))}
      </div>
      </div>
    </div>
  );
}

// ── Search input for the events list.
function ComercialSearch({ value, onChange }) {
  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui' }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: BI_COLOR.faint, lineHeight: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="4.2"/>
          <path d="M9.2 9.2l3 3"/>
        </svg>
      </span>
      <input
        type="text"
        placeholder="Buscar por clínica, valor ou status…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 36px 10px 34px',
          border: `1px solid ${BI_COLOR.line}`, borderRadius: 12,
          background: '#fff', color: BI_COLOR.ink,
          fontSize: 13, fontWeight: 500,
          fontFamily: 'Inter, system-ui',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
        }}
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Limpar busca" style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          width: 20, height: 20, borderRadius: 10, border: 'none',
          background: '#eef0f3', color: BI_COLOR.muted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Sort dropdown for the events list.
function ComercialSort({ value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const current = options.find(o => o.k === value) || options[0];
  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 30, padding: '0 10px', borderRadius: 999,
        border: `1px solid ${BI_COLOR.line}`, background: '#fff',
        color: BI_COLOR.inkSoft, fontSize: 11.5, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'Inter, system-ui',
        whiteSpace: 'nowrap',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h7M4 6h5M5 9h3"/>
        </svg>
        {current.l}
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3.5l2.5 2.5L7 3.5"/>
        </svg>
      </button>
      {open && (
        <React.Fragment>
          <div onClick={() => setOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 10, background: 'transparent',
          }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            borderRadius: 12, boxShadow: '0 12px 28px rgba(15,23,41,0.12)',
            padding: 4, minWidth: 180, zIndex: 11,
          }}>
            {options.map(o => {
              const on = o.k === value;
              return (
                <button key={o.k} onClick={() => { onChange(o.k); setOpen(false); }} style={{
                  display: 'block', width: '100%', padding: '9px 10px',
                  borderRadius: 8, border: 'none', textAlign: 'left',
                  background: on ? 'rgba(30,64,175,0.10)' : 'transparent',
                  color: on ? BI_COLOR.navyDeep : BI_COLOR.ink,
                  fontSize: 12, fontWeight: on ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'Inter, system-ui',
                }}>{o.l}</button>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// Date order for chronological sort. Hard-coded because the mock data
// uses date keys instead of real Date objects.
const COM_DATE_ORDER = ['hoje', 'ontem', '28abr', '27abr', '26abr', '25abr', '24abr'];

// ── Event timeline. Driven by status filter, free-text search, and
//    sort. When sorted by date the items stay grouped under date
//    headers; sorting by value or clinic flattens them into a single
//    list because grouping under date no longer adds meaning.
function ComercialEventsTimeline({ filter, onFilter }) {
  const [query, setQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState('recent');

  const filterOpts = [
    { k: 'todas',      l: 'Todas' },
    { k: 'concluidas', l: 'Concluídas' },
    { k: 'pendentes',  l: 'Pendentes' },
    { k: 'rota',       l: 'Em rota' },
  ];
  const sortOpts = [
    { k: 'recent',  l: 'Mais recentes' },
    { k: 'oldest',  l: 'Mais antigos' },
    { k: 'highest', l: 'Maior valor' },
    { k: 'lowest',  l: 'Menor valor' },
    { k: 'clinic',  l: 'Clínica A–Z' },
  ];

  const q = query.trim().toLowerCase();
  const flat = COM_EVENTS
    .flatMap(g => g.items.map(it => ({ ...it, dateKey: g.dateKey, dateLabel: g.date })))
    .filter(it => _comFilterStatus(filter, it.status))
    .filter(it => !q
      || it.clinic.toLowerCase().includes(q)
      || it.status.toLowerCase().includes(q)
      || COM_FMT_FULL_RECEITA(it.value).toLowerCase().includes(q)
      || String(it.value).includes(q));

  const dateRank = (k) => {
    const i = COM_DATE_ORDER.indexOf(k);
    return i === -1 ? 999 : i;
  };
  if (sortKey === 'recent') {
    flat.sort((a, b) => dateRank(a.dateKey) - dateRank(b.dateKey)
      || (a.time < b.time ? 1 : -1));
  } else if (sortKey === 'oldest') {
    flat.sort((a, b) => dateRank(b.dateKey) - dateRank(a.dateKey)
      || (a.time > b.time ? 1 : -1));
  } else if (sortKey === 'highest') {
    flat.sort((a, b) => b.value - a.value);
  } else if (sortKey === 'lowest') {
    flat.sort((a, b) => a.value - b.value);
  } else if (sortKey === 'clinic') {
    flat.sort((a, b) => a.clinic.localeCompare(b.clinic, 'pt-BR'));
  }

  const groupedByDate = sortKey === 'recent' || sortKey === 'oldest';
  let groups;
  if (groupedByDate) {
    const map = new Map();
    for (const it of flat) {
      if (!map.has(it.dateKey)) map.set(it.dateKey, { dateKey: it.dateKey, date: it.dateLabel, items: [] });
      map.get(it.dateKey).items.push(it);
    }
    groups = Array.from(map.values());
  } else {
    const labelMap = { highest: 'Maior valor primeiro', lowest: 'Menor valor primeiro', clinic: 'Por clínica (A–Z)' };
    groups = flat.length > 0 ? [{ dateKey: 'sorted', date: labelMap[sortKey], items: flat }] : [];
  }

  const totalCount = flat.length;
  const isFiltered = q || filter !== 'todas' || sortKey !== 'recent';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 2px 10px',
        fontFamily: 'Inter, system-ui',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: BI_COLOR.faint,
        }}>O que moveu o número</span>
        <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
          {totalCount} {totalCount === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <ComercialSearch value={query} onChange={setQuery}/>
      </div>

      {/* Filters + sort, on the same row. Filter chips scroll
          horizontally if they don't fit. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <FilterChips value={filter} onChange={onFilter} options={filterOpts}/>
        </div>
        <ComercialSort value={sortKey} options={sortOpts} onChange={setSortKey}/>
      </div>

      {groups.length === 0 && (
        <StateBlock
          kind="empty"
          title={isFiltered ? 'Sem resultados' : 'Sem registros'}
          body={isFiltered
            ? 'Tente ajustar a busca, o filtro ou a ordenação.'
            : 'Nenhum pedido encontrado neste período.'}
        />
      )}

      {groups.map((g) => (
        <div key={g.dateKey} style={{ marginBottom: 8 }}>
          <div style={{
            padding: '12px 2px 6px',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: BI_COLOR.faint,
            fontFamily: 'Inter, system-ui',
          }}>{g.date}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.items.map((it, i) => (
              <ItemRow
                key={i}
                title={it.clinic}
                sub={(groupedByDate ? it.time : `${it.dateLabel} · ${it.time}`) + ` · ${COM_FMT_FULL_RECEITA(it.value)}`}
                tag={it.status}
                tagTone={_comStatusTone(it.status)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ComercialDetailScreen — orchestrator.
// Per-bucket label that appears next to the big number when the user
// scrubs the chart in 'Individual' mode. Tells them what one bar means.
const COM_BUCKET_LABEL = {
  '1D':     'nesta hora',
  '1W':     'neste dia',
  '1M':     'neste dia',
  '3M':     'nesta semana',
  '1A':     'neste mês',
  'custom': 'neste dia',
};

function ComercialDetailScreen({ initialKpi = 'receita', initialPeriod = 'semana', onBack }) {
  // Granularity is the only date control on this screen — the previous
  // top-of-screen period filter has been removed because it duplicated
  // this one. `initialPeriod` still seeds the default scope for callers.
  const [scope,    setScope]    = React.useState(COM_PERIOD_TO_SCOPE[initialPeriod] || '1W');
  const [kpi,      setKpi]      = React.useState(initialKpi);
  const [mode,     setMode]     = React.useState('agg');         // 'agg' | 'point'
  const [scrubIdx, setScrubIdx] = React.useState(-1);
  const [filter,   setFilter]   = React.useState('todas');

  const onScopeChange = (s) => { setScope(s);    setScrubIdx(-1); };
  const onKpiChange   = (k) => { setKpi(k);      setScrubIdx(-1); };
  const onModeChange  = (m) => { setMode(m);     setScrubIdx(-1); };

  const data     = COM_DATA[kpi];
  const series   = (mode === 'agg' ? data.agg : data.pt)[scope]
                || (mode === 'agg' ? data.agg : data.pt)['1W'];
  const total    = data.total[scope];
  const deltaPct = data.deltaPct[scope];
  const tone     = COM_TONE[kpi];
  const fmt      = COM_FMT[kpi];

  const isScrubbing = scrubIdx >= 0 && scrubIdx < series.length;
  const headerValue = isScrubbing ? series[scrubIdx].v : total;
  const headerTime  = isScrubbing ? series[scrubIdx].tFull : COM_SCOPE_LABEL[scope];
  const scrubLabel  = mode === 'agg'
    ? (kpi === 'ticketMedio' ? 'média até aqui' : 'acumulado até aqui')
    : (COM_BUCKET_LABEL[scope] || 'neste período');

  const others = COM_KPI_LIST.filter(o => o.k !== kpi);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Header — back, title, avatar. Date filter lives below the chart. */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Portal · Desempenho</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>Desempenho Comercial</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 24,
      }}>
        {/* KPI selector */}
        <div style={{ padding: '14px 16px 0' }}>
          <ComercialKpiTabs value={kpi} onChange={onKpiChange}/>
        </div>

        {/* Chart mode (Acumulado vs Individual) — sits with the KPI
            choice at the top because it's a question of "what is the
            big number telling me right now", not a chart-only setting. */}
        <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'center' }}>
          <ComercialChartMode value={mode} onChange={onModeChange}/>
        </div>

        {/* Primary KPI block */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: isScrubbing ? tone.color : BI_COLOR.faint,
            transition: 'color 160ms',
            fontVariantNumeric: 'tabular-nums',
          }}>{headerTime}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{
              fontSize: 38, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -1.4,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{fmt(headerValue)}</span>
            {!isScrubbing && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: deltaPct > 0 ? BI_COLOR.green : deltaPct < 0 ? BI_COLOR.red : BI_COLOR.faint,
                fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
              }}>
                {deltaPct > 0 ? '+' : ''}{deltaPct}%
                <span style={{ color: BI_COLOR.faint, fontWeight: 500, marginLeft: 4 }}>
                  vs período anterior
                </span>
              </span>
            )}
            {isScrubbing && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: BI_COLOR.muted,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}>{scrubLabel}</span>
            )}
          </div>

          {/* Secondary related metrics — low emphasis */}
          <div style={{
            display: 'flex', gap: 18, marginTop: 16, paddingTop: 12,
            borderTop: `1px solid ${BI_COLOR.lineSoft}`,
          }}>
            {others.map(o => {
              const v  = COM_DATA[o.k].total[scope];
              const dp = COM_DATA[o.k].deltaPct[scope];
              return (
                <div key={o.k} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                    color: BI_COLOR.faint,
                  }}>{o.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700, color: BI_COLOR.inkSoft,
                      fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
                    }}>{COM_FMT[o.k](v)}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600,
                      color: dp > 0 ? BI_COLOR.green : dp < 0 ? BI_COLOR.red : BI_COLOR.faint,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{dp > 0 ? '+' : ''}{dp}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div style={{ padding: '14px 16px 0' }}>
          <ComercialChart
            mode={mode}
            series={series}
            color={tone.color}
            scrubIndex={scrubIdx}
            onScrub={setScrubIdx}
          />
        </div>

        {/* Chart toolbar: granularity (date filter) lives directly
            below the chart. The mode toggle moved to the top, next to
            the KPI selector. */}
        <div style={{ padding: '8px 16px 0' }}>
          <ComercialGranularity value={scope} onChange={onScopeChange}/>
        </div>

        {/* Events */}
        <div style={{ padding: '18px 16px 24px' }}>
          <ComercialEventsTimeline filter={filter} onFilter={setFilter}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OrderQuickViewScreen — quick-view the rep lands on when tapping
// a row in the events feed. Compact summary with status, value,
// clinic, items and progress, plus a CTA into the full order.
// ─────────────────────────────────────────────────────────────
const COM_ORDER_QUICK = {
  orderId: 'PED-2841',
  clinic: 'Itaim Bibi',
  address: 'R. Bandeira Paulista, 700 · Itaim Bibi',
  city: 'São Paulo',
  doctorName: 'Dr. Rafael Almeida',
  doctorInitial: 'A',
  doctorSpecialty: 'Cardiologista',
  doctorCrm: 'CRM-SP 134.567',
  doctorRecent: '8 prescrições no mês',
  placedAt: '30 abr · qui · 14:35',
  placedAgo: 'há 4 dias',
  value: 12400,
  status: 'Faturado',
  paymentTerm: 'Faturado · 30 dias',
  estimatedDelivery: '5 — 6 mai',
  items: [
    { name: 'AtlasGel 500 ml',            qty: 12, subtotal: 6480 },
    { name: 'AtlasFix Adesivo Cirúrgico', qty: 8,  subtotal: 2320 },
    { name: 'AtlasMed Roll-on 50 ml',     qty: 6,  subtotal: 3600 },
  ],
  itemCount: 3,
  unitsCount: 26,
  timeline: [
    { k: 'pedido',   label: 'Pedido',   time: '30 abr 14:35',   done: true,  current: false },
    { k: 'aprovado', label: 'Aprovado', time: '30 abr 14:38',   done: true,  current: false },
    { k: 'faturado', label: 'Faturado', time: '30 abr 15:12',   done: false, current: true  },
    { k: 'rota',     label: 'Em rota',  time: 'previsto 5 mai', done: false, current: false },
    { k: 'entregue', label: 'Entregue', time: '~6 mai',         done: false, current: false },
  ],
};

// Horizontal pipeline. Each step is a grid cell so circles align
// with their labels regardless of label width. Connectors are split
// in half between adjacent cells; the right half of cell i is green
// only if step i is fully done (the user has moved past it).
function OrderTimeline({ steps }) {
  const n = steps.length;
  const reached = (s) => s.done || s.current;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`,
      fontFamily: 'Inter, system-ui',
    }}>
      {steps.map((s, i) => (
        <div key={s.k} style={{ position: 'relative', minHeight: 44 }}>
          {i > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: '50%', top: 9, height: 2,
              background: steps[i - 1].done ? BI_COLOR.green : '#e5e7eb',
            }}/>
          )}
          {i < n - 1 && (
            <div style={{
              position: 'absolute', left: '50%', right: 0, top: 9, height: 2,
              background: s.done ? BI_COLOR.green : '#e5e7eb',
            }}/>
          )}
          <div style={{
            position: 'relative', margin: '0 auto', zIndex: 1,
            width: s.current ? 18 : 14, height: s.current ? 18 : 14,
            borderRadius: '50%',
            background: reached(s) ? BI_COLOR.green : '#fff',
            border: reached(s) ? 'none' : `2px solid #d1d5db`,
            boxShadow: s.current ? `0 0 0 4px rgba(22,163,115,0.18)` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: s.current ? -2 : 0,
            transition: 'all 160ms',
          }}>
            {s.done && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"
                stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4.5l1.5 1.5L7 2.5"/>
              </svg>
            )}
            {s.current && (
              <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }}/>
            )}
          </div>
          <div style={{
            marginTop: 10, textAlign: 'center',
            fontSize: 10.5, fontWeight: s.current ? 700 : 500,
            color: s.current ? BI_COLOR.green : (s.done ? BI_COLOR.ink : BI_COLOR.faint),
            letterSpacing: 0.1,
          }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function _orderSectionLabel(text, right) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '0 2px 8px',
      fontFamily: 'Inter, system-ui',
    }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
        color: BI_COLOR.faint,
      }}>{text}</span>
      {right && (
        <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontWeight: 600 }}>{right}</span>
      )}
    </div>
  );
}

function OrderQuickViewScreen({ orderId, onBack }) {
  const o = COM_ORDER_QUICK;
  const tone = _comStatusTone(o.status);
  const tt = TAG_TONE[tone];
  const currentStep = o.timeline.find(s => s.current);
  const nextIdx = o.timeline.findIndex(s => !s.done && !s.current);
  const nextStep = nextIdx >= 0 ? o.timeline[nextIdx] : null;
  const noop = () => {};

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack || noop} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Pedido</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>Resumo do pedido</div>
          </div>
          <button aria-label="Compartilhar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="4" cy="8" r="2"/>
              <circle cx="12" cy="3" r="2"/>
              <circle cx="12" cy="13" r="2"/>
              <path d="M5.7 7l4.6-3M5.7 9l4.6 3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}>
        {/* Status hero */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: '#fff',
            border: `1px solid ${BI_COLOR.line}`,
            borderRadius: 16, padding: 18,
            boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
              background: tt.color,
            }}/>
            <div style={{ paddingLeft: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Tag tone={tone}>{o.status}</Tag>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: BI_COLOR.muted,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3,
                }}>#{o.orderId}</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                  color: BI_COLOR.faint,
                }}>Total do pedido</div>
                <div style={{
                  marginTop: 4,
                  fontSize: 38, fontWeight: 700, color: BI_COLOR.ink,
                  letterSpacing: -1.4, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05,
                }}>{COM_FMT_FULL_RECEITA(o.value)}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {o.placedAt}
                  <span style={{ color: BI_COLOR.faint, marginLeft: 6 }}>· {o.placedAgo}</span>
                </div>
              </div>
              <div style={{
                marginTop: 14, paddingTop: 12,
                borderTop: `1px solid ${BI_COLOR.lineSoft}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                    color: BI_COLOR.faint,
                  }}>Pagamento</div>
                  <div style={{
                    marginTop: 3, fontSize: 12, fontWeight: 600, color: BI_COLOR.inkSoft,
                  }}>{o.paymentTerm}</div>
                </div>
                <div style={{ width: 1, height: 26, background: BI_COLOR.lineSoft, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                    color: BI_COLOR.faint,
                  }}>Entrega prev.</div>
                  <div style={{
                    marginTop: 3, fontSize: 12, fontWeight: 600, color: BI_COLOR.inkSoft,
                  }}>{o.estimatedDelivery}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic */}
        <div style={{ padding: '16px 16px 0' }}>
          {_orderSectionLabel('Clínica', 'Ver detalhes')}
          <BICard pad={14} onClick={noop}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'linear-gradient(165deg, #1e40af, #3b82f6)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, letterSpacing: -0.3, flexShrink: 0,
              }}>{o.clinic[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{o.clinic}</div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2, lineHeight: 1.35 }}>{o.address}</div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.faint, marginTop: 2 }}>{o.city}</div>
              </div>
              <ChevronRight color={BI_COLOR.faint}/>
            </div>
          </BICard>
        </div>

        {/* Doctor */}
        <div style={{ padding: '16px 16px 0' }}>
          {_orderSectionLabel('Médico', 'Ver perfil')}
          <BICard pad={14} onClick={noop}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 21,
                background: 'linear-gradient(165deg, #16a373, #0f8a5f)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, letterSpacing: -0.3, flexShrink: 0,
              }}>{o.doctorInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{o.doctorName}</div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2 }}>
                  {o.doctorSpecialty}
                  <span style={{ color: BI_COLOR.faint, marginLeft: 6 }}>· {o.doctorCrm}</span>
                </div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.faint, marginTop: 2 }}>{o.doctorRecent}</div>
              </div>
              <ChevronRight color={BI_COLOR.faint}/>
            </div>
          </BICard>
        </div>

        {/* Items */}
        <div style={{ padding: '16px 16px 0' }}>
          {_orderSectionLabel(`Itens · ${o.itemCount} produtos`, `${o.unitsCount} un.`)}
          <BICard pad={0}>
            {o.items.map((it, i) => (
              <div key={i} style={{
                padding: '11px 14px',
                borderTop: i > 0 ? `1px solid ${BI_COLOR.lineSoft}` : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: '#f3f4f6', color: BI_COLOR.muted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0, letterSpacing: -0.2,
                }}>{it.qty}×</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: BI_COLOR.ink, letterSpacing: -0.1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{it.name}</div>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: BI_COLOR.ink,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: -0.1,
                }}>{COM_FMT_FULL_RECEITA(it.subtotal)}</span>
              </div>
            ))}
          </BICard>
        </div>

        {/* Timeline */}
        <div style={{ padding: '16px 16px 0' }}>
          {_orderSectionLabel('Acompanhamento', currentStep ? 'em andamento' : '')}
          <BICard pad={16}>
            <OrderTimeline steps={o.timeline}/>
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid ${BI_COLOR.lineSoft}`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                  color: BI_COLOR.faint,
                }}>Etapa atual</div>
                <div style={{
                  marginTop: 3,
                  fontSize: 13.5, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.1,
                }}>{currentStep ? currentStep.label : '—'}</div>
                <div style={{ marginTop: 1, fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {currentStep ? currentStep.time : ''}
                </div>
              </div>
              {nextStep && (
                <div style={{
                  flex: 1, minWidth: 0, paddingLeft: 12,
                  borderLeft: `1px solid ${BI_COLOR.lineSoft}`,
                }}>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                    color: BI_COLOR.faint,
                  }}>Próxima etapa</div>
                  <div style={{
                    marginTop: 3,
                    fontSize: 13.5, fontWeight: 700, color: BI_COLOR.inkSoft, letterSpacing: -0.1,
                  }}>{nextStep.label}</div>
                  <div style={{ marginTop: 1, fontSize: 11, color: BI_COLOR.muted }}>
                    {nextStep.time}
                  </div>
                </div>
              )}
            </div>
          </BICard>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 16px 16px',
        background: 'linear-gradient(180deg, rgba(247,248,251,0), rgba(247,248,251,0.97) 30%)',
        pointerEvents: 'none',
      }}>
        <button style={{
          width: '100%', padding: 14, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
          fontSize: 14, fontWeight: 700, fontFamily: 'Inter, system-ui',
          boxShadow: '0 12px 28px rgba(10,47,127,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          letterSpacing: -0.1,
          pointerEvents: 'auto',
        }}>
          Ver pedido completo
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M8 4l3 3-3 3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Desempenho · Atividade — single goal-driven screen replacing
// the four separate KPI screens (visitas hoje, visitas semana,
// follow-ups, novas clínicas). Same UX skeleton as Comercial,
// but the primary number is framed against a meta and a pace
// indicator (this is the Meta e atividade card writ large).
// ─────────────────────────────────────────────────────────────
const ATV_KPI_LIST = [
  { k: 'visitas',   label: 'Visitas' },
  { k: 'followups', label: 'Follow-ups' },
  { k: 'novas',     label: 'Novas' },
];

const ATV_TONE = {
  visitas:   { color: '#1e40af' },
  followups: { color: '#c6861b' },
  novas:     { color: '#16a373' },
};

const ATV_FMT = {
  visitas:   (n) => Math.round(n).toLocaleString('pt-BR'),
  followups: (n) => Math.round(n).toLocaleString('pt-BR'),
  novas:     (n) => Math.round(n).toLocaleString('pt-BR'),
};

const ATV_SCOPE_LABEL = {
  '1D':     'Hoje · qui, 30 abr',
  '1W':     'Esta semana · 27 abr — 3 mai',
  '1M':     'Este mês · 1 — 30 abr',
  '3M':     'Últimos 90 dias',
  '1A':     'Últimos 12 meses',
  'custom': 'Personalizado · 23 — 29 abr',
};

const ATV_BUCKET_LABEL = {
  '1D':     'nesta hora',
  '1W':     'neste dia',
  '1M':     'neste dia',
  '3M':     'nesta semana',
  '1A':     'neste mês',
  'custom': 'neste dia',
};

function _atvGen(scope, kpi) {
  const cfg = ({
    '1M':     { n: 30, axis: (i) => (i === 0 || i === 9 || i === 19 || i === 29) ? String(i + 1) : '',
                full: (i) => (i + 1) + ' abr · ' + ['ter','qua','qui','sex','sáb','dom','seg'][i % 7] },
    '3M':     { n: 12, axis: (i) => i % 3 === 0 ? `S${i + 1}` : '',
                full: (i) => `Semana ${i + 1} · fev–abr` },
    '1A':     { n: 12, axis: (i) => {
                  const months = ['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr'];
                  return i % 2 === 0 ? months[i] : '';
                },
                full: (i) => {
                  const months = ['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr'];
                  return months[i] + ' ' + (i < 8 ? '2025' : '2026');
                } },
    'custom': { n: 7,
                axis: (i) => (i === 0 || i === 6) ? ['23','24','25','26','27','28','29'][i] : '',
                full: (i) => ['23 abr · qua','24 abr · qui','25 abr · sex','26 abr · sáb','27 abr · dom','28 abr · seg','29 abr · ter'][i] },
  })[scope];
  const base  = ({ visitas:   { '1M': 4.5, '3M': 32, '1A': 140, 'custom': 6   },
                   followups: { '1M': 1.7, '3M': 14, '1A': 60,  'custom': 2   },
                   novas:     { '1M': 0.5, '3M': 4,  '1A': 16,  'custom': 0.7 } })[kpi][scope];
  const swing = ({ visitas:   { '1M': 4,   '3M': 8,  '1A': 30,  'custom': 4   },
                   followups: { '1M': 2,   '3M': 4,  '1A': 15,  'custom': 2   },
                   novas:     { '1M': 0.6, '3M': 2,  '1A': 8,   'custom': 1   } })[kpi][scope];
  const seed  = (kpi === 'visitas' ? 41 : kpi === 'followups' ? 42 : 43)
              + (scope === '1M' ? 100 : scope === '3M' ? 200 : scope === '1A' ? 300 : 400);
  const noise = _comNoise(seed, cfg.n);
  return noise.map((r, i) => {
    let v = base + (r - 0.5) * swing;
    if (scope === '1M' && (i % 7 === 5 || i % 7 === 6)) v *= 0.2;
    if (v < 0) v = 0;
    return { t: cfg.axis(i), tFull: cfg.full(i), v: Math.round(v) };
  });
}

const ATV_DATA = {
  visitas: {
    total:        { '1D': 6,  '1W': 28, '1M': 124, '3M': 386,  '1A': 1640, 'custom': 42 },
    goal:         { '1D': 8,  '1W': 35, '1M': 140, '3M': 420,  '1A': 1800, 'custom': 50 },
    deltaPct:     { '1D': 33, '1W': 14, '1M': 8,   '3M': 12,   '1A': 18,   'custom': 5  },
    paceExpected: { '1D': 5,  '1W': 20, '1M': 80,  '3M': 280,  '1A': 1100, 'custom': 30 },
    series: {
      '1D': [
        { t: '09', tFull: '09:00', v: 1 },
        { t: '',   tFull: '10:00', v: 1 },
        { t: '11', tFull: '11:00', v: 1 },
        { t: '',   tFull: '12:00', v: 0 },
        { t: '13', tFull: '13:00', v: 1 },
        { t: '',   tFull: '14:00', v: 1 },
        { t: '15', tFull: '15:00', v: 0 },
        { t: '',   tFull: '16:00', v: 1 },
        { t: '17', tFull: '17:00', v: 0 },
        { t: '18', tFull: '18:00', v: 0 },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 5 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 7 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 4 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 6 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 6 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 0 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 0 },
      ],
      '1M':     _atvGen('1M', 'visitas'),
      '3M':     _atvGen('3M', 'visitas'),
      '1A':     _atvGen('1A', 'visitas'),
      'custom': _atvGen('custom', 'visitas'),
    },
  },
  followups: {
    total:        { '1D': 3, '1W': 12, '1M': 47, '3M': 142, '1A': 580, 'custom': 14 },
    goal:         { '1D': 4, '1W': 15, '1M': 60, '3M': 180, '1A': 720, 'custom': 18 },
    deltaPct:     { '1D': 0, '1W': 8,  '1M': 5,  '3M': 11,  '1A': 14,  'custom': 4 },
    paceExpected: { '1D': 2, '1W': 9,  '1M': 34, '3M': 120, '1A': 440, 'custom': 11 },
    series: {
      '1D': [
        { t: '09', tFull: '09:00', v: 0 },
        { t: '',   tFull: '10:00', v: 1 },
        { t: '11', tFull: '11:00', v: 0 },
        { t: '',   tFull: '12:00', v: 1 },
        { t: '13', tFull: '13:00', v: 0 },
        { t: '',   tFull: '14:00', v: 0 },
        { t: '15', tFull: '15:00', v: 0 },
        { t: '',   tFull: '16:00', v: 1 },
        { t: '17', tFull: '17:00', v: 0 },
        { t: '18', tFull: '18:00', v: 0 },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 2 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 3 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 1 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 3 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 3 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 0 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 0 },
      ],
      '1M':     _atvGen('1M', 'followups'),
      '3M':     _atvGen('3M', 'followups'),
      '1A':     _atvGen('1A', 'followups'),
      'custom': _atvGen('custom', 'followups'),
    },
  },
  novas: {
    total:        { '1D': 1,   '1W': 4, '1M': 12, '3M': 36, '1A': 145, 'custom': 5 },
    goal:         { '1D': 1,   '1W': 5, '1M': 18, '3M': 54, '1A': 200, 'custom': 6 },
    deltaPct:     { '1D': 100, '1W': 33,'1M': 9,  '3M': 12, '1A': 22,  'custom': 25 },
    paceExpected: { '1D': 0,   '1W': 3, '1M': 10, '3M': 32, '1A': 130, 'custom': 4 },
    series: {
      '1D': [
        { t: '09', tFull: '09:00', v: 0 },
        { t: '',   tFull: '10:00', v: 1 },
        { t: '11', tFull: '11:00', v: 0 },
        { t: '',   tFull: '12:00', v: 0 },
        { t: '13', tFull: '13:00', v: 0 },
        { t: '',   tFull: '14:00', v: 0 },
        { t: '15', tFull: '15:00', v: 0 },
        { t: '',   tFull: '16:00', v: 0 },
        { t: '17', tFull: '17:00', v: 0 },
        { t: '18', tFull: '18:00', v: 0 },
      ],
      '1W': [
        { t: 'Seg', tFull: 'Seg · 27 abr', v: 1 },
        { t: 'Ter', tFull: 'Ter · 28 abr', v: 1 },
        { t: 'Qua', tFull: 'Qua · 29 abr', v: 0 },
        { t: 'Qui', tFull: 'Qui · 30 abr', v: 1 },
        { t: 'Sex', tFull: 'Sex · 1 mai',  v: 1 },
        { t: 'Sáb', tFull: 'Sáb · 2 mai',  v: 0 },
        { t: 'Dom', tFull: 'Dom · 3 mai',  v: 0 },
      ],
      '1M':     _atvGen('1M', 'novas'),
      '3M':     _atvGen('3M', 'novas'),
      '1A':     _atvGen('1A', 'novas'),
      'custom': _atvGen('custom', 'novas'),
    },
  },
};

(function _atvBuildAgg() {
  const scopes = ['1D', '1W', '1M', '3M', '1A', 'custom'];
  for (const o of ATV_KPI_LIST) {
    const k = o.k;
    ATV_DATA[k].pt = {};
    ATV_DATA[k].agg = {};
    for (const sc of scopes) {
      const src = ATV_DATA[k].series[sc];
      ATV_DATA[k].pt[sc] = src.map(row => ({ t: row.t, tFull: row.tFull, v: row.v }));
      let acc = 0;
      const out = src.map(row => {
        acc += row.v;
        return { t: row.t, tFull: row.tFull, v: Math.round(acc) };
      });
      ATV_DATA[k].agg[sc] = out;
      ATV_DATA[k].total[sc] = out[out.length - 1].v;
    }
  }
})();

// ── Visit events feed (replaces the per-KPI lists). Drives the
//    bottom of the screen with a chronological log of activity.
const ATV_EVENTS = [
  { dateKey: 'hoje', date: 'Hoje',
    items: [
      { time: '16:00', clinic: 'Brooklin Saúde',         doctor: 'sem responsável',  status: 'Pendente'  },
      { time: '14:30', clinic: 'Moema Pediatria',        doctor: 'Dra. Tomé',        status: 'Em rota'   },
      { time: '13:10', clinic: 'Vila Olímpia Clinic',    doctor: 'Dr. Bernardes',    status: 'Concluída' },
      { time: '11:45', clinic: 'Pinheiros Saúde',        doctor: 'sem responsável',  status: 'Em rota'   },
      { time: '10:30', clinic: 'Centro Médico Jardins',  doctor: 'Dra. Carvalho',    status: 'Concluída' },
      { time: '09:12', clinic: 'Itaim Bibi',             doctor: 'Dr. Almeida',      status: 'Concluída' },
    ] },
  { dateKey: 'ontem', date: 'Ontem',
    items: [
      { time: '15:40', clinic: 'Tatuapé Clínica',        doctor: 'Dr. Paixão',       status: 'Concluída' },
      { time: '14:10', clinic: 'Saúde Ipiranga',         doctor: 'sem responsável',  status: 'Cancelada' },
      { time: '11:50', clinic: 'Vila Olímpia Clinic',    doctor: 'Dra. Castro',      status: 'Concluída' },
      { time: '09:30', clinic: 'Pinheiros Saúde',        doctor: 'Dr. Bento',        status: 'Concluída' },
    ] },
  { dateKey: '28abr', date: 'ter, 28 abr',
    items: [
      { time: '15:20', clinic: 'Itaim Bibi',             doctor: 'Dr. Almeida',      status: 'Concluída' },
      { time: '13:00', clinic: 'C. Belo Saúde',          doctor: 'Dra. Mello',       status: 'Concluída' },
      { time: '11:30', clinic: 'Tatuapé Clínica',        doctor: 'Dr. Paixão',       status: 'Concluída' },
      { time: '09:50', clinic: 'Morumbi Médico',         doctor: 'sem responsável',  status: 'Pendente'  },
    ] },
  { dateKey: '27abr', date: 'seg, 27 abr',
    items: [
      { time: '14:10', clinic: 'Pinheiros',              doctor: 'Dr. Bento',        status: 'Concluída' },
      { time: '11:00', clinic: 'Saúde Ipiranga',         doctor: 'Dra. Albuquerque', status: 'Concluída' },
      { time: '09:30', clinic: 'Centro Médico Jardins',  doctor: 'Dra. Carvalho',    status: 'Concluída' },
    ] },
  { dateKey: '25abr', date: 'sáb, 25 abr',
    items: [
      { time: '10:40', clinic: 'Lapa Clinic',            doctor: 'Dra. Mendes',      status: 'Concluída' },
    ] },
];

function _atvFilterStatus(filter, status) {
  if (filter === 'todas')      return true;
  if (filter === 'concluidas') return status === 'Concluída';
  if (filter === 'rota')       return status === 'Em rota';
  if (filter === 'pendentes')  return status === 'Pendente';
  if (filter === 'canceladas') return status === 'Cancelada';
  return true;
}

function _atvStatusTone(s) {
  if (s === 'Concluída')  return 'good';
  if (s === 'Em rota')    return 'info';
  if (s === 'Pendente')   return 'warn';
  if (s === 'Cancelada')  return 'bad';
  return 'muted';
}

function AtividadeKpiTabs({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: 4, borderRadius: 14,
      background: '#fff', border: `1px solid ${BI_COLOR.line}`,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
      fontFamily: 'Inter, system-ui',
    }}>
      {ATV_KPI_LIST.map(o => {
        const on = o.k === value;
        const tone = ATV_TONE[o.k];
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            flex: 1, height: 40, borderRadius: 10, border: 'none',
            background: on ? tone.color : 'transparent',
            color: on ? '#fff' : BI_COLOR.muted,
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
            letterSpacing: -0.1,
            boxShadow: on ? `0 4px 12px ${tone.color}33` : 'none',
            transition: 'all 160ms',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function AtividadeEventsTimeline({ filter, onFilter }) {
  const [query, setQuery]     = React.useState('');
  const [sortKey, setSortKey] = React.useState('recent');

  const filterOpts = [
    { k: 'todas',       l: 'Todas' },
    { k: 'concluidas',  l: 'Concluídas' },
    { k: 'rota',        l: 'Em rota' },
    { k: 'pendentes',   l: 'Pendentes' },
    { k: 'canceladas',  l: 'Canceladas' },
  ];
  const sortOpts = [
    { k: 'recent', l: 'Mais recentes' },
    { k: 'oldest', l: 'Mais antigas' },
    { k: 'clinic', l: 'Clínica A–Z' },
    { k: 'doctor', l: 'Médico A–Z' },
  ];

  const q = query.trim().toLowerCase();
  const flat = ATV_EVENTS
    .flatMap(g => g.items.map(it => ({ ...it, dateKey: g.dateKey, dateLabel: g.date })))
    .filter(it => _atvFilterStatus(filter, it.status))
    .filter(it => !q
      || it.clinic.toLowerCase().includes(q)
      || it.doctor.toLowerCase().includes(q)
      || it.status.toLowerCase().includes(q));

  const dateRank = (k) => {
    const i = COM_DATE_ORDER.indexOf(k);
    return i === -1 ? 999 : i;
  };
  if (sortKey === 'recent') {
    flat.sort((a, b) => dateRank(a.dateKey) - dateRank(b.dateKey)
      || (a.time < b.time ? 1 : -1));
  } else if (sortKey === 'oldest') {
    flat.sort((a, b) => dateRank(b.dateKey) - dateRank(a.dateKey)
      || (a.time > b.time ? 1 : -1));
  } else if (sortKey === 'clinic') {
    flat.sort((a, b) => a.clinic.localeCompare(b.clinic, 'pt-BR'));
  } else if (sortKey === 'doctor') {
    flat.sort((a, b) => a.doctor.localeCompare(b.doctor, 'pt-BR'));
  }

  const groupedByDate = sortKey === 'recent' || sortKey === 'oldest';
  let groups;
  if (groupedByDate) {
    const map = new Map();
    for (const it of flat) {
      if (!map.has(it.dateKey)) map.set(it.dateKey, { dateKey: it.dateKey, date: it.dateLabel, items: [] });
      map.get(it.dateKey).items.push(it);
    }
    groups = Array.from(map.values());
  } else {
    const labelMap = { clinic: 'Por clínica (A–Z)', doctor: 'Por médico (A–Z)' };
    groups = flat.length > 0 ? [{ dateKey: 'sorted', date: labelMap[sortKey], items: flat }] : [];
  }

  const totalCount = flat.length;
  const isFiltered = q || filter !== 'todas' || sortKey !== 'recent';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 2px 10px',
        fontFamily: 'Inter, system-ui',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: BI_COLOR.faint,
        }}>Visitas no período</span>
        <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
          {totalCount} {totalCount === 1 ? 'visita' : 'visitas'}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <ComercialSearch value={query} onChange={setQuery}/>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <FilterChips value={filter} onChange={onFilter} options={filterOpts}/>
        </div>
        <ComercialSort value={sortKey} options={sortOpts} onChange={setSortKey}/>
      </div>

      {groups.length === 0 && (
        <StateBlock
          kind="empty"
          title={isFiltered ? 'Sem resultados' : 'Sem registros'}
          body={isFiltered
            ? 'Tente ajustar a busca, o filtro ou a ordenação.'
            : 'Nenhuma visita encontrada neste período.'}
        />
      )}

      {groups.map((g) => (
        <div key={g.dateKey} style={{ marginBottom: 8 }}>
          <div style={{
            padding: '12px 2px 6px',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: BI_COLOR.faint,
            fontFamily: 'Inter, system-ui',
          }}>{g.date}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.items.map((it, i) => (
              <ItemRow
                key={i}
                title={it.clinic}
                sub={(groupedByDate ? it.time : `${it.dateLabel} · ${it.time}`) + ' · ' + it.doctor}
                tag={it.status}
                tagTone={_atvStatusTone(it.status)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Lists for the satellite sub-screens. Kept separate from DETAIL_ROWS
// so they can carry the structured fields the filter/sort logic needs.
const ATV_FOLLOWUPS_LIST = [
  { id: 1, clinic: 'C. Belo Saúde',         neighborhood: 'C. Belo',     doctor: 'Dra. Mello',        lastVisitDaysAgo: 16, daysOverdue: 9,  tag: 'Vencido',   tagTone: 'warn' },
  { id: 2, clinic: 'Centro Médico Jardins', neighborhood: 'Itaim',       doctor: 'Dra. Carvalho',     lastVisitDaysAgo: 14, daysOverdue: 7,  tag: 'Vencido',   tagTone: 'warn' },
  { id: 3, clinic: 'Morumbi Médico',        neighborhood: 'Morumbi',     doctor: 'sem responsável',   lastVisitDaysAgo: 11, daysOverdue: 4,  tag: 'Vencido',   tagTone: 'warn' },
  { id: 4, clinic: 'Saúde Ipiranga',        neighborhood: 'Ipiranga',    doctor: 'Dra. Albuquerque',  lastVisitDaysAgo: 9,  daysOverdue: 0,  tag: 'Hoje',      tagTone: 'info' },
  { id: 5, clinic: 'Pinheiros Saúde',       neighborhood: 'Pinheiros',   doctor: 'Dr. Bento',         lastVisitDaysAgo: 8,  daysOverdue: -1, tag: 'Em 1 dia',  tagTone: 'info' },
  { id: 6, clinic: 'Tatuapé Clínica',       neighborhood: 'Tatuapé',     doctor: 'Dr. Paixão',        lastVisitDaysAgo: 7,  daysOverdue: -2, tag: 'Em 2 dias', tagTone: 'info' },
  { id: 7, clinic: 'Brooklin Saúde',        neighborhood: 'Brooklin',    doctor: 'sem responsável',   lastVisitDaysAgo: 5,  daysOverdue: -4, tag: 'Em 4 dias', tagTone: 'info' },
  { id: 8, clinic: 'Liberdade Saúde',       neighborhood: 'Liberdade',   doctor: 'Dra. Tomé',         lastVisitDaysAgo: 6,  daysOverdue: -5, tag: 'Em 5 dias', tagTone: 'info' },
  { id: 9, clinic: 'Vila Olímpia Clinic',   neighborhood: 'V. Olímpia',  doctor: 'Dr. Bernardes',     lastVisitDaysAgo: 3,  daysOverdue: -6, tag: 'Em 6 dias', tagTone: 'info' },
];

const ATV_NOVAS_LIST = [
  { id: 1, clinic: 'Clínica Vila Mariana', neighborhood: 'V. Mariana',  daysAgo: 3,  source: 'Cadastrada via mapa' },
  { id: 2, clinic: 'Liberdade Saúde',      neighborhood: 'Liberdade',   daysAgo: 5,  source: 'Cadastro manual' },
  { id: 3, clinic: 'Lapa Clinic',          neighborhood: 'Lapa',        daysAgo: 9,  source: 'Indicação · Dr. Bento' },
  { id: 4, clinic: 'Perdizes Médico',      neighborhood: 'Perdizes',    daysAgo: 12, source: 'Cadastro manual' },
  { id: 5, clinic: 'Sé Médico',            neighborhood: 'Sé',          daysAgo: 18, source: 'Cadastrada via mapa' },
  { id: 6, clinic: 'Bela Vista Saúde',     neighborhood: 'Bela Vista',  daysAgo: 24, source: 'Indicação · Dra. Tomé' },
  { id: 7, clinic: 'Jabaquara Clínica',    neighborhood: 'Jabaquara',   daysAgo: 31, source: 'Cadastro manual' },
  { id: 8, clinic: 'Santana Saúde',        neighborhood: 'Santana',     daysAgo: 38, source: 'Cadastrada via mapa' },
];

// Compact card for the secondary atividade KPIs. Two of these sit
// side-by-side at the top of the Atividade screen. Tap → sub-screen.
// No meta/pace shown — just the count and how it compares to the
// previous period.
function AtvKpiCard({ kpi, scope, label, onClick }) {
  const data  = ATV_DATA[kpi];
  const total = data.total[scope];
  const dp    = data.deltaPct[scope];
  const tone  = ATV_TONE[kpi];
  const fmt   = ATV_FMT[kpi];
  return (
    <BICard pad={14} onClick={onClick} style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: tone.color,
      }}/>
      <div style={{ paddingLeft: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 1.0, textTransform: 'uppercase',
            color: BI_COLOR.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{label}</span>
          <ChevronRight color={BI_COLOR.faint}/>
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{
            fontSize: 26, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.7,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{fmt(total)}</span>
        </div>
        <div style={{
          marginTop: 10, fontSize: 11, fontWeight: 600,
          color: dp > 0 ? BI_COLOR.green : dp < 0 ? BI_COLOR.red : BI_COLOR.faint,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {dp > 0 ? '+' : ''}{dp}%
          <span style={{ color: BI_COLOR.faint, fontWeight: 500, marginLeft: 4 }}>vs ant.</span>
        </div>
      </div>
    </BICard>
  );
}

// Sub-screen the user lands on when tapping a Follow-ups or Novas
// card. Hero with the same KPI summary, then full list with search,
// status filters and sort.
function AtvKpiListScreen({ kind, onBack }) {
  const isFollowups = kind === 'followups';
  const kpi = isFollowups ? 'followups' : 'novas';
  const title = isFollowups ? 'Follow-ups' : 'Novas clínicas';
  const subtitle = isFollowups
    ? 'Clínicas com follow-up pendente'
    : 'Clínicas cadastradas neste período';

  const [scope] = React.useState('1W');
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('todos');
  const [sortKey, setSortKey] = React.useState(isFollowups ? 'urgent' : 'recentes');

  const data  = ATV_DATA[kpi];
  const total = data.total[scope];
  const dp    = data.deltaPct[scope];
  const tone  = ATV_TONE[kpi];
  const fmt   = ATV_FMT[kpi];

  const filterOpts = isFollowups
    ? [
        { k: 'todos',    l: 'Todos' },
        { k: 'vencidos', l: 'Vencidos' },
        { k: 'hoje',     l: 'Hoje' },
        { k: 'proximos', l: 'Próximos' },
      ]
    : [
        { k: 'todos',    l: 'Todas' },
        { k: 'recentes', l: 'Recentes (≤ 7 d)' },
        { k: 'antigas',  l: 'Antigas (> 7 d)' },
      ];
  const sortOpts = isFollowups
    ? [
        { k: 'urgent', l: 'Mais urgentes' },
        { k: 'leastUrgent', l: 'Menos urgentes' },
        { k: 'clinic', l: 'Clínica A–Z' },
      ]
    : [
        { k: 'recentes', l: 'Mais recentes' },
        { k: 'antigas',  l: 'Mais antigas' },
        { k: 'clinic',   l: 'Clínica A–Z' },
      ];

  const rows = isFollowups ? ATV_FOLLOWUPS_LIST : ATV_NOVAS_LIST;
  const q = query.trim().toLowerCase();

  let items = rows.filter(r => {
    if (q) {
      const hay = (r.clinic + ' ' + r.neighborhood + ' ' + (r.doctor || '') + ' ' + (r.source || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (isFollowups) {
      if (filter === 'vencidos') return r.daysOverdue > 0;
      if (filter === 'hoje')     return r.daysOverdue === 0;
      if (filter === 'proximos') return r.daysOverdue < 0;
      return true;
    } else {
      if (filter === 'recentes') return r.daysAgo <= 7;
      if (filter === 'antigas')  return r.daysAgo > 7;
      return true;
    }
  });
  items = items.slice();
  if (sortKey === 'urgent')          items.sort((a, b) => b.daysOverdue - a.daysOverdue);
  else if (sortKey === 'leastUrgent') items.sort((a, b) => a.daysOverdue - b.daysOverdue);
  else if (sortKey === 'recentes')   items.sort((a, b) => a.daysAgo - b.daysAgo);
  else if (sortKey === 'antigas')    items.sort((a, b) => b.daysAgo - a.daysAgo);
  else if (sortKey === 'clinic')     items.sort((a, b) => a.clinic.localeCompare(b.clinic, 'pt-BR'));

  const isFiltered = q || filter !== 'todos' || sortKey !== (isFollowups ? 'urgent' : 'recentes');

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack || (() => {})} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Atividade</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>{title}</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 24,
      }}>
        {/* Hero card */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: '#fff',
            border: `1px solid ${BI_COLOR.line}`,
            borderRadius: 16, padding: 18,
            boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
              background: tone.color,
            }}/>
            <div style={{ paddingLeft: 8 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                color: BI_COLOR.faint,
              }}>{ATV_SCOPE_LABEL[scope]}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <span style={{
                  fontSize: 38, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -1.4,
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>{fmt(total)}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: dp > 0 ? BI_COLOR.green : dp < 0 ? BI_COLOR.red : BI_COLOR.faint,
                  fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                }}>
                  {dp > 0 ? '+' : ''}{dp}%
                  <span style={{ color: BI_COLOR.faint, fontWeight: 500, marginLeft: 4 }}>
                    vs período anterior
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11.5, color: BI_COLOR.muted }}>
                {subtitle}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 2px 10px',
            fontFamily: 'Inter, system-ui',
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>{isFollowups ? 'Lista de follow-ups' : 'Clínicas cadastradas'}</span>
            <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
              {items.length} {isFollowups ? (items.length === 1 ? 'follow-up' : 'follow-ups') : (items.length === 1 ? 'clínica' : 'clínicas')}
            </span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <ComercialSearch value={query} onChange={setQuery}/>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <FilterChips value={filter} onChange={setFilter} options={filterOpts}/>
            </div>
            <ComercialSort value={sortKey} options={sortOpts} onChange={setSortKey}/>
          </div>

          {items.length === 0 && (
            <StateBlock
              kind="empty"
              title={isFiltered ? 'Sem resultados' : 'Sem registros'}
              body={isFiltered
                ? 'Tente ajustar a busca, o filtro ou a ordenação.'
                : (isFollowups ? 'Nenhum follow-up neste período.' : 'Nenhuma clínica cadastrada neste período.')}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((it, i) => (
              <ItemRow
                key={it.id}
                title={it.clinic}
                sub={isFollowups
                  ? `${it.neighborhood} · ${it.doctor} · última visita há ${it.lastVisitDaysAgo} dias`
                  : `${it.neighborhood} · cadastrada há ${it.daysAgo} dias · ${it.source}`}
                tag={isFollowups ? it.tag : 'Nova'}
                tagTone={isFollowups ? it.tagTone : 'good'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AtividadeDetailScreen({ initialPeriod = 'semana', onBack }) {
  // Visitas-only screen. Follow-ups and Novas live in their own
  // satellite sections below the events feed; the KPI selector is
  // gone because there's only one KPI in the chart now.
  const [scope,    setScope]    = React.useState(COM_PERIOD_TO_SCOPE[initialPeriod] || '1W');
  const [mode,     setMode]     = React.useState('agg');
  const [scrubIdx, setScrubIdx] = React.useState(-1);
  const [filter,   setFilter]   = React.useState('todas');

  const onScopeChange = (s) => { setScope(s); setScrubIdx(-1); };
  const onModeChange  = (m) => { setMode(m);  setScrubIdx(-1); };

  const kpi          = 'visitas';
  const data         = ATV_DATA[kpi];
  const series       = (mode === 'agg' ? data.agg : data.pt)[scope]
                    || (mode === 'agg' ? data.agg : data.pt)['1W'];
  const total        = data.total[scope];
  const goal         = data.goal[scope];
  const paceExpected = data.paceExpected[scope];
  const tone         = ATV_TONE[kpi];
  const fmt          = ATV_FMT[kpi];

  const isScrubbing = scrubIdx >= 0 && scrubIdx < series.length;
  const headerValue = isScrubbing ? series[scrubIdx].v : total;
  const headerTime  = isScrubbing ? series[scrubIdx].tFull : ATV_SCOPE_LABEL[scope];
  const scrubLabel  = mode === 'agg'
    ? 'acumulado até aqui'
    : (ATV_BUCKET_LABEL[scope] || 'neste período');

  const aboveTarget = total >= paceExpected;
  const pacePct = paceExpected > 0
    ? Math.round(((total - paceExpected) / paceExpected) * 100)
    : 0;
  const projection = paceExpected > 0
    ? Math.round((total / paceExpected) * goal)
    : total;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack || (() => {})} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Portal · Desempenho</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>Atividade</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 24,
      }}>
        {/* Mode toggle */}
        <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'center' }}>
          <ComercialChartMode value={mode} onChange={onModeChange}/>
        </div>

        {/* Primary KPI block — Visitas, current vs meta + pace */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: isScrubbing ? tone.color : BI_COLOR.faint,
            transition: 'color 160ms',
            fontVariantNumeric: 'tabular-nums',
          }}>{headerTime}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 38, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -1.4,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{fmt(headerValue)}</span>
            {!isScrubbing && (
              <span style={{
                fontSize: 18, fontWeight: 600, color: BI_COLOR.faint,
                fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4,
              }}>
                / {fmt(goal)}
                <span style={{ fontSize: 11, color: BI_COLOR.muted, fontWeight: 600, marginLeft: 4 }}>meta · visitas</span>
              </span>
            )}
            {isScrubbing && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: BI_COLOR.muted,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}>{scrubLabel}</span>
            )}
          </div>

          {!isScrubbing && (
            <div style={{
              marginTop: 10,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 999,
              background: aboveTarget ? 'rgba(22,163,115,0.10)' : 'rgba(184,69,69,0.10)',
              color: aboveTarget ? BI_COLOR.green : BI_COLOR.red,
              fontSize: 11.5, fontWeight: 600,
              fontFamily: 'Inter, system-ui',
            }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                {aboveTarget
                  ? <path d="M2 7l3.5-3.5L8 6l1.5-1.5"/>
                  : <path d="M2 4l3.5 3.5L8 5l1.5 1.5"/>}
              </svg>
              {pacePct >= 0 ? '+' : ''}{pacePct}% {aboveTarget ? 'acima do ritmo esperado' : 'abaixo do ritmo esperado'}
              {paceExpected > 0 && (
                <span style={{ color: BI_COLOR.faint, fontWeight: 500, marginLeft: 4 }}>
                  · projeção {fmt(projection)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Two compact KPI cards — Follow-ups + Novas clínicas. Tap a
            card → dedicated sub-screen with full list, search, filter
            and sort. Placed right after the primary block so the rep
            sees all three atividade KPIs at a glance before diving
            into the visitas chart. */}
        <div style={{ padding: '14px 16px 0', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <AtvKpiCard kpi="followups" scope={scope} label="Follow-ups" onClick={() => {}}/>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <AtvKpiCard kpi="novas" scope={scope} label="Novas clínicas" onClick={() => {}}/>
          </div>
        </div>

        {/* Chart — dashed Meta reference line in Acumulado mode helps
            the rep see whether the cumulative curve is on track to
            cross the period target. Hidden in Individual mode because
            "daily goal" varies confusingly across scopes. */}
        <div style={{ padding: '14px 16px 0' }}>
          <ComercialChart
            mode={mode}
            series={series}
            color={tone.color}
            scrubIndex={scrubIdx}
            onScrub={setScrubIdx}
            goalLine={mode === 'agg' ? goal : null}
            goalLabel={mode === 'agg' ? `Meta ${goal}` : null}
          />
        </div>

        {/* Granularity (chart-only) */}
        <div style={{ padding: '8px 16px 0' }}>
          <ComercialGranularity value={scope} onChange={onScopeChange}/>
        </div>

        {/* Events feed (visits) */}
        <div style={{ padding: '18px 16px 24px' }}>
          <AtividadeEventsTimeline filter={filter} onFilter={setFilter}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TerritoryDetailScreen — todas as clínicas + visitada/não-visitada
// ─────────────────────────────────────────────────────────────
function TerritoryDetailScreen({ onBack, focus }) {
  const [period, setPeriod] = React.useState('semana');
  const [filter, setFilter] = React.useState(focus || 'todas');
  const filters = [
    { k: 'todas',         l: 'Todas' },
    { k: 'visitadas',     l: 'Visitadas' },
    { k: 'nao_visitadas', l: 'Não visitadas' },
    { k: 'risco',         l: 'Em risco' },
    { k: 'nunca',         l: 'Nunca compraram' },
  ];
  const filtered = TERRITORY_CLINICS.filter(c => {
    if (filter === 'visitadas') return c.tag === 'Visitada';
    if (filter === 'nao_visitadas') return c.tag === 'Não visitada';
    if (filter === 'risco') return c.sub.includes('45 d') || c.sub.includes('38 d');
    if (filter === 'nunca') return c.sub.includes('nunca');
    return true;
  });
  const summary = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4,
        }}>62%</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Cobertura · Esta semana
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, marginTop: 2, letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums' }}>
            88 de 142 clínicas visitadas
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
        <MiniMetric label="Ativas" value="84" tone="good"/>
        <MiniMetric label="Em risco" value="18" tone="warn"/>
        <MiniMetric label="Nunca compraram" value="31" tone="bad"/>
      </div>
    </div>
  );
  return (
    <DetailShell kicker="Território · Atendimento" title="Clínicas do território"
      summary={summary} period={period} onPeriod={setPeriod}
      filters={filters} filterValue={filter} onFilter={setFilter} onBack={onBack}
      footer={
        <button style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
          fontSize: 13.5, fontWeight: 700, fontFamily: 'Inter, system-ui',
          boxShadow: '0 12px 28px rgba(10,47,127,0.3)', cursor: 'pointer',
        }}>Priorizar não visitadas no mapa</button>
      }>
      {filtered.length > 0
        ? filtered.map((r, i) => <ItemRow key={i} {...r}/>)
        : <StateBlock kind="empty" title="Sem clínicas neste filtro" body="Tente ajustar os filtros para ver mais resultados."/>}
    </DetailShell>
  );
}

function MiniMetric({ label, value, tone = 'info' }) {
  const tt = TAG_TONE[tone];
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 10,
      background: '#f7f9fc', border: `1px solid ${BI_COLOR.line}`,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: tt.color, marginTop: 2, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ClinicStatusScreen — single screen replacing the 5 per-status
// detail screens. Coverage hero on top, then status filter chips
// (with colored dot + count badge that double as a status legend),
// search, sort, and a combined list of all clinics.
// ─────────────────────────────────────────────────────────────
function ClinicCoverageHero({ coverage, total, ativas, risco, naoVisitadas }) {
  const visited = coverage.visited;
  const tot = coverage.total;
  const pct = coverage.pct;
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BI_COLOR.line}`,
      borderRadius: 16, padding: 18,
      boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
      position: 'relative', overflow: 'hidden',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: BI_COLOR.navy,
      }}/>
      <div style={{ paddingLeft: 8 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: BI_COLOR.faint,
        }}>Cobertura de território · esta semana</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <span style={{
            fontSize: 38, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -1.4,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{pct}%</span>
          <span style={{
            fontSize: 12, color: BI_COLOR.muted, fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <strong style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{visited}</strong> de <strong style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{tot}</strong> clínicas
          </span>
        </div>
        <div style={{
          marginTop: 12, height: 8, background: BI_COLOR.lineSoft, borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg, #1e40af, #16a373)',
            borderRadius: 4,
          }}/>
        </div>
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: `1px solid ${BI_COLOR.lineSoft}`,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          fontSize: 11, color: BI_COLOR.muted,
        }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>Total</div>
            <div style={{ marginTop: 3, fontSize: 14, fontWeight: 700, color: BI_COLOR.ink, fontVariantNumeric: 'tabular-nums' }}>{total}</div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>Ativas</div>
            <div style={{ marginTop: 3, fontSize: 14, fontWeight: 700, color: BI_COLOR.green, fontVariantNumeric: 'tabular-nums' }}>{ativas}</div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: BI_COLOR.faint }}>Em risco</div>
            <div style={{ marginTop: 3, fontSize: 14, fontWeight: 700, color: BI_COLOR.amberText, fontVariantNumeric: 'tabular-nums' }}>{risco}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicStatusChips({ value, onChange, options }) {
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0',
      WebkitOverflowScrolling: 'touch',
      fontFamily: 'Inter, system-ui',
    }}>
      {options.map(o => {
        const on = o.k === value;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            border: `1px solid ${on ? BI_COLOR.navy : BI_COLOR.line}`,
            background: on ? 'rgba(30,64,175,0.08)' : '#fff',
            color: on ? BI_COLOR.navy : BI_COLOR.inkSoft,
            padding: '6px 10px', borderRadius: 999, cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap', flexShrink: 0,
            fontFamily: 'Inter, system-ui',
          }}>
            {o.color && (
              <span style={{
                width: 7, height: 7, borderRadius: 4, background: o.color,
                flexShrink: 0,
              }}/>
            )}
            {o.l}
            <span style={{
              padding: '0 6px', borderRadius: 4,
              background: on ? 'rgba(30,64,175,0.15)' : '#eef0f3',
              color: on ? BI_COLOR.navy : BI_COLOR.muted,
              fontSize: 10.5, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 18, textAlign: 'center',
            }}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ClinicStatusScreen({ onBack }) {
  const [filter,  setFilter]  = React.useState('todas');
  const [query,   setQuery]   = React.useState('');
  const [sortKey, setSortKey] = React.useState('default');

  const t = BI_DATA.territory;
  const funnel = BI_DATA.funnel;

  // Combine all status clinics into one flat list with status meta.
  const all = funnel.flatMap(f =>
    (STATUS_CLINICS[f.k] || []).map(c => ({
      ...c,
      statusKey: f.k,
      statusLabel: f.label,
      statusColor: f.color,
    }))
  );

  const q = query.trim().toLowerCase();
  let items = all.filter(c => {
    if (filter !== 'todas' && c.statusKey !== filter) return false;
    if (q) {
      const hay = (c.title + ' ' + c.sub).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  items = items.slice();

  // Status priority for "Por status" sort: most urgent first.
  const STATUS_ORDER = ['risco', 'rej', 'neg', 'sem', 'ativa'];
  if (sortKey === 'clinic')      items.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  else if (sortKey === 'status') items.sort((a, b) => STATUS_ORDER.indexOf(a.statusKey) - STATUS_ORDER.indexOf(b.statusKey));

  const filterOpts = [
    { k: 'todas', l: 'Todas', count: all.length, color: null },
    ...funnel.map(f => ({ k: f.k, l: f.label, count: (STATUS_CLINICS[f.k] || []).length, color: f.color })),
  ];
  const sortOpts = [
    { k: 'default', l: 'Padrão' },
    { k: 'status',  l: 'Por urgência' },
    { k: 'clinic',  l: 'Clínica A–Z' },
  ];

  const isFiltered = q || filter !== 'todas' || sortKey !== 'default';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack || (() => {})} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Território</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>Status das clínicas</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 24,
      }}>
        <div style={{ padding: '14px 16px 0' }}>
          <ClinicCoverageHero
            coverage={t.coverage}
            total={t.total}
            ativas={t.ativas}
            risco={t.risco}
          />
        </div>

        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 2px 10px',
            fontFamily: 'Inter, system-ui',
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Clínicas</span>
            <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
              {items.length} {items.length === 1 ? 'clínica' : 'clínicas'}
            </span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <ComercialSearch value={query} onChange={setQuery}/>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <ClinicStatusChips value={filter} onChange={setFilter} options={filterOpts}/>
            </div>
            <ComercialSort value={sortKey} options={sortOpts} onChange={setSortKey}/>
          </div>

          {items.length === 0 && (
            <StateBlock
              kind="empty"
              title={isFiltered ? 'Sem resultados' : 'Sem clínicas'}
              body={isFiltered
                ? 'Tente ajustar a busca, o filtro ou a ordenação.'
                : 'Nenhuma clínica encontrada.'}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((c, i) => (
              <ItemRow
                key={i}
                title={c.title}
                sub={c.sub}
                tag={c.tag}
                tagTone={c.tagTone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ActivityDetailScreen — gráficos detalhados, comparações
// ─────────────────────────────────────────────────────────────
function ActivityDetailScreen({ onBack }) {
  const [period, setPeriod] = React.useState('semana');
  const [view, setView] = React.useState('barras');
  const filters = [
    { k: 'barras', l: 'Barras' },
    { k: 'cumul', l: 'Cumulativo' },
    { k: 'comparar', l: 'Comparar 2 períodos' },
  ];
  const summary = (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>
          61
        </span>
        <Tag tone="good">+12% vs período anterior</Tag>
      </div>
      <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2 }}>
        Total de visitas nos últimos 14 dias · média 6,1 / dia útil
      </div>
    </div>
  );
  return (
    <DetailShell kicker="Atividade · Detalhes" title="Análise de atividade"
      summary={summary} period={period} onPeriod={setPeriod}
      filters={filters} filterValue={view} onFilter={setView} onBack={onBack}>
      {/* Reuse ActivityCard inside detail — bigger, with goal line */}
      <ActivityCard data={BI_DATA.activity} dailyGoal={BI_DATA.dailyGoal}/>
      <BICard>
        <BISectionTitle title="Por dia da semana"/>
        {[
          { d: 'Segunda', n: 4, w: 60 },
          { d: 'Terça',   n: 5.5, w: 80 },
          { d: 'Quarta',  n: 4.5, w: 65 },
          { d: 'Quinta',  n: 4,   w: 60 },
          { d: 'Sexta',   n: 6,   w: 90 },
        ].map(r => (
          <div key={r.d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <span style={{ width: 60, fontSize: 12, color: BI_COLOR.inkSoft }}>{r.d}</span>
            <div style={{ flex: 1, height: 8, background: '#eef0f3', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${r.w}%`, height: '100%', background: 'linear-gradient(90deg, #1e40af, #2850c8)' }}/>
            </div>
            <span style={{ width: 36, textAlign: 'right', fontSize: 12, fontWeight: 700, color: BI_COLOR.ink, fontVariantNumeric: 'tabular-nums' }}>{r.n}</span>
          </div>
        ))}
      </BICard>
    </DetailShell>
  );
}

// ─────────────────────────────────────────────────────────────
// ConversionDetailScreen
// ─────────────────────────────────────────────────────────────
// Visit-level data for the Análise de conversão list. Each entry
// captures whether the visit converted into a pedido, is still under
// evaluation, or didn't convert.
const CONVERSION_VISITS = [
  { dateKey: 'hoje',  date: 'Hoje',         time: '14:35', clinic: 'Itaim Bibi',             doctor: 'Dr. Almeida',       outcome: 'Convertida',    value: 12400 },
  { dateKey: 'hoje',  date: 'Hoje',         time: '11:20', clinic: 'Vila Olímpia Clinic',    doctor: 'Dra. Castro',       outcome: 'Em decisão',    value: null  },
  { dateKey: 'hoje',  date: 'Hoje',         time: '10:30', clinic: 'Centro Médico Jardins',  doctor: 'Dra. Carvalho',     outcome: 'Sem conversão', value: null  },
  { dateKey: 'ontem', date: 'Ontem',        time: '15:40', clinic: 'Tatuapé Clínica',        doctor: 'Dr. Paixão',        outcome: 'Convertida',    value: 5800  },
  { dateKey: 'ontem', date: 'Ontem',        time: '13:18', clinic: 'Moema Pediatria',        doctor: 'Dra. Tomé',         outcome: 'Em decisão',    value: null  },
  { dateKey: 'ontem', date: 'Ontem',        time: '09:55', clinic: 'Brooklin Saúde',         doctor: 'sem responsável',   outcome: 'Sem conversão', value: null  },
  { dateKey: '28abr', date: 'ter, 28 abr',  time: '15:20', clinic: 'Pinheiros',              doctor: 'Dr. Bento',         outcome: 'Convertida',    value: 18900 },
  { dateKey: '28abr', date: 'ter, 28 abr',  time: '11:30', clinic: 'C. Belo Saúde',          doctor: 'Dra. Mello',        outcome: 'Em decisão',    value: null  },
  { dateKey: '27abr', date: 'seg, 27 abr',  time: '14:10', clinic: 'Saúde Ipiranga',         doctor: 'Dra. Albuquerque',  outcome: 'Sem conversão', value: null  },
  { dateKey: '27abr', date: 'seg, 27 abr',  time: '09:30', clinic: 'Centro Médico Jardins',  doctor: 'Dra. Carvalho',     outcome: 'Convertida',    value: 14700 },
  { dateKey: '25abr', date: 'sáb, 25 abr',  time: '11:20', clinic: 'Lapa Clinic',            doctor: 'Dra. Mendes',       outcome: 'Convertida',    value: 4200  },
  { dateKey: '24abr', date: 'sex, 24 abr',  time: '15:00', clinic: 'Moema Pediatria',        doctor: 'Dra. Tomé',         outcome: 'Convertida',    value: 8100  },
  { dateKey: '24abr', date: 'sex, 24 abr',  time: '11:15', clinic: 'Vila Olímpia Clinic',    doctor: 'Dr. Bernardes',     outcome: 'Convertida',    value: 14000 },
];

function _convOutcomeTone(o) {
  if (o === 'Convertida')    return 'good';
  if (o === 'Em decisão')    return 'info';
  if (o === 'Sem conversão') return 'muted';
  return 'muted';
}

function _convFmtValue(n) {
  if (n == null) return '';
  if (n >= 1000) return 'R$ ' + (n / 1000).toFixed(1).replace('.', ',') + 'k';
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

function ConversionVisitsList() {
  const [query,   setQuery]   = React.useState('');
  const [filter,  setFilter]  = React.useState('todas');
  const [sortKey, setSortKey] = React.useState('recent');

  const filterOpts = [
    { k: 'todas',       l: 'Todas' },
    { k: 'convertidas', l: 'Convertidas' },
    { k: 'decisao',     l: 'Em decisão' },
    { k: 'sem',         l: 'Sem conversão' },
  ];
  const sortOpts = [
    { k: 'recent', l: 'Mais recentes' },
    { k: 'oldest', l: 'Mais antigas' },
    { k: 'value',  l: 'Maior valor' },
    { k: 'clinic', l: 'Clínica A–Z' },
  ];

  const q = query.trim().toLowerCase();
  let items = CONVERSION_VISITS.filter(v => {
    if (filter === 'convertidas' && v.outcome !== 'Convertida')    return false;
    if (filter === 'decisao'     && v.outcome !== 'Em decisão')    return false;
    if (filter === 'sem'         && v.outcome !== 'Sem conversão') return false;
    if (q) {
      const hay = (v.clinic + ' ' + v.doctor + ' ' + v.outcome).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  items = items.slice();

  const dateRank = (k) => {
    const i = COM_DATE_ORDER.indexOf(k);
    return i === -1 ? 999 : i;
  };
  if (sortKey === 'recent') {
    items.sort((a, b) => dateRank(a.dateKey) - dateRank(b.dateKey)
      || (a.time < b.time ? 1 : -1));
  } else if (sortKey === 'oldest') {
    items.sort((a, b) => dateRank(b.dateKey) - dateRank(a.dateKey)
      || (a.time > b.time ? 1 : -1));
  } else if (sortKey === 'value') {
    items.sort((a, b) => (b.value || 0) - (a.value || 0));
  } else if (sortKey === 'clinic') {
    items.sort((a, b) => a.clinic.localeCompare(b.clinic, 'pt-BR'));
  }

  const isFiltered = q || filter !== 'todas' || sortKey !== 'recent';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 2px 10px',
        fontFamily: 'Inter, system-ui',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: BI_COLOR.faint,
        }}>Visitas no período</span>
        <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
          {items.length} {items.length === 1 ? 'visita' : 'visitas'}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <ComercialSearch value={query} onChange={setQuery}/>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <FilterChips value={filter} onChange={setFilter} options={filterOpts}/>
        </div>
        <ComercialSort value={sortKey} options={sortOpts} onChange={setSortKey}/>
      </div>

      {items.length === 0 && (
        <StateBlock
          kind="empty"
          title={isFiltered ? 'Sem resultados' : 'Sem visitas'}
          body={isFiltered
            ? 'Tente ajustar a busca, o filtro ou a ordenação.'
            : 'Nenhuma visita no período selecionado.'}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((v, i) => (
          <ItemRow
            key={i}
            title={v.clinic}
            sub={`${v.date} · ${v.time} · ${v.doctor}` + (v.value ? ` · ${_convFmtValue(v.value)}` : '')}
            tag={v.outcome}
            tagTone={_convOutcomeTone(v.outcome)}
          />
        ))}
      </div>
    </div>
  );
}

// Aggregate per-clinic conversion status from the per-visit log.
// A clinic's status follows the most positive outcome it has in the
// period: any "Convertida" wins; otherwise "Em decisão" wins over
// "Sem conversão". Each row also carries the count of visits, the
// most recent visit date, and the realized value (if converted).
function _convAggregateByClinic(visits) {
  const byClinic = new Map();
  visits.forEach(v => {
    const prev = byClinic.get(v.clinic) || {
      clinic: v.clinic,
      visits: 0,
      lastDate: '',
      lastTime: '',
      lastDoctor: '',
      doctors: new Set(),
      value: 0,
      outcomes: { Convertida: 0, 'Em decisão': 0, 'Sem conversão': 0 },
    };
    prev.visits += 1;
    prev.outcomes[v.outcome] = (prev.outcomes[v.outcome] || 0) + 1;
    prev.doctors.add(v.doctor);
    if (v.value) prev.value += v.value;
    // First entry wins as "last" because CONVERSION_VISITS is sorted desc.
    if (!prev.lastDate) {
      prev.lastDate = v.date;
      prev.lastTime = v.time;
      prev.lastDoctor = v.doctor;
    }
    byClinic.set(v.clinic, prev);
  });
  return Array.from(byClinic.values()).map(c => {
    let status;
    if (c.outcomes['Convertida'] > 0)        status = 'Convertida';
    else if (c.outcomes['Em decisão'] > 0)   status = 'Em decisão';
    else                                     status = 'Sem conversão';
    return { ...c, status, doctors: Array.from(c.doctors) };
  });
}

// Compact funnel chart that renders inside the DetailShell body.
// Same idea as ConversionCard but tighter (no "Análise" CTA, since
// we already are on the analysis screen).
function _ConvFunnelCard({ data }) {
  const maxW = 100;
  const steps = [
    { k: 'v', label: 'Visitas',     n: data.visits,      color: '#1e40af', w: maxW,                                                rate: null },
    { k: 'i', label: 'Interesse',   n: data.interest,    color: '#c6861b', w: data.visits  ? (data.interest    / data.visits) * maxW : 0, rate: data.interestRate },
    { k: 'c', label: 'Conversões',  n: data.conversions, color: '#16a373', w: data.visits  ? (data.conversions / data.visits) * maxW : 0, rate: data.conversionRate },
  ];
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BI_COLOR.line}`,
      borderRadius: 14, padding: 14, marginBottom: 12,
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          textTransform: 'uppercase', color: BI_COLOR.faint,
        }}>Funil de conversão</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, color: BI_COLOR.muted,
        }}>
          <InfoIcon size={11}/> visitas → interesse → pedido
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {steps.map((s) => (
          <div key={s.k}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: BI_COLOR.ink }}>{s.label}</span>
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                {s.rate !== null && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: s.color,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.rate}%
                  </span>
                )}
                <span style={{
                  fontSize: 13, fontWeight: 700, color: BI_COLOR.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}>{s.n}</span>
              </span>
            </div>
            <div style={{ height: 8, background: '#eef0f3', borderRadius: 4, overflow: 'hidden' }}>
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
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BI_COLOR.lineSoft}`,
      }}>
        <RatePill label="Taxa de interesse" value={data.interestRate} color="#c6861b"/>
        <RatePill label="Taxa de conversão" value={data.conversionRate} color="#16a373"/>
      </div>
    </div>
  );
}

function ConversionDetailScreen({ onBack, focus, initialQuery = '', initialSort = 'recent' }) {
  const [period, setPeriod] = React.useState('semana');
  const [filter, setFilter] = React.useState(focus || 'todas');
  const [query, setQuery]   = React.useState(initialQuery);
  const [sortKey, setSort]  = React.useState(initialSort);
  const c = BI_DATA.conversion;

  // Aggregate per-clinic.
  const clinicRows = React.useMemo(() => _convAggregateByClinic(CONVERSION_VISITS), []);

  const counts = {
    todas:       clinicRows.length,
    convertidas: clinicRows.filter(r => r.status === 'Convertida').length,
    decisao:     clinicRows.filter(r => r.status === 'Em decisão').length,
    sem:         clinicRows.filter(r => r.status === 'Sem conversão').length,
  };

  const filters = [
    { k: 'todas',       l: 'Todas' },
    { k: 'convertidas', l: 'Convertidas' },
    { k: 'decisao',     l: 'Em decisão' },
    { k: 'sem',         l: 'Sem conversão' },
  ];

  const sortOptions = [
    { k: 'recent',  l: 'Mais recentes' },
    { k: 'value',   l: 'Maior valor' },
    { k: 'visits',  l: 'Mais visitas' },
    { k: 'clinic',  l: 'Clínica A–Z' },
  ];

  // Filter → search → sort.
  let filtered = clinicRows.filter(r => {
    if (filter === 'convertidas') return r.status === 'Convertida';
    if (filter === 'decisao')     return r.status === 'Em decisão';
    if (filter === 'sem')         return r.status === 'Sem conversão';
    return true;
  });

  const q = query.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(r => {
      const hay = (r.clinic + ' ' + r.doctors.join(' ') + ' ' + r.status).toLowerCase();
      return hay.includes(q);
    });
  }

  filtered = filtered.slice();
  if (sortKey === 'recent') {
    const dateRank = (k) => {
      const i = COM_DATE_ORDER.indexOf(k);
      return i === -1 ? 999 : i;
    };
    // We don't keep dateKey on the aggregate; fall back to original chronology
    // (CONVERSION_VISITS is already sorted desc, so first-seen order works).
    const order = clinicRows.map(r => r.clinic);
    filtered.sort((a, b) => order.indexOf(a.clinic) - order.indexOf(b.clinic));
  } else if (sortKey === 'value') {
    filtered.sort((a, b) => (b.value || 0) - (a.value || 0));
  } else if (sortKey === 'visits') {
    filtered.sort((a, b) => b.visits - a.visits);
  } else if (sortKey === 'clinic') {
    filtered.sort((a, b) => a.clinic.localeCompare(b.clinic, 'pt-BR'));
  }

  const isFiltered = q || filter !== 'todas';

  const summary = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(165deg, #16a373, #0f8a5f)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4,
        }}>{c.conversionRate}%</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: BI_COLOR.faint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Conversão · Esta semana
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, marginTop: 2, letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums' }}>
            {c.conversions} de {c.visits} visitas viraram pedido
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
        <MiniMetric label="Convertidas"   value={String(counts.convertidas)} tone="good"/>
        <MiniMetric label="Em decisão"    value={String(counts.decisao)}     tone="warn"/>
        <MiniMetric label="Sem conversão" value={String(counts.sem)}         tone="bad"/>
      </div>
    </div>
  );

  return (
    <DetailShell kicker="Conversão · Atendimento" title="Análise de conversão"
      summary={summary} period={period} onPeriod={setPeriod}
      filters={filters} filterValue={filter} onFilter={setFilter} onBack={onBack}>
      {/* Conversion funnel chart */}
      <_ConvFunnelCard data={c}/>

      {/* List header + sort */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '4px 2px 10px', fontFamily: 'Inter, system-ui',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: BI_COLOR.faint,
        }}>
          Status por clínica · {filtered.length} {filtered.length === 1 ? 'clínica' : 'clínicas'}
        </span>
        <ComercialSort value={sortKey} options={sortOptions} onChange={setSort}/>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <ComercialSearch value={query} onChange={setQuery}/>
      </div>

      {/* Per-clinic rows */}
      {filtered.length === 0 ? (
        <StateBlock
          kind="empty"
          title={isFiltered ? 'Sem resultados' : 'Sem clínicas no período'}
          body={isFiltered
            ? 'Ajuste a busca ou os filtros para ver mais clínicas.'
            : 'Nenhuma clínica nas visitas desta semana.'}
        />
      ) : (
        filtered.map((r, i) => {
          const docPart = r.doctors.length === 1
            ? r.doctors[0]
            : `${r.doctors.length} médicos`;
          const visitPart = `${r.visits} ${r.visits === 1 ? 'visita' : 'visitas'}`;
          const lastPart = r.lastDate ? `última ${r.lastDate.toLowerCase()}` : '';
          const valuePart = r.status === 'Convertida' && r.value > 0 ? _convFmtValue(r.value) : '';
          const sub = [docPart, visitPart, lastPart, valuePart].filter(Boolean).join(' · ');
          return (
            <ItemRow
              key={i}
              title={r.clinic}
              sub={sub}
              tag={r.status}
              tagTone={_convOutcomeTone(r.status)}
            />
          );
        })
      )}
    </DetailShell>
  );
}

// ─────────────────────────────────────────────────────────────
// DataQualityDetailScreen — clínicas com dados incompletos
// ─────────────────────────────────────────────────────────────
function DataQualityDetailScreen({ onBack }) {
  const [period, setPeriod] = React.useState('semana');
  const [filter, setFilter] = React.useState('todos');
  const filters = [
    { k: 'todos',    l: 'Todos campos' },
    { k: 'contato',  l: 'Sem contato' },
    { k: 'medicos',  l: 'Sem médicos' },
    { k: 'endereco', l: 'Sem endereço' },
  ];
  const summary = (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BI_COLOR.red, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>31</span>
        <Tag tone="warn">22% da base</Tag>
      </div>
      <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2 }}>
        Clínicas com cadastro incompleto. Toque em uma para corrigir.
      </div>
    </div>
  );
  return (
    <DetailShell kicker="Qualidade · Cadastros" title="Corrigir cadastros"
      summary={summary} period={period} onPeriod={setPeriod}
      filters={filters} filterValue={filter} onFilter={setFilter} onBack={onBack}
      footer={
        <button style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
          fontSize: 13.5, fontWeight: 700, fontFamily: 'Inter, system-ui',
          boxShadow: '0 12px 28px rgba(10,47,127,0.3)', cursor: 'pointer',
        }}>Iniciar correção em massa</button>
      }>
      {INCOMPLETE_CLINICS.map((r, i) => (
        <ItemRow key={i} {...r}
          action={
            <span style={{
              fontSize: 11, fontWeight: 700, color: BI_COLOR.navy,
              padding: '6px 10px', borderRadius: 8,
              background: 'rgba(30,64,175,0.08)',
            }}>Corrigir</span>
          }/>
      ))}
    </DetailShell>
  );
}

// ─────────────────────────────────────────────────────────────
// IncompleteDetailScreen — sub-screen reached from a row in the
// Corrigir cadastros list. Lets the rep fill in the fields that
// are still missing for the entity (clinic OR doctor). Already-
// filled fields are shown read-only as a summary so the rep can
// confirm the existing data without re-typing it.
// ─────────────────────────────────────────────────────────────
const FIELD_DEFS = {
  // Clinic fields
  nome:          { label: 'Nome',                     placeholder: 'Nome da clínica',          type: 'text'   },
  contato:       { label: 'Telefone de contato',      placeholder: '(11) 99999-9999',          type: 'tel'    },
  endereco:      { label: 'Endereço completo',        placeholder: 'Rua, número, bairro',      type: 'text'   },
  cnpj:          { label: 'CNPJ',                     placeholder: '00.000.000/0000-00',       type: 'text'   },
  horario:       { label: 'Horário de funcionamento', placeholder: 'Seg–Sex 09h–18h',          type: 'text'   },
  email:         { label: 'E-mail',                   placeholder: 'contato@clinica.com.br',   type: 'email'  },
  medicos:       { label: 'Médico responsável',       placeholder: 'Selecionar médico',        type: 'select' },
  // Doctor fields
  crm:           { label: 'CRM',                      placeholder: 'CRM-SP 000.000',           type: 'text'   },
  telefone:      { label: 'Telefone',                 placeholder: '(11) 99999-9999',          type: 'tel'    },
  especialidade: { label: 'Especialidade',            placeholder: 'Cardiologia, Pediatria…', type: 'select' },
};

// Field order so PENDENTES + PREENCHIDOS render in a predictable shape.
const FIELD_ORDER_CLINIC = ['nome', 'contato', 'endereco', 'cnpj', 'horario', 'email', 'medicos'];
const FIELD_ORDER_DOCTOR = ['nome', 'crm', 'telefone', 'email', 'especialidade'];

function IncompleteField({ name, def, value, missing, readOnly }) {
  const hasValue = value && String(value).trim() !== '';
  const borderColor = missing ? '#c6861b' : BI_COLOR.line;
  const labelColor  = missing ? BI_COLOR.amberText : BI_COLOR.faint;

  if (def.type === 'select') {
    return (
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        background: '#fff',
        border: `1px solid ${borderColor}`,
        width: '100%', textAlign: 'left', cursor: missing ? 'pointer' : 'default',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: labelColor,
          }}>{def.label}{missing && <span style={{ marginLeft: 4 }}>·  obrigatório</span>}</div>
          <div style={{
            marginTop: 3, fontSize: 13.5,
            color: hasValue ? BI_COLOR.ink : '#a1a8b3',
            fontWeight: hasValue ? 600 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{hasValue ? value : def.placeholder}</div>
        </div>
        {missing && <ChevronRight color={BI_COLOR.faint}/>}
      </button>
    );
  }

  return (
    <div style={{
      padding: '10px 14px', borderRadius: 12,
      background: readOnly ? '#f7f8fb' : '#fff',
      border: `1px solid ${borderColor}`,
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        color: labelColor,
      }}>{def.label}{missing && <span style={{ marginLeft: 4 }}>·  obrigatório</span>}</div>
      {readOnly ? (
        <div style={{
          marginTop: 4, fontSize: 13.5, fontWeight: 600, color: BI_COLOR.ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{hasValue ? value : '—'}</div>
      ) : (
        <input
          type={def.type}
          placeholder={def.placeholder}
          defaultValue={hasValue ? value : ''}
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 13.5, fontWeight: 500,
            color: BI_COLOR.ink,
            background: 'transparent',
            padding: '4px 0 0',
            fontFamily: 'Inter, system-ui',
          }}
        />
      )}
    </div>
  );
}

function IncompleteDetailScreen({ entityId, onBack }) {
  const entry = INCOMPLETE_CLINICS.find(c => c.id === entityId) || INCOMPLETE_CLINICS[0];
  const isDoctor = entry.kind === 'doctor';
  const order   = isDoctor ? FIELD_ORDER_DOCTOR : FIELD_ORDER_CLINIC;
  const missing = entry.missing || [];
  const filled  = entry.filled  || {};

  // Total + filled count for the progress meter
  const total       = order.length;
  const filledCount = order.filter(k => !missing.includes(k)).length;
  const pct         = Math.round((filledCount / total) * 100);

  const heroGradient = isDoctor
    ? 'linear-gradient(165deg, #16a373, #0f8a5f)'
    : 'linear-gradient(165deg, #1e40af, #3b82f6)';
  const heroInitial = entry.title.replace(/^Dr[a]?\.\s*/, '').charAt(0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BI_COLOR.paperBg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 4,
        background: 'rgba(247,248,251,0.94)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderBottom: `1px solid ${BI_COLOR.line}`,
        padding: '10px 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack || (() => {})} aria-label="Voltar" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#fff', border: `1px solid ${BI_COLOR.line}`,
            boxShadow: '0 2px 6px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: BI_COLOR.ink, padding: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Qualidade · {isDoctor ? 'Médico' : 'Clínica'}</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.3, marginTop: 1,
            }}>Corrigir cadastro</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'linear-gradient(165deg, #0a2f7f, #1e40af)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>RM</div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}>
        {/* Hero */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: '#fff',
            border: `1px solid ${BI_COLOR.line}`,
            borderRadius: 16, padding: 16,
            boxShadow: '0 1px 2px rgba(15,23,41,0.03), 0 8px 24px rgba(15,23,41,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: isDoctor ? 24 : 14,
                background: heroGradient, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, letterSpacing: -0.4, flexShrink: 0,
              }}>{heroInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: BI_COLOR.ink, letterSpacing: -0.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{entry.title}</div>
                <div style={{ fontSize: 11.5, color: BI_COLOR.muted, marginTop: 2 }}>{entry.subtitle}</div>
              </div>
              <Tag tone={entry.tagTone}>{entry.tag}</Tag>
            </div>
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid ${BI_COLOR.lineSoft}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums',
              }}>
                <span><strong style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{filledCount}</strong> de <strong style={{ color: BI_COLOR.ink, fontWeight: 700 }}>{total}</strong> campos preenchidos</span>
                <span style={{ fontWeight: 700, color: pct >= 80 ? BI_COLOR.green : BI_COLOR.amberText }}>{pct}%</span>
              </div>
              <div style={{
                marginTop: 8, height: 6, background: BI_COLOR.lineSoft, borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: pct >= 80 ? BI_COLOR.green : '#c6861b',
                  borderRadius: 3,
                }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 2px 8px',
            fontFamily: 'Inter, system-ui',
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.amberText,
            }}>Pendentes</span>
            <span style={{ fontSize: 10.5, color: BI_COLOR.faint, fontVariantNumeric: 'tabular-nums' }}>
              {missing.length} {missing.length === 1 ? 'campo' : 'campos'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missing.map(name => (
              <IncompleteField key={name} name={name} def={FIELD_DEFS[name]} value="" missing/>
            ))}
          </div>
        </div>

        {/* Preenchidos */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 2px 8px',
            fontFamily: 'Inter, system-ui',
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: BI_COLOR.faint,
            }}>Preenchidos</span>
            <span style={{ fontSize: 11, color: BI_COLOR.navy, fontWeight: 600 }}>Editar</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.filter(k => !missing.includes(k)).map(name => (
              <IncompleteField key={name} name={name} def={FIELD_DEFS[name]} value={filled[name]} readOnly/>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 16px 16px',
        background: 'linear-gradient(180deg, rgba(247,248,251,0), rgba(247,248,251,0.97) 30%)',
        pointerEvents: 'none',
      }}>
        <button style={{
          width: '100%', padding: 14, borderRadius: 14, border: 'none',
          background: 'linear-gradient(165deg, #0a2f7f, #1e40af)', color: '#fff',
          fontSize: 14, fontWeight: 700, fontFamily: 'Inter, system-ui',
          boxShadow: '0 12px 28px rgba(10,47,127,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          letterSpacing: -0.1,
          pointerEvents: 'auto',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7l3 3 6-6.5"/>
          </svg>
          Salvar correção
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MainDashboard — the BI screen body, extracted so navigation
// can swap between dashboard ↔ detail.
// ─────────────────────────────────────────────────────────────
function MainDashboard() {
  const [period, setPeriod] = React.useState('semana');
  const d = BI_DATA;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: BI_COLOR.paperBg, fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1, overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 24,
      }}>
        <BIHeader/>

        {/* Period filter + relative timestamp + offline */}
        <div style={{ padding: '14px 16px 10px' }}>
          <PeriodFilter value={period} onChange={setPeriod}/>
          <div style={{ marginTop: 8 }}>
            <LiveStatus minutesAgo={d.updatedMinutesAgo} online={d.online}/>
          </div>
        </div>

        {/* Resumo — Comercial card. Atividade was removed because the
            Meta e atividade card directly below already covers visits,
            goal pace and daily activity. */}
        <div style={{ padding: '4px 16px 12px' }}>
          <BISectionTitle title="Resumo"
            right={<span style={{ fontSize: 11, color: BI_COLOR.muted }}>vs período anterior</span>}/>
          <ResumoGroup
            kicker="Comercial"
            hero={d.snapshot.receita.value}
            sub="Receita acumulada no período"
            deltaText={`+${d.snapshot.receita.deltaPct}% vs período anterior`}
            deltaTone="good"
            onHeroClick={() => {}}
            items={[
              { k: 'pedidos', label: 'Pedidos',
                value: d.snapshot.pedidos.value, delta: `+${d.snapshot.pedidos.delta}`,
                deltaTone: 'good', onClick: () => {} },
              { k: 'ticket', label: 'Ticket médio',
                value: d.snapshot.ticketMedio.value,
                delta: `${d.snapshot.ticketMedio.deltaPct >= 0 ? '+' : ''}${d.snapshot.ticketMedio.deltaPct}%`,
                deltaTone: d.snapshot.ticketMedio.deltaPct >= 0 ? 'good' : 'bad',
                onClick: () => {} },
            ]}
          />
        </div>

        {/* Meta + Atividade — combined card with single CTA */}
        <div style={{ padding: '4px 16px 12px' }}>
          <MetaAtividadeCard goal={d.goal} activity={d.activity} dailyGoal={d.dailyGoal}
            onActivity={() => {}}/>
        </div>

        {/* Atividades recentes — preview com CTA para o histórico completo */}
        <div style={{ padding: '4px 16px 12px' }}>
          <AtividadesPreviewCard onSeeAll={() => {}}/>
        </div>

        {/* Território — also concentra status das clínicas (substituiu o
            mapa de calor). */}
        <div style={{ padding: '4px 16px 12px' }}>
          <BISectionTitle title="Território"
            right={<span style={{ fontSize: 11, color: BI_COLOR.muted, fontVariantNumeric: 'tabular-nums' }}>{d.territory.total} clínicas</span>}/>
          <TerritoryCard territory={d.territory} funnel={d.funnel}
            onCategory={() => {}} onCoverage={() => {}} onStatus={() => {}}/>
        </div>

        {/* Conversion */}
        <div style={{ padding: '4px 16px 12px' }}>
          <ConversionCard data={d.conversion} onOpen={() => {}}/>
        </div>

        {/* Data quality */}
        <div style={{ padding: '4px 16px 24px' }}>
          <DataQualityCard {...d.dataQuality} onFix={() => {}}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BIScreen — purely initialView-driven. The dashboard never swaps to
// a detail screen inside its own frame: each detail screen exists as
// its own DCArtboard in the design canvas. The "back" button on a
// detail screen is a static affordance (no-op here).
// ─────────────────────────────────────────────────────────────
function BIScreen({ initialView = { type: 'main' } }) {
  const noop = () => {};
  const view = initialView;

  if (view.type === 'metric') {
    return <MetricDetailScreen metric={view.metric} onBack={noop}/>;
  }
  if (view.type === 'comercial') {
    return <ComercialDetailScreen initialKpi={view.kpi || 'receita'} initialPeriod={view.period || 'semana'} onBack={noop}/>;
  }
  if (view.type === 'order-quick-view') {
    return <OrderQuickViewScreen orderId={view.orderId} onBack={noop}/>;
  }
  if (view.type === 'atividade') {
    return <AtividadeDetailScreen initialPeriod={view.period || 'semana'} onBack={noop}/>;
  }
  if (view.type === 'atividade-followups') {
    return <AtvKpiListScreen kind="followups" onBack={noop}/>;
  }
  if (view.type === 'atividade-novas') {
    return <AtvKpiListScreen kind="novas" onBack={noop}/>;
  }
  if (view.type === 'territory') {
    return <TerritoryDetailScreen onBack={noop} focus={view.focus}/>;
  }
  if (view.type === 'clinic-status') {
    return <ClinicStatusScreen onBack={noop}/>;
  }
  if (view.type === 'activity') {
    return <ActivityDetailScreen onBack={noop}/>;
  }
  if (view.type === 'conversion') {
    return <ConversionDetailScreen onBack={noop} focus={view.focus}/>;
  }
  if (view.type === 'data-quality') {
    return <DataQualityDetailScreen onBack={noop}/>;
  }
  if (view.type === 'data-quality-detail') {
    return <IncompleteDetailScreen entityId={view.entityId} onBack={noop}/>;
  }

  return <MainDashboard/>;
}

Object.assign(window, { BIScreen });
