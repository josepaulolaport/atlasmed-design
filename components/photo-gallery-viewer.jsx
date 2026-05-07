// ─────────────────────────────────────────────────────────────
// Photo Gallery Viewer — full-screen viewer for clinic / doctor
// photo galleries. Includes thumbnail strip, caption bar, FAB
// for adding photos, and an action menu.
// ─────────────────────────────────────────────────────────────

const MOCK_GALLERY = [
  { id: 'ph-1', label: 'Fachada',           date: 'fev/2026', context: 'Visita de prospecção',     hue: 218, placeholder: 'fachada' },
  { id: 'ph-2', label: 'Recepção',          date: 'fev/2026', context: 'Clínica Santa Mônica',     hue: 148, placeholder: 'recepção' },
  { id: 'ph-3', label: 'Sala 3 · Ortopedia',date: 'mar/2026', context: 'Com Dra. Mariana Silva',   hue: 38,  placeholder: 'sala 3' },
  { id: 'ph-4', label: 'Estoque amostras',  date: 'mar/2026', context: 'Conferência mensal',       hue: 280, placeholder: 'estoque' },
  { id: 'ph-5', label: 'Entrada estac.',    date: 'jan/2026', context: 'Acesso lateral',           hue: 0,   placeholder: 'estac.' },
];

