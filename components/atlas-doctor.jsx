// DoctorDetail — full doctor profile. Mirrors the structure of ClinicDetail
// but centered on a person: personal info, prescribing behaviour, visit history,
// clinics where they attend, and field notes.

const DOCTOR_DETAIL = {
  id: 'd-0',
  name: 'Dra. Mariana Silva',
  initials: 'MS',
  hue: 12,
  specialty: 'Ortopedia',
  crm: 'CRM/SP 142.801',
  role: 'Decisora · Ortopedia',
  distance: 2.3,
  phone: '(11) 98844-2107',
  email: 'mariana.silva@santamonica.com.br',
  whatsapp: '',
  birthday: '14 de junho · 48 anos',
  faculty: 'USP — Medicina · 2008',
  residency: 'Residência HCFMUSP · Ortopedia (2012)',
  team: 'Palmeiras',
  interests: 'Corrida de rua · vinho tinto · cozinha italiana',
  language: 'Português · Inglês',
  status: { label: 'Decisora', color: '#1e40af', bg: 'rgba(30,64,175,0.12)' },
  relationship: { label: 'Aberta', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },

  // Photos — doctor profile picture + extras (crachá, recentemente encontrada em evento etc)
  photo: { hue: 12, placeholder: 'foto perfil' },
  gallery: [
    { label: 'Perfil', date: 'jan/2026', hue: 12, placeholder: 'perfil' },
    { label: 'Cartão de visita', date: 'jan/2026', hue: 218, placeholder: 'cartão' },
    { label: 'Congresso SBOT', date: 'out/2025', hue: 148, placeholder: 'congresso' },
  ],

  signals: [
    { kind: 'good', title: 'Crescimento na prescrição de AtlasGel', body: '+38% nos últimos 90 dias. Reforçar com material de evidências.' },
    { kind: 'info', title: 'Aniversário em 54 dias', body: '14 de junho. Enviar mensagem personalizada e garrafa de vinho.' },
    { kind: 'warn', title: 'Não recebe ligação às segundas', body: 'Preferência anotada na visita de 12/fev.' },
  ],

  prescribing: [
    { product: 'AtlasGel', volume: 'R$ 84.200', trend: [22, 24, 30, 34, 38, 42], growth: +38, share: 72 },
    { product: 'OrtoPlus', volume: 'R$ 12.100', trend: [2, 3, 4, 5, 6, 8], growth: +120, share: 18, new: true },
    { product: 'CardioFlex', volume: 'R$ 4.800', trend: [6, 5, 4, 3, 2, 2], growth: -55, share: 10 },
  ],

  clinics: [
    { id: 'c-0', name: 'Clínica Santa Mônica', role: 'Principal · 3 dias/sem', days: 'Ter · Qui · Sex', isMain: true, statusColor: '#16a373' },
    { id: 'c-14', name: 'Centro Médico OrtoVita', role: 'Secundária · 1 dia/sem', days: 'Quartas', statusColor: '#16a373' },
    { id: 'c-88', name: 'Hospital Sírio-Libanês', role: 'Cirurgias · agenda fechada', days: 'Segundas', statusColor: '#707079' },
  ],

  visits: [
    {
      date: '17/abr · qui',
      time: '14h30', duration: '42 min',
      consultant: 'Rafael Melo', consultantHue: 220, consultantInitials: 'RM',
      kind: 'Reunião agendada',
      location: 'Clínica Santa Mônica',
      note: 'Apresentei o novo AtlasGel 240g. Muito receptiva — pediu amostras para 5 pacientes e material impresso. Falou dos próximos congressos.',
      outcome: 'positivo',
      orderValue: null,
      samples: ['AtlasGel 240g · 5un'],
    },
    {
      date: '14/mar · sex',
      time: '16h10', duration: '55 min',
      consultant: 'Rafael Melo', consultantHue: 220, consultantInitials: 'RM',
      kind: 'Fechamento de pedido',
      location: 'Clínica Santa Mônica',
      note: 'Fechou pedido de R$ 4.120. Reclamou do atraso da entrega anterior.',
      outcome: 'misto',
      orderValue: 'R$ 4.120',
      samples: null,
    },
    {
      date: '12/fev · qua',
      time: '14h00', duration: '1h 12min',
      consultant: 'Rafael Melo', consultantHue: 220, consultantInitials: 'RM',
      kind: 'Follow-up feira',
      location: 'Clínica Santa Mônica',
      note: 'Follow-up do SBOT 2025. Interessada em trial do OrtoPlus — não fechou por limite do mês. Anotação: prefere reuniões de manhã, evita segundas.',
      outcome: 'positivo',
      orderValue: null,
      samples: ['OrtoPlus · trial'],
    },
    {
      date: '08/jan · qua',
      time: '10h40', duration: '35 min',
      consultant: 'Rafael Melo', consultantHue: 220, consultantInitials: 'RM',
      kind: 'Visita institucional',
      location: 'Centro Médico OrtoVita',
      note: 'Encontro breve na OrtoVita. Agradeceu material enviado. Mencionou que Dra. Helena Ferreira chegará em março.',
      outcome: 'neutro',
      orderValue: null,
      samples: null,
    },
    {
      date: '19/dez · qui',
      time: '10h00', duration: '47 min',
      consultant: 'Rafael Melo', consultantHue: 220, consultantInitials: 'RM',
      kind: 'Reunião agendada',
      location: 'Clínica Santa Mônica',
      note: 'Planejamento do Q1. Sinalizou aumento de 20% no volume de AtlasGel.',
      outcome: 'positivo',
      orderValue: null,
      samples: null,
    },
  ],

  notes: [
    'Prefere reuniões de manhã. Evita segundas.',
    'Filha caçula joga vôlei profissional — sempre perguntar.',
    'É da banca do SBOT — bom canal para abrir congressos.',
    'Adora vinho italiano (Amarone). Evitar chocolate amargo (alergia leve).',
  ],
};

