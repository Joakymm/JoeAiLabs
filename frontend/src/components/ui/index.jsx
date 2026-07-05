import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ── Spinner ───────────────────────────────────────────────────────────────── */
export function Spinner({ size = 24, text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 20px' }}>
      <div style={{
        width: size, height: size,
        border: '3px solid rgba(0,255,163,0.15)',
        borderTopColor: 'var(--neon-green)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</span>}
    </div>
  );
}

/* ── Alert ─────────────────────────────────────────────────────────────────── */
export function Alert({ type = 'info', message, onClose, children }) {
  const colors = {
    success: { bg: 'rgba(0,255,163,0.08)', border: 'rgba(0,255,163,0.2)', icon: 'fa-circle-check', color: 'var(--neon-green)' },
    error:   { bg: 'rgba(255,82,82,0.08)', border: 'rgba(255,82,82,0.2)', icon: 'fa-circle-xmark', color: '#ff5252' },
    warning: { bg: 'rgba(255,214,0,0.08)',  border: 'rgba(255,214,0,0.2)',  icon: 'fa-triangle-exclamation', color: '#ffd600' },
    info:    { bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.2)',  icon: 'fa-circle-info', color: 'var(--neon-blue)' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 14px', borderRadius: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      color: 'var(--text-main)', fontSize: '0.85rem',
    }}>
      <i className={`fas ${c.icon}`} style={{ color: c.color, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>{message || children}</div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}>
          <i className="fas fa-times" />
        </button>
      )}
    </div>
  );
}

/* ── Toast Container ────────────────────────────────────────────────────────── */
export function ToastContainer({ toasts, remove }) {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const colors = {
    success: 'var(--neon-green)', error: '#ff5252', warning: '#ffd600', info: 'var(--neon-blue)',
  };
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--bg-dark)', border: `1px solid ${colors[t.type] || colors.info}30`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          color: 'var(--text-main)', fontSize: '0.85rem',
          animation: 'slideIn 0.2s ease',
        }}>
          <i className={`fas ${icons[t.type] || icons.info}`} style={{ color: colors[t.type] || colors.info, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}>
            <i className="fas fa-times" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── StatCard ──────────────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, sub, color = 'var(--neon-green)', onClick }) {
  return (
    <div className="card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}12`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color, fontSize: '1rem', flexShrink: 0,
        }}>
          <i className={`fas ${icon}`} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>{label}</div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-main)', fontFamily: 'Orbitron,sans-serif' }}>{value}</div>
        </div>
      </div>
      {sub && <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{sub}</div>}
    </div>
  );
}

/* ── SectionHeader ─────────────────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16, marginBottom: 20, flexWrap: 'wrap',
    }}>
      <div>
        <h2 style={{
          fontFamily: 'Orbitron,sans-serif', fontSize: '1.1rem',
          color: 'var(--text-main)', margin: 0, letterSpacing: 0.5,
        }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── ProgressBar ───────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max = 100, height = 6, color, label }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const barColor = color || (pct >= 80 ? 'var(--neon-green)' : pct >= 40 ? 'var(--neon-yellow)' : 'var(--neon-blue)');
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{
        width: '100%', height, borderRadius: height / 2,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: height / 2,
          background: barColor,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 8px ${barColor}40`,
        }} />
      </div>
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, width = 500, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', letterSpacing: 1, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, fontSize: '1.1rem' }}>
            <i className="fas fa-times" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── EmptyState ────────────────────────────────────────────────────────────── */
export function EmptyState({ icon = 'fa-inbox', title = 'Nothing here', message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-dim)', fontSize: '1.5rem', marginBottom: 16,
      }}>
        <i className={`fas ${icon}`} />
      </div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 6px' }}>{title}</h3>
      {message && <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '0 0 16px', maxWidth: 300 }}>{message}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
