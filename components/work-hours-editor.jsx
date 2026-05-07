// ─────────────────────────────────────────────────────────────
// WorkHoursEditorSheet — bottom sheet to edit the rep's work
// schedule. Opens from the Profile screen "Horário de trabalho"
// preference row.
// ─────────────────────────────────────────────────────────────

const WORK_HOURS_DEFAULT = {
  days: [1, 2, 3, 4, 5],
  startHour: 8,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
};

const WH_DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const WH_PRESETS = [
  {
    label: 'Comercial',
    sub: 'Seg–Sex · 08:00 – 18:00',
    icon: '🏢',
    days: [1, 2, 3, 4, 5],
    startHour: 8,  startMinute: 0,
    endHour: 18,   endMinute: 0,
  },
  {
    label: 'Manhã',
    sub: 'Seg–Sex · 08:00 – 12:00',
    icon: '🌅',
    days: [1, 2, 3, 4, 5],
    startHour: 8,  startMinute: 0,
    endHour: 12,   endMinute: 0,
  },
  {
    label: 'Tarde',
    sub: 'Seg–Sex · 13:00 – 18:00',
    icon: '☀️',
    days: [1, 2, 3, 4, 5],
    startHour: 13, startMinute: 0,
    endHour: 18,   endMinute: 0,
  },
  {
    label: 'Estendido',
    sub: 'Seg–Sáb · 07:30 – 19:00',
    icon: '🚀',
    days: [1, 2, 3, 4, 5, 6],
    startHour: 7,  startMinute: 30,
    endHour: 19,   endMinute: 0,
  },
];