// ─────────────────────────────────────────────────────────────
// Header — similar to clinic but avatar-centric
// ─────────────────────────────────────────────────────────────
function DoctorHeader({ doctor, onBack }) {
  return (
    <div style={{
      position: 'relative',
      background: `linear-gradient(165deg, hsl(${doctor.hue}, 58%, 24%) 0%, hsl(${doctor.hue}, 52%, 38%) 70%, hsl(${doctor.hue}, 48%, 48%) 110%)`,
      color: '#fff',
      padding: '14px 16px 22px',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110,
        background: `radial-gradient(circle, hsla(${doctor.hue}, 80%, 85%, 0.35) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(255,255,255,0.22)',
            background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* avatar */}
        <div style={{
          width: 76, height: 76, borderRadius: 38, flexShrink: 0, position: 'relative', overflow: 'hidden',
          border: '3px solid rgba(255,255,255,0.9)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
          background: `hsl(${doctor.hue}, 45%, 72%)`,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 76 76" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id={`docstripes-${doctor.hue}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <rect width="8" height="8" fill={`hsl(${doctor.hue}, 45%, 72%)`}/>
                <rect width="4" height="8" fill={`hsl(${doctor.hue}, 50%, 65%)`}/>
              </pattern>
            </defs>
            <rect width="76" height="76" fill={`url(#docstripes-${doctor.hue})`}/>
            <circle cx="38" cy="38" r="22" fill={`hsl(${doctor.hue}, 50%, 92%)`} fillOpacity="0.9"/>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, letterSpacing: -0.5,
            color: `hsl(${doctor.hue}, 60%, 22%)`,
          }}>{doctor.initials}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.28)',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, marginBottom: 8,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff' }}/>
            {doctor.status.label} · {doctor.specialty}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 4 }}>{doctor.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', fontVariantNumeric: 'tabular-nums' }}>{doctor.crm}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>{doctor.residency}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick actions — call, whatsapp, e-mail, nova visita, novo pedido
// ─────────────────────────────────────────────────────────────
function DoctorQuickActions({ doctor }) {
  const actions = [
    { k: 'call', label: 'Ligar' },
    { k: 'wa',   label: 'WhatsApp' },
    { k: 'mail', label: 'E-mail' },
    { k: 'visit',label: 'Nova visita' },
  ];
  const icons = {
    call:  <path d="M15 12.5v2.2a1.5 1.5 0 01-1.6 1.5c-2.3-.2-4.5-1-6.3-2.4a13 13 0 01-4-4A13 13 0 011 3.6 1.5 1.5 0 012.5 2H5l1.4 3.3L5 6.5a9 9 0 004 4l1.2-1.4L13.5 10l1.5 2.5z"/>,
    wa:    <path d="M15.5 9a6.5 6.5 0 01-9.6 5.7L2 16l1.3-3.8A6.5 6.5 0 1115.5 9zM6 7.5c.5 2 2 3.5 4 4 .5 0 1-.3 1.3-.7l.5-.6c.3-.3.7-.4 1-.2l1 .5c.4.2.5.7.3 1-.5 1-1.6 1.5-2.7 1.4a7.5 7.5 0 01-6-6c-.1-1 .4-2.2 1.4-2.7.3-.2.8-.1 1 .3l.5 1c.2.3.1.7-.2 1l-.6.5c-.4.3-.5.8-.5 1.2z"/>,
    mail:  <><rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M2 5l7 5 7-5"/></>,
    visit: <><rect x="2.5" y="4" width="13" height="11" rx="2"/><path d="M2.5 7h13M6 2.5v3M12 2.5v3M9 9v4M7 11h4"/></>,
  };
  return (
    <div style={{
      margin: '-14px 16px 0', position: 'relative', zIndex: 2,
      padding: '10px 6px',
      background: '#fff',
      border: '1px solid #edeff3',
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(15,23,41,0.08)',
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'Inter, system-ui',
    }}>
      {actions.map(a => (
        <button key={a.k} style={{
          flex: 1, border: 'none', background: 'transparent',
          padding: '4px 0', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          color: `hsl(${doctor.hue}, 55%, 30%)`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: `hsl(${doctor.hue}, 60%, 94%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {icons[a.k]}
            </svg>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.1 }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Personal info card
// ─────────────────────────────────────────────────────────────
function DoctorPersonalCard({ doctor }) {
  const rows = [
    { icon: '🎓', label: 'Formação',   value: doctor.faculty },
    { icon: '🏥', label: 'Residência', value: doctor.residency },
    { icon: '🎂', label: 'Aniversário', value: doctor.birthday },
    { icon: '⚽', label: 'Time',        value: doctor.team },
    { icon: '♡',  label: 'Interesses',  value: doctor.interests },
    { icon: '🗣',  label: 'Idiomas',    value: doctor.language },
  ];
  const contacts = [
    { label: 'Telefone', value: doctor.phone, mono: true },
    { label: 'WhatsApp', value: doctor.whatsapp, mono: true },
    { label: 'E-mail',   value: doctor.email },
  ];
  return (
    <CCard style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a94a6' }}>Pessoal</div>
        <div style={{ flex: 1, height: 1, background: '#eef0f3' }}/>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#1e40af', fontSize: 11.5, fontWeight: 600, padding: 0,
          fontFamily: 'Inter, system-ui',
        }}>
          <PencilIcon size={11}/> Sugerir edição
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 10, columnGap: 12 }}>
        {rows.map(r => {
          const empty = !r.value || r.value === '—' || r.value === '-';
          return (
            <div key={r.label} style={{ minWidth: 0, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, lineHeight: 1, marginTop: 2 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#8a94a6', marginBottom: 2 }}>{r.label}</div>
                {empty ? (
                  <EmptyChip/>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%' }}>
                    <span style={{
                      fontSize: 12, color: '#0f1729', fontWeight: 500, lineHeight: 1.35,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{r.value}</span>
                    <EditPencilButton/>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 1, background: '#eef0f3', margin: '14px -16px 12px' }}/>

      {/* contact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Inter, system-ui' }}>
        {contacts.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#8a94a6', width: 68, flexShrink: 0 }}>{c.label}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#0f1729' }}>
              <Editable value={c.value} mono={c.mono}/>
            </div>
          </div>
        ))}
      </div>
    </CCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Clinics where they work
// ─────────────────────────────────────────────────────────────
function DoctorClinics({ clinics }) {
  return (
    <>
      <CSectionHeader title={`Clínicas · ${clinics.length}`} subtitle="onde atende"/>
      <CCard>
        {clinics.map((c, i) => (
          <button key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', width: '100%', textAlign: 'left',
            background: 'transparent', border: 'none',
            borderTop: i > 0 ? '1px solid #eef0f3' : 'none',
            cursor: 'pointer', fontFamily: 'Inter, system-ui',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: c.isMain ? '#eef2ff' : '#f3f4f6',
              color: c.isMain ? '#1e40af' : '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="12" height="9" rx="1"/><path d="M6 5V3h4v2M8 8v3M6.5 9.5h3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                {c.isMain && <span style={{ padding: '1px 6px', borderRadius: 999, background: 'rgba(30,64,175,0.10)', color: '#1e40af', fontSize: 9, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>principal</span>}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{c.role} · {c.days}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l4 4-4 4"/>
            </svg>
          </button>
        ))}
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Prescribing — riff of ClinicProducts but labelled "Prescrição"
// ─────────────────────────────────────────────────────────────
function DoctorPrescribing({ items }) {
  return (
    <>
      <CSectionHeader title="Prescrição · 6 meses" subtitle="volume atribuído a esta médica" action="Ver todos"/>
      <CCard>
        {items.map((p, i) => {
          const max = Math.max(...p.trend);
          const positive = p.growth >= 0;
          return (
            <React.Fragment key={p.product}>
              {i > 0 && <div style={{ height: 1, background: '#eef0f3', margin: '0 -16px' }}/>}
              <div style={{ padding: '12px 0', fontFamily: 'Inter, system-ui' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1729', letterSpacing: -0.1 }}>{p.product}</span>
                    {p.new && <span style={{ padding: '1px 6px', borderRadius: 999, background: 'rgba(22,163,115,0.10)', color: '#117a55', fontSize: 9, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>novo</span>}
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{p.volume}</span>
                  </div>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: positive ? '#117a55' : '#b84545',
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    {positive ? '▲' : '▼'} {Math.abs(p.growth)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28, flexShrink: 0 }}>
                    {p.trend.map((v, k) => (
                      <div key={k} style={{
                        width: 5, height: `${(v / max) * 100}%`, minHeight: 3,
                        background: k === p.trend.length - 1 ? '#1e40af' : '#c7d2fe', borderRadius: 2,
                      }}/>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#6b7280', marginBottom: 3, fontVariantNumeric: 'tabular-nums' }}>
                      <span>Share da médica</span>
                      <span style={{ fontWeight: 600, color: '#0f1729' }}>{p.share}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#eef0f3', overflow: 'hidden' }}>
                      <div style={{ width: `${p.share}%`, height: '100%', background: '#1e40af', borderRadius: 3 }}/>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </CCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Doctor screen — stitched
// ─────────────────────────────────────────────────────────────
function DoctorDetailScreen({ doctor = DOCTOR_DETAIL, onBack = () => {} }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f7f8fb',
      overflowY: 'auto',
      fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
    }}>
      <AtlasTopBar page="Explorar" active="explorar"/>
      <DoctorHeader doctor={doctor} onBack={onBack}/>
      <DoctorQuickActions doctor={doctor}/>
      <SuggestEditBanner/>
      <AddToRouteButton clinic={{ name: doctor.clinics[0]?.name }}/>
      <PhotosButton gallery={doctor.gallery} title="Fotos do médico"/>
      <DoctorPersonalCard doctor={doctor}/>
      <DoctorPrescribing items={doctor.prescribing}/>
      <DoctorClinics clinics={doctor.clinics}/>
      <ClinicVisits visits={doctor.visits}/>
      <ClinicNotes notes={doctor.notes}/>
    </div>
  );
}

Object.assign(window, {
  DoctorDetailScreen, DOCTOR_DETAIL,
  DoctorHeader, DoctorQuickActions, DoctorPersonalCard, DoctorClinics, DoctorPrescribing,
});
