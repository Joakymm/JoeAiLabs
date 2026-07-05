import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WELCOME_MSG = {
  role: 'assistant',
  text: "Hey there! 👋 I'm **JOE**, your AI tutor. Ask me anything about the curriculum, prompt engineering, AI tools, or your progress. I'm here to help! 🚀",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('joeailabs_chat');
      return saved ? JSON.parse(saved) : [WELCOME_MSG];
    } catch {
      return [WELCOME_MSG];
    }
  });
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const saveChat = useCallback(() => {
    localStorage.setItem('joeailabs_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => { saveChat(); }, [saveChat]);

  const clearChat = () => {
    if (window.confirm('Clear all chat messages?')) {
      const msgs = [WELCOME_MSG];
      setMessages(msgs);
      localStorage.setItem('joeailabs_chat', JSON.stringify(msgs));
      setError('');
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', text };
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setStreamText('');

    try {
      const token = localStorage.getItem('joeailabs_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.text) {
                fullText += data.text;
                setStreamText(fullText);
              }
              if (data.error) {
                setError(data.error);
              }
            } catch {}
          }
        }
      }

      if (fullText) {
        setMessages(prev => [...prev, { role: 'assistant', text: fullText }]);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setStreaming(false);
      setStreamText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(p => !p)}
        className="chat-toggle"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--neon-green)', border: 'none',
          color: '#020508', fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 0 30px rgba(0,255,163,0.4), 0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>
        <i className={`fas ${open ? 'fa-times' : 'fa-comment'}`} />
      </button>

      {open && (
        <div className="chat-widget" style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 999,
          width: 380, maxHeight: 'calc(100vh - 180px)', height: 480,
          background: 'var(--bg-card)',
          border: '1px solid rgba(0,255,163,0.2)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,163,0.08)',
          overflow: 'hidden',
          animation: 'fade-in-up 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(0,255,163,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(0,255,163,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,255,163,0.1)',
                border: '2px solid var(--neon-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', color: 'var(--neon-green)',
              }}>AI</div>
              <div>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem', color: 'var(--neon-green)', letterSpacing: 1 }}>JOE TUTOR</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{streaming ? 'Typing...' : 'Online'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={saveChat} title="Save chat"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                <i className="fas fa-save" />
              </button>
              <button onClick={clearChat} title="Clear chat"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: msg.role === 'user'
                    ? 'rgba(0,255,163,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(0,255,163,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <div className="chat-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {streaming && streamText && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.6,
                }}>
                  <div className="chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamText}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            {streaming && !streamText && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
                <div style={{
                  display: 'flex', gap: 4, padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', animation: 'pulse-glow 1.2s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', animation: 'pulse-glow 1.2s infinite 0.2s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-green)', animation: 'pulse-glow 1.2s infinite 0.4s' }} />
                </div>
              </div>
            )}
            {error && (
              <div style={{ padding: '8px 12px', background: 'rgba(255,60,90,0.1)', border: '1px solid rgba(255,60,90,0.25)', borderRadius: 8, color: '#ff8099', fontSize: '0.82rem' }}>
                <i className="fas fa-circle-exclamation" style={{ marginRight: 6 }} />{error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(0,255,163,0.1)',
            display: 'flex', gap: 8,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask JOE anything..."
              disabled={streaming}
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              style={{
                padding: '0 16px', borderRadius: 10,
                background: 'var(--neon-green)', border: 'none',
                color: '#020508', cursor: 'pointer',
                fontSize: '1rem',
                opacity: streaming || !input.trim() ? 0.5 : 1,
              }}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chat-markdown p { margin: 0; color: inherit; font-size: inherit; line-height: inherit; }
        .chat-markdown ul, .chat-markdown ol { margin: 4px 0; padding-left: 20px; color: var(--text-muted); }
        .chat-markdown li { margin-bottom: 2px; }
        .chat-markdown code { background: rgba(0,255,163,0.07); border: 1px solid rgba(0,255,163,0.15); padding: 1px 5px; border-radius: 4px; font-size: 0.85em; color: var(--neon-green); }
        .chat-markdown pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(0,255,163,0.1); border-radius: 8px; padding: 12px; overflow-x: auto; margin: 8px 0; }
        .chat-markdown pre code { background: none; border: none; padding: 0; color: var(--neon-green); }
        .chat-markdown strong { color: var(--neon-green); }
        .chat-markdown blockquote { border-left: 3px solid var(--neon-yellow); padding-left: 12px; margin: 8px 0; color: var(--text-muted); font-style: italic; }
        @media (max-width: 600px) {
          .chat-widget { width: calc(100vw - 32px) !important; right: 16px !important; bottom: 84px !important; height: 70vh !important; max-height: 480px !important; }
          .chat-toggle { width: 52px !important; height: 52px !important; font-size: 1.25rem !important; bottom: 16px !important; right: 16px !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .chat-widget { width: 340px !important; height: 420px !important; right: 20px !important; }
        }
        @media (max-width: 400px) {
          .chat-widget { width: calc(100vw - 24px) !important; right: 12px !important; height: 65vh !important; max-height: 420px !important; }
          .chat-toggle { width: 48px !important; height: 48px !important; font-size: 1.1rem !important; bottom: 12px !important; right: 12px !important; }
        }
      `}</style>
    </>
  );
}
