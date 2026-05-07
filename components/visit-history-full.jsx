// ─────────────────────────────────────────────────────────────
// VisitHistoryFullScreen — full-screen visit history viewer
// Opens from clinic / doctor detail "Ver histórico completo"
// ─────────────────────────────────────────────────────────────

const VH_OUTCOME_META = {
  positivo: { color: '#16a373', label: 'Positivo', bg: 'rgba(22,163,115,0.12)' },
  neutro:   { color: '#8a94a6', label: 'Neutro',   bg: 'rgba(138,148,166,0.14)' },
  misto:    { color: '#c6861b', label: 'Misto',    bg: 'rgba(198,134,27,0.14)' },
  negativo: { color: '#b84545', label: 'Negativo', bg: 'rgba(184,69,69,0.12)' },
};

// Realistic 18-visit mock dataset spanning ~6 months
const ALL_VISITS_MOCK = [
  {
    id: 'v-1',
    date: '17/abr · qui',
    time: '14h30',
    duration: '42 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Demonstração do novo AtlasGel 240g. Dra. Mariana mostrou bom interesse para casos pós-operatórios e pediu material institucional para os colegas. Combinamos retorno em 15 dias para fechar primeiro pedido.',
    outcome: 'positivo',
    orderValue: null,
    samples: ['AtlasGel 240g · 5un'],
  },
  {
    id: 'v-2',
    date: '03/abr · qui',
    time: '10h00',
    duration: '1h 12min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Pedido fechado',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Reunião com Dr. André para repor estoque mensal. Fechado pedido completo de AtlasGel 120g e CardioFlex. Cliente bem satisfeito com a entrega anterior.',
    outcome: 'positivo',
    orderValue: 'R$ 4.120',
    samples: null,
  },
  {
    id: 'v-3',
    date: '21/mar · sex',
    time: '15h45',
    duration: '38 min',
    consultant: 'Beatriz Costa',
    consultantHue: 320,
    consultantInitials: 'BC',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Apresentação do estudo clínico publicado em fev/26 sobre AtlasGel em ortopedia. Dra. solicitou cópia do paper completo e referências bibliográficas. Recepção da Mariana muito positiva.',
    outcome: 'positivo',
    orderValue: null,
    samples: ['AtlasGel 60g · 8un', 'AtlasVit · 6un'],
  },
  {
    id: 'v-4',
    date: '12/mar · qua',
    time: '08h50',
    duration: '22 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Visita de cortesia',
    withWhom: 'Recepção',
    location: 'Clínica Santa Mônica',
    note: 'Passei rapidamente para deixar amostras solicitadas pela Dra. Mariana e ajustar os dados de cobrança no cadastro. Não consegui falar com nenhum médico — agenda cheia.',
    outcome: 'neutro',
    orderValue: null,
    samples: ['AtlasGel 240g · 3un'],
  },
  {
    id: 'v-5',
    date: '28/fev · sex',
    time: '11h20',
    duration: '55 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Pedido fechado',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Reposição mensal. Dr. André comentou que está testando substituir CardioFlex por concorrente mais barato — alerta para próxima visita. Pedido fechado mas com volume reduzido em CardioFlex.',
    outcome: 'misto',
    orderValue: 'R$ 2.850',
    samples: null,
  },
  {
    id: 'v-6',
    date: '14/fev · sex',
    time: '16h10',
    duration: '40 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Conversa sobre lançamento do AtlasVit. Dra. Mariana indicou para uso em pacientes idosos com baixa adesão a suplementos orais. Vai começar a recomendar nos próximos retornos.',
    outcome: 'positivo',
    orderValue: null,
    samples: ['AtlasVit · 12un'],
  },
  {
    id: 'v-7',
    date: '05/fev · qua',
    time: '13h00',
    duration: '28 min',
    consultant: 'Beatriz Costa',
    consultantHue: 320,
    consultantInitials: 'BC',
    kind: 'Treinamento',
    withWhom: 'Equipe da clínica',
    location: 'Clínica Santa Mônica',
    note: 'Treinamento rápido com a equipe de atendimento sobre a nova bula do AtlasGel 240g e canais de suporte ao paciente. Bem recebido, sem dúvidas pendentes.',
    outcome: 'neutro',
    orderValue: null,
    samples: null,
  },
  {
    id: 'v-8',
    date: '23/jan · qui',
    time: '09h30',
    duration: '1h 05min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Pedido fechado',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Reunião longa com Dr. André para revisar todo o portfólio. Fechado pedido grande de AtlasGel em três apresentações + CardioFlex. Conversa também sobre eventos científicos de 2026.',
    outcome: 'positivo',
    orderValue: 'R$ 6.480',
    samples: null,
  },
  {
    id: 'v-9',
    date: '15/jan · qua',
    time: '10h45',
    duration: '18 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Visita de cortesia',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Passagem rápida para confirmar a participação da Dra. no simpósio de fevereiro. Confirmou presença, pediu para levar acompanhante (Dr. Bento).',
    outcome: 'positivo',
    orderValue: null,
    samples: null,
  },
  {
    id: 'v-10',
    date: '08/jan · qua',
    time: '14h20',
    duration: '32 min',
    consultant: 'Bruno Araújo',
    consultantHue: 28,
    consultantInitials: 'BA',
    kind: 'Reunião agendada',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Cobertura de feriado — Bruno passou para fechar pedido emergencial de AtlasGel. Cliente reclamou da demora na entrega anterior; abrimos chamado com a logística.',
    outcome: 'misto',
    orderValue: 'R$ 1.420',
    samples: null,
  },
  {
    id: 'v-11',
    date: '19/dez · qui',
    time: '15h00',
    duration: '45 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Reunião de fim de ano. Apresentação do roadmap 2026 e novidades do AtlasVit. Dra. animada com o novo formato em sachê. Pediu para receber primeiro lote em janeiro.',
    outcome: 'positivo',
    orderValue: null,
    samples: ['AtlasVit · 4un'],
  },
  {
    id: 'v-12',
    date: '11/dez · qua',
    time: '08h40',
    duration: '50 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Pedido fechado',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Pedido de reposição mensal. Dr. André pediu desconto progressivo para pedidos acima de R$ 5k — encaminhei para o comercial avaliar política de descontos por volume.',
    outcome: 'positivo',
    orderValue: 'R$ 5.140',
    samples: null,
  },
  {
    id: 'v-13',
    date: '02/dez · seg',
    time: '11h00',
    duration: '15 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Visita de cortesia',
    withWhom: 'Recepção',
    location: 'Clínica Santa Mônica',
    note: 'Sem médico disponível. Deixei material da campanha de fim de ano e marquei retorno para 19/dez com a Dra. Mariana.',
    outcome: 'neutro',
    orderValue: null,
    samples: null,
  },
  {
    id: 'v-14',
    date: '21/nov · qui',
    time: '16h30',
    duration: '38 min',
    consultant: 'Beatriz Costa',
    consultantHue: 320,
    consultantInitials: 'BC',
    kind: 'Reunião agendada',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Apresentação técnica do CardioFlex com dados comparativos. Dr. André levantou questões sobre eventos adversos descritos na bula nova — encaminhei dúvidas ao médico responsável da matriz.',
    outcome: 'misto',
    orderValue: null,
    samples: ['CardioFlex · 3un'],
  },
  {
    id: 'v-15',
    date: '12/nov · seg',
    time: '09h15',
    duration: '25 min',
    consultant: 'Bruno Araújo',
    consultantHue: 28,
    consultantInitials: 'BA',
    kind: 'Prospecção',
    withWhom: 'Recepção',
    location: 'Clínica Santa Mônica',
    note: 'Primeira visita após reorganização da equipe. Deixei cartão e material institucional. Recepção indicou Dra. Mariana como ponto de contato principal para visitas futuras.',
    outcome: 'neutro',
    orderValue: null,
    samples: null,
  },
  {
    id: 'v-16',
    date: '04/nov · seg',
    time: '14h00',
    duration: '52 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Reunião agendada',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Reunião exploratória sobre a entrada do AtlasVit no portfólio. Dra. Mariana já recebeu sample de concorrente — vamos preparar comparativo clínico para próxima visita.',
    outcome: 'positivo',
    orderValue: null,
    samples: ['AtlasVit · 6un'],
  },
  {
    id: 'v-17',
    date: '24/out · qui',
    time: '10h30',
    duration: '20 min',
    consultant: 'Rafael Melo',
    consultantHue: 220,
    consultantInitials: 'RM',
    kind: 'Visita de cortesia',
    withWhom: 'Dra. Mariana Silva',
    location: 'Clínica Santa Mônica',
    note: 'Almoço informal pós-congresso de ortopedia. Dra. Mariana retornou de Madri animada com novos protocolos — abriu espaço para apresentação detalhada em novembro.',
    outcome: 'positivo',
    orderValue: null,
    samples: null,
  },
  {
    id: 'v-18',
    date: '15/out · ter',
    time: '13h45',
    duration: '30 min',
    consultant: 'Bruno Araújo',
    consultantHue: 28,
    consultantInitials: 'BA',
    kind: 'Resolução de problema',
    withWhom: 'Dr. André Bento',
    location: 'Clínica Santa Mônica',
    note: 'Cliente reportou divergência na nota fiscal do pedido anterior. Resolvido na hora — emissão corrigida no mesmo dia. Dr. André agradeceu agilidade.',
    outcome: 'negativo',
    orderValue: null,
    samples: null,
  },
];

