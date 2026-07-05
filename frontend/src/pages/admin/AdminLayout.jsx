import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const SIDEBAR = [
  { to: '/admin',           icon: 'fa-gauge-high',      label: 'Dashboard',  end: true },
  { to: '/admin/courses',   icon: 'fa-book',            label: 'Courses' },
  { to: '/admin/prompts',   icon: 'fa-bolt',            label: 'Prompts' },
  { to: '/admin/users',     icon: 'fa-users',           label: 'Users' },
  { to: '/admin/quizzes',   icon: 'fa-circle-question', label: 'Quizzes' },
  { to: '/admin/analytics', icon: 'fa-chart-line',      label: 'Analytics' },
  { to: '/admin/payments',  icon: 'fa-credit-card',     label: 'Payments' },
  { to: '/admin/settings',  icon: 'fa-gear',            label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => { setMobileSidebarOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const isActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const SidebarContent = ({ mobile = false }) => (
    <div style={{
      width: mobile ? 260 : (collapsed ? 64 : 220),
      background: 'var(--bg-dark)',
      borderRight: '1px solid rgba(0,255,163,0.08)',
      padding: '16px 0',
      transition: mobile ? 'none' : 'width 0.2s',
      display: 'flex', flexDirection: 'column',
      height: mobile ? '100%' : undefined,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', marginBottom: 24,
      }}>
        {(!collapsed || mobile) && (
          <span style={{
            fontFamily: 'Orbitron,sans-serif', fontSize: '0.82rem',
            color: 'var(--neon-yellow)', letterSpacing: 2,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="fas fa-shield" style={{ fontSize: '0.75rem' }} />ADMIN
          </span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 6, borderRadius: 6, marginLeft: 'auto' }}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
        {SIDEBAR.map(item => {
          const active = isActive(item);
          return (
            <Link key={item.to} to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
                color: active ? 'var(--neon-green)' : 'var(--text-muted)',
                background: active ? 'rgba(0,255,163,0.08)' : 'transparent',
                borderLeft: active ? '3px solid var(--neon-green)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <i className={`fas ${item.icon}`} style={{ width: 18, textAlign: 'center', fontSize: '0.85rem', flexShrink: 0 }} />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(0,255,163,0.06)', marginTop: 12 }}>
        <Link to="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
            color: 'var(--text-dim)', fontSize: '0.85rem', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <i className="fas fa-arrow-left" style={{ width: 18, textAlign: 'center', flexShrink: 0 }} />
          {(!collapsed || mobile) && <span>Back to App</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        display: 'none', padding: '10px 16px',
        borderBottom: '1px solid rgba(0,255,163,0.08)',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-dark)',
      }} className="admin-mobile-bar">
        <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-yellow)' }}>
          <i className="fas fa-shield" style={{ marginRight: 8 }} />ADMIN
        </span>
        <button onClick={() => setMobileSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}>
          <i className="fas fa-bars" />
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Desktop sidebar */}
        <div style={{ display: 'flex', flexShrink: 0 }} className="admin-desktop-sidebar">
          <SidebarContent />
        </div>

        {/* Mobile overlay + drawer */}
        {mobileSidebarOpen && (
          <>
            <div onClick={() => setMobileSidebarOpen(false)} style={{
              position: 'fixed', inset: 0, background: 'rgba(2,5,8,0.7)',
              backdropFilter: 'blur(4px)', zIndex: 800,
            }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 900, display: 'flex' }}>
              <SidebarContent mobile />
            </div>
          </>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-bar { display: flex !important; }
        }
        @media (max-width: 768px) {
          div[style*="padding: 32px"] { padding: 16px !important; }
        }
      `}</style>
    </>
  );
}
