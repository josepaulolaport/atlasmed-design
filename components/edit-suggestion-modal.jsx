// ─────────────────────────────────────────────────────────────
// Edit Suggestion Modal — bottom sheet that lets a sales rep
// propose a correction to administrative data on a clinic or
// doctor profile. Suggestions go through admin review.
// ─────────────────────────────────────────────────────────────

const EDITABLE_FIELDS = {
  // Clinic fields
  clinicName:    { label: 'Nome da clínica', type: 'text',     validation: 'text', mono: false },
  clinicPhone:   { label: 'Telefone',        type: 'tel',      validation: 'phone', mono: true },
  clinicEmail:   { label: 'E-mail',          type: 'email',    validation: 'email' },
  clinicAddress: { label: 'Endereço',        type: 'textarea', validation: 'text' },
  clinicWebsite: { label: 'Site',            type: 'url',      validation: 'url' },
  clinicHours:   { label: 'Horário',         type: 'text',     validation: 'text' },
  clinicCnpj:    { label: 'CNPJ',            type: 'text',     validation: 'cnpj', mono: true },

  // Doctor fields
  doctorName:      { label: 'Nome do médico',  type: 'text',  validation: 'text' },
  doctorPhone:     { label: 'Telefone',        type: 'tel',   validation: 'phone', mono: true },
  doctorEmail:     { label: 'E-mail',          type: 'email', validation: 'email' },
  doctorWhatsapp:  { label: 'WhatsApp',        type: 'tel',   validation: 'phone', mono: true },
  doctorBirthday:  { label: 'Aniversário',     type: 'text',  validation: 'text' },
  doctorTeam:      { label: 'Time',            type: 'text',  validation: 'text' },
  doctorInterests: { label: 'Interesses',      type: 'text',  validation: 'text' },
  doctorLanguage:  { label: 'Idiomas',         type: 'text',  validation: 'text' },
  doctorCrm:       { label: 'CRM',             type: 'text',  validation: 'text', mono: true },
  doctorSpecialty: { label: 'Especialidade',   type: 'text',  validation: 'text' },
};

function _validateField(value, kind) {
  const v = (value || '').trim();
  if (!v) return 'Informe um valor.';
  switch (kind) {
    case 'phone': {
      const digits = v.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) return 'Telefone inválido. Use (DDD) 9XXXX-XXXX.';
      return null;
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido.';
      return null;
    }
    case 'cnpj': {
      const digits = v.replace(/\D/g, '');
      if (digits.length !== 14) return 'CNPJ deve ter 14 dígitos.';
      return null;
    }
    case 'url': {
      if (!/^https?:\/\/.+\..+/i.test(v)) return 'URL deve começar com http:// ou https://';
      return null;
    }
    default:
      if (v.length < 2) return 'Valor muito curto.';
      return null;
  }
}

