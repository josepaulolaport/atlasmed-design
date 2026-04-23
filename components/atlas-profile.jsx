// Perfil (Profile) screen — Atlasmed design system.
// Personal overview: identity, território, resumo rápido, preferências,
// atividade recente, suporte e sair. Intentionally not a dashboard.

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PROFILE_USER = {
  name: 'Rafael Melo',
  initials: 'RM',
  role: 'Representante Comercial',
  region: 'São Paulo · Zona Oeste',
  email: 'rafael.melo@atlasmed.com',
  phone: '+55 11 98412-5520',
  since: 'Desde março de 2024',
};

const TERRITORY_STATS = {
  clinics: 127,
  doctors: 48,
  coveragePct: 42,
  coverageWeek: 'esta semana',
  visitedThisWeek: 53,
};

const QUICK_SUMMARY = {
  visits:    { value: 18, label: 'Visitas',    sub: 'esta semana' },
  followups: { value: 7,  label: 'Follow-ups', sub: 'pendentes' },
  conversion: { value: '34%', label: 'Conversão', sub: 'este mês' },
};

const RECENT_ACTIVITY = [
  { kind: 'visit',    title: 'Visita registrada',     detail: 'Clínica Santa Mônica',        when: 'há 2 h' },
  { kind: 'followup', title: 'Follow-up concluído',   detail: 'Dr. Paulo Cardoso',           when: 'ontem' },
  { kind: 'order',    title: 'Pedido enviado',         detail: 'PED-2041 · Santa Mônica',    when: 'ontem' },
  { kind: 'download', title: 'Apresentação baixada',   detail: 'Portfólio de Produtos Q2',    when: 'ter, 21 abr' },
];

const DEFAULT_PREFS = {
  followupAlerts:   true,
  nearbyOpportun:   true,
  weekendSilence:   false,
  wifiOnlyDownload: true,
  workHours:        '08:00 – 18:00',
  workDays:         'Seg a Sex',
};

// ─── Small building blocks ───────────────────────────────────────────────────

function ProfileAvatar({ initials = 'RM', size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0a2f7f 0%, #1e40af 45%, #16a373 115%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.36, fontWeight: 700, letterSpacing: -0.5,
      boxShadow: '0 6px 20px rgba(10,47,127,0.22), 0 0 0 3px rgba(255,255,255,0.8)',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function ProfileToggle({ on, accent = '#0a2f7f' }) {
  return (
    <div style={{
      width: 38, height: 22, borderRadius: 11,
      background: on ? accent : '#d9dde4',
      position: 'relative', transition: 'background 200ms',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        transition: 'left 200ms',
      }}/>
    </div>
  );
}

function ProfileChevron({ color = '#c4c9d2' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4"/>
    </svg>
  );
}

function SectionHeader({ title, action, actionOnClick }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2px 10px',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: '#374151',
        letterSpacing: 0.6, textTransform: 'uppercase',
      }}>{title}</span>
      {action && (
        <button onClick={actionOnClick} style={{
          border: 'none', background: 'transparent', color: '#0a2f7f',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 3, padding: 0,
        }}>
          {action}
          <ProfileChevron color="#0a2f7f"/>
        </button>
      )}
    </div>
  );
}

function ActivityIcon({ kind }) {
  const map = {
    visit:    { bg: 'rgba(10,47,127,0.08)',  color: '#0a2f7f', path: 'M7 1a4 4 0 0 0-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-4-4z M7 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z' },
    followup: { bg: 'rgba(22,163,115,0.10)', color: '#16a373', path: 'M2 7.5l3 3 7-7' },
    order:    { bg: 'rgba(198,134,27,0.12)', color: '#b07a10', path: 'M2 3h2l1.5 7h7l1.5-5H4 M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M11 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    download: { bg: 'rgba(30,64,175,0.10)',  color: '#1e40af', path: 'M7 2v8 M4 7l3 3 3-3 M2 13h10' },
  };
  const m = map[kind] || map.visit;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: m.bg, color: m.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={m.path}/>
      </svg>
    </div>
  );
}

