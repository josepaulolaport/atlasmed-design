// ─────────────────────────────────────────────────────────────
// PresentationViewerScreen — in-app PDF / slide deck viewer.
// Opens from a presentation card or detail. Pages are rendered
// as crisp SVG mocks (this is a design frame, not a real PDF
// renderer). Supports vertical scroll, zoom, page indicator,
// and a full-screen toggle that hides chrome.
// ─────────────────────────────────────────────────────────────

const PRES_VIEWER_SLIDES = {
  // Default deck used when the presentation id has no specific mock.
  default: [
    { kind: 'cover',   title: 'AtlasMed', subtitle: 'Apresentação institucional', accent: '#0a2f7f' },
    { kind: 'agenda',  title: 'Agenda', items: ['Quem somos', 'Linhas terapêuticas', 'Resultados clínicos', 'Próximos passos'] },
    { kind: 'section', title: '01 · Quem somos', accent: '#16a373' },
    { kind: 'two-col', title: 'Histórico e missão',
      colA: { heading: 'Origem', body: 'Fundada em 2014, AtlasMed nasceu da parceria de pesquisadores e clínicos para acelerar inovação em saúde no Brasil.' },
      colB: { heading: 'Missão',  body: 'Conectar ciência clínica e prática médica diária por meio de produtos confiáveis, baseados em evidência.' } },
    { kind: 'chart',   title: 'Evolução do mercado · 2020–2026', bars: [38, 52, 47, 64, 71, 88, 96] },
    { kind: 'section', title: '02 · Linhas terapêuticas', accent: '#1e40af' },
    { kind: 'grid',    title: 'Portfólio principal', items: [
      { label: 'Cardiovascular', icon: '❤️' },
      { label: 'Diabetes',       icon: '🩺' },
      { label: 'Dermatologia',   icon: '🧴' },
      { label: 'Ortopedia',      icon: '🦴' },
    ] },
    { kind: 'quote',   title: '“Mais de 1.200 médicos prescrevem AtlasMed regularmente em São Paulo.”', author: '— Atlas Insights, 2026' },
    { kind: 'two-col', title: 'Resultados clínicos AtlasGel',
      colA: { heading: '−42%', body: 'redução média de dor pós-operatória em 14 dias.' },
      colB: { heading: '94%',  body: 'satisfação reportada por pacientes em estudo multicêntrico.' } },
    { kind: 'chart',   title: 'Adesão por região', bars: [62, 71, 84, 78, 92, 88, 95, 81] },
    { kind: 'section', title: '03 · Próximos passos', accent: '#c6861b' },
    { kind: 'agenda',  title: 'Roadmap Q3 2026', items: ['Lançamento AtlasFlex', 'Estudo de Fase III · CardioFlex', 'Expansão regional Sul', 'Programa de educação continuada'] },
    { kind: 'closing', title: 'Obrigado.', subtitle: 'contato@atlasmed.com.br · (11) 1234-5678', accent: '#0a2f7f' },
  ],
};

