import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const SIDEBAR = [
  { to: '/admin',           icon: 'fa-gauge-high',     label: 'Dashboard',     end: true },
  { to: '/admin/courses',   icon: 'fa-book',           label: 'Courses' },
  { to: '/admin/prompts',   icon: 'fa-bolt',           label: 'Prompts' },
  { to: '/admin/users',     icon: 'fa-users',          label: 'Users' },
  { to: '/admin/quizzes',   icon: 'fa-question-circle',label: 'Quizzes' },
  { to: '/admin/analytics', icon: 'fa-chart-line',     label: 'Analytics' },
  { to: '/admin/payments',  icon: 'fa-credit-card',    label: 'Payments' },
  { to: '/admin/settings',  icon: 'fa-gear',           label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        width: collapsed ? 60 : 220,
        background: 'var(--bg-dark)',
        borderRight: '1px solid rgba(0,255,163,0.08)',
        padding: '16px 0',
        transition: 'width 0.2s',
        flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', marginBottom: 20,
        }}>
          {!collapsed && (
            <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-yellow)', letterSpacing: 2 }}>
              <i className="fas fa-shield" style={{ marginRight: 8, fontSize: '0.75rem' }} />ADMIN
            </span>
          )}
          <button onClick={() => setCollapsed(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
          </button>
        </div>

        {SIDEBAR.map(item => (
          <Link key={item.to} to={item.to}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', margin: '2px 8px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              color: isActive(item) ? 'var(--neon-green)' : 'var(--text-muted)',
              background: isActive(item) ? 'rgba(0,255,163,0.06)' : 'transparent',
              transition: 'all 0.15s',
            }}>
            <i className={`fas ${item.icon}`} style={{ width: 20, textAlign: 'center', fontSize: '0.9rem' }} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', padding: '0 16px' }}>
          <Link to="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
              color: 'var(--text-dim)', fontSize: '0.82rem',
            }}>
            <i className="fas fa-arrow-left" />
            {!collapsed && <span>Back to App</span>}
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <Outlet />
      </div>
    </div>
  );
}