function EditSuggestionModal({
  open,
  onClose,
  fieldKey,
  currentValue,
  entityType,
  entityId,
  entityName,
}) {
  const fieldConfig = EDITABLE_FIELDS[fieldKey] || { label: 'Campo', type: 'text', validation: 'text' };
  const isEmpty = !currentValue || currentValue === '—' || currentValue === '-';

  const [newValue, setNewValue] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setNewValue('');
      setReason('');
      setError('');
      setShowSuccess(false);
    }
  }, [open, fieldKey]);

  if (!open) return null;

  const handleSubmit = () => {
    const err = _validateField(newValue, fieldConfig.validation);
    if (err) { setError(err); return; }
    setError('');

    const suggestion = {
      id: 'sug-' + Date.now(),
      entityType, entityId,
      fieldKey,
      currentValue: isEmpty ? null : currentValue,
      proposedValue: newValue.trim(),
      reason: reason.trim(),
      submittedBy: 'rafael.melo@atlasmed.com',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    console.log('Edit suggestion submitted:', suggestion);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onClose) onClose();
    }, 2200);
  };

  const titleLabel = isEmpty
    ? `Adicionar ${fieldConfig.label.toLowerCase()}`
    : 'Sugerir alteração';
  const isLong = fieldConfig.type === 'textarea';
  const mono = !!fieldConfig.mono;
  const inputType = fieldConfig.type === 'textarea' ? 'text' : fieldConfig.type;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 250,
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,41,0.42)',
          animation: 'atlasFadeIn 200ms ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -12px 40px rgba(15,23,41,0.18)',
        animation: 'atlasSlideUp 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        maxHeight: '92%',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db' }}/>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '8px 18px 14px',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: '#eef2ff', color: '#1e40af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l3 3-9 9H3v-3l9-9z"/>
              <path d="M11 4l3 3"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', letterSpacing: -0.3 }}>
              {titleLabel}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
              Passa por revisão administrativa antes de entrar no perfil.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 32, height: 32, borderRadius: 16,
              border: 'none', background: '#f1f3f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#374151', flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l7 7M10 3l-7 7"/>
            </svg>
          </button>
        </div>

        {/* Entity context chip */}
        {entityName && (
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: '#f3f4f6', color: '#6b7280',
              fontSize: 11, fontWeight: 600,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: 3,
                background: entityType === 'doctor' ? '#1e40af' : '#16a373',
              }}/>
              {entityType === 'doctor' ? 'Médico' : 'Clínica'} · {entityName}
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 8px' }}>
          {/* Field block */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#8a94a6',
              letterSpacing: 0.6, textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {fieldConfig.label}
            </div>

            {/* Current value (read-only) */}
            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: '#f7f8fb', border: '1px solid #eef0f3',
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
                Valor atual
              </div>
              <div style={{
                fontSize: 14, color: isEmpty ? '#c4c9d2' : '#374151',
                fontStyle: isEmpty ? 'italic' : 'normal',
                fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
                fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
                wordBreak: 'break-word',
              }}>
                {isEmpty ? 'Não informado' : currentValue}
              </div>
            </div>

            {/* Down arrow */}
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '2px 0 6px',
              color: '#c4c9d2',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v9M4 9l4 4 4-4"/>
              </svg>
            </div>

            {/* New value input */}
            <div style={{
              padding: '10px 14px 12px', borderRadius: 12,
              background: '#fff',
              border: error ? '1.5px solid #b84545' : '1.5px solid #1e40af',
              boxShadow: error
                ? '0 0 0 3px rgba(184,69,69,0.10)'
                : '0 0 0 3px rgba(30,64,175,0.10)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
                Novo valor
              </div>
              {isLong ? (
                <textarea
                  value={newValue}
                  onChange={(e) => { setNewValue(e.target.value); if (error) setError(''); }}
                  placeholder={`Novo ${fieldConfig.label.toLowerCase()}…`}
                  rows={3}
                  style={{
                    width: '100%', resize: 'vertical', minHeight: 60,
                    border: 'none', outline: 'none', padding: 0,
                    fontSize: 14, color: '#0f1729',
                    fontFamily: 'Inter, system-ui',
                    background: 'transparent',
                    lineHeight: 1.45,
                  }}
                />
              ) : (
                <input
                  type={inputType}
                  value={newValue}
                  onChange={(e) => { setNewValue(e.target.value); if (error) setError(''); }}
                  placeholder={`Novo ${fieldConfig.label.toLowerCase()}…`}
                  style={{
                    width: '100%',
                    border: 'none', outline: 'none', padding: 0,
                    fontSize: 14, color: '#0f1729',
                    fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'Inter, system-ui',
                    fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
                    background: 'transparent',
                  }}
                />
              )}
            </div>

            {error && (
              <div style={{
                marginTop: 8, fontSize: 12, color: '#b84545', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="6.5" cy="6.5" r="5.5"/>
                  <path d="M6.5 4v3"/>
                  <circle cx="6.5" cy="9" r="0.4" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#8a94a6',
                letterSpacing: 0.6, textTransform: 'uppercase',
              }}>
                Motivo (opcional)
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                {reason.length}/200
              </div>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 200))}
              placeholder="Por que esta alteração é necessária?"
              rows={3}
              style={{
                width: '100%', resize: 'vertical', minHeight: 64,
                padding: '10px 12px',
                border: '1px solid #e5ebf3', borderRadius: 12,
                outline: 'none',
                fontSize: 13.5, color: '#1f2937', lineHeight: 1.45,
                fontFamily: 'Inter, system-ui',
                background: '#fff',
              }}
            />
          </div>

          {/* Note */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(198,134,27,0.07)',
            border: '1px solid rgba(198,134,27,0.18)',
            marginBottom: 16,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6861b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="8" cy="8" r="6.5"/>
              <path d="M8 5v3.5"/>
              <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
            </svg>
            <div style={{ fontSize: 11.5, color: '#8a5a0f', lineHeight: 1.45 }}>
              Sua sugestão será revisada antes de atualizar o cadastro. O valor original não é alterado imediatamente.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 10, padding: '14px 18px 22px',
          borderTop: '1px solid #f1f3f6', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: '#fff', color: '#374151',
              border: '1px solid #e5ebf3',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
            }}
          >Cancelar</button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 2, height: 48, borderRadius: 12,
              background: '#0a2f7f', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7l4 4 6-8"/>
            </svg>
            Enviar sugestão
          </button>
        </div>
      </div>

      {showSuccess && (
        <SuggestionToast message="Sugestão enviada para revisão"/>
      )}
    </div>
  );
}

function SuggestionToast({ message }) {
  return (
    <div style={{
      position: 'absolute',
      top: 18, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#16a373', color: '#fff',
      padding: '10px 18px',
      borderRadius: 12,
      fontSize: 13.5, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(22,163,115,0.4)',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'Inter, system-ui',
      animation: 'atlasSlideDown 280ms cubic-bezier(0.22, 1, 0.36, 1)',
      whiteSpace: 'nowrap',
    }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8l3.5 3.5L13 4"/>
      </svg>
      {message}
    </div>
  );
}

Object.assign(window, {
  EditSuggestionModal,
  EDITABLE_FIELDS,
  SuggestionToast,
});
