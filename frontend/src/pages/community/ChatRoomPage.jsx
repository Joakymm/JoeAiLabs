import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

export default function ChatRoomPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [usersOnline, setUsersOnline] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const token = localStorage.getItem('joeailabs_token');
    if (!token) return;

    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socket.on('connect', () => {
      setConnected(true);
      setLoading(false);
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setLoading(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('online', (data) => {
      setUsersOnline(data.count);
    });

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', (data) => {
      if (data.typing) {
        setTypingUsers(prev => prev.includes(data.userId) ? prev : [...prev, data.userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current?.connected) return;
    socketRef.current.emit('message', { content: input.trim() });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing', { typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { typing: false });
    }, 2000);
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ padding: '16px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
          <div>
            <Link to="/community" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.82rem' }}>
              <i className="fas fa-arrow-left" /> BACK TO COMMUNITY
            </Link>
            <h2 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.1rem', marginTop: 8 }}>
              <i className="fas fa-comments" style={{ marginRight: 8, color: 'var(--neon-green)' }} />
              LIVE CHAT
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--neon-green)' : 'var(--neon-red)', display: 'inline-block' }} />
              {connected ? `${usersOnline} online` : 'Disconnected'}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', borderRadius: 12,
          border: '1px solid rgba(0,255,163,0.1)',
          background: 'rgba(0,0,0,0.15)',
          padding: 16, marginBottom: 16,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 8 }} />
              Connecting to chat...
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={msg._id || i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              maxWidth: '80%',
              padding: '8px 14px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--neon-green)', marginBottom: 2, fontWeight: 700 }}>
                {msg.user?.username || 'Unknown'}
              </div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {msg.content}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 4 }}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontStyle: 'italic' }}>
              Someone is typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, flexShrink: 0, marginBottom: 16 }}>
          <input
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
            disabled={!connected}
          />
          <button type="submit" disabled={!connected || !input.trim()}
            className="btn btn-primary" style={{ flexShrink: 0 }}>
            <i className="fas fa-paper-plane" /> SEND
          </button>
        </form>
      </div>
    </div>
  );
}
