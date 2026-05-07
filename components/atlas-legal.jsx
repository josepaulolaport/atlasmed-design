// ─────────────────────────────────────────────────────────────
// LegalDocumentScreen — viewer for Termos de Uso and Política
// de Privacidade. Opens from the Profile screen. Includes a
// table of contents, in-document search and a simulated
// download button.
// ─────────────────────────────────────────────────────────────

const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Termos de Uso',
    subtitle: 'AtlasMed Salesman App',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Introdução',
        content: 'Bem-vindo ao AtlasMed. Ao usar nosso aplicativo, você concorda com estes termos de uso. Leia atentamente este documento antes de prosseguir.\n\nEstes termos constituem um acordo legal entre você (o "Usuário") e a AtlasMed Ltda. (a "Empresa"). O uso continuado do aplicativo implica na aceitação destes termos.',
      },
      {
        id: 'account',
        title: '2. Conta de Usuário',
        content: 'Para usar o AtlasMed, você deve criar uma conta fornecendo informações verdadeiras e completas. Você é responsável por:\n\n• Manter a confidencialidade de suas credenciais de acesso\n• Todas as atividades realizadas através de sua conta\n• Notificar imediatamente a Empresa sobre qualquer uso não autorizado\n\nA Empresa reserva-se o direito de suspender ou encerrar contas que violem estes termos.',
      },
      {
        id: 'usage',
        title: '3. Uso Permitido',
        content: 'O aplicativo destina-se exclusivamente ao uso profissional por representantes comerciais autorizados pela Empresa. É proibido:\n\n• Usar o aplicativo para fins não relacionados às atividades comerciais autorizadas\n• Compartilhar informações confidenciais de clientes com terceiros não autorizados\n• Realizar engenharia reversa ou tentativas de acesso não autorizado ao sistema\n• Usar o aplicativo de maneira que possa prejudicar sua funcionalidade ou outros usuários',
      },
      {
        id: 'data',
        title: '4. Dados e Privacidade',
        content: 'Ao usar o AtlasMed, você concorda com a coleta e processamento de dados conforme descrito em nossa Política de Privacidade. Os dados coletados incluem:\n\n• Informações de perfil do usuário\n• Dados de localização durante visitas\n• Histórico de interações com clientes\n• Indicadores de performance\n\nTodos os dados são tratados com confidencialidade e segurança apropriadas.',
      },
      {
        id: 'liability',
        title: '5. Limitação de Responsabilidade',
        content: 'A Empresa não se responsabiliza por:\n\n• Interrupções temporárias no serviço por motivos técnicos\n• Perda de dados resultante de ações do usuário\n• Decisões comerciais tomadas com base nas informações do aplicativo\n• Problemas de conectividade de terceiros\n\nO aplicativo é fornecido "como está", sem garantias expressas ou implícitas.',
      },
      {
        id: 'changes',
        title: '6. Alterações aos Termos',
        content: 'A Empresa reserva-se o direito de modificar estes termos a qualquer momento. Usuários serão notificados sobre mudanças significativas através do aplicativo. O uso continuado após as alterações constitui aceitação dos novos termos.',
      },
      {
        id: 'termination',
        title: '7. Encerramento',
        content: 'Você pode encerrar sua conta a qualquer momento através das configurações do aplicativo. A Empresa pode suspender ou encerrar o acesso de usuários que violem estes termos, sem aviso prévio.\n\nApós o encerramento, você perderá acesso aos dados armazenados no aplicativo.',
      },
      {
        id: 'contact',
        title: '8. Contato',
        content: 'Para dúvidas sobre estes termos, entre em contato:\n\nAtlasMed Ltda.\nE-mail: legal@atlasmed.com.br\nTelefone: (11) 1234-5678\nEndereço: Av. Paulista, 1000 — São Paulo, SP, CEP 01310-100',
      },
    ],
  },
  privacy: {
    title: 'Política de Privacidade',
    subtitle: 'Como tratamos seus dados',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Informações que Coletamos',
        content: 'A AtlasMed coleta diferentes tipos de informações para fornecer e melhorar nossos serviços:\n\nInformações Fornecidas por Você:\n• Nome completo, e-mail, telefone\n• Dados profissionais (empresa, cargo, território)\n• Informações de clientes (clínicas, médicos)\n• Dados de visitas e interações comerciais\n\nInformações Coletadas Automaticamente:\n• Localização GPS durante visitas\n• Dados de uso do aplicativo\n• Informações do dispositivo (modelo, sistema operacional)\n• Logs de acesso e atividades',
      },
      {
        id: 'usage',
        title: '2. Como Usamos suas Informações',
        content: 'Utilizamos suas informações para:\n\n• Fornecer funcionalidades do aplicativo\n• Gerar relatórios e indicadores de performance\n• Melhorar a experiência do usuário\n• Enviar notificações relevantes\n• Cumprir obrigações legais e contratuais\n• Prevenir fraudes e garantir segurança\n\nNunca vendemos suas informações pessoais a terceiros.',
      },
      {
        id: 'sharing',
        title: '3. Compartilhamento de Informações',
        content: 'Podemos compartilhar suas informações com:\n\n• Sua empresa empregadora (para gestão de equipe)\n• Provedores de serviços terceirizados (hospedagem, analytics)\n• Autoridades legais quando exigido por lei\n\nTodos os terceiros estão obrigados a proteger suas informações conforme esta política.',
      },
      {
        id: 'security',
        title: '4. Segurança',
        content: 'Implementamos medidas de segurança para proteger suas informações:\n\n• Criptografia de dados em trânsito e repouso\n• Controles de acesso baseados em função\n• Monitoramento contínuo de segurança\n• Backups regulares\n• Auditorias de segurança periódicas\n\nApesar de nossos esforços, nenhum sistema é 100% seguro. Você deve proteger suas credenciais de acesso.',
      },
      {
        id: 'rights',
        title: '5. Seus Direitos',
        content: 'De acordo com a LGPD, você tem direito a:\n\n• Confirmar a existência de tratamento de dados\n• Acessar seus dados pessoais\n• Corrigir dados incompletos ou incorretos\n• Solicitar anonimização ou exclusão\n• Revogar consentimento\n• Portabilidade de dados\n\nPara exercer estes direitos, entre em contato através de privacy@atlasmed.com.br.',
      },
      {
        id: 'retention',
        title: '6. Retenção de Dados',
        content: 'Mantemos suas informações pelo tempo necessário para:\n\n• Fornecer os serviços contratados\n• Cumprir obrigações legais\n• Resolver disputas\n\nApós o encerramento da conta, dados pessoais são excluídos em até 90 dias, exceto quando a retenção for exigida por lei.',
      },
      {
        id: 'children',
        title: '7. Menores de Idade',
        content: 'O AtlasMed não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se tomarmos conhecimento de coleta inadvertida, excluiremos os dados imediatamente.',
      },
      {
        id: 'changes',
        title: '8. Alterações a Esta Política',
        content: 'Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do aplicativo ou e-mail. A data de última atualização está sempre indicada no topo do documento.',
      },
      {
        id: 'contact',
        title: '9. Contato',
        content: 'Para questões sobre privacidade:\n\nEncarregado de Dados: João Silva\nE-mail: privacy@atlasmed.com.br\nTelefone: (11) 1234-5678\nEndereço: Av. Paulista, 1000 — São Paulo, SP, CEP 01310-100',
      },
    ],
  },
};

