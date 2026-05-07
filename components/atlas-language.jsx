// ─────────────────────────────────────────────────────────────
// LanguageSelectorSheet — bottom sheet that lets the user pick
// the app's preferred language. Opens from the Profile screen.
// Includes flag, native name, and translated name preview.
// ─────────────────────────────────────────────────────────────

const AVAILABLE_LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', nativeName: 'Português',         displayName: 'Português (Brasil)', region: 'Brasil',          status: 'recommended' },
  { code: 'pt-PT', flag: '🇵🇹', nativeName: 'Português',         displayName: 'Português (Portugal)', region: 'Portugal' },
  { code: 'en-US', flag: '🇺🇸', nativeName: 'English',           displayName: 'English (US)',       region: 'United States' },
  { code: 'es-ES', flag: '🇪🇸', nativeName: 'Español',           displayName: 'Espanhol (Espanha)', region: 'España' },
  { code: 'es-MX', flag: '🇲🇽', nativeName: 'Español',           displayName: 'Espanhol (México)',  region: 'México' },
  { code: 'fr-FR', flag: '🇫🇷', nativeName: 'Français',          displayName: 'Francês',            region: 'France' },
  { code: 'de-DE', flag: '🇩🇪', nativeName: 'Deutsch',           displayName: 'Alemão',             region: 'Deutschland' },
  { code: 'it-IT', flag: '🇮🇹', nativeName: 'Italiano',          displayName: 'Italiano',           region: 'Italia' },
];

function LanguageSelectorSheet({
  open = true,
  onClose = () => {},
  currentLanguage = 'pt-BR',
  onLanguageChange = () => {},
}) {
  const [selected, setSelected] = React.useState(currentLanguage);
  const [confirming, setConfirming] = React.useState(false);

  if (!open) return null;

  const handleApply = () => {
    setConfirming(true);
    setTimeout(() => {
      onLanguageChange(selected);
      setConfirming(false);
      onClose();
    }, 700);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      zIndex: 1000,
      display: 'flex', alignItems: 'flex-end',
      animation: 'lsFadeIn 200ms ease-out',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.42)',
      }}/>
      <div style={{
        position: 'relative',
        width: '100%',
        background: '#fff',
        borderRadius: '22px 22px 0 0',
        animation: 'lsSlideUp 280ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '80%',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui',
        boxShadow: '0 -10px 30px rgba(15,23,41,0.18)',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#e5e7eb',
          margin: '10px auto 0',
          flexShrink: 0,
        }}/>

        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #eef0f3',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
            Selecionar idioma
          </div>
          <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 3 }}>
            Escolha o idioma de exibição do aplicativo.
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {AVAILABLE_LANGUAGES.map((lang, i) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  background: isSelected ? '#eef2ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  textAlign: 'left',
                  transition: 'background 140ms',
                  borderTop: i === 0 ? 'none' : '1px solid #f3f4f6',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafbfc'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: '#f7f8fb',
                  border: '1px solid #eef0f3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, lineHeight: 1, flexShrink: 0,
                }}>
                  {lang.flag}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>
                      {lang.nativeName}
                    </span>
                    {lang.status === 'recommended' && (
                      <span style={{
                        padding: '1px 7px', borderRadius: 6,
                        background: '#e7f6ef', color: '#0f7c5a',
                        fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 0.4,
                      }}>
                        Recomendado
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                    {lang.displayName}
                  </div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  border: `1.5px solid ${isSelected ? '#0a2f7f' : '#cbd5e1'}`,
                  background: isSelected ? '#0a2f7f' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 160ms',
                }}>
                  {isSelected && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5.5l2.5 2.5L9 3"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 18px',
          borderTop: '1px solid #eef0f3',
          flexShrink: 0,
          background: '#fff',
        }}>
          <div style={{
            fontSize: 11.5, color: '#8a94a6',
            textAlign: 'center', marginBottom: 10,
          }}>
            O idioma será aplicado em todo o aplicativo.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '13px 16px',
                border: '1px solid #eef0f3', borderRadius: 12,
                background: '#fff', color: '#0f1729',
                fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={confirming || selected === currentLanguage}
              style={{
                flex: 2, padding: '13px 16px',
                border: 'none', borderRadius: 12,
                background: (selected === currentLanguage || confirming) ? '#cbd5e1' : '#0a2f7f',
                color: '#fff',
                fontSize: 14.5, fontWeight: 700,
                cursor: (selected === currentLanguage || confirming) ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {confirming ? 'Aplicando…' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lsFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lsSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

Object.assign(window, { LanguageSelectorSheet, AVAILABLE_LANGUAGES });
