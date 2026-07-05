import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocial } from '../../context/SocialContext';
import NotificationsDropdown from '../social/NotificationsDropdown';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadNotifications, unreadMessages } = useSocial();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);
  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/feed', icon: 'fa-newspaper', label: 'Feed' },
    { to: '/modules', icon: 'fa-graduation-cap', label: 'AI Academy' },
    { to: '/prompts', icon: 'fa-bolt', label: 'Prompt Library' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', icon: 'fa-shield', label: 'Admin' });
  }

  const mobileLinks = isLoggedIn
    ? navLinks
    : [
        ...(isLanding ? [{ to: '#master', icon: 'fa-cubes', label: 'AI Tools', anchor: true }] : []),
        { to: '/login', icon: 'fa-right-to-bracket', label: 'Login' },
        { to: '/register', icon: 'fa-rocket', label: 'Get Started' },
      ];

  const isScrolledOrNotLanding = scrolled || !isLanding;

  return (
    <>
      <nav className={`navbar${isScrolledOrNotLanding ? ' navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <span className="navbar-logo-text">
              <span className="logo-joe">JOE</span>
              <span className="logo-ai">AI</span>
              <span className="logo-labs">LABS</span>
            </span>
          </Link>

          <div className="navbar-desktop">
            {isLoggedIn && navLinks.map(l => (
              <Link
                key={l.to} to={l.to}
                className={`navbar-link${isActive(l.to) ? ' active' : ''}`}
              >
                <i className={`fas ${l.icon}`} />{l.label}
              </Link>
            ))}
          </div>

          <div className="navbar-desktop-right">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>

            {isLoggedIn ? (
              <>
                <button
                  className="navbar-icon-btn"
                  onClick={() => navigate('/messages')}
                  title="Messages"
                >
                  <i className="fas fa-envelope" />
                  {unreadMessages > 0 && (
                    <span className="navbar-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
                  )}
                </button>

                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    className="navbar-icon-btn"
                    onClick={() => setNotifOpen(p => !p)}
                    title="Notifications"
                  >
                    <i className="fas fa-bell" />
                    {unreadNotifications > 0 && (
                      <span className="navbar-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                    )}
                  </button>
                  <NotificationsDropdown
                    isOpen={notifOpen}
                    onClose={() => setNotifOpen(false)}
                  />
                </div>

                <Link to="/settings" className="navbar-user" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  <div className="navbar-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <i className="fas fa-user" />
                    )}
                  </div>
                  <div className="navbar-user-info">
                    <span className="navbar-username">{user?.username}</span>
                    {user?.isPremium && <span className="navbar-pro-badge">⭐ PRO</span>}
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  <i className="fas fa-right-from-bracket" /> Logout
                </button>
              </>
            ) : (
              <>
                {isLanding && (
                  <>
                    <a href="#master" className="btn btn-ghost btn-sm nav-desktop-link" onClick={(e) => { e.preventDefault(); document.getElementById('master')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
                    <a href="#pro" className="btn btn-ghost btn-sm nav-desktop-link" onClick={(e) => { e.preventDefault(); document.getElementById('pro')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
                  </>
                )}
                <Link to="/login" className="btn btn-ghost btn-sm nav-desktop-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm nav-desktop-register">Enter JOEAILABS</Link>
              </>
            )}
          </div>

          <button
            className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}

      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <div className="mobile-drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="navbar-logo-text">
            <span className="logo-joe">JOE</span>
            <span className="logo-ai">AI</span>
            <span className="logo-labs">LABS</span>
          </span>
          <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36, fontSize: '0.9rem' }} aria-label="Toggle theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>

        {isLoggedIn && (
          <Link to="/settings" onClick={() => setMenuOpen(false)} className="mobile-drawer-user" style={{ textDecoration: 'none', display: 'flex', gap: 12 }}>
            <div className="navbar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <i className="fas fa-user" />
              )}
            </div>
            <div>
              <div className="mobile-drawer-username">{user?.username}</div>
              {user?.isPremium && <span className="navbar-pro-badge">⭐ PRO</span>}
            </div>
          </Link>
        )}

        <div className="mobile-drawer-links">
          {isLoggedIn && (
            <>
              <Link to="/feed" className={`mobile-drawer-link${isActive('/feed') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                <i className="fas fa-newspaper" />Feed
              </Link>
              <Link to="/messages" className={`mobile-drawer-link${isActive('/messages') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                <i className="fas fa-envelope" />Messages
                {unreadMessages > 0 && <span className="mobile-badge">{unreadMessages}</span>}
              </Link>
              <Link to="/notifications" className={`mobile-drawer-link${isActive('/notifications') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                <i className="fas fa-bell" />Notifications
                {unreadNotifications > 0 && <span className="mobile-badge">{unreadNotifications}</span>}
              </Link>
              <div className="divider" style={{ margin: '8px 0' }} />
            </>
          )}
          {mobileLinks.map(l => (
            l.anchor ? (
              <a key={l.label} href={l.to} className="mobile-drawer-link"
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById(l.to.slice(1))?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <i className={`fas ${l.icon}`} />{l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.to}
                className={`mobile-drawer-link${isActive(l.to) ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className={`fas ${l.icon}`} />{l.label}
              </Link>
            )
          ))}
        </div>

        {isLoggedIn && (
          <div className="mobile-drawer-footer">
            <button onClick={handleLogout} className="mobile-drawer-logout">
              <i className="fas fa-right-from-bracket" /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