function WorkHoursEditorSheet({
  open = true,
  onClose = () => {},
  initialHours = WORK_HOURS_DEFAULT,
  onSave = () => {},
}) {
  const [days, setDays] = React.useState(initialHours.days);
  const [startHour, setStartHour] = React.useState(initialHours.startHour);
  const [startMinute, setStartMinute] = React.useState(initialHours.startMinute);
  const [endHour, setEndHour] = React.useState(initialHours.endHour);
  const [endMinute, setEndMinute] = React.useState(initialHours.endMinute);
  const [error, setError] = React.useState('');

  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!mounted) return null;

  const toggleDay = (dayIndex) => {
    setError('');
    setDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const applyPreset = (preset) => {
    setError('');
    setDays(preset.days);
    setStartHour(preset.startHour);
    setStartMinute(preset.startMinute);
    setEndHour(preset.endHour);
    setEndMinute(preset.endMinute);
  };

  const isPresetActive = (preset) => {
    const sameDays = preset.days.length === days.length &&
      preset.days.every(d => days.includes(d));
    return sameDays
      && preset.startHour === startHour
      && preset.startMinute === startMinute
      && preset.endHour === endHour
      && preset.endMinute === endMinute;
  };

  const handleSave = () => {
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    if (days.length === 0) {
      setError('Selecione pelo menos um dia');
      return;
    }
    if (endMinutes <= startMinutes) {
      setError('Horário de término deve ser após o início');
      return;
    }
    onSave({ days, startHour, startMinute, endHour, endMinute });
    onClose();
  };

  const handleTimeChange = (which, value) => {
    setError('');
    const [h, m] = value.split(':').map(n => parseInt(n, 10));
    if (which === 'start') {
      setStartHour(h); setStartMinute(m);
    } else {
      setEndHour(h); setEndMinute(m);
    }
  };

  const previewText = `${formatWorkDays(days)} · ${formatWorkTime(startHour, startMinute)} – ${formatWorkTime(endHour, endMinute)}`;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 40,
        background: 'rgba(15, 23, 41, 0.5)',
        backdropFilter: 'blur(2px)',
        opacity: open ? 1 : 0,
        transition: 'opacity 280ms ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        background: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 24px',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.20)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '88%', overflowY: 'auto',
        fontFamily: 'Inter, system-ui',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#d1d5db',
          margin: '0 auto 14px',
        }}/>

        <div style={{ padding: '0 22px' }}>
          {/* Title */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 12, marginBottom: 4,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: '#0f1729',
                letterSpacing: -0.3,
              }}>
                Horário de trabalho
              </div>
              <div style={{
                fontSize: 12.5, color: '#6b7280', marginTop: 2,
              }}>
                Define quando você receberá notificações e oportunidades.
              </div>
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid #eef0f3', background: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              color: '#6b7280',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8"/>
              </svg>
            </button>
          </div>

          {/* Live preview */}
          <div style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(10,47,127,0.06), rgba(22,163,115,0.06))',
            border: '1px solid rgba(10,47,127,0.12)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#fff',
              border: '1px solid rgba(10,47,127,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              color: '#0a2f7f',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9.5, color: '#8a94a6', fontWeight: 700,
                letterSpacing: 0.8, textTransform: 'uppercase',
              }}>
                Pré-visualização
              </div>
              <div style={{
                fontSize: 13.5, fontWeight: 700, color: '#0f1729',
                marginTop: 1, letterSpacing: -0.1,
              }}>
                {previewText}
              </div>
            </div>
          </div>

          {/* Days */}
          <div style={{
            fontSize: 9.5, fontWeight: 800, color: '#8a94a6',
            letterSpacing: 0.8, textTransform: 'uppercase',
            marginTop: 22, marginBottom: 8,
          }}>
            Dias da semana
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
          }}>
            {WH_DAY_LABELS.map((label, i) => {
              const isSelected = days.includes(i);
              const isWeekend = i === 0 || i === 6;
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? '#0a2f7f' : '#eef0f3'}`,
                    background: isSelected ? '#0a2f7f' : '#fff',
                    color: isSelected ? '#fff' : (isWeekend ? '#9ca3af' : '#374151'),
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui',
                    transition: 'all 140ms',
                    letterSpacing: 0.2,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Time pickers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 18,
          }}>
            <WHTimeField
              label="Início"
              value={`${pad2(startHour)}:${pad2(startMinute)}`}
              onChange={(v) => handleTimeChange('start', v)}
            />
            <WHTimeField
              label="Término"
              value={`${pad2(endHour)}:${pad2(endMinute)}`}
              onChange={(v) => handleTimeChange('end', v)}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(184,69,69,0.08)',
              border: '1px solid rgba(184,69,69,0.18)',
              color: '#b84545',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="7" cy="7" r="6"/>
                <path d="M7 4v3.5M7 10v.01"/>
              </svg>
              {error}
            </div>
          )}

          {/* Presets */}
          <div style={{
            fontSize: 9.5, fontWeight: 800, color: '#8a94a6',
            letterSpacing: 0.8, textTransform: 'uppercase',
            marginTop: 22, marginBottom: 8,
          }}>
            Atalhos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {WH_PRESETS.map(preset => {
              const active = isPresetActive(preset);
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: `1px solid ${active ? '#0a2f7f' : '#eef0f3'}`,
                    background: active ? 'rgba(10,47,127,0.05)' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700,
                    color: active ? '#0a2f7f' : '#0f1729',
                    letterSpacing: -0.1,
                  }}>
                    <span style={{ fontSize: 14 }}>{preset.icon}</span>
                    {preset.label}
                  </div>
                  <div style={{
                    fontSize: 10.5, color: '#6b7280', marginTop: 2,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {preset.sub}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                border: '1px solid #eef0f3',
                background: '#fff',
                color: '#374151',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2,
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #0a2f7f, #1e40af)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
                letterSpacing: -0.1,
                boxShadow: '0 4px 14px rgba(10,47,127,0.25)',
              }}
            >
              Salvar horário
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function WHTimeField({ label, value, onChange }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5, fontWeight: 800, color: '#8a94a6',
        letterSpacing: 0.8, textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        background: '#f7f8fb',
        border: '1px solid #eef0f3',
        borderRadius: 12,
        padding: '10px 12px',
        gap: 10,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8a94a6" strokeWidth="1.7">
          <circle cx="7" cy="7" r="5.5"/>
          <path d="M7 4v3l2 1.2" strokeLinecap="round"/>
        </svg>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui',
            color: '#0f1729',
            letterSpacing: -0.4,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 0,
            padding: 0,
          }}
        />
      </div>
    </div>
  );
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatWorkDays(dayIndices) {
  if (!dayIndices || dayIndices.length === 0) return 'Nenhum dia';
  if (dayIndices.length === 7) return 'Todos os dias';

  const sorted = [...dayIndices].sort((a, b) => a - b);

  // Detect a single contiguous run
  const isContiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (isContiguous && sorted.length >= 2) {
    return `${WH_DAY_LABELS[sorted[0]]} a ${WH_DAY_LABELS[sorted[sorted.length - 1]]}`;
  }

  // Common case: weekdays (1-5)
  const isWeekdays = sorted.length === 5 && sorted.every(d => d >= 1 && d <= 5);
  if (isWeekdays) return 'Seg a Sex';

  return sorted.map(i => WH_DAY_LABELS[i]).join(', ');
}

function formatWorkTime(hour, minute) {
  return `${pad2(hour)}:${pad2(minute)}`;
}

function formatWorkHours(hours) {
  if (!hours) return '';
  return `${formatWorkDays(hours.days)} · ${formatWorkTime(hours.startHour, hours.startMinute)} – ${formatWorkTime(hours.endHour, hours.endMinute)}`;
}

Object.assign(window, {
  WorkHoursEditorSheet,
  WORK_HOURS_DEFAULT,
  WH_DAY_LABELS,
  WH_PRESETS,
  formatWorkDays,
  formatWorkTime,
  formatWorkHours,
});