// ─── Território · map preview ────────────────────────────────────────────────
function TerritoryMapPreview({ height = 150 }) {
  return (
    <div style={{
      width: '100%', height, borderRadius: 12, overflow: 'hidden',
      background: '#e9eef1', position: 'relative',
      border: '1px solid #eef0f3',
    }}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="tp-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef3f6"/>
            <stop offset="1" stopColor="#dce4ea"/>
          </linearGradient>
          <pattern id="tp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(10,47,127,0.14)" strokeWidth="1.2"/>
          </pattern>
        </defs>
        <rect width="360" height="150" fill="url(#tp-bg)"/>

        {/* Rivers / parks */}
        <path d="M-5 125 C 60 115, 140 135, 220 118 S 340 100, 370 110 L 370 160 L -5 160 Z"
              fill="rgba(22,163,115,0.10)"/>

        {/* Secondary streets (subtle grid) */}
        <g stroke="#e6ebef" strokeWidth="0.6" fill="none">
          <path d="M-5 25 H 370 M-5 55 H 370 M-5 95 H 370"/>
          <path d="M30 -5 V 160 M80 -5 V 160 M140 -5 V 160 M195 -5 V 160 M255 -5 V 160 M320 -5 V 160"/>
        </g>
        {/* Primary streets */}
        <g stroke="#cbd3d9" strokeWidth="1.2" fill="none">
          <path d="M-5 72 H 370"/>
          <path d="M165 -5 V 160"/>
          <path d="M-5 35 C 80 35, 120 50, 200 45 S 330 55, 370 48"/>
        </g>

        {/* Assigned region polygon */}
        <polygon
          points="60,28 120,18 190,30 225,52 228,95 190,122 130,122 78,108 48,78"
          fill="url(#tp-hatch)"
        />
        <polygon
          points="60,28 120,18 190,30 225,52 228,95 190,122 130,122 78,108 48,78"
          fill="rgba(10,47,127,0.18)"
          stroke="#0a2f7f" strokeWidth="2" strokeLinejoin="round"
        />

        {/* Clinic pins */}
        {[
          [90, 45],[130, 55],[170, 42],[150, 78],[105, 82],[185, 88],[115, 105],[180, 110]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#0a2f7f" opacity="0.55"/>
        ))}

        {/* Salesman location */}
        <g transform="translate(142,68)">
          <circle r="14" fill="rgba(22,163,115,0.18)"/>
          <circle r="7" fill="#16a373" stroke="#fff" strokeWidth="2"/>
        </g>
      </svg>

      {/* Top-left floating label */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        padding: '4px 9px', borderRadius: 14,
        background: 'rgba(255,255,255,0.92)',
        fontSize: 10.5, fontWeight: 700, color: '#0a2f7f',
        letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0a2f7f' }}/>
        São Paulo · Zona Oeste
      </div>

      {/* Bottom-right "expand" hint */}
      <button style={{
        position: 'absolute', bottom: 10, right: 10,
        width: 30, height: 30, borderRadius: 9,
        background: '#fff', border: '1px solid #eef0f3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5V2h3 M8 2h3v3 M11 8v3H8 M5 11H2V8"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Main Profile Screen ─────────────────────────────────────────────────────
function ProfileScreen({ prefs = DEFAULT_PREFS, logoutConfirm = false }) {
  const u = PROFILE_USER;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#f7f8fb',
      fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <AtlasTopBar page="Perfil" active="perfil"/>

      {/* ── Header · identity ────────────────────────────────────── */}
      <div style={{
        padding: '18px 20px 24px',
        background: 'linear-gradient(180deg, rgba(10,47,127,0.07) 0%, rgba(10,47,127,0.02) 60%, transparent 100%)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          marginBottom: 14,
        }}>
          <button aria-label="editar" style={{
            width: 34, height: 34, borderRadius: 10,
            background: '#fff', border: '1px solid #eef0f3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#374151',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 1.5l3 3-8 8H2.5v-3z"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ProfileAvatar initials={u.initials} size={66}/>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 19, fontWeight: 700, color: '#1f2937',
              letterSpacing: -0.4, lineHeight: 1.2,
            }}>{u.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              {u.role}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 8, padding: '3px 9px', borderRadius: 20,
              background: 'rgba(10,47,127,0.08)', color: '#0a2f7f',
              fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 0.5A3.5 3.5 0 0 0 1.5 4c0 2.5 3.5 5.5 3.5 5.5s3.5-3 3.5-5.5A3.5 3.5 0 0 0 5 0.5z"/>
                <circle cx="5" cy="4" r="1.2"/>
              </svg>
              {u.region}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '4px 16px 28px' }}>

        {/* Território */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Território" action="Abrir mapa"/>
          <div style={{
            background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
            padding: 10, overflow: 'hidden',
          }}>
            <TerritoryMapPreview height={150}/>

            {/* Stats row */}
            <div style={{ display: 'flex', padding: '12px 4px 4px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>{TERRITORY_STATS.clinics}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 1 }}>clínicas</div>
              </div>
              <div style={{ width: 1, background: '#f1f3f6', margin: '4px 0' }}/>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>{TERRITORY_STATS.doctors}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 1 }}>médicos</div>
              </div>
              <div style={{ width: 1, background: '#f1f3f6', margin: '4px 0' }}/>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#16a373' }}>{TERRITORY_STATS.coveragePct}%</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 1 }}>cobertura</div>
              </div>
            </div>

            {/* Coverage text + bar */}
            <div style={{ padding: '10px 6px 4px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  Você cobriu <b style={{ color: '#16a373', fontWeight: 700 }}>42%</b> da sua região
                </span>
                <span style={{ fontSize: 10.5, color: '#9ca3af' }}>esta semana</span>
              </div>
              <div style={{
                height: 5, borderRadius: 3, background: '#eef0f3',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${TERRITORY_STATS.coveragePct}%`,
                  background: 'linear-gradient(90deg, #16a373 0%, #14b680 100%)',
                  borderRadius: 3,
                }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo rápido */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Resumo rápido"/>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { ...QUICK_SUMMARY.visits,    color: '#0a2f7f' },
              { ...QUICK_SUMMARY.followups, color: '#c6861b' },
              { ...QUICK_SUMMARY.conversion, color: '#16a373' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: '#fff',
                border: '1px solid #eef0f3', borderRadius: 14,
                padding: '14px 12px',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: -0.5 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginTop: 7 }}>{s.label}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferências */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Preferências"/>
          <div style={{
            background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
            overflow: 'hidden',
          }}>
            {[
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 5.5a4 4 0 0 1 8 0v3l1 2H2l1-2z M5.5 12a1.5 1.5 0 0 0 3 0"/>
                  </svg>
                ),
                label: 'Alertas de follow-up',
                sub: 'Lembretes por proximidade e data',
                trailing: <ProfileToggle on={prefs.followupAlerts}/>,
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 1v1.5 M7 11.5V13 M13 7h-1.5 M2.5 7H1 M11.2 2.8L10.2 3.9 M3.8 10.2L2.7 11.2 M11.2 11.2L10.2 10.2 M3.8 3.8L2.7 2.7"/>
                    <circle cx="7" cy="7" r="2.7"/>
                  </svg>
                ),
                label: 'Oportunidades próximas',
                sub: 'Avisar quando estiver perto de clínicas sugeridas',
                trailing: <ProfileToggle on={prefs.nearbyOpportun}/>,
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="7" r="5.5"/>
                    <path d="M7 3.5V7l2.5 1.5"/>
                  </svg>
                ),
                label: 'Horário de trabalho',
                sub: `${prefs.workDays} · ${prefs.workHours}`,
                trailing: <ProfileChevron/>,
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 9a5 5 0 0 1 10-3.5 3 3 0 0 1 2 5H4a3 3 0 0 1-3-1.5z"/>
                  </svg>
                ),
                label: 'Download só em Wi-Fi',
                sub: 'Apresentações grandes aguardam Wi-Fi',
                trailing: <ProfileToggle on={prefs.wifiOnlyDownload}/>,
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="7" r="5.5"/>
                    <path d="M1.5 7h11 M7 1.5c1.8 2 1.8 9 0 11 M7 1.5c-1.8 2-1.8 9 0 11"/>
                  </svg>
                ),
                label: 'Idioma',
                sub: 'Português (Brasil)',
                trailing: <ProfileChevron/>,
              },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid #f1f3f6',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'rgba(10,47,127,0.07)', color: '#0a2f7f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{row.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>{row.label}</div>
                  {row.sub && (
                    <div style={{
                      fontSize: 11.5, color: '#9ca3af', marginTop: 2, lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{row.sub}</div>
                  )}
                </div>
                {row.trailing}
              </div>
            ))}
          </div>
        </div>

        {/* Atividade recente */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Atividade recente" action="Ver tudo"/>
          <div style={{
            background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
            overflow: 'hidden',
          }}>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid #f1f3f6',
              }}>
                <ActivityIcon kind={a.kind}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#1f2937', fontWeight: 500 }}>{a.title}</div>
                  <div style={{
                    fontSize: 11.5, color: '#9ca3af', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{a.detail}</div>
                </div>
                <span style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500, flexShrink: 0 }}>
                  {a.when}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suporte & Conta */}
        <div style={{ marginBottom: 12 }}>
          <SectionHeader title="Suporte & conta"/>
          <div style={{
            background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
            overflow: 'hidden',
          }}>
            {[
              {
                label: 'Central de ajuda',
                sub: 'Tutoriais, perguntas frequentes',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="7" r="5.5"/>
                    <path d="M5 5.5a2 2 0 1 1 3 1.7c-.6.3-1 .8-1 1.5 M7 11v.01"/>
                  </svg>
                ),
              },
              {
                label: 'Falar com o suporte',
                sub: 'Resposta em até 4 h úteis',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 3h9a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H8l-2.5 2v-2h-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                  </svg>
                ),
              },
              {
                label: 'Termos e privacidade',
                sub: null,
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 1.5h6l3 3V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z"/>
                    <path d="M9 1.5v3h3 M4.5 7.5h5 M4.5 10h3.5"/>
                  </svg>
                ),
              },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid #f1f3f6',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'rgba(10,47,127,0.07)', color: '#0a2f7f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{row.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>{row.label}</div>
                  {row.sub && (
                    <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{row.sub}</div>
                  )}
                </div>
                <ProfileChevron/>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button style={{
          width: '100%', marginTop: 4,
          background: '#fff', border: '1px solid rgba(184,69,69,0.22)',
          borderRadius: 14, padding: '14px',
          color: '#b84545', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'inherit',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3 M10 10.5l3-3-3-3 M13 7.5H6"/>
          </svg>
          Sair da conta
        </button>

        {/* Footer · version */}
        <div style={{
          textAlign: 'center', marginTop: 18, padding: '4px 0',
          fontSize: 10.5, color: '#c4c9d2', letterSpacing: 0.3,
        }}>
          Atlasmed · v2.6.1 · {u.since}
        </div>
      </div>

      {/* ── Logout confirmation sheet ───────────────────────────── */}
      {logoutConfirm && (
        <>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(24,20,16,0.45)',
            backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
          }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '12px 20px 28px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{
              width: 36, height: 4, borderRadius: 2, background: '#e5e7eb',
              margin: '0 auto 18px',
            }}/>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'rgba(184,69,69,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#b84545" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 3h4 M15 15.5l4.5-4.5L15 6.5 M19.5 11H9"/>
              </svg>
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, color: '#1f2937',
              textAlign: 'center', letterSpacing: -0.3,
            }}>Sair da conta?</div>
            <div style={{
              fontSize: 13, color: '#6b7280', textAlign: 'center',
              lineHeight: 1.5, marginTop: 6, padding: '0 8px',
            }}>
              Você precisará fazer login novamente para<br/>acessar seus pedidos, visitas e rotas.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              <button style={{
                width: '100%', height: 48, borderRadius: 12,
                background: '#b84545', color: '#fff', border: 'none',
                fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Sair</button>
              <button style={{
                width: '100%', height: 48, borderRadius: 12,
                background: 'transparent', color: '#374151',
                border: '1px solid #eef0f3',
                fontSize: 14.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  PROFILE_USER, TERRITORY_STATS, QUICK_SUMMARY, RECENT_ACTIVITY, DEFAULT_PREFS,
  ProfileAvatar, ProfileToggle, ProfileChevron, TerritoryMapPreview,
  ProfileScreen,
});
