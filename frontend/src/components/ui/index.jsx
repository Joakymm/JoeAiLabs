import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Spinner ─────────────────────────────────────────────────────────────── */
export function Spinner({ size = 40, text = '' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:60 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid rgba(0,255,163,0.15)`,
        borderTop: `3px solid var(--neon-green)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontFamily:'Orbitron,sans-serif', letterSpacing:2 }}>{text}</p>}
    </div>
  );
}

/* ── Alert ───────────────────────────────────────────────────────────────── */
export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;
  const icons = { error:'fa-circle-exclamation', success:'fa-circle-check', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  return (
    <div className={`alert alert-${type}`}>
      <i className={`fas ${icons[type]}`} />
      <span style={{ flex:1 }}>{children}</span>
      {onClose && <button onClick={onClose} style={{ background:'none',border:'none',color:'inherit',cursor:'pointer',padding:0 }}><i className="fas fa-times" /></button>}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, width = 560 }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="modal-header">
          <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1rem', color:'var(--neon-green)', letterSpacing:2 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'1.2rem', cursor:'pointer' }}>
            <i className="fas fa-times" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────────────────────────── */
export function ProgressBar({ pct = 0, height = 6, showLabel = false }) {
  return (
    <div>
      <div className="progress-track" style={{ height }}>
        <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {showLabel && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
          <span style={{ fontSize:'0.75rem', color:'var(--neon-green)', fontFamily:'Orbitron,sans-serif' }}>{pct}%</span>
        </div>
      )}
    </div>
  );
}

/* ── ProtectedRoute ──────────────────────────────────────────────────────── */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner text="LOADING" />;
  if (!isLoggedIn) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (adminOnly && user?.role !== 'admin') return (
    <div style={{ textAlign:'center', padding:'120px 20px' }}>
      <h2 style={{ color:'var(--neon-red)', fontFamily:'Orbitron,sans-serif' }}>ACCESS DENIED</h2>
    </div>
  );
  return children;
}

/* ── Toast container ─────────────────────────────────────────────────────── */
export function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)}
          style={{
            background: t.type === 'error' ? 'rgba(255,60,90,0.15)' : 'rgba(0,255,163,0.12)',
            border: `1px solid ${t.type === 'error' ? 'rgba(255,60,90,0.4)' : 'rgba(0,255,163,0.4)'}`,
            color: t.type === 'error' ? '#ff8099' : 'var(--neon-green)',
            padding:'12px 20px', borderRadius:10, cursor:'pointer',
            fontSize:'0.88rem', fontWeight:600, maxWidth:320,
            animation: 'fade-in-up 0.3s ease',
            backdropFilter: 'blur(8px)',
          }}>
          <i className={`fas ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} style={{ marginRight:8 }} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── StatCard ────────────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, color = 'green', sub }) {
  const colors = {
    green:  { bg:'rgba(0,255,163,0.08)',  icon:'var(--neon-green)',  border:'rgba(0,255,163,0.15)' },
    yellow: { bg:'rgba(255,214,0,0.08)',  icon:'var(--neon-yellow)', border:'rgba(255,214,0,0.15)' },
    blue:   { bg:'rgba(0,212,255,0.08)',  icon:'var(--neon-blue)',   border:'rgba(0,212,255,0.15)' },
    red:    { bg:'rgba(255,60,90,0.08)',  icon:'var(--neon-red)',    border:'rgba(255,60,90,0.15)' },
  };
  const c = colors[color] || colors.green;
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:16, borderColor: c.border }}>
      <div style={{ width:48, height:48, borderRadius:12, background: c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', color: c.icon, flexShrink:0 }}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.6rem', fontWeight:700, lineHeight:1 }}>{value}</div>
        <div style={{ color:'var(--text-muted)', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:1, marginTop:3 }}>{label}</div>
        {sub && <div style={{ color:'var(--neon-green)', fontSize:'0.72rem', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────────────────────── */
export function EmptyState({ emoji = '🔍', title, description, action }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:16 }}>{emoji}</div>
      <h3 style={{ fontFamily:'Orbitron,sans-serif', color:'var(--neon-green)', marginBottom:8, fontSize:'1.1rem' }}>{title}</h3>
      {description && <p style={{ color:'var(--text-muted)', marginBottom:24, maxWidth:400, margin:'0 auto 24px' }}>{description}</p>}
      {action}
    </div>
  );
}
