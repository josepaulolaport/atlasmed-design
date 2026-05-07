// ─────────────────────────────────────────────────────────────
// HelpCenterScreen — Central de Ajuda. Browse categories, FAQs,
// and video tutorials. Opens from the Profile screen.
// ─────────────────────────────────────────────────────────────

const HELP_CATEGORIES = [
  { id: 'getting-started', icon: '📱', title: 'Primeiros Passos',  description: 'Como começar a usar o app',          articles: 12 },
  { id: 'visits',          icon: '🏥', title: 'Visitas',           description: 'Gerenciar visitas e agendamentos',  articles: 8  },
  { id: 'orders',          icon: '📦', title: 'Pedidos',           description: 'Fazer e acompanhar pedidos',        articles: 10 },
  { id: 'reports',         icon: '📊', title: 'Relatórios',        description: 'Entender seus indicadores',          articles: 6  },
  { id: 'profile',         icon: '👤', title: 'Conta & Perfil',    description: 'Configurações da sua conta',         articles: 5  },
  { id: 'troubleshoot',    icon: '🛠',  title: 'Problemas Técnicos',description: 'Resolva problemas comuns',           articles: 7  },
];

const FAQ_ITEMS = [
  { id: 'faq-1',  category: 'visits',          question: 'Como adicionar uma nova clínica?',          answer: 'Para adicionar uma nova clínica, vá até a aba "Explorar", toque no botão "+" no canto inferior direito e preencha os dados solicitados. A clínica será adicionada à sua carteira após aprovação do gestor.' },
  { id: 'faq-2',  category: 'visits',          question: 'Como registrar uma visita realizada?',     answer: 'Na tela da clínica ou médico, toque em "Registrar Visita", preencha os detalhes (data, horário, resultado) e salve. A visita aparecerá no histórico e nos seus indicadores em tempo real.' },
  { id: 'faq-3',  category: 'orders',          question: 'Como fazer um pedido?',                    answer: 'Na aba "Pedidos", toque em "Novo Pedido", selecione os produtos desejados, defina a quantidade e a clínica destinatária e confirme. O pedido será enviado para processamento imediato.' },
  { id: 'faq-4',  category: 'reports',         question: 'Como ver meus indicadores de performance?',answer: 'Acesse a aba "Desempenho" no menu principal. Lá você verá vendas, visitas realizadas, taxa de conversão, cobertura e outros indicadores importantes do seu território.' },
  { id: 'faq-5',  category: 'visits',          question: 'Como editar informações de uma clínica?',  answer: 'Na tela de detalhes da clínica, toque no ícone de lápis ao lado do campo que deseja alterar. As mudanças passam por aprovação do gestor antes de serem aplicadas no cadastro.' },
  { id: 'faq-6',  category: 'orders',          question: 'Posso cancelar um pedido após enviado?',   answer: 'Sim, desde que o pedido não tenha saído para entrega. Acesse o pedido na aba "Pedidos" e toque em "Cancelar pedido". Pedidos em trânsito não podem ser cancelados pelo aplicativo.' },
  { id: 'faq-7',  category: 'profile',         question: 'Como alterar minha foto de perfil?',       answer: 'Vá até "Perfil" e toque na sua foto atual. Escolha entre tirar uma nova foto pela câmera ou selecionar uma da galeria. A foto é atualizada imediatamente.' },
  { id: 'faq-8',  category: 'troubleshoot',    question: 'O app está lento, o que fazer?',           answer: 'Tente: 1) Fechar e reabrir o app; 2) Verificar sua conexão de internet; 3) Atualizar o app na loja; 4) Limpar o cache nas configurações do dispositivo. Se persistir, fale com o suporte.' },
  { id: 'faq-9',  category: 'getting-started', question: 'Como funciona o mapa de território?',      answer: 'O mapa mostra todas as clínicas e médicos da sua carteira em tempo real. Pins verdes indicam visitas recentes, vermelhos prioridades e azuis pendentes. Toque em qualquer pin para detalhes.' },
  { id: 'faq-10', category: 'reports',         question: 'O que significa "Cobertura de Território"?',answer: 'É o percentual de clínicas únicas da sua carteira que receberam ao menos uma visita no período. Quanto maior, melhor a sua presença territorial.' },
];

const VIDEO_TUTORIALS = [
  { id: 'v-1', title: 'Tour pelo aplicativo',           duration: '3:24', tone: '#0a2f7f', icon: '🎬' },
  { id: 'v-2', title: 'Como fazer um pedido',           duration: '2:15', tone: '#16a373', icon: '📦' },
  { id: 'v-3', title: 'Registrando visitas com sucesso',duration: '3:45', tone: '#f59e0b', icon: '🏥' },
  { id: 'v-4', title: 'Lendo seus indicadores',         duration: '4:08', tone: '#8b5cf6', icon: '📊' },
];

