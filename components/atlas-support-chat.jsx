// ─────────────────────────────────────────────────────────────
// SupportChatScreen — real-time chat with the AtlasMed support
// team. Opens from "Suporte" in Profile or from the Help Center
// CTA. Includes message bubbles, status ticks, typing indicator
// and quick-reply chips.
// ─────────────────────────────────────────────────────────────

const CHAT_MESSAGES = [
  { id: 'm-1', sender: 'support', agent: 'Ana', text: 'Olá! Sou a Ana, do suporte AtlasMed 👋 Como posso ajudar você hoje?', timestamp: '2026-05-07T13:58:00', status: 'delivered' },
  { id: 'm-2', sender: 'user',                  text: 'Oi Ana! Estou com dificuldade para registrar uma visita pelo mapa.',                                       timestamp: '2026-05-07T14:02:00', status: 'read' },
  { id: 'm-3', sender: 'support', agent: 'Ana', text: 'Sem problemas! Vou te ajudar agora mesmo. Qual mensagem aparece quando você toca em "Iniciar visita"?',     timestamp: '2026-05-07T14:03:00', status: 'delivered' },
  { id: 'm-4', sender: 'user',                  text: 'Aparece um erro dizendo que minha localização não pôde ser confirmada.',                                    timestamp: '2026-05-07T14:05:00', status: 'read' },
  { id: 'm-5', sender: 'support', agent: 'Ana', text: 'Entendi. Isso geralmente acontece quando o GPS está em modo econômico. Vou te enviar um guia rápido.',       timestamp: '2026-05-07T14:06:00', status: 'delivered' },
  { id: 'm-6', sender: 'support', agent: 'Ana', text: 'Você pode tentar isto: Configurações do celular → Localização → Modo de alta precisão. Depois reinicie o app.', timestamp: '2026-05-07T14:06:30', status: 'delivered' },
  { id: 'm-7', sender: 'user',                  text: 'Vou tentar agora, um minuto.',                                                                              timestamp: '2026-05-07T14:08:00', status: 'read' },
];

const SUPPORT_STATUS = {
  online:  { label: 'Online agora',          color: '#16a373' },
  away:    { label: 'Ausente · responde em 5 min', color: '#f59e0b' },
  offline: { label: 'Offline · deixe sua dúvida',  color: '#9ca3af' },
};

const _quickReplies = [
  'Tudo certo, obrigado!',
  'Pode me explicar de novo?',
  'Funcionou ✓',
  'Não funcionou',
];

