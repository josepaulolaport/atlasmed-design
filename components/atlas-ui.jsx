// Shared UI primitives for the Atlasmed login flow.
// Frosted glass inputs, pill buttons, toast, backdrops.

// ─────────────────────────────────────────────────────────────
// GlassInput — frosted input with floating label + focus glow
// ─────────────────────────────────────────────────────────────
function GlassInput({
  label, value, onChange, type = 'text', autoComplete,
  icon, trailing, error = false, disabled = false,
  onFocus, onBlur, maxLength, inputMode,
}) {
  const [focused, setFocused] = React.useState(false);
  const filled = value && value.length > 0;
  const active = focused || filled;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'relative',
        height: 56, borderRadius: 14,
        background: error
          ? 'rgba(255, 90, 90, 0.12)'
          : focused
          ? 'rgba(255,255,255,0.18)'
          : 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${error ? 'rgba(255,120,120,0.6)' : focused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'}`,
        boxShadow: focused
          ? '0 0 0 4px rgba(255,255,255,0.08), 0 6px 20px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 220ms cubic-bezier(.2,.8,.2,1)',
        display: 'flex', alignItems: 'center',
        padding: `0 ${trailing ? 8 : 16}px 0 ${icon ? 48 : 16}px`,
        opacity: disabled ? 0.5 : 1,
      }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#fff' : 'rgba(255,255,255,0.65)',
            transition: 'color 200ms', pointerEvents: 'none',
          }}>{icon}</div>
        )}
        <label style={{
          position: 'absolute',
          left: icon ? 48 : 16,
          top: active ? 10 : '50%',
          transform: active ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: active ? 11 : 15,
          letterSpacing: active ? 0.6 : 0,
          textTransform: active ? 'uppercase' : 'none',
          color: error ? 'rgba(255,180,180,0.9)' : 'rgba(255,255,255,0.7)',
          fontFamily: 'Inter, system-ui', fontWeight: active ? 600 : 400,
          transition: 'all 200ms cubic-bezier(.2,.8,.2,1)',
          pointerEvents: 'none',
        }}>{label}</label>
        <input
          type={type} value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={(e) => { setFocused(true); onFocus && onFocus(e); }}
          onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
          autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength}
          disabled={disabled}
          style={{
            flex: 1, height: '100%', background: 'transparent',
            border: 'none', outline: 'none',
            paddingTop: active ? 14 : 0,
            fontSize: 15, color: '#fff', fontFamily: 'Inter, system-ui',
            fontWeight: 500, letterSpacing: 0.1,
            caretColor: '#fff',
          }}/>
        {trailing}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PrimaryButton — big white/blue CTA with loading state
// ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, loading = false, disabled = false, variant = 'white', style = {} }) {
  const isWhite = variant === 'white';
  return (
    <button
      onClick={loading || disabled ? undefined : onClick}
      style={{
        width: '100%', height: 54, borderRadius: 14,
        border: 'none', cursor: disabled || loading ? 'default' : 'pointer',
        background: isWhite ? '#fff' : 'rgba(255,255,255,0.14)',
        color: isWhite ? '#0a2f7f' : '#fff',
        fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
        fontFamily: 'Inter, system-ui',
        position: 'relative', overflow: 'hidden',
        boxShadow: isWhite
          ? '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        opacity: disabled ? 0.45 : 1,
        transform: 'scale(1)',
        transition: 'transform 120ms ease, opacity 200ms, background 200ms',
        backdropFilter: isWhite ? 'none' : 'blur(14px)',
        ...style,
      }}
      onPointerDown={(e) => !disabled && !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
      onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: loading ? 0 : 1, transition: 'opacity 150ms',
      }}>{children}</span>
      {loading && (
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `2.5px solid ${isWhite ? 'rgba(10,47,127,0.2)' : 'rgba(255,255,255,0.25)'}`,
            borderTopColor: isWhite ? '#0a2f7f' : '#fff',
            animation: 'spin 0.8s linear infinite',
          }}/>
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// BiometricButton — circle fingerprint / face-id
// ─────────────────────────────────────────────────────────────
function BiometricButton({ kind = 'face', onClick, label }) {
  return (
    <button onClick={onClick} style={{
      width: 64, height: 64, borderRadius: 32, border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#fff',
      transition: 'all 180ms', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
    title={label}>
      {kind === 'face' ? (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M21 4h3.5A1.5 1.5 0 0 1 26 5.5V9M26 21v3.5a1.5 1.5 0 0 1-1.5 1.5H21M9 26H5.5A1.5 1.5 0 0 1 4 24.5V21"/>
          <path d="M11 12v2M19 12v2"/>
          <path d="M15 13v4M13 17h4"/>
          <path d="M11 20c1.5 1.5 2.5 2 4 2s2.5-0.5 4-2"/>
        </svg>
      ) : (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13a9 9 0 0 1 18 0v3"/>
          <path d="M9 15v3a6 6 0 0 0 12 0v-5a6 6 0 0 0-12 0v4a3 3 0 0 0 6 0v-4"/>
          <path d="M15 13v3a3 3 0 0 1-3 3"/>
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Checkbox — custom frosted check
// ─────────────────────────────────────────────────────────────
function GlassCheck({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: 4, margin: -4, color: 'rgba(255,255,255,0.85)',
      fontSize: 13, fontFamily: 'Inter, system-ui', fontWeight: 500,
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        border: `1.5px solid ${checked ? '#fff' : 'rgba(255,255,255,0.4)'}`,
        background: checked ? '#fff' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 180ms',
      }}>
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10">
            <path d="M1 5l3.5 3.5L11 1.5" stroke="#0a2f7f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast — top-docked alert
// ─────────────────────────────────────────────────────────────
function Toast({ kind = 'error', message, visible }) {
  const bg = kind === 'error'
    ? 'rgba(220, 38, 38, 0.92)'
    : kind === 'success'
    ? 'rgba(16, 170, 110, 0.92)'
    : 'rgba(30, 30, 40, 0.88)';
  const icon = kind === 'error' ? (
    <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ) : kind === 'success' ? (
    <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M5 9l3 3 5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) : null;

  return (
    <div style={{
      position: 'absolute', top: 64, left: 16, right: 16, zIndex: 50,
      padding: '12px 16px', borderRadius: 14,
      background: bg, color: '#fff',
      fontSize: 13, fontFamily: 'Inter, system-ui', fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      transform: visible ? 'translateY(0)' : 'translateY(-16px)',
      opacity: visible ? 1 : 0,
      transition: 'all 280ms cubic-bezier(.2,.8,.2,1)',
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {icon}
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BackButton — small glass chevron
// ─────────────────────────────────────────────────────────────
function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#fff',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}

// Icons
const Icons = {
  mail: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="14" height="11" rx="2"/><path d="M2.5 5l6.5 4.5L15.5 5"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="8" width="11" height="7" rx="1.5"/><path d="M6 8V6a3 3 0 0 1 6 0v2"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="9" cy="9" r="2.5"/></svg>,
  eyeOff: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l14 14"/><path d="M10.7 10.7A2.5 2.5 0 0 1 7.3 7.3"/><path d="M5 5.5C3 7 1 9 1 9s3 6 8 6c1.5 0 2.8-.5 4-1.2M13 13.2C15 12 17 9 17 9s-3-6-8-6c-.7 0-1.4.1-2 .3"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// AtlasTopBar — unified slim sticky top bar shared across
// Perfil, Apresentações, Pedidos and Explorar. A single tap on
// the hamburger (navy pill with the Atlas green dot accent)
// opens the side drawer. The bar itself is frosted + sticky so
// it is always in evidence but takes under 48px of vertical
// space, leaving the screen's content untouched.
//
// Props:
//   page     — short page label shown next to "Atlasmed"
//   active   — drawer item that should be highlighted
//                ("desempenho" | "explorar" | "mapa" | "pedidos"
//                 | "apresentacoes" | "perfil")
//   compact  — drop the page label (useful on narrow sub-screens
//              that already carry a back button + title)
// ─────────────────────────────────────────────────────────────
function AtlasTopBar({ page = '', active = '', compact = false }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(247,248,251,0.88)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid #eef0f3',
        padding: '7px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
        fontFamily: 'Inter, system-ui',
      }}>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          style={{
            position: 'relative',
            width: 36, height: 36, borderRadius: 11,
            background: '#fff',
            border: '1px solid #eef0f3',
            boxShadow: '0 1px 2px rgba(15,23,41,0.04), 0 6px 14px rgba(15,23,41,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0, color: '#0a2f7f',
            transition: 'transform 140ms, box-shadow 140ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(15,23,41,0.06), 0 10px 20px rgba(15,23,41,0.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,41,0.04), 0 6px 14px rgba(15,23,41,0.05)';
          }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M3 4.5h9M3 7.5h9M3 10.5h6"/>
          </svg>
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 5, height: 5, borderRadius: '50%',
            background: '#16a373',
            boxShadow: '0 0 0 1.5px #fff',
          }}/>
        </button>
        {!compact && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            minWidth: 0, flex: 1, overflow: 'hidden',
          }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4,
              textTransform: 'uppercase', color: '#8a94a6',
              flexShrink: 0,
            }}>Atlasmed</span>
            {page && (
              <>
                <span style={{
                  width: 3, height: 3, borderRadius: 2, flexShrink: 0,
                  background: '#c8cdd5',
                }}/>
                <span style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
                  color: '#0f1729',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  minWidth: 0,
                }}>{page}</span>
              </>
            )}
          </div>
        )}
      </div>
      <AtlasSideDrawer open={open} onClose={() => setOpen(false)} active={active}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// AtlasSideDrawer — slide-in navigation drawer mounted by
// AtlasTopBar. Tapping any item just closes the drawer (these
// mocks don't have live routing); the visual active state lets
// the rep see where they are.
// ─────────────────────────────────────────────────────────────
function AtlasSideDrawer({ open, onClose, active = '' }) {
  const items = [
    { k: 'desempenho',   label: 'Desempenho',   icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16V9M9 16V5M15 16v-8M3 19h16"/>
      </svg>
    )},
    { k: 'explorar',     label: 'Explorar',     icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="6.5"/><path d="M15 15l4 4"/>
      </svg>
    )},
    { k: 'mapa',         label: 'Mapa',         icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5l5-2 6 2 5-2v14l-5 2-6-2-5 2V5z"/><path d="M8 3v16M14 5v16"/>
      </svg>
    )},
    { k: 'pedidos',      label: 'Pedidos',      icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-3-4z"/>
        <path d="M3 6h16M15 10a4 4 0 0 1-8 0"/>
      </svg>
    )},
    { k: 'apresentacoes', label: 'Apresentações', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="16" height="11" rx="1.5"/><path d="M11 15v4M7 19h8"/>
      </svg>
    )},
    { k: 'perfil',       label: 'Perfil',       icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="8" r="3.5"/><path d="M4 19c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5"/>
      </svg>
    )},
  ];

  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t); }
  }, [open]);
  if (!mounted) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(15,23,41,0.45)',
        opacity: open ? 1 : 0,
        transition: 'opacity 260ms ease',
      }}/>
      <aside style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '78%', maxWidth: 320, zIndex: 51,
        background: '#fff',
        boxShadow: '10px 0 40px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{
          background: 'linear-gradient(165deg, #0a2f7f 0%, #1e40af 100%)',
          padding: '28px 22px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <span style={{
            position: 'absolute', top: -40, right: -30, width: 140, height: 140,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,115,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            width: 44, height: 44, borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12,
          }}>RM</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>Rafael Melo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>rafael.melo@atlasmed.com</div>
        </div>

        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {items.map(it => {
            const on = it.k === active;
            const color = on ? '#0a2f7f' : '#374151';
            return (
              <button key={it.k} onClick={onClose} style={{
                width: '100%', border: 'none',
                background: on ? '#eef2ff' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 12, marginBottom: 2,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Inter, system-ui',
                transition: 'background 140ms',
              }}>
                {it.icon(color)}
                <span style={{
                  fontSize: 14, fontWeight: on ? 600 : 500,
                  color, letterSpacing: -0.1,
                }}>{it.label}</span>
                {on && <span style={{ flex: 1, textAlign: 'right', color: '#16a373', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>•</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '14px 16px 22px', borderTop: '1px solid #eef0f3' }}>
          <button style={{
            width: '100%', border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
            color: '#b84545', fontSize: 13.5, fontWeight: 600,
            fontFamily: 'Inter, system-ui',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 3H4a1 1 0 00-1 1v10a1 1 0 001 1h7"/>
              <path d="M8 9h9M14 6l3 3-3 3"/>
            </svg>
            Sair
          </button>
          <div style={{ fontSize: 10.5, color: '#9ca3af', textAlign: 'center', marginTop: 10, fontWeight: 500, letterSpacing: 0.3 }}>
            Atlasmed · v2.4.1
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { GlassInput, PrimaryButton, BiometricButton, GlassCheck, Toast, BackButton, Icons, AtlasTopBar, AtlasSideDrawer });
