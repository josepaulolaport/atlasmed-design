// ─────────────────────────────────────────────────────────────
// ProfileEditorScreen — full-screen editor for the rep's
// personal profile. Opens from the pencil icon on the Profile
// header.
// ─────────────────────────────────────────────────────────────

const USER_PROFILE_EDITABLE = {
  name: 'Rafael Melo',
  email: 'rafael.melo@atlasmed.com',
  phone: '+55 11 98412-5520',
  initials: 'RM',
  region: 'São Paulo · Zona Oeste',
  role: 'Representante Comercial',
  since: 'Desde março de 2024',
};

function ProfileEditorScreen({
  user = USER_PROFILE_EDITABLE,
  onBack = () => {},
  onSave = () => {},
  initialPhotoSheetOpen = false,
  initialDeleteConfirmOpen = false,
}) {
  const [name, setName]   = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [phone, setPhone] = React.useState(user.phone);
  const [saving, setSaving] = React.useState(false);
  const [photoActionOpen, setPhotoActionOpen]     = React.useState(initialPhotoSheetOpen);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(initialDeleteConfirmOpen);
  const [errors, setErrors] = React.useState({});
  const [toast, setToast] = React.useState(null);

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 1900);
  };

  const validate = () => {
    const errs = {};
    if (!name || name.trim().length < 3) {
      errs.name = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'E-mail inválido';
    }
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      errs.phone = 'Telefone inválido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const updated = { ...user, name, email, phone };
      onSave(updated);
      setSaving(false);
      showToast('Perfil atualizado ✓', 'success');
      setTimeout(onBack, 900);
    }, 1100);
  };

  const handlePhotoAction = (which) => {
    setPhotoActionOpen(false);
    if (which === 'cancel') return;
    showToast(which === 'camera' ? 'Foto atualizada via câmera ✓' : 'Foto atualizada via galeria ✓');
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    showToast('Ação não disponível no demo', 'info');
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      animation: 'peSlideInRight 300ms cubic-bezier(.2,.8,.2,1)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 36, height: 36, borderRadius: 11,
          border: '1px solid #eef0f3', background: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: '#0a2f7f',
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>

        <div style={{
          flex: 1,
          fontSize: 15, fontWeight: 700, color: '#0f1729',
          textAlign: 'center', letterSpacing: -0.2,
        }}>
          Editar perfil
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: 'none',
            background: saving ? '#f3f4f6' : 'transparent',
            color: saving ? '#9ca3af' : '#0a2f7f',
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, system-ui',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}
        >
          {saving && (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                 style={{ animation: 'peSpin 0.9s linear infinite' }}>
              <path d="M8 2a6 6 0 016 6" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" opacity="0.22"/>
            </svg>
          )}
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 16px 32px',
      }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <button
            onClick={() => setPhotoActionOpen(true)}
            aria-label="Alterar foto"
            style={{
              width: 100, height: 100, borderRadius: 50,
              background: 'linear-gradient(135deg, #0a2f7f 0%, #1e40af 45%, #16a373 115%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: -1,
              position: 'relative',
              cursor: 'pointer',
              border: '4px solid #fff',
              boxShadow: '0 8px 24px rgba(10,47,127,0.26)',
              padding: 0,
              fontFamily: 'Inter, system-ui',
            }}
          >
            {user.initials}

            <div style={{
              position: 'absolute',
              bottom: -2, right: -2,
              width: 32, height: 32,
              borderRadius: 16,
              background: '#0a2f7f',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.4 4h2l1-1.3h5l1 1.3h2a1 1 0 011 1v6a1 1 0 01-1 1H1.4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
                <circle cx="7" cy="8" r="2.1"/>
              </svg>
            </div>
          </button>

          <button
            onClick={() => setPhotoActionOpen(true)}
            style={{
              display: 'block',
              margin: '12px auto 0',
              border: 'none',
              background: 'transparent',
              color: '#0a2f7f',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              padding: '6px 12px',
            }}
          >
            Alterar foto
          </button>
        </div>

        {/* Form fields */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          padding: '18px 16px',
          marginBottom: 14,
        }}>
          <PEField
            label="Nome completo"
            value={name}
            onChange={(v) => { setName(v); if (errors.name) setErrors(e => ({ ...e, name: null })); }}
            error={errors.name}
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
          />
          <PEField
            label="E-mail"
            value={email}
            onChange={(v) => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: null })); }}
            error={errors.email}
            type="email"
            autoComplete="email"
            placeholder="voce@atlasmed.com"
          />
          <PEField
            label="Telefone"
            value={phone}
            onChange={(v) => { setPhone(v); if (errors.phone) setErrors(e => ({ ...e, phone: null })); }}
            error={errors.phone}
            type="tel"
            autoComplete="tel"
            tabular
            placeholder="+55 11 90000-0000"
            isLast
          />
        </div>

        {/* Region (read-only) */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#f7f8fb',
              border: '1px solid #eef0f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#6b7280',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 14s5-4.5 5-8.5A5 5 0 003 5.5C3 9.5 8 14 8 14z"/>
                <circle cx="8" cy="6" r="1.8"/>
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: '#8a94a6',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: 2,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                Território
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="5" width="6" height="5" rx="1"/>
                  <path d="M4.2 5V3.7a1.8 1.8 0 013.6 0V5"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1729', letterSpacing: -0.1 }}>
                {user.region}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                Solicite alteração ao seu gestor
              </div>
            </div>
          </div>
        </div>

        {/* Role + tenure (read-only meta) */}
        <div style={{
          background: '#fff',
          border: '1px solid #eef0f3',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 800, color: '#8a94a6',
              letterSpacing: 0.8, textTransform: 'uppercase',
              marginBottom: 2,
            }}>
              Cargo
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>
              {user.role}
            </div>
          </div>
          <div style={{
            fontSize: 11, color: '#6b7280', fontWeight: 500,
            textAlign: 'right', whiteSpace: 'nowrap',
          }}>
            {user.since}
          </div>
        </div>

        {/* Delete account */}
        <button
          onClick={() => setDeleteConfirmOpen(true)}
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: 12,
            border: '1px solid rgba(184,69,69,0.22)',
            background: '#fff',
            color: '#b84545',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M2 4h10M5.5 4V2.5h3V4M4 4l.6 8h4.8L10 4"/>
          </svg>
          Excluir minha conta
        </button>
      </div>

      {photoActionOpen && (
        <PhotoActionSheet
          options={[
            { key: 'camera', label: 'Câmera', sub: 'Tirar nova foto', emoji: '📷' },
            { key: 'gallery', label: 'Galeria', sub: 'Escolher do dispositivo', emoji: '🖼️' },
            { key: 'remove',  label: 'Remover foto', sub: 'Voltar para iniciais', emoji: '🚫', danger: true },
          ]}
          onSelect={(key) => handlePhotoAction(key)}
          onClose={() => setPhotoActionOpen(false)}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmDialog
          title="Excluir conta?"
          message="Esta ação não pode ser desfeita. Todos os seus dados, histórico de visitas e pedidos serão removidos permanentemente."
          confirmLabel="Excluir conta"
          cancelLabel="Cancelar"
          confirmDanger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}

      {toast && (
        <div style={{
          position: 'absolute',
          left: '50%', bottom: 28,
          transform: 'translateX(-50%)',
          zIndex: 220,
          background: toast.kind === 'success' ? '#117a55'
                    : toast.kind === 'info'    ? '#0f1729'
                    : '#b84545',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 12px 28px rgba(15,23,41,0.28)',
          fontFamily: 'Inter, system-ui',
          animation: 'peToastIn 220ms ease',
          whiteSpace: 'nowrap',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes peSlideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes peSpin { to { transform: rotate(360deg); } }
        @keyframes peSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes peFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes peDialogIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes peToastIn {
          from { opacity: 0; transform: translate(-50%, 14px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

function PEField({ label, value, onChange, error, type = 'text', autoComplete, tabular, placeholder, isLast = false }) {
  return (
    <div style={{ marginBottom: isLast ? 0 : 18 }}>
      <label style={{
        display: 'block',
        fontSize: 9.5,
        fontWeight: 800,
        color: '#8a94a6',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 7,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '11px 13px',
          border: `1px solid ${error ? '#e7a3a3' : '#eef0f3'}`,
          borderRadius: 11,
          fontSize: 14,
          fontFamily: 'Inter, system-ui',
          fontVariantNumeric: tabular ? 'tabular-nums' : 'normal',
          color: '#0f1729',
          outline: 'none',
          background: error ? 'rgba(184,69,69,0.04)' : '#fff',
          fontWeight: 500,
        }}
      />
      {error && (
        <div style={{
          fontSize: 11.5, color: '#b84545', marginTop: 5,
          fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="7" cy="7" r="6"/>
            <path d="M7 4v3.5M7 10v.01"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

function PhotoActionSheet({ options, onSelect, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 200,
        animation: 'peFadeIn 220ms ease',
      }}/>
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        zIndex: 201,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '12px 14px 24px',
        animation: 'peSlideUp 280ms cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.20)',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#d1d5db',
          margin: '0 auto 14px',
        }}/>
        <div style={{
          fontSize: 16, fontWeight: 700, color: '#0f1729',
          padding: '0 8px 12px',
          letterSpacing: -0.2,
        }}>
          Foto de perfil
        </div>

        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{
              width: '100%',
              padding: '12px 12px',
              border: 'none',
              borderRadius: 12,
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'Inter, system-ui',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: opt.danger ? 'rgba(184,69,69,0.08)' : '#f7f8fb',
              border: `1px solid ${opt.danger ? 'rgba(184,69,69,0.16)' : '#eef0f3'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}>
              {opt.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: opt.danger ? '#b84545' : '#0f1729',
                letterSpacing: -0.1,
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 1 }}>
                {opt.sub}
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '12px',
            border: '1px solid #eef0f3',
            borderRadius: 12,
            background: '#fff',
            color: '#374151',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui',
          }}
        >
          Cancelar
        </button>
      </div>
    </>
  );
}

function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Cancelar', confirmDanger = false, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,41,0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 210,
        animation: 'peFadeIn 220ms ease',
      }}/>
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 211,
        background: '#fff',
        borderRadius: 18,
        padding: 22,
        width: '82%',
        maxWidth: 320,
        boxShadow: '0 24px 56px rgba(15,23,41,0.32)',
        animation: 'peDialogIn 240ms cubic-bezier(.2,.8,.2,1)',
        fontFamily: 'Inter, system-ui',
      }}>
        {confirmDanger && (
          <div style={{
            width: 40, height: 40, borderRadius: 20,
            background: 'rgba(184,69,69,0.10)',
            border: '1px solid rgba(184,69,69,0.20)',
            color: '#b84545',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 2L1.5 15h15L9 2z"/>
              <path d="M9 7v3.5M9 12.5v.01"/>
            </svg>
          </div>
        )}
        <div style={{
          fontSize: 17, fontWeight: 700, color: '#0f1729',
          marginBottom: 6, letterSpacing: -0.2,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 13, color: '#6b7280', lineHeight: 1.55,
          marginBottom: 18,
        }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: '1px solid #eef0f3',
              background: '#fff',
              color: '#374151',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: 'none',
              background: confirmDanger ? '#b84545' : '#0a2f7f',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              boxShadow: confirmDanger
                ? '0 4px 14px rgba(184,69,69,0.28)'
                : '0 4px 14px rgba(10,47,127,0.22)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  ProfileEditorScreen,
  PhotoActionSheet,
  ConfirmDialog,
  USER_PROFILE_EDITABLE,
});