function PresentationViewerScreen({
  presentationId = 'pr2',
  onBack = () => {},
  initialFullscreen = false,
  initialPage = 1,
}) {
  const presentation = (window.PRESENTATIONS || []).find(p => p.id === presentationId)
    || { id: presentationId, title: 'Apresentação', subtitle: '', pages: 14, type: 'pdf', size: '12 MB', author: 'AtlasMed', updated: '—' };

  const slides = PRES_VIEWER_SLIDES.default;
  const totalPages = Math.max(slides.length, presentation.pages || slides.length);

  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [fullscreen, setFullscreen]   = React.useState(initialFullscreen);
  const [zoom, setZoom]               = React.useState(1);
  const scrollerRef = React.useRef(null);
  const pageRefs = React.useRef([]);

  // Track which page is most visible while scrolling.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const sTop = scroller.scrollTop;
    const sH = scroller.clientHeight;
    let best = 0, bestVis = 0;
    pageRefs.current.forEach((el, i) => {
      if (!el) return;
      const top = el.offsetTop - sTop;
      const bottom = top + el.offsetHeight;
      const vis = Math.max(0, Math.min(sH, bottom) - Math.max(0, top));
      if (vis > bestVis) { bestVis = vis; best = i; }
    });
    setCurrentPage(best + 1);
  };

  const jumpTo = (page) => {
    const target = pageRefs.current[page - 1];
    if (target && scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: target.offsetTop - 12, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: fullscreen ? '#0f1729' : '#1a2235',
      fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top chrome — hidden in fullscreen */}
      {!fullscreen && (
        <div style={{
          padding: '11px 14px',
          background: 'rgba(15,23,41,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          color: '#fff',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
          animation: 'pvFadeIn 200ms ease-out',
        }}>
          <button onClick={onBack} aria-label="Voltar" style={_pvIconBtn(false)}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <path d="M10 3l-5 5 5 5"/>
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9.5, color: 'rgba(255,255,255,0.5)', fontWeight: 700,
              letterSpacing: 0.8, textTransform: 'uppercase',
            }}>
              {presentation.type?.toUpperCase() || 'PDF'} · {presentation.size}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700, marginTop: 1, letterSpacing: -0.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {presentation.title}
            </div>
          </div>
          <button onClick={() => setFullscreen(true)} aria-label="Tela cheia" style={_pvIconBtn(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5V2h3M9 2h3v3M2 9v3h3M9 12h3V9"/>
            </svg>
          </button>
          <button aria-label="Compartilhar" style={_pvIconBtn(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="3" r="1.6"/><circle cx="3" cy="7" r="1.6"/><circle cx="11" cy="11" r="1.6"/>
              <path d="M4.4 6.2L9.6 3.8M4.4 7.8L9.6 10.2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Pages scroller */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto',
          padding: fullscreen ? '24px 12px 80px' : '14px 12px 80px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => { pageRefs.current[i] = el; }}
            style={{
              width: 360 * zoom,
              maxWidth: '100%',
              background: '#fff',
              borderRadius: 6,
              boxShadow: '0 12px 30px rgba(0,0,0,0.42), 0 2px 4px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              transition: 'width 220ms ease',
              position: 'relative',
              aspectRatio: '4 / 3',
            }}
          >
            <_PVSlide slide={slide} pageNumber={i + 1} totalPages={totalPages}/>
          </div>
        ))}
        {/* End-of-deck marker */}
        <div style={{
          padding: '10px 16px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4,
          marginTop: 8,
        }}>
          Fim do documento · {totalPages} páginas
        </div>
      </div>

      {/* Bottom chrome */}
      <div style={{
        position: 'absolute', bottom: fullscreen ? 18 : 14,
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(15,23,41,0.86)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 999,
        padding: '6px 6px 6px 12px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.36)',
        zIndex: 10,
      }}>
        <button
          onClick={() => jumpTo(Math.max(1, currentPage - 1))}
          aria-label="Anterior"
          style={_pvCircleBtn}
          disabled={currentPage <= 1}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}>
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: '#fff',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 44, textAlign: 'center',
          padding: '0 2px',
        }}>
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={() => jumpTo(Math.min(totalPages, currentPage + 1))}
          aria-label="Próximo"
          style={_pvCircleBtn}
          disabled={currentPage >= totalPages}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}>
            <path d="M6 3l5 5-5 5"/>
          </svg>
        </button>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.16)', margin: '0 4px' }}/>
        <button
          onClick={() => setZoom(z => Math.max(0.7, +(z - 0.15).toFixed(2)))}
          aria-label="Reduzir"
          style={_pvCircleBtn}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6.5h7"/>
          </svg>
        </button>
        <button
          onClick={() => setZoom(z => Math.min(1.6, +(z + 0.15).toFixed(2)))}
          aria-label="Ampliar"
          style={_pvCircleBtn}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6.5 3v7M3 6.5h7"/>
          </svg>
        </button>
        <button
          onClick={() => setFullscreen(!fullscreen)}
          aria-label={fullscreen ? 'Sair tela cheia' : 'Tela cheia'}
          style={_pvCircleBtn}
        >
          {fullscreen ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 2v3H2M9 5h3V2M5 12V9H2M9 9h3v3"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5V2h3M9 2h3v3M2 9v3h3M9 12h3V9"/>
            </svg>
          )}
        </button>
      </div>

      {/* Fullscreen back button */}
      {fullscreen && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          style={{
            position: 'absolute', top: 18, left: 14, zIndex: 10,
            width: 38, height: 38, borderRadius: 19,
            background: 'rgba(15,23,41,0.86)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
      )}

      <style>{`
        @keyframes pvFadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}

function _pvIconBtn(filled) {
  return {
    width: 36, height: 36, borderRadius: 11,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#fff',
    cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

const _pvCircleBtn = {
  width: 32, height: 32, borderRadius: 16,
  border: 'none', background: 'transparent',
  color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

// ── Per-slide renderers ─────────────────────────────────────
function _PVSlide({ slide, pageNumber, totalPages }) {
  const PageNum = (
    <div style={{
      position: 'absolute', bottom: 10, right: 14,
      fontSize: 10, color: '#9ca3af', fontWeight: 600,
      fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
    }}>
      {pageNumber} / {totalPages}
    </div>
  );

  if (slide.kind === 'cover') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${slide.accent} 0%, #0f1729 100%)`,
        color: '#fff',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.8 }}>
          <svg width="16" height="11" viewBox="0 0 22 15" fill="none">
            <path d="M1 13 Q11 -1, 21 13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <circle cx="11" cy="7" r="2" fill="#16a373"/>
          </svg>
          ATLASMED
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
            {slide.title}
          </div>
          <div style={{ fontSize: 13, marginTop: 10, opacity: 0.78, fontWeight: 500 }}>
            {slide.subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 10, opacity: 0.5, fontWeight: 600 }}>
          <span>2026 · v1.0</span>
        </div>
        <div style={{
          position: 'absolute', top: 0, right: -40,
          width: 200, height: 200, borderRadius: 100,
          background: 'radial-gradient(circle at 30% 30%, rgba(22,163,115,0.4), transparent 60%)',
        }}/>
      </div>
    );
  }

  if (slide.kind === 'agenda') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#fff', padding: '34px 36px',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
          Agenda
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f1729', letterSpacing: -0.6, marginTop: 6 }}>
          {slide.title}
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {slide.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13,
                background: '#eef2ff', color: '#0a2f7f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 14, color: '#1f2937', fontWeight: 600 }}>
                {item}
              </div>
            </div>
          ))}
        </div>
        {PageNum}
      </div>
    );
  }

  if (slide.kind === 'section') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${slide.accent || '#0a2f7f'} 0%, #0f1729 100%)`,
        color: '#fff',
        padding: '40px 36px',
        display: 'flex', alignItems: 'flex-end',
        position: 'relative',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, opacity: 0.7, textTransform: 'uppercase' }}>
            Seção
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginTop: 6, lineHeight: 1.1 }}>
            {slide.title}
          </div>
        </div>
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 6,
          background: 'rgba(22,163,115,0.7)',
        }}/>
      </div>
    );
  }

  if (slide.kind === 'two-col') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#fff', padding: '34px 36px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
          Detalhamento
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f1729', letterSpacing: -0.5, marginTop: 6 }}>
          {slide.title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 22, flex: 1 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a2f7f', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {slide.colA.heading}
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginTop: 8 }}>
              {slide.colA.body}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a373', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {slide.colB.heading}
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginTop: 8 }}>
              {slide.colB.body}
            </div>
          </div>
        </div>
        {PageNum}
      </div>
    );
  }

  if (slide.kind === 'chart') {
    const max = Math.max(...slide.bars);
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#fff', padding: '34px 36px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
          Indicador
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f1729', letterSpacing: -0.4, marginTop: 6 }}>
          {slide.title}
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8,
          marginTop: 28, paddingBottom: 18,
          borderBottom: '2px solid #eef0f3',
        }}>
          {slide.bars.map((v, i) => {
            const h = (v / max) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: '100%', height: `${h}%`, minHeight: 4,
                  background: `linear-gradient(180deg, #0a2f7f 0%, #1e40af 100%)`,
                  borderRadius: '4px 4px 0 0',
                }}/>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>
                  {2020 + i}
                </div>
              </div>
            );
          })}
        </div>
        {PageNum}
      </div>
    );
  }

  if (slide.kind === 'grid') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#fff', padding: '34px 36px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
          Portfólio
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f1729', letterSpacing: -0.4, marginTop: 6 }}>
          {slide.title}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          marginTop: 22, flex: 1,
        }}>
          {slide.items.map((it, i) => (
            <div key={i} style={{
              padding: '14px 14px',
              border: '1px solid #eef0f3', borderRadius: 12,
              background: '#f7f8fb',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 22 }}>{it.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>{it.label}</div>
            </div>
          ))}
        </div>
        {PageNum}
      </div>
    );
  }

  if (slide.kind === 'quote') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#f7f8fb',
        padding: '40px 38px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          fontSize: 38, color: '#cbd5e1', fontWeight: 800, lineHeight: 0.6,
        }}>"</div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: '#0f1729',
          letterSpacing: -0.3, lineHeight: 1.35,
          marginTop: -8,
        }}>
          {slide.title.replace(/^"|"$/g, '').replace(/^“|”$/g, '')}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 14, fontWeight: 600 }}>
          {slide.author}
        </div>
        {PageNum}
      </div>
    );
  }

  if (slide.kind === 'closing') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${slide.accent} 0%, #0f1729 100%)`,
        color: '#fff',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.2 }}>
          {slide.title}
        </div>
        <div style={{ fontSize: 13, opacity: 0.78, marginTop: 12, fontWeight: 500 }}>
          {slide.subtitle}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: 24 }}>
      Página {pageNumber}
    </div>
  );
}

Object.assign(window, { PresentationViewerScreen, PRES_VIEWER_SLIDES });