function VisitHistoryFullScreen({
  entityType = 'clinic',
  entityName = 'Clínica Santa Mônica',
  visits = ALL_VISITS_MOCK,
  onBack = () => {},
}) {
  const [filter, setFilter] = React.useState('todas');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [exporting, setExporting] = React.useState(false);
  const [exportToast, setExportToast] = React.useState(null);

  const outcomeFiltered = visits.filter(v => {
    if (filter === 'todas') return true;
    if (filter === 'positivas') return v.outcome === 'positivo';
    if (filter === 'mistas')    return v.outcome === 'misto';
    if (filter === 'negativas') return v.outcome === 'negativo';
    return true;
  });

  const filtered = outcomeFiltered.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.note || '').toLowerCase().includes(q) ||
      (v.consultant || '').toLowerCase().includes(q) ||
      (v.withWhom || '').toLowerCase().includes(q) ||
      (v.kind || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    todas:     visits.length,
    positivas: visits.filter(v => v.outcome === 'positivo').length,
    mistas:    visits.filter(v => v.outcome === 'misto').length,
    negativas: visits.filter(v => v.outcome === 'negativo').length,
  };

  const totalVisits = filtered.length;
  const ordersWithValue = filtered.filter(v => v.orderValue);
  const totalOrders = ordersWithValue.length;
  const totalValue = ordersWithValue.reduce((sum, v) => {
    const raw = v.orderValue.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.');
    const n = parseFloat(raw);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const avgDuration = totalVisits === 0 ? 0 : Math.round(
    filtered.reduce((sum, v) => {
      const hMatch = (v.duration || '').match(/(\d+)\s*h/);
      const mMatch = (v.duration || '').match(/(\d+)\s*min/);
      const h = hMatch ? parseInt(hMatch[1], 10) : 0;
      const m = mMatch ? parseInt(mMatch[1], 10) : 0;
      return sum + h * 60 + m;
    }, 0) / totalVisits
  );

  const handleExport = () => {
    setExporting(true);
    setExportToast({ kind: 'progress', message: 'Exportando histórico...' });
    setTimeout(() => {
      setExporting(false);
      setExportToast({ kind: 'success', message: 'Histórico exportado ✓' });
      setTimeout(() => setExportToast(null), 1800);
    }, 1500);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'vhSlideInRight 300ms cubic-bezier(.2,.8,.2,1)',
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
            Histórico de visitas
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: '#0f1729',
            marginTop: 1, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {entityName}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          aria-label="Exportar histórico"
          style={{
            width: 36, height: 36, borderRadius: 11,
            border: '1px solid #eef0f3',
            background: exporting ? '#f3f4f6' : '#fff',
            cursor: exporting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: exporting ? '#9ca3af' : '#0a2f7f',
          }}>
          {exporting ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ animation: 'vhSpin 0.9s linear infinite' }}>
              <path d="M8 2a6 6 0 016 6" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" opacity="0.18"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5v7.5"/>
              <path d="M5 7l3 3 3-3"/>
              <path d="M3 13.2h10"/>
            </svg>
          )}
        </button>
      </div>

      {/* Summary stats */}
      <div style={{
        padding: '14px 16px 12px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
        flexShrink: 0,
      }}>
        <VHStat
          value={String(totalVisits)}
          color="#0a2f7f"
          label="visitas"
        />
        <VHStat
          value={totalOrders > 0 ? `R$ ${(totalValue / 1000).toFixed(1)}k` : '—'}
          color="#16a373"
          label={`${totalOrders} ${totalOrders === 1 ? 'pedido' : 'pedidos'}`}
        />
        <VHStat
          value={avgDuration > 0 ? `${avgDuration} min` : '—'}
          color="#0f1729"
          label="duração média"
        />
      </div>

      {/* Search */}
      <div style={{
        padding: '12px 16px 8px',
        background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#f7f8fb',
          border: '1px solid #eef0f3',
          borderRadius: 12, padding: '9px 12px',
        }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="#8a94a6" strokeWidth="1.7">
            <circle cx="6.5" cy="6.5" r="5"/>
            <path d="M11 11l2.5 2.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar na anotação, consultor…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 13.5, fontFamily: 'Inter, system-ui',
              color: '#0f1729',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Limpar busca" style={{
              width: 18, height: 18, borderRadius: 9,
              background: '#e5e7eb', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, flexShrink: 0,
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{
        padding: '10px 16px 12px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', gap: 6,
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {[
          { key: 'todas',     label: 'Todas' },
          { key: 'positivas', label: 'Positivas' },
          { key: 'mistas',    label: 'Mistas' },
          { key: 'negativas', label: 'Negativas' },
        ].map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 11px',
                borderRadius: 999,
                border: `1px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
                background: active ? '#0a2f7f' : '#fff',
                color: active ? '#fff' : '#374151',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 6,
                background: active ? 'rgba(255,255,255,0.22)' : '#f3f4f6',
                color: active ? '#fff' : '#6b7280',
                lineHeight: 1.2,
              }}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visit list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px 28px',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: 60,
            color: '#9ca3af',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="6" width="20" height="16" rx="2"/>
                <path d="M4 11h20M10 3v6M18 3v6"/>
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginBottom: 4 }}>
              Nenhuma visita encontrada
            </div>
            <div style={{ fontSize: 12.5, color: '#6b7280' }}>
              Ajuste os filtros ou a busca
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            border: '1px solid #eef0f3',
            borderRadius: 14,
            padding: 16,
          }}>
            {filtered.map((visit, i) => (
              <VisitHistoryRow
                key={visit.id}
                visit={visit}
                isLast={i === filtered.length - 1}
                showLocation={entityType === 'doctor'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {exportToast && (
        <div style={{
          position: 'absolute',
          left: '50%', bottom: 28,
          transform: 'translateX(-50%)',
          zIndex: 110,
          background: exportToast.kind === 'success' ? '#117a55' : '#0f1729',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 12px 28px rgba(15,23,41,0.28)',
          fontFamily: 'Inter, system-ui',
          animation: 'vhToastIn 220ms ease',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap',
        }}>
          {exportToast.kind === 'progress' && (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                 style={{ animation: 'vhSpin 0.9s linear infinite' }}>
              <path d="M8 2a6 6 0 016 6" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" opacity="0.25"/>
            </svg>
          )}
          {exportToast.message}
        </div>
      )}

      <style>{`
        @keyframes vhSlideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes vhSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes vhToastIn {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

function VHStat({ value, label, color }) {
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

function VisitHistoryRow({ visit, isLast, showLocation = false }) {
  const meta = VH_OUTCOME_META[visit.outcome] || VH_OUTCOME_META.neutro;

  return (
    <div style={{
      display: 'flex', gap: 12,
      paddingBottom: isLast ? 0 : 18,
      position: 'relative',
    }}>
      {/* Timeline rail */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 14, flexShrink: 0,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: 5,
          background: meta.color,
          marginTop: 5,
          boxShadow: `0 0 0 3px ${meta.color}22`,
          flexShrink: 0,
        }}/>
        {!isLast && (
          <div style={{
            flex: 1, width: 2, background: '#eef0f3',
            marginTop: 4, minHeight: 22,
          }}/>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8, marginBottom: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f1729', whiteSpace: 'nowrap' }}>
              {visit.date}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
              {visit.time} · {visit.duration}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 9,
              background: `hsl(${visit.consultantHue}, 48%, 86%)`,
              color: `hsl(${visit.consultantHue}, 55%, 28%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>
              {visit.consultantInitials}
            </div>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
              {visit.consultant.split(' ')[0]}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: meta.bg, color: meta.color,
            fontSize: 10.5, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {visit.kind}
          </span>

          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: '#f3f4f6', color: '#4b5563',
            fontSize: 10.5, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            com {visit.withWhom}
          </span>

          {showLocation && visit.location && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(30,64,175,0.08)', color: '#1e40af',
              fontSize: 10.5, fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              📍 {visit.location}
            </span>
          )}

          {visit.orderValue && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(22,163,115,0.12)', color: '#117a55',
              fontSize: 10.5, fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>
              pedido · {visit.orderValue}
            </span>
          )}

          {visit.samples && visit.samples.map((s, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(30,64,175,0.08)', color: '#1e40af',
              fontSize: 10.5, fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              amostra · {s}
            </span>
          ))}
        </div>

        <div style={{
          fontSize: 12.5, color: '#374151',
          lineHeight: 1.55,
        }}>
          {visit.note}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  VisitHistoryFullScreen,
  VisitHistoryRow,
  ALL_VISITS_MOCK,
  VH_OUTCOME_META,
});