function HelpCenterScreen({ onBack = () => {}, onOpenSupport = () => {} }) {
  const [searchQuery, setSearch] = React.useState('');
  const [expandedFaq, setExpandedFaq] = React.useState(null);

  const filteredFaqs = React.useMemo(() => {
    if (!searchQuery) return FAQ_ITEMS;
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(f =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
        <button onClick={onBack} aria-label="Voltar" style={_hcIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Suporte
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2 }}>
            Central de Ajuda
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero search */}
        <div style={{
          padding: '24px 16px 20px',
          background: 'linear-gradient(135deg, #0a2f7f 0%, #1d4ed8 100%)',
          color: '#fff',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginBottom: 6 }}>
            Como podemos ajudar?
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', marginBottom: 16 }}>
            Encontre respostas rápidas ou fale com o suporte.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: '#fff', borderRadius: 12,
            padding: '11px 14px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#8a94a6" strokeWidth="1.7">
              <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar na ajuda…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14, color: '#0f1729',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} aria-label="Limpar" style={{
                width: 18, height: 18, borderRadius: 9, background: '#e5e7eb',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              Categorias
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
            }}>
              {HELP_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    padding: 14,
                    background: '#fff',
                    border: '1px solid #eef0f3',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'transform 120ms, box-shadow 120ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,41,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: '#f7f8fb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 10,
                  }}>{cat.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1, marginBottom: 2 }}>
                    {cat.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 1.4 }}>
                    {cat.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#8a94a6', fontWeight: 500 }}>
                    {cat.articles} artigos
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            {searchQuery ? `${filteredFaqs.length} resultados` : 'Perguntas frequentes'}
          </div>
          {filteredFaqs.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
              background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
              color: '#9ca3af',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', marginBottom: 4 }}>
                Nenhum resultado encontrado
              </div>
              <div style={{ fontSize: 12 }}>Tente outras palavras ou fale com o suporte.</div>
            </div>
          ) : (
            <div style={{
              background: '#fff', border: '1px solid #eef0f3',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {filteredFaqs.map((faq, idx) => {
                const open = expandedFaq === faq.id;
                return (
                  <div key={faq.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f3f4f6' }}>
                    <button
                      onClick={() => setExpandedFaq(open ? null : faq.id)}
                      style={{
                        width: '100%', padding: '14px 14px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0f1729', lineHeight: 1.4 }}>
                        {faq.question}
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: 11,
                        background: open ? '#eef2ff' : '#f7f8fb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 180ms',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={open ? '#0a2f7f' : '#6b7280'} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 180ms' }}>
                          <path d="M2 3.5l3 3 3-3"/>
                        </svg>
                      </div>
                    </button>
                    {open && (
                      <div style={{
                        padding: '0 14px 14px',
                        fontSize: 13, color: '#374151',
                        lineHeight: 1.65,
                        animation: 'hcFade 200ms ease-out',
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Videos */}
        {!searchQuery && (
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              Tutoriais em vídeo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VIDEO_TUTORIALS.map(v => (
                <div key={v.id} style={{
                  padding: 12,
                  background: '#fff', border: '1px solid #eef0f3',
                  borderRadius: 14,
                  display: 'flex', gap: 12, alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 88, height: 56, borderRadius: 10,
                    background: `linear-gradient(135deg, ${v.tone} 0%, ${v.tone}cc 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 15,
                      background: 'rgba(255,255,255,0.92)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill={v.tone} stroke="none">
                        <path d="M2 1.5L9.5 5.5 2 9.5z"/>
                      </svg>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 4, right: 4,
                      padding: '1px 5px', borderRadius: 4,
                      background: 'rgba(15,23,41,0.85)',
                      color: '#fff', fontSize: 10, fontWeight: 600,
                    }}>{v.duration}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, marginBottom: 3 }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                      Assistir vídeo
                    </div>
                  </div>
                  <div style={{ color: '#cbd0d8', fontSize: 18, fontWeight: 300 }}>›</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div style={{ padding: '16px 16px 24px' }}>
          <div style={{
            padding: 14,
            background: '#fff',
            border: '1px solid #eef0f3', borderRadius: 14,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', marginBottom: 4 }}>
              Não encontrou o que procurava?
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
              Entre em contato com a equipe AtlasMed.
            </div>
            <a href="tel:+551112345678" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px',
              border: '1px solid #eef0f3', borderRadius: 11,
              textDecoration: 'none', color: '#0f1729',
              marginBottom: 8,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#eef2ff', color: '#0a2f7f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 11.5V13a1.5 1.5 0 0 1-1.6 1.5c-2.2-.2-4.3-1-6.1-2.3a13 13 0 0 1-4-4A13 13 0 0 1 0 2.1 1.5 1.5 0 0 1 1.5.6h2L4.8 4 3.5 5.3a9 9 0 0 0 4 4l1.3-1.3 3.4 1.3z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#8a94a6', fontWeight: 600 }}>Telefone · Seg–Sex 8h–18h</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>(11) 1234-5678</div>
              </div>
            </a>
            <a href="mailto:suporte@atlasmed.com.br" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px',
              border: '1px solid #eef0f3', borderRadius: 11,
              textDecoration: 'none', color: '#0f1729',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#e7f6ef', color: '#0f7c5a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1.5" y="3" width="13" height="10" rx="1.5"/>
                  <path d="M1.5 4.5L8 9l6.5-4.5"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#8a94a6', fontWeight: 600 }}>E-mail · resposta em até 24h</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>suporte@atlasmed.com.br</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hcFade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

const _hcIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

Object.assign(window, { HelpCenterScreen, HELP_CATEGORIES, FAQ_ITEMS, VIDEO_TUTORIALS });
