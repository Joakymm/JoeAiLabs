import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Pricing', to: '/upgrade' },
  { label: 'Community', to: '/community' },
  { label: 'Contact', to: '#' },
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms', to: '#' },
  { label: 'Careers', to: '#' },
];

const SOCIAL_LINKS = [
  { icon: 'fa-brands fa-discord', url: '#', label: 'Discord' },
  { icon: 'fa-brands fa-github', url: '#', label: 'GitHub' },
  { icon: 'fa-brands fa-telegram', url: 'https://t.me/joeailabs?utm_source=landing&utm_medium=footer&utm_campaign=joeailabs_community', label: 'Telegram' },
  { icon: 'fa-brands fa-youtube', url: '#', label: 'YouTube' },
];

export default function FooterSection() {
  return (
    <footer className="footer-section" style={{
      borderTop: '1px solid rgba(0,255,163,0.06)',
      padding: '48px 24px 32px',
      background: 'rgba(0,0,0,0.3)',
    }}>
      <div className="container">
        <div className="landing-grid-3" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 40,
          marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.3rem', fontWeight: 900 }}>
                <span style={{
                  color: 'var(--neon-green)',
                  textShadow: '0 0 20px rgba(0,255,163,0.5)',
                }}>JOE</span>
                <span style={{ color: '#fff' }}>AI</span>
                <span style={{
                  color: 'var(--neon-yellow)',
                  textShadow: '0 0 20px rgba(255,214,0,0.4)',
                }}>LABS</span>
              </span>
            </Link>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              maxWidth: 320,
            }}>
              The AI operating system for creators. Master AI tools, build income streams,
              and join the future of work.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.75rem',
              color: 'var(--neon-green)',
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              LINKS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FOOTER_LINKS.map(l => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    transition: 'color 0.2s',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.75rem',
              color: 'var(--neon-green)',
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              CONNECT
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(0,255,163,0.04)',
                    border: '1px solid rgba(0,255,163,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid rgba(0,255,163,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{
            color: 'var(--text-dim)',
            fontSize: '0.78rem',
          }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span style={{ color: 'var(--neon-green)' }}>JOE</span>AI
              <span style={{ color: 'var(--neon-yellow)' }}>LABS</span>
            </span>
            {' '}— © {new Date().getFullYear()} Joakim Ngiciri. All rights reserved.
          </span>
          <span style={{
            color: 'var(--text-dim)',
            fontSize: '0.7rem',
            fontFamily: 'Share Tech Mono, monospace',
          }}>
            BUILT WITH AI IN KENYA
          </span>
        </div>
      </div>
    </footer>
  );
}
