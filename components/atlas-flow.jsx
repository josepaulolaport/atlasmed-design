// AtlasFlow — controller + router. Owns state, routes between screens,
// simulates network calls. A single instance drives BOTH device frames
// (iOS + Android) in lockstep so demo viewers see the same flow.

const DEMO_ACCOUNT = { email: 'rafael.melo@atlasmed.com', password: 'Atlas2026' };

function useAtlasController({ initialScreen = 'splash', scenario = 'happy' } = {}) {
  const [screen, setScreen] = React.useState(initialScreen);
  const [state, _setState] = React.useState({
    email: scenario === 'happy' ? '' : 'rafael.melo@atlasmed.com',
    password: '',
    errorKind: null,
    loading: false,
    forgotEmail: '',
    code: '',
    codeError: false,
    newPassword: '',
    confirmPassword: '',
    attempts: 0,
  });

  const setState = (patch) => _setState((s) => ({ ...s, ...patch }));
  const go = (to) => setScreen(to);

  // Simulate login submit
  const submit = async (bioKind = null) => {
    setState({ loading: true, errorKind: null });
    await new Promise((r) => setTimeout(r, 900));

    if (bioKind) {
      setState({ loading: false });
      setScreen('login-success');
      return;
    }

    const nextAttempts = state.attempts + 1;

    if (scenario === 'wrong') {
      setState({ loading: false, errorKind: 'wrong', attempts: nextAttempts });
      return;
    }
    if (scenario === 'locked') {
      setState({ loading: false, errorKind: 'locked', attempts: nextAttempts });
      return;
    }
    if (scenario === 'network') {
      setState({ loading: false, errorKind: 'network', attempts: nextAttempts });
      return;
    }

    // happy path
    const ok = state.email === DEMO_ACCOUNT.email && state.password === DEMO_ACCOUNT.password;
    if (!ok) {
      if (nextAttempts >= 4) {
        setState({ loading: false, errorKind: 'locked', attempts: nextAttempts });
      } else {
        setState({ loading: false, errorKind: 'wrong', attempts: nextAttempts });
      }
      return;
    }
    setState({ loading: false });
    setScreen('login-success');
  };

  const submitForgot = async () => {
    setState({ loading: true });
    await new Promise((r) => setTimeout(r, 700));
    setState({ loading: false });
    setScreen('forgot-code');
  };

  const submitCode = async () => {
    setState({ loading: true, codeError: false });
    await new Promise((r) => setTimeout(r, 700));
    if (state.code === '123456' || state.code.length === 6) {
      setState({ loading: false });
      setScreen('forgot-new');
    } else {
      setState({ loading: false, codeError: true });
    }
  };

  const submitNewPassword = async () => {
    setState({ loading: true });
    await new Promise((r) => setTimeout(r, 900));
    setState({ loading: false });
    setScreen('forgot-success');
  };

  const resend = () => {};

  return { screen, state, setState, go, submit, submitForgot, submitCode, submitNewPassword, resend };
}

// Render one screen
function AtlasFlowScreen({ ctrl }) {
  const s = ctrl.screen;
  if (s === 'splash') return <SplashScreen onDone={() => ctrl.go('login')}/>;
  if (s === 'login') return <LoginScreen ctrl={ctrl}/>;
  if (s === 'forgot-email') return <ForgotEmailScreen ctrl={ctrl}/>;
  if (s === 'forgot-code') return <ForgotCodeScreen ctrl={ctrl}/>;
  if (s === 'forgot-new') return <ForgotNewScreen ctrl={ctrl}/>;
  if (s === 'forgot-success') return <ForgotSuccessScreen ctrl={ctrl}/>;
  if (s === 'login-success') return <LoginSuccessScreen ctrl={ctrl}/>;
  return null;
}

// Dual-device view: iOS + Android side by side with shared controller
function AtlasFlowPair({ initialScreen = 'splash', scenario = 'happy', scale = 1 }) {
  const ctrl = useAtlasController({ initialScreen, scenario });
  return (
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <IOSDevice width={390} height={844}>
          <AtlasFlowScreen ctrl={ctrl}/>
        </IOSDevice>
      </div>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <AndroidDevice width={390} height={844}>
          <AtlasFlowScreen ctrl={ctrl}/>
        </AndroidDevice>
      </div>
    </div>
  );
}

// Single device, for focus view. Accepts platform prop.
function AtlasFlowSingle({ platform = 'ios', initialScreen = 'login', scenario = 'happy' }) {
  const ctrl = useAtlasController({ initialScreen, scenario });
  const Frame = platform === 'ios' ? IOSDevice : AndroidDevice;
  return (
    <Frame width={390} height={844}>
      <AtlasFlowScreen ctrl={ctrl}/>
    </Frame>
  );
}

Object.assign(window, { useAtlasController, AtlasFlowScreen, AtlasFlowPair, AtlasFlowSingle, DEMO_ACCOUNT });
