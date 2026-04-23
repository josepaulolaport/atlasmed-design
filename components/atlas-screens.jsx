// Screen components for the Atlasmed login flow.
// Each is a pure presentational component driven by a controller
// object { state, setState, go, ... }. This lets one controller
// drive both iOS and Android frames in lockstep.

// ─────────────────────────────────────────────────────────────
// BlueBackdrop — deep-blue gradient mesh with soft orbs
// ─────────────────────────────────────────────────────────────
function BlueBackdrop({ theme = 'dark' }) {
  if (theme === 'light') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#f6f9ff', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '80%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,64,175,0.18) 0%, transparent 70%)' }}/>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-30%', width: '100%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}/>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a2f7f', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0a2f7f 0%, #1e40af 50%, #3b82f6 110%)' }}/>
      {/* soft radial orbs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-25%', width: '80%', height: '50%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 65%)',
        filter: 'blur(40px)',
        animation: 'orbFloat 18s ease-in-out infinite',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-20%', width: '75%', height: '45%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 65%)',
        filter: 'blur(40px)',
        animation: 'orbFloat2 22s ease-in-out infinite',
      }}/>
      {/* fine grain noise via gradient lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.12,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)',
        backgroundSize: '4px 4px',
        mixBlendMode: 'overlay',
      }}/>
      <style>{`
        @keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, 30px) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, -20px) scale(1.15); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-7px); } 40%, 80% { transform: translateX(7px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }
      `}</style>
    </div>
  );
}

// Screen wrapper
function Screen({ children, keyName }) {
  return (
    <div key={keyName} style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 420ms cubic-bezier(.2,.8,.2,1)',
    }}>
      {children}
    </div>
  );
}

// Footer
function TermsFooter({ version = 'v2.8.1' }) {
  return (
    <div style={{
      position: 'absolute', bottom: 40, left: 0, right: 0,
      textAlign: 'center', padding: '0 24px',
      color: 'rgba(255,255,255,0.5)', fontSize: 11,
      fontFamily: 'Inter, system-ui', lineHeight: 1.5,
    }}>
      <div>
        Ao continuar, você concorda com os{' '}
        <span style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }}>Termos</span>
        {' '}e{' '}
        <span style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }}>Política de Privacidade</span>.
      </div>
      <div style={{ marginTop: 6, opacity: 0.7, letterSpacing: 0.4 }}>atlasmed · {version}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SplashScreen
// ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [phase, setPhase] = React.useState(0); // 0: mark, 1: wordmark, 2: out
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => onDone && onDone(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <Screen keyName="splash">
      <BlueBackdrop/>
      <div style={{
        position: 'relative', flex: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        opacity: phase >= 2 ? 0 : 1, transition: 'opacity 420ms ease',
      }}>
        <div style={{
          transition: 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 400ms',
          transform: phase >= 1 ? 'translateY(-6px) scale(1)' : 'translateY(28px) scale(0.9)',
          opacity: phase >= 1 ? 1 : 0,
        }}>
          <AtlasLogo size={200} color="#fff" animate={false}/>
        </div>
        <div style={{
          marginTop: 4, fontSize: 11, letterSpacing: 5, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, system-ui', fontWeight: 500,
          opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 500ms ease 300ms, transform 500ms ease 300ms',
        }}>Portal do Representante</div>
      </div>
      {/* bottom dot loader */}
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 8,
        opacity: phase >= 2 ? 0 : 1, transition: 'opacity 300ms',
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.7)',
            animation: `pulse 1.4s ease-in-out infinite ${i * 0.2}s`,
          }}/>
        ))}
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. LoginScreen
// ─────────────────────────────────────────────────────────────
function LoginScreen({ ctrl }) {
  const { state, setState, go, submit } = ctrl;
  const [showPw, setShowPw] = React.useState(false);
  const [shakeKey, setShakeKey] = React.useState(0);

  // Trigger shake on error change
  React.useEffect(() => {
    if (state.errorKind) setShakeKey(k => k + 1);
  }, [state.errorKind]);

  const errorMsg = {
    'wrong': 'E-mail ou senha incorretos.',
    'locked': 'Muitas tentativas. Recupere sua senha para continuar.',
    'network': 'Sem conexão. Verifique sua internet.',
  }[state.errorKind];

  const isLocked = state.errorKind === 'locked';

  return (
    <Screen keyName="login">
      <BlueBackdrop/>

      <div style={{ position: 'relative', padding: '60px 28px 20px', display: 'flex', justifyContent: 'center' }}>
        <AtlasLogo size={140} color="#fff" animate delay={80}/>
      </div>

      <div key={shakeKey} style={{
        position: 'relative', padding: '20px 28px 0',
        animation: state.errorKind ? 'shake 440ms cubic-bezier(.36,.07,.19,.97)' : 'none',
      }}>
        <div style={{
          color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: -0.4,
          fontFamily: 'Inter, system-ui', marginBottom: 6,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 150ms backwards',
        }}>Bem-vindo</div>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 28,
          fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 220ms backwards',
        }}>Entre com sua conta para acessar o portal.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 300ms backwards' }}>
            <GlassInput
              label="E-mail corporativo"
              icon={Icons.mail}
              value={state.email}
              onChange={(v) => setState({ email: v, errorKind: null })}
              type="email" autoComplete="email" inputMode="email"
              error={state.errorKind === 'wrong'}
              disabled={isLocked}
            />
          </div>
          <div style={{ animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 380ms backwards' }}>
            <GlassInput
              label="Senha"
              icon={Icons.lock}
              value={state.password}
              onChange={(v) => setState({ password: v, errorKind: null })}
              type={showPw ? 'text' : 'password'} autoComplete="current-password"
              error={state.errorKind === 'wrong'}
              disabled={isLocked}
              trailing={
                <button onClick={() => setShowPw(s => !s)} style={{
                  width: 40, height: 40, borderRadius: 20, background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{showPw ? Icons.eyeOff : Icons.eye}</button>
              }
            />
          </div>
        </div>

        {/* Inline error — subtle, under the inputs, doesn't cover the logo */}
        <div style={{
          marginTop: 12, minHeight: 20,
          opacity: errorMsg ? 1 : 0,
          transform: errorMsg ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 240ms ease, transform 240ms ease',
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255, 190, 190, 0.95)',
          fontSize: 12.5, fontWeight: 500,
          fontFamily: 'Inter, system-ui',
        }}>
          {errorMsg && (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4v3.5M7 9.5v.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>{errorMsg}</span>
            </>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 24,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 460ms backwards',
        }}>
          <button onClick={() => go('forgot-email')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500,
            fontFamily: 'Inter, system-ui', padding: 4,
          }}>Esqueci minha senha</button>
        </div>

        <div style={{ animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 540ms backwards' }}>
          <PrimaryButton
            loading={state.loading}
            disabled={!state.email || !state.password || isLocked}
            onClick={() => submit()}>
            Entrar
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </PrimaryButton>
        </div>

      </div>

      <TermsFooter/>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Forgot — request email
// ─────────────────────────────────────────────────────────────
function ForgotEmailScreen({ ctrl }) {
  const { state, setState, go, submitForgot } = ctrl;
  return (
    <Screen keyName="forgot-email">
      <BlueBackdrop/>
      <div style={{ position: 'relative', padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => go('login')}/>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter, system-ui' }}>Passo 1 de 3</span>
      </div>

      <div style={{ position: 'relative', padding: '32px 28px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1)',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="6" width="20" height="16" rx="2"/><path d="M4 8l10 7 10-7"/>
          </svg>
        </div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginBottom: 8, animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 100ms backwards', fontFamily: 'Inter, system-ui' }}>Recuperar senha</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 28, lineHeight: 1.5, fontFamily: 'Inter, system-ui', animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 160ms backwards' }}>
          Digite o e-mail cadastrado. Enviaremos um código de 6 dígitos para você.
        </div>

        <div style={{ animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 220ms backwards' }}>
          <GlassInput
            label="E-mail corporativo" icon={Icons.mail}
            value={state.forgotEmail}
            onChange={(v) => setState({ forgotEmail: v })}
            type="email" inputMode="email"
          />
        </div>

        <div style={{ marginTop: 24, animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 280ms backwards' }}>
          <PrimaryButton
            loading={state.loading}
            disabled={!state.forgotEmail || !state.forgotEmail.includes('@')}
            onClick={() => submitForgot()}>
            Enviar código
          </PrimaryButton>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 20,
          color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 340ms backwards',
        }}>
          Lembrou?{' '}
          <button onClick={() => go('login')} style={{
            background: 'transparent', border: 'none', color: '#fff', fontWeight: 600,
            cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, system-ui',
          }}>Voltar ao login</button>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Forgot — 6-digit code
// ─────────────────────────────────────────────────────────────
function CodeInput({ value, onChange, error = false }) {
  const refs = React.useRef([]);
  const digits = (value || '').padEnd(6, ' ').split('').slice(0, 6);

  const setDigit = (i, d) => {
    const arr = digits.slice();
    arr[i] = d;
    const next = arr.join('').replace(/\s+$/, '');
    onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={d.trim()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            setDigit(i, v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d.trim() && i > 0) refs.current[i - 1]?.focus();
          }}
          style={{
            flex: 1, height: 60, minWidth: 0, textAlign: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
            fontFamily: 'Inter, system-ui',
            background: d.trim() ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
            border: `1.5px solid ${error ? 'rgba(255,120,120,0.7)' : d.trim() ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 12, outline: 'none',
            backdropFilter: 'blur(14px)',
            transition: 'all 160ms',
            caretColor: '#fff',
          }}
        />
      ))}
    </div>
  );
}

function ForgotCodeScreen({ ctrl }) {
  const { state, setState, go, submitCode, resend } = ctrl;
  const [cooldown, setCooldown] = React.useState(42);
  React.useEffect(() => {
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const [shakeKey, setShakeKey] = React.useState(0);
  React.useEffect(() => { if (state.codeError) setShakeKey(k => k + 1); }, [state.codeError]);

  return (
    <Screen keyName="forgot-code">
      <BlueBackdrop/>
      <div style={{ position: 'relative', padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => go('forgot-email')}/>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter, system-ui' }}>Passo 2 de 3</span>
      </div>

      <div style={{ position: 'relative', padding: '32px 28px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1)',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h2"/>
            <rect x="8" y="4" width="12" height="8" rx="2"/>
            <circle cx="14" cy="16" r="1.5" fill="#fff"/>
          </svg>
        </div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginBottom: 8, fontFamily: 'Inter, system-ui', animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 100ms backwards' }}>Verifique seu e-mail</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 28, lineHeight: 1.5, fontFamily: 'Inter, system-ui', animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 160ms backwards' }}>
          Enviamos um código para<br/><span style={{ color: '#fff', fontWeight: 600 }}>{state.forgotEmail || 'seu e-mail'}</span>
        </div>

        <div key={shakeKey} style={{ animation: state.codeError ? 'shake 440ms cubic-bezier(.36,.07,.19,.97)' : 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 220ms backwards' }}>
          <CodeInput value={state.code} onChange={(v) => setState({ code: v, codeError: false })} error={state.codeError}/>
        </div>

        {state.codeError && (
          <div style={{
            marginTop: 10, color: 'rgba(255,180,180,0.95)', fontSize: 12,
            fontFamily: 'Inter, system-ui', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v4M7 10v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Código inválido. Confira e tente novamente.
          </div>
        )}

        <div style={{ marginTop: 24, animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 280ms backwards' }}>
          <PrimaryButton
            loading={state.loading}
            disabled={!state.code || state.code.length < 6}
            onClick={() => submitCode()}>
            Verificar código
          </PrimaryButton>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 20,
          color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 340ms backwards',
        }}>
          {cooldown > 0 ? (
            <>Reenviar código em <span style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>0:{cooldown.toString().padStart(2, '0')}</span></>
          ) : (
            <button onClick={() => { resend(); setCooldown(42); }} style={{
              background: 'transparent', border: 'none', color: '#fff', fontWeight: 600,
              cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, system-ui',
            }}>Reenviar código</button>
          )}
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Forgot — new password
// ─────────────────────────────────────────────────────────────
function ForgotNewScreen({ ctrl }) {
  const { state, setState, go, submitNewPassword } = ctrl;
  const [showPw, setShowPw] = React.useState(false);
  const pw = state.newPassword || '';
  const checks = {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    upper: /[A-Z]/.test(pw),
    match: pw && pw === state.confirmPassword,
  };
  const allValid = checks.length && checks.number && checks.upper && checks.match;

  return (
    <Screen keyName="forgot-new">
      <BlueBackdrop/>
      <div style={{ position: 'relative', padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => go('forgot-code')}/>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter, system-ui' }}>Passo 3 de 3</span>
      </div>

      <div style={{ position: 'relative', padding: '32px 28px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1)',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="12" width="16" height="12" rx="2"/>
            <path d="M10 12V9a4 4 0 018 0v3"/>
            <circle cx="14" cy="18" r="1" fill="#fff"/>
          </svg>
        </div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginBottom: 8, fontFamily: 'Inter, system-ui', animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 100ms backwards' }}>Crie uma nova senha</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24, fontFamily: 'Inter, system-ui', animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 160ms backwards' }}>
          Escolha uma senha forte que você não usou antes.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 220ms backwards' }}>
          <GlassInput
            label="Nova senha" icon={Icons.lock}
            value={state.newPassword} onChange={(v) => setState({ newPassword: v })}
            type={showPw ? 'text' : 'password'}
            trailing={
              <button onClick={() => setShowPw(s => !s)} style={{
                width: 40, height: 40, borderRadius: 20, background: 'transparent',
                border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{showPw ? Icons.eyeOff : Icons.eye}</button>
            }
          />
          <GlassInput
            label="Confirmar senha" icon={Icons.lock}
            value={state.confirmPassword} onChange={(v) => setState({ confirmPassword: v })}
            type={showPw ? 'text' : 'password'}
          />
        </div>

        {/* Requirements */}
        <div style={{
          marginTop: 16, padding: '12px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 280ms backwards',
        }}>
          {[
            ['length', 'Mín. 8 caracteres'],
            ['number', 'Um número'],
            ['upper', 'Uma maiúscula'],
            ['match', 'Senhas iguais'],
          ].map(([k, label]) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontFamily: 'Inter, system-ui',
              color: checks[k] ? 'rgba(180,255,210,0.95)' : 'rgba(255,255,255,0.5)',
              transition: 'color 200ms',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 7,
                background: checks[k] ? 'rgba(72,187,120,0.9)' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${checks[k] ? 'transparent' : 'rgba(255,255,255,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 220ms',
              }}>
                {checks[k] && (
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              {label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 340ms backwards' }}>
          <PrimaryButton
            loading={state.loading}
            disabled={!allValid}
            onClick={() => submitNewPassword()}>
            Salvar nova senha
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Forgot — success
// ─────────────────────────────────────────────────────────────
function ForgotSuccessScreen({ ctrl }) {
  const { go } = ctrl;
  React.useEffect(() => {
    const t = setTimeout(() => go('login'), 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen keyName="forgot-success">
      <BlueBackdrop/>
      <div style={{
        position: 'relative', flex: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
      }}>
        {/* Check circle */}
        <div style={{
          width: 96, height: 96, borderRadius: 48,
          background: 'rgba(72,187,120,0.18)', border: '1.5px solid rgba(72,187,120,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1)',
          boxShadow: '0 0 60px rgba(72,187,120,0.35)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M14 24l7 7 14-14" stroke="rgba(180,255,210,1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 44, strokeDashoffset: 44, animation: 'checkDraw 600ms cubic-bezier(.2,.8,.2,1) 200ms forwards' }}/>
          </svg>
        </div>
        <div style={{
          color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginBottom: 10,
          textAlign: 'center', fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 250ms backwards',
        }}>Senha atualizada</div>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
          lineHeight: 1.5, maxWidth: 280, fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 320ms backwards',
        }}>
          Sua senha foi redefinida com segurança.<br/>Você já pode acessar o portal.
        </div>

        <div style={{
          marginTop: 40, width: '100%', maxWidth: 320,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 400ms backwards',
        }}>
          <PrimaryButton onClick={() => go('login')}>Voltar ao login</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Login success — confirmation
// ─────────────────────────────────────────────────────────────
function LoginSuccessScreen({ ctrl }) {
  return (
    <Screen keyName="login-success">
      <BlueBackdrop/>
      <div style={{
        position: 'relative', flex: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 48,
          background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1)',
          boxShadow: '0 0 60px rgba(255,255,255,0.15)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M14 24l7 7 14-14" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 44, strokeDashoffset: 44, animation: 'checkDraw 600ms cubic-bezier(.2,.8,.2,1) 200ms forwards' }}/>
          </svg>
        </div>
        <div style={{
          color: '#fff', fontSize: 24, fontWeight: 700, letterSpacing: -0.3, marginBottom: 8,
          textAlign: 'center', fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 250ms backwards',
        }}>Olá, Rafael</div>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
          fontFamily: 'Inter, system-ui',
          animation: 'slideUp 500ms cubic-bezier(.2,.8,.2,1) 320ms backwards',
        }}>Carregando sua área de trabalho…</div>
      </div>
    </Screen>
  );
}

Object.assign(window, {
  BlueBackdrop, Screen, TermsFooter,
  SplashScreen, LoginScreen,
  ForgotEmailScreen, ForgotCodeScreen, ForgotNewScreen, ForgotSuccessScreen,
  LoginSuccessScreen,
});
