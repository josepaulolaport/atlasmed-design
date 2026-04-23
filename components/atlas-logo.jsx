// AtlasLogo — animated wordmark recreated in SVG so we can draw the arc,
// stroke the letters, and orchestrate entry motion.
// `mark` prop: 'full' shows arc + wordmark; 'mark' shows the arc alone.

function AtlasLogo({ size = 180, color = '#fff', animate = true, delay = 0, subtitle = null }) {
  const [mounted, setMounted] = React.useState(!animate);
  React.useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);

  // Use the real logo asset — rendered with a CSS filter for white/dark.
  return (
    <div style={{
      width: size, aspectRatio: '258 / 132',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
      transition: 'opacity 700ms cubic-bezier(.2,.8,.2,1), transform 900ms cubic-bezier(.2,.8,.2,1)',
    }}>
      <img src="assets/atlasmed-logo.png" alt="atlasmed"
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          filter: color === '#fff' ? 'none'
            : color === 'dark' ? 'invert(14%) sepia(92%) saturate(3500%) hue-rotate(223deg) brightness(85%) contrast(105%)'
            : 'none',
        }} />
      {subtitle && (
        <div style={{
          marginTop: 10, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, system-ui',
          opacity: mounted ? 1 : 0, transition: 'opacity 600ms ease 400ms',
        }}>{subtitle}</div>
      )}
    </div>
  );
}

// Animated pulse mark — just the arc, for splash screen
function AtlasMark({ size = 120, color = '#fff' }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 120 84" fill="none">
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="0" x2="120" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="50%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {/* Outer arc */}
      <path d="M10 60 Q 60 -10, 110 60" stroke="url(#arcGrad)" strokeWidth="3" strokeLinecap="round" fill="none"
        style={{
          strokeDasharray: 180, strokeDashoffset: 180,
          animation: 'arcDraw 1.4s cubic-bezier(.25,.8,.25,1) forwards',
        }}/>
      {/* Inner dot */}
      <circle cx="60" cy="42" r="3" fill={color}
        style={{ opacity: 0, animation: 'dotFade 0.5s ease 1s forwards' }}/>
      <style>{`
        @keyframes arcDraw { to { stroke-dashoffset: 0; } }
        @keyframes dotFade { to { opacity: 1; } }
      `}</style>
    </svg>
  );
}

Object.assign(window, { AtlasLogo, AtlasMark });