function LegalDocumentScreen({ type = 'terms', onBack = () => {}, initialTOCOpen = false }) {
  const doc = LEGAL_DOCUMENTS[type] || LEGAL_DOCUMENTS.terms;
  const [searchQuery, setSearch] = React.useState('');
  const [tocOpen, setTOCOpen] = React.useState(initialTOCOpen);
  const [downloadingState, setDownloadingState] = React.useState('idle');

  const filteredSections = React.useMemo(() => {
    if (!searchQuery) return doc.sections;
    const q = searchQuery.toLowerCase();
    return doc.sections.filter(s =>
      s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [searchQuery, doc.sections]);

  const updated = new Date(doc.lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDownload = () => {
    setDownloadingState('downloading');
    setTimeout(() => setDownloadingState('done'), 1100);
    setTimeout(() => setDownloadingState('idle'), 2400);
  };

  const renderHighlighted = (text) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} style={{ background: '#fff3a8', color: '#0f1729', padding: '0 2px', borderRadius: 3 }}>{p}</mark>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      )
    );
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#fff',
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
        <button onClick={onBack} aria-label="Voltar" style={_lgIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#8a94a6', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Documento legal
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f1729', marginTop: 1, letterSpacing: -0.2 }}>
            {doc.title}
          </div>
        </div>
        <button
          onClick={handleDownload}
          aria-label="Baixar"
          style={{
            ..._lgIconBtn,
            background: downloadingState === 'done' ? '#16a373' : '#fff',
            color: downloadingState === 'done' ? '#fff' : '#0a2f7f',
          }}
        >
          {downloadingState === 'downloading' ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="6" strokeDasharray="20 14" style={{ animation: 'lgSpin 0.8s linear infinite', transformOrigin: 'center' }}/>
            </svg>
          ) : downloadingState === 'done' ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l3.5 3.5L13 5"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5v7.5"/><path d="M5 7l3 3 3-3"/><path d="M3 13.2h10"/>
            </svg>
          )}
        </button>
      </div>

      {/* Sub-header */}
      <div style={{
        padding: '14px 16px', background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f1729', letterSpacing: -0.4, marginBottom: 4 }}>
          {doc.title}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
          {doc.subtitle}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: '#f7f8fb', border: '1px solid #eef0f3',
          fontSize: 11, color: '#6b7280', fontWeight: 500,
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1"/>
          </svg>
          Atualizado em {updated}
        </div>
      </div>

      {/* Search */}
      <div style={{
        padding: '10px 16px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#f7f8fb', border: '1px solid #eef0f3',
          borderRadius: 12, padding: '8px 12px',
        }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="#8a94a6" strokeWidth="1.7">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no documento…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: '#0f1729',
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 36px' }}>
        {/* TOC */}
        {!searchQuery && (
          <div style={{
            marginBottom: 18,
            border: '1px solid #eef0f3', borderRadius: 14,
            background: '#f7f8fb',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setTOCOpen(!tocOpen)}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: '#eef2ff', color: '#0a2f7f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M2 3h9M2 6.5h9M2 10h6"/>
                </svg>
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#0f1729' }}>
                Índice
              </div>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" style={{ transform: tocOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}>
                <path d="M2 4l3.5 3.5L9 4"/>
              </svg>
            </button>
            {tocOpen && (
              <div style={{ padding: '0 14px 12px', borderTop: '1px solid #eef0f3' }}>
                {doc.sections.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(`legal-${s.id}`);
                      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      display: 'block', padding: '8px 0',
                      fontSize: 13, color: '#374151',
                      textDecoration: 'none',
                      borderBottom: '1px solid #eef0f3',
                    }}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        {filteredSections.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#9ca3af',
            background: '#f7f8fb', borderRadius: 14, border: '1px solid #eef0f3',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', marginBottom: 4 }}>
              Nenhum resultado
            </div>
            <div style={{ fontSize: 12 }}>Nenhuma seção contém "{searchQuery}".</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredSections.map(s => (
              <section key={s.id} id={`legal-${s.id}`}>
                <h2 style={{
                  fontSize: 17, fontWeight: 700, color: '#0f1729',
                  letterSpacing: -0.2, margin: '0 0 10px',
                }}>
                  {renderHighlighted(s.title)}
                </h2>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: '#374151',
                  whiteSpace: 'pre-wrap', margin: 0,
                }}>
                  {renderHighlighted(s.content)}
                </p>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        {!searchQuery && (
          <div style={{
            marginTop: 32, padding: 14,
            background: '#f7f8fb', border: '1px solid #eef0f3',
            borderRadius: 12, textAlign: 'center',
            fontSize: 11.5, color: '#8a94a6',
          }}>
            © 2026 AtlasMed Ltda. · CNPJ 12.345.678/0001-90
          </div>
        )}
      </div>

      <style>{`
        @keyframes lgSpin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const _lgIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

Object.assign(window, { LegalDocumentScreen, LEGAL_DOCUMENTS });