function SupportChatScreen({ onBack = () => {}, supportStatus = 'online' }) {
  const [messages, setMessages] = React.useState(CHAT_MESSAGES);
  const [inputText, setInput]   = React.useState('');
  const [isTyping, setTyping]   = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const status = SUPPORT_STATUS[supportStatus];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };
  React.useEffect(scrollToBottom, [messages, isTyping]);

  const send = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    // Simulate support typing → reply
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}-r`,
          sender: 'support',
          agent: 'Ana',
          text: 'Perfeito! Avisa aqui se precisar de mais alguma coisa 😊',
          timestamp: new Date().toISOString(),
          status: 'delivered',
        },
      ]);
    }, 2400);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#f0f3f7',
      fontFamily: 'Inter, system-ui',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '11px 14px', background: '#fff',
        borderBottom: '1px solid #eef0f3',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Voltar" style={_scIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.9" strokeLinecap="round">
            <path d="M10 3l-5 5 5 5"/>
          </svg>
        </button>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 19,
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, letterSpacing: -0.4,
          }}>AT</div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 11, height: 11, borderRadius: 6,
            background: status.color,
            border: '2px solid #fff',
          }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f1729', letterSpacing: -0.2 }}>
            Suporte AtlasMed
          </div>
          <div style={{ fontSize: 11.5, color: status.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            {status.label}
          </div>
        </div>
        <button aria-label="Mais" style={_scIconBtn}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="#0a2f7f">
            <circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 14px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        backgroundImage: 'radial-gradient(rgba(15,23,41,0.04) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
        backgroundPosition: '0 0',
      }}>
        {/* Conversation start divider */}
        <div style={{
          alignSelf: 'center',
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(15,23,41,0.06)',
          color: '#6b7280', fontSize: 11, fontWeight: 500,
          marginBottom: 4,
        }}>
          Hoje · 13:58
        </div>

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const sameSender = prev && prev.sender === msg.sender;
          return <_MessageBubble key={msg.id} message={msg} sameSender={sameSender}/>;
        })}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '11px 14px',
            background: '#fff',
            borderRadius: '16px 16px 16px 4px',
            boxShadow: '0 1px 2px rgba(15,23,41,0.06)',
            border: '1px solid #eef0f3',
          }}>
            <_TypingDots/>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Quick replies */}
      <div style={{
        padding: '8px 14px 0', flexShrink: 0,
        display: 'flex', gap: 6, overflowX: 'auto',
      }}>
        {_quickReplies.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #eef0f3',
              background: '#fff',
              color: '#0a2f7f',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 12px 12px', background: '#fff',
        borderTop: '1px solid #eef0f3',
        display: 'flex', alignItems: 'flex-end', gap: 8,
        flexShrink: 0,
      }}>
        <button aria-label="Anexar" style={{
          width: 38, height: 38, borderRadius: 19,
          border: '1px solid #eef0f3', background: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0a2f7f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L5.5 10.5a2 2 0 0 0 2.8 2.8L14 7.7a3.5 3.5 0 0 0-4.95-4.95l-5.7 5.7a5 5 0 0 0 7.07 7.07L13 13.5"/>
          </svg>
        </button>
        <div style={{
          flex: 1,
          background: '#f7f8fb',
          border: '1px solid #eef0f3',
          borderRadius: 19,
          padding: '8px 14px',
          minHeight: 38,
          display: 'flex', alignItems: 'center',
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(inputText);
              }
            }}
            placeholder="Digite sua mensagem…"
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontSize: 14, fontFamily: 'inherit',
              color: '#0f1729', minHeight: 22, maxHeight: 90,
            }}
          />
        </div>
        <button
          onClick={() => send(inputText)}
          disabled={!inputText.trim()}
          aria-label="Enviar"
          style={{
            width: 38, height: 38, borderRadius: 19,
            border: 'none',
            background: inputText.trim() ? '#0a2f7f' : '#cbd5e1',
            color: '#fff',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 160ms',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7l11-5-5 11-1.5-4.5L2 7z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes scTyping {
          0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes scBubbleIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const _scIconBtn = {
  width: 36, height: 36, borderRadius: 11,
  border: '1px solid #eef0f3', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

function _MessageBubble({ message, sameSender }) {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '78%',
      display: 'flex', flexDirection: 'column',
      gap: 3,
      animation: 'scBubbleIn 220ms cubic-bezier(.2,.8,.2,1)',
      marginTop: sameSender ? 0 : 2,
    }}>
      {!isUser && !sameSender && (
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginLeft: 12 }}>
          {message.agent || 'Suporte'}
        </div>
      )}
      <div style={{
        padding: '10px 13px',
        background: isUser ? '#0a2f7f' : '#fff',
        color: isUser ? '#fff' : '#0f1729',
        borderRadius: isUser
          ? `16px ${sameSender ? '16px' : '6px'} 6px 16px`
          : `${sameSender ? '16px' : '6px'} 16px 16px 6px`,
        fontSize: 14.5,
        lineHeight: 1.45,
        boxShadow: isUser ? '0 1px 2px rgba(10,47,127,0.20)' : '0 1px 2px rgba(15,23,41,0.06)',
        border: isUser ? 'none' : '1px solid #eef0f3',
        wordBreak: 'break-word',
      }}>
        {message.text}
      </div>
      <div style={{
        fontSize: 10.5, color: '#9ca3af',
        textAlign: isUser ? 'right' : 'left',
        padding: isUser ? '0 6px 0 0' : '0 0 0 6px',
        display: 'flex', alignItems: 'center', gap: 4,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}>
        <span>{time}</span>
        {isUser && (
          <span style={{
            color: message.status === 'read' ? '#16a373' : '#9ca3af',
            fontSize: 11, lineHeight: 1,
          }}>
            {message.status === 'sent' ? '✓' : '✓✓'}
          </span>
        )}
      </div>
    </div>
  );
}

function _TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0 2px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: 4,
          background: '#9ca3af',
          animation: `scTyping 1.3s infinite ${i * 0.18}s`,
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, { SupportChatScreen, CHAT_MESSAGES, SUPPORT_STATUS });
