// Apresentações (Presentations) screens — Atlasmed design system.
// Library of institutional PDFs / PowerPoints the salesman can browse,
// search, preview and download.

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PRESENTATION_CATEGORIES = [
  'Todas',
  'Institucional',
  'Produtos',
  'Clínico',
  'Treinamento',
  'Comercial',
];

const PRESENTATIONS = [
  {
    id: 'pr1',
    title: 'Atlasmed · Visão Institucional 2026',
    subtitle: 'Overview corporativo, missão, linhas terapêuticas',
    category: 'Institucional',
    type: 'pdf',
    size: '12,4 MB',
    pages: 28,
    updated: '18 abr 2026',
    author: 'Marketing',
    featured: true,
    new: false,
  },
  {
    id: 'pr2',
    title: 'Portfólio de Produtos — Q2 2026',
    subtitle: 'Catálogo completo com posicionamento e preços',
    category: 'Produtos',
    type: 'pptx',
    size: '24,1 MB',
    pages: 42,
    updated: '15 abr 2026',
    author: 'Comercial',
    featured: true,
    new: true,
  },
  {
    id: 'pr3',
    title: 'AtlasGel · Estudo Clínico Multicêntrico',
    subtitle: 'Resultados de eficácia e segurança em 1.204 pacientes',
    category: 'Clínico',
    type: 'pdf',
    size: '8,7 MB',
    pages: 54,
    updated: '10 abr 2026',
    author: 'Dept. Científico',
    featured: false,
    new: true,
  },
  {
    id: 'pr4',
    title: 'AtlasDerm · Apresentação ao Médico',
    subtitle: 'Material de detalhamento para visita clínica',
    category: 'Produtos',
    type: 'pdf',
    size: '5,2 MB',
    pages: 16,
    updated: '08 abr 2026',
    author: 'Marketing',
    featured: false,
    new: false,
  },
  {
    id: 'pr5',
    title: 'CardioFlex · Dados de Eficácia',
    subtitle: 'Meta-análise publicada no JACC · Janeiro 2026',
    category: 'Clínico',
    type: 'pptx',
    size: '18,3 MB',
    pages: 34,
    updated: '02 abr 2026',
    author: 'Dept. Científico',
    featured: false,
    new: false,
  },
  {
    id: 'pr6',
    title: 'Treinamento Comercial Q2',
    subtitle: 'Argumentação, objeções e abordagem consultiva',
    category: 'Treinamento',
    type: 'pdf',
    size: '3,1 MB',
    pages: 22,
    updated: '28 mar 2026',
    author: 'RH',
    featured: false,
    new: false,
  },
  {
    id: 'pr7',
    title: 'OrtoPlus · Lançamento',
    subtitle: 'Deck oficial de lançamento com key messages',
    category: 'Produtos',
    type: 'pptx',
    size: '32,6 MB',
    pages: 48,
    updated: '22 mar 2026',
    author: 'Marketing',
    featured: false,
    new: false,
  },
  {
    id: 'pr8',
    title: 'VitalScan · Protocolo Diagnóstico',
    subtitle: 'Guia técnico para implantação em clínicas',
    category: 'Clínico',
    type: 'pdf',
    size: '14,0 MB',
    pages: 38,
    updated: '18 mar 2026',
    author: 'Dept. Científico',
    featured: false,
    new: false,
  },
  {
    id: 'pr9',
    title: 'Política Comercial 2026',
    subtitle: 'Condições, descontos e programa de fidelidade',
    category: 'Comercial',
    type: 'pdf',
    size: '2,4 MB',
    pages: 12,
    updated: '11 mar 2026',
    author: 'Comercial',
    featured: false,
    new: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_META = {
  pdf:  { label: 'PDF',  color: '#b84545', bg: 'rgba(184,69,69,0.10)', strong: '#8f2a2a' },
  pptx: { label: 'PPTX', color: '#c6861b', bg: 'rgba(198,134,27,0.12)', strong: '#8a5a0d' },
};

function PresentationThumb({ type, size = 56 }) {
  const meta = TYPE_META[type] || TYPE_META.pdf;
  const isPdf = type === 'pdf';
  return (
    <div style={{
      width: size, height: size * 1.25, borderRadius: 8,
      background: '#fff',
      border: `1px solid ${isPdf ? 'rgba(184,69,69,0.22)' : 'rgba(198,134,27,0.28)'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Simulated slide content lines */}
      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ height: 4, width: '70%', background: meta.bg, borderRadius: 1 }}/>
        <div style={{ height: 3, width: '90%', background: '#eef0f3', borderRadius: 1 }}/>
        <div style={{ height: 3, width: '82%', background: '#eef0f3', borderRadius: 1 }}/>
        <div style={{ height: 3, width: '55%', background: '#eef0f3', borderRadius: 1 }}/>
      </div>
      {/* Type label ribbon bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '3px 6px',
        background: meta.color, color: '#fff',
        fontSize: 8, fontWeight: 800, letterSpacing: 0.6,
        textAlign: 'center',
      }}>{meta.label}</div>
      {/* Corner fold */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 10, height: 10,
        background: 'linear-gradient(225deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.08) 50%, transparent 50%)',
      }}/>
    </div>
  );
}

function FileTypePill({ type }) {
  const meta = TYPE_META[type] || TYPE_META.pdf;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 4,
      background: meta.bg, color: meta.strong,
      fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5,
      flexShrink: 0,
    }}>{meta.label}</span>
  );
}

function NewPill() {
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 10,
      background: 'rgba(22,163,115,0.12)', color: '#0f8a5f',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
    }}>Novo</span>
  );
}

function DownloadIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M4 7.5l4 4 4-4"/>
      <path d="M2 13.5h12"/>
    </svg>
  );
}

function ShareIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v10M4.5 4.5L8 1l3.5 3.5"/>
      <path d="M2.5 9v4a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"/>
    </svg>
  );
}

function PresBackChevron() {
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

// ─── Screen 1: Library ───────────────────────────────────────────────────────
function PresentationsLibraryScreen({
  searchQuery = '',
  selectedCategory = 'Todas',
  emptyState = false,
}) {
  const filtered = PRESENTATIONS.filter(p => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchQ = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const featured = !searchQuery && selectedCategory === 'Todas'
    ? filtered.filter(p => p.featured)
    : [];
  const rest = !searchQuery && selectedCategory === 'Todas'
    ? filtered.filter(p => !p.featured)
    : filtered;

  const showEmpty = emptyState || rest.length + featured.length === 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <AtlasTopBar page="Apresentações" active="apresentacoes"/>

      {/* Header */}
      <div style={{ padding: '18px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0a2f7f', letterSpacing: -0.5 }}>Apresentações</h1>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Biblioteca institucional</div>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: 12,
            background: '#fff', border: '1px solid #eef0f3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, marginTop: 14,
          }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 1.5v10M4.5 7l4 4 4-4"/>
              <path d="M2 14.5h13"/>
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#fff',
          border: `1.5px solid ${searchQuery ? 'rgba(10,47,127,0.3)' : '#eef0f3'}`,
          borderRadius: 12, padding: '10px 14px', marginTop: 16,
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={searchQuery ? '#0a2f7f' : '#9ca3af'} strokeWidth="1.7" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l2.5 2.5"/>
          </svg>
          <span style={{ fontSize: 14, color: searchQuery ? '#1f2937' : '#9ca3af', fontWeight: searchQuery ? 500 : 400 }}>
            {searchQuery ? searchQuery : 'Buscar apresentações…'}
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
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '14px 0 10px' }}>
          {PRESENTATION_CATEGORIES.map(cat => (
            <button key={cat} style={{
              padding: '5px 13px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
              background: cat === selectedCategory ? '#0a2f7f' : '#fff',
              color: cat === selectedCategory ? '#fff' : '#6b7280',
              border: cat === selectedCategory ? '1.5px solid #0a2f7f' : '1.5px solid #eef0f3',
              fontSize: 11.5, fontWeight: 500,
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '4px 16px 24px' }}>
        {showEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 64, gap: 14,
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: 24,
              background: 'rgba(10,47,127,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0a2f7f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                <circle cx="10.5" cy="10.5" r="6.5"/>
                <path d="M15.5 15.5L20 20"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                {searchQuery ? 'Nada encontrado' : 'Sem apresentações'}
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 5, lineHeight: 1.5 }}>
                {searchQuery
                  ? <>Nenhum resultado para<br/><b style={{ color: '#374151' }}>"{searchQuery}"</b>.</>
                  : <>As apresentações aparecerão<br/>aqui assim que forem publicadas.</>
                }
              </div>
            </div>
            {searchQuery && (
              <button style={{
                marginTop: 4, background: 'transparent', color: '#0a2f7f',
                border: '1px solid rgba(10,47,127,0.3)',
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Limpar busca</button>
            )}
          </div>
        ) : (
          <>
            {/* Featured section — only on default view */}
            {featured.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 2px 10px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                    Em destaque
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                    Atualizadas recentemente
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }}>
                  {featured.map(p => (
                    <div key={p.id} style={{
                      flexShrink: 0, width: 220,
                      background: '#fff', border: '1px solid #eef0f3',
                      borderRadius: 14, padding: 14,
                      display: 'flex', flexDirection: 'column', gap: 12,
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <PresentationThumb type={p.type} size={48}/>
                        {p.new && <NewPill/>}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1f2937', lineHeight: 1.3 }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                          {p.category} · {p.pages} págs · {p.size}
                        </div>
                      </div>
                      <button style={{
                        background: '#0a2f7f', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '9px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      }}>
                        <DownloadIcon size={13}/>Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List section */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 2px 10px',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {searchQuery ? `${rest.length} ${rest.length === 1 ? 'resultado' : 'resultados'}` : 'Todas'}
              </span>
              {!searchQuery && (
                <button style={{
                  border: 'none', background: 'transparent', color: '#6b7280',
                  fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M1.5 2.5h7M2.5 5h5M4 7.5h2"/>
                  </svg>
                  Mais recentes
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rest.map(p => (
                <div key={p.id} style={{
                  background: '#fff', border: '1px solid #eef0f3',
                  borderRadius: 12, padding: '12px 12px 12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer',
                }}>
                  <PresentationThumb type={p.type} size={44}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 13.5, fontWeight: 600, color: '#1f2937',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                      }}>{p.title}</span>
                      {p.new && <NewPill/>}
                    </div>
                    <div style={{
                      fontSize: 11.5, color: '#6b7280', marginBottom: 5,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{p.subtitle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: '#9ca3af' }}>
                      <FileTypePill type={p.type}/>
                      <span>{p.pages} págs</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      <span>{p.size}</span>
                    </div>
                  </div>
                  <button style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: '#f7f8fb', border: '1px solid #eef0f3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, color: '#0a2f7f',
                  }}>
                    <DownloadIcon size={15}/>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Screen 2: Presentation Detail ───────────────────────────────────────────
function PresentationDetailScreen({
  presentationId = 'pr2',
  downloading = false,
  downloaded = false,
  progress = 42,
}) {
  const p = PRESENTATIONS.find(x => x.id === presentationId) || PRESENTATIONS[0];
  const meta = TYPE_META[p.type];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Apresentações" active="apresentacoes"/>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PresBackChevron/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Apresentação
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{p.category}</div>
          </div>
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #eef0f3', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#374151',
          }}>
            <ShareIcon size={15}/>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 0' }}>
        {/* Big preview card */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3',
          borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: 16,
        }}>
          <div style={{
            width: 160, height: 200, borderRadius: 10,
            background: '#fff',
            border: `1px solid ${p.type === 'pdf' ? 'rgba(184,69,69,0.25)' : 'rgba(198,134,27,0.3)'}`,
            boxShadow: '0 6px 24px rgba(10,47,127,0.08), 0 2px 6px rgba(0,0,0,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Simulated slide cover */}
            <div style={{
              padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ height: 6, width: '30%', background: '#0a2f7f', borderRadius: 2, marginBottom: 4 }}/>
              <div style={{ height: 9, width: '85%', background: '#1f2937', borderRadius: 2 }}/>
              <div style={{ height: 9, width: '65%', background: '#1f2937', borderRadius: 2 }}/>
              <div style={{ height: 4, width: '90%', background: '#eef0f3', borderRadius: 1, marginTop: 8 }}/>
              <div style={{ height: 4, width: '80%', background: '#eef0f3', borderRadius: 1 }}/>
              <div style={{ height: 4, width: '88%', background: '#eef0f3', borderRadius: 1 }}/>
              <div style={{ marginTop: 12, display: 'flex', gap: 4 }}>
                <div style={{ flex: 1, height: 32, borderRadius: 3, background: meta.bg }}/>
                <div style={{ flex: 1, height: 32, borderRadius: 3, background: 'rgba(22,163,115,0.1)' }}/>
              </div>
            </div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 18,
              background: meta.color, color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{meta.label} · {p.pages} PÁGS</div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{
              fontSize: 17, fontWeight: 700, color: '#1f2937',
              letterSpacing: -0.3, lineHeight: 1.25,
            }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 6, lineHeight: 1.4 }}>
              {p.subtitle}
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 18, marginTop: 14, paddingTop: 14,
            borderTop: '1px solid #f1f3f6', width: '100%',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{p.pages}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>páginas</div>
            </div>
            <div style={{ width: 1, background: '#f1f3f6' }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{p.size}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>tamanho</div>
            </div>
            <div style={{ width: 1, background: '#f1f3f6' }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{meta.label}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>formato</div>
            </div>
          </div>
        </div>

        {/* Metadata card */}
        <div style={{
          background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
          padding: 14, marginBottom: 12,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#9ca3af',
            letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12,
          }}>Detalhes</div>

          {[
            { label: 'Autor', value: p.author },
            { label: 'Categoria', value: p.category },
            { label: 'Atualizada', value: p.updated },
            { label: 'Idioma', value: 'Português (BR)' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0',
              borderTop: i === 0 ? 'none' : '1px solid #f1f3f6',
            }}>
              <span style={{ fontSize: 12.5, color: '#6b7280' }}>{row.label}</span>
              <span style={{ fontSize: 12.5, color: '#1f2937', fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Related section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#9ca3af',
            letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 2px 10px',
          }}>Relacionadas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRESENTATIONS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 2).map(r => (
              <div key={r.id} style={{
                background: '#fff', border: '1px solid #eef0f3',
                borderRadius: 12, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <PresentationThumb type={r.type} size={36}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 600, color: '#1f2937',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{r.title}</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
                    <FileTypePill type={r.type}/>  <span style={{ marginLeft: 4 }}>{r.size}</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c4c9d2" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M5 3l4 4-4 4"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA area */}
      <div style={{ padding: '12px 16px 28px', flexShrink: 0, background: '#f7f8fb' }}>
        {downloading ? (
          <div style={{
            width: '100%', height: 50, borderRadius: 14,
            background: 'rgba(10,47,127,0.10)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0a2f7f 0%, #1e40af 100%)',
              transition: 'width 300ms ease',
            }}/>
            <span style={{
              position: 'relative', fontSize: 14, fontWeight: 600,
              color: progress > 50 ? '#fff' : '#0a2f7f',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M7 1v3M7 10v3M13 7h-3M4 7H1M11.2 2.8l-2.1 2.1M4.9 9.1l-2.1 2.1M11.2 11.2l-2.1-2.1M4.9 4.9L2.8 2.8" opacity="0.5"/>
              </svg>
              Baixando · {progress}%
            </span>
          </div>
        ) : downloaded ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              flex: 1, height: 50, borderRadius: 14,
              background: '#0a2f7f', color: '#fff', border: 'none',
              fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="12" height="12" rx="1"/>
                <path d="M2 6h12M5 2v4"/>
              </svg>
              Abrir
            </button>
            <button style={{
              width: 50, height: 50, borderRadius: 14,
              background: '#fff', border: '1px solid #eef0f3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#374151',
            }}>
              <ShareIcon size={17}/>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              flex: 1, height: 50, borderRadius: 14,
              background: '#fff', color: '#0a2f7f',
              border: '1.5px solid #d8dde7',
              fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                <circle cx="8" cy="8" r="2"/>
              </svg>
              Visualizar
            </button>
            <button style={{
              flex: 1, height: 50, borderRadius: 14,
              background: '#0a2f7f', color: '#fff', border: 'none',
              fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <DownloadIcon size={16}/>
              Baixar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  PRESENTATIONS, PRESENTATION_CATEGORIES,
  PresentationThumb, FileTypePill, NewPill,
  PresentationsLibraryScreen, PresentationDetailScreen,
});