function PhotoDisplay({ photo }) {
  const id = `gal-${photo.id || photo.label || 'p'}`;
  return (
    <div style={{
      width: '100%',
      maxWidth: 380,
      aspectRatio: '4 / 3',
      borderRadius: 16,
      overflow: 'hidden',
      background: `hsl(${photo.hue}, 40%, 72%)`,
      boxShadow: '0 18px 48px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.35)',
      position: 'relative',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="14" height="14" fill={`hsl(${photo.hue}, 40%, 72%)`}/>
            <rect width="7" height="14" fill={`hsl(${photo.hue}, 46%, 64%)`}/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${id})`}/>
        <rect width="400" height="300" fill="rgba(0,0,0,0.04)"/>
        <text
          x="200" y="158"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="14"
          fill="rgba(15,23,41,0.32)"
          letterSpacing="2"
        >{photo.placeholder || photo.label}</text>
      </svg>
    </div>
  );
}

function PhotoGalleryViewer({ open, onClose, photos = [], initialIndex = 0, title = 'Galeria de fotos' }) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const [toast, setToast] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setCurrentIndex(Math.min(initialIndex, photos.length - 1));
      setShowMenu(false);
      setShowAddOptions(false);
      setToast('');
    }
  }, [open, initialIndex, photos.length]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  setCurrentIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(photos.length - 1, i + 1));
      if (e.key === 'Escape')     onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length, onClose]);

  if (!open || photos.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));
  const photo = photos[safeIndex];
  const galleryPhoto = {
    id: photo.id || `ph-${safeIndex}`,
    label: photo.label || 'Foto',
    date: photo.date || '',
    context: photo.context || '',
    hue: photo.hue ?? 218,
    placeholder: photo.placeholder || photo.label || 'foto',
  };

  const handleNext = () => setCurrentIndex(i => Math.min(photos.length - 1, i + 1));
  const handlePrev = () => setCurrentIndex(i => Math.max(0, i - 1));

  const fireToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.94)',
      fontFamily: 'Inter, system-ui',
      animation: 'atlasFadeIn 280ms ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 28px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.70) 0%, transparent 100%)',
      }}>
        <button
          onClick={onClose}
          aria-label="Fechar galeria"
          style={{
            width: 38, height: 38, borderRadius: 19,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {safeIndex + 1} / {photos.length}
          </div>
        </div>

        <button
          onClick={() => setShowMenu(true)}
          aria-label="Mais opções"
          style={{
            width: 38, height: 38, borderRadius: 19,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <circle cx="4" cy="9" r="1.6"/>
            <circle cx="9" cy="9" r="1.6"/>
            <circle cx="14" cy="9" r="1.6"/>
          </svg>
        </button>
      </div>

      {/* Photo viewer */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '88px 28px 224px',
      }}>
        <PhotoDisplay photo={galleryPhoto}/>
      </div>

      {/* Prev arrow */}
      {safeIndex > 0 && (
        <button
          onClick={handlePrev}
          aria-label="Foto anterior"
          style={{
            position: 'absolute', left: 12, top: '46%', transform: 'translateY(-50%)',
            width: 42, height: 42, borderRadius: 21,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#fff', cursor: 'pointer', zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4l-5 5 5 5"/>
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {safeIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          aria-label="Próxima foto"
          style={{
            position: 'absolute', right: 12, top: '46%', transform: 'translateY(-50%)',
            width: 42, height: 42, borderRadius: 21,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#fff', cursor: 'pointer', zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4l5 5-5 5"/>
          </svg>
        </button>
      )}

      {/* Caption bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 116,
        padding: '40px 24px 14px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 50%)',
        color: '#fff',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, marginBottom: 4 }}>
          {galleryPhoto.label}
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 500 }}>
          {galleryPhoto.date}
          {galleryPhoto.context && <span style={{ opacity: 0.85 }}> · {galleryPhoto.context}</span>}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 26,
        zIndex: 6,
      }}>
        <div style={{
          display: 'flex', gap: 8,
          padding: '0 16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {photos.map((p, i) => {
            const active = i === safeIndex;
            const hue = p.hue ?? 218;
            return (
              <button
                key={p.id || i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Foto ${i + 1}`}
                style={{
                  width: 56, height: 56, borderRadius: 10,
                  flexShrink: 0,
                  border: active ? '2px solid #fff' : '2px solid rgba(255,255,255,0.18)',
                  padding: 0, cursor: 'pointer',
                  background: `repeating-linear-gradient(45deg, hsl(${hue}, 46%, 64%) 0 4px, hsl(${hue}, 42%, 72%) 4px 8px)`,
                  opacity: active ? 1 : 0.55,
                  transition: 'opacity 200ms, border-color 200ms',
                  boxShadow: active ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Add photo FAB */}
      <button
        onClick={() => setShowAddOptions(true)}
        style={{
          position: 'absolute', bottom: 100, right: 16, zIndex: 8,
          background: '#0a2f7f', color: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 28,
          padding: '11px 18px',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Inter, system-ui',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 10px 28px rgba(10,47,127,0.55)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M8 3v10M3 8h10"/>
        </svg>
        Adicionar
      </button>

      {/* Menu sheet */}
      {showMenu && (
        <GalleryActionSheet
          options={[
            { label: 'Compartilhar foto',  icon: 'share' },
            { label: 'Editar descrição',   icon: 'edit'  },
            { label: 'Excluir foto',       icon: 'trash', color: '#b84545' },
            { label: 'Cancelar',           cancel: true },
          ]}
          onPick={(opt) => {
            if (!opt.cancel) fireToast(`${opt.label}`);
          }}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* Add photo options */}
      {showAddOptions && (
        <GalleryActionSheet
          options={[
            { label: 'Tirar foto com a câmera', icon: 'camera' },
            { label: 'Escolher da galeria',     icon: 'image'  },
            { label: 'Cancelar',                cancel: true },
          ]}
          onPick={(opt) => {
            if (!opt.cancel) fireToast('Foto adicionada');
          }}
          onClose={() => setShowAddOptions(false)}
        />
      )}

      {toast && <GalleryToast message={toast}/>}
    </div>
  );
}

function GalleryActionIcon({ kind, color }) {
  const c = color || '#1f2937';
  const props = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none',
    stroke: c, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'share':  return <svg {...props}><path d="M9 11V3M5 7l4-4 4 4"/><path d="M3 11v3a2 2 0 002 2h8a2 2 0 002-2v-3"/></svg>;
    case 'edit':   return <svg {...props}><path d="M12 3l3 3-9 9H3v-3l9-9z"/><path d="M11 4l3 3"/></svg>;
    case 'trash':  return <svg {...props}><path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10"/></svg>;
    case 'camera': return <svg {...props}><rect x="2.5" y="5" width="13" height="9" rx="2"/><circle cx="9" cy="9.5" r="2.5"/><path d="M6.5 5l1-1.5h3L11.5 5"/></svg>;
    case 'image':  return <svg {...props}><rect x="2.5" y="3.5" width="13" height="11" rx="1.5"/><circle cx="6.5" cy="7.5" r="1.2"/><path d="M3 12l4-3 3 2.5 2-1.5 3 2"/></svg>;
    default: return null;
  }
}

function GalleryActionSheet({ options, onClose, onPick }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      fontFamily: 'Inter, system-ui',
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          animation: 'atlasFadeIn 200ms ease',
        }}
      />
      <div style={{
        position: 'absolute', left: 8, right: 8, bottom: 14,
        display: 'flex', flexDirection: 'column', gap: 8,
        animation: 'atlasSlideUp 260ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        <div style={{
          background: '#fff', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}>
          {options.filter(o => !o.cancel).map((opt, i, arr) => (
            <button
              key={opt.label}
              onClick={() => { onPick && onPick(opt); onClose(); }}
              style={{
                width: '100%', padding: '14px 18px',
                border: 'none',
                borderTop: i > 0 ? '1px solid #f1f3f6' : 'none',
                background: 'transparent',
                color: opt.color || '#1f2937',
                fontSize: 15, fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
                display: 'flex', alignItems: 'center', gap: 12,
                textAlign: 'left',
              }}
            >
              <GalleryActionIcon kind={opt.icon} color={opt.color || '#374151'}/>
              {opt.label}
            </button>
          ))}
        </div>
        {options.find(o => o.cancel) && (
          <button
            onClick={onClose}
            style={{
              padding: '14px 18px', border: 'none',
              background: '#fff', color: '#0a2f7f',
              borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, system-ui',
              boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
            }}
          >Cancelar</button>
        )}
      </div>
    </div>
  );
}

function GalleryToast({ message }) {
  return (
    <div style={{
      position: 'absolute',
      top: 70, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50,
      background: 'rgba(22,163,115,0.95)', color: '#fff',
      padding: '10px 16px', borderRadius: 12,
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'Inter, system-ui',
      animation: 'atlasSlideDown 260ms cubic-bezier(0.22, 1, 0.36, 1)',
      whiteSpace: 'nowrap',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7l3.5 3.5L12 4"/>
      </svg>
      {message}
    </div>
  );
}

Object.assign(window, {
  PhotoGalleryViewer,
  MOCK_GALLERY,
});
