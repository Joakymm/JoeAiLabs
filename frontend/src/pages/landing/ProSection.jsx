import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FREE_FEATURES = [
  '3 AI learning modules',
  'Basic prompt templates',
  'Limited tool access',
];

const PRO_FEATURES = [
  'All 6 AI modules — full access',
  'Premium prompt vault (226+)',
  'Make money with AI (Train AI)',
  'Creator workflow blueprints',
  'AI business automation systems',
  'Exclusive community access',
  'Priority support',
  'Lifetime updates',
];

export default function ProSection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="pro-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, transparent, rgba(255,214,0,0.02), transparent)',
      borderTop: '1px solid rgba(255,214,0,0.05)',
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-yellow" style={{ marginBottom: 16 }}>
            <i className="fas fa-crown" style={{ marginRight: 4 }} /> UNLOCK PRO
          </span>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--text-main)',
            marginBottom: 12,
          }}>
            Free vs{' '}
            <span style={{
              color: 'var(--neon-yellow)',
              textShadow: '0 0 30px rgba(255,214,0,0.2)',
            }}>
              Unlimited Pro
            </span>
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: 500,
            margin: '0 auto',
            fontSize: '0.95rem',
          }}>
            Start free. Upgrade when you&apos;re ready to go all in.
          </p>
        </div>

        <div className="landing-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          maxWidth: 800,
          margin: '0 auto',
        }}>
          {/* Free tier */}
          <div className="pro-card free" style={{
            borderRadius: 16,
            border: '1px solid rgba(0,255,163,0.1)',
            background: 'rgba(8,15,29,0.4)',
            padding: '36px 28px',
            position: 'relative',
          }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              FREE
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--neon-green)',
              marginBottom: 6,
            }}>
              $0
            </div>
            <div style={{
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
              marginBottom: 28,
            }}>
              Get started today
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              marginBottom: 32,
            }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 12,
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}>
                  <i className="fas fa-check-circle" style={{
                    color: 'var(--neon-green)',
                    flexShrink: 0,
                    fontSize: '0.85rem',
                  }} />
                  {f}
                </li>
              ))}
            </ul>
            {isLoggedIn ? (
              <div style={{
                padding: '14px 20px',
                textAlign: 'center',
                borderRadius: 10,
                background: 'rgba(0,255,163,0.05)',
                border: '1px solid rgba(0,255,163,0.1)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                fontFamily: 'Share Tech Mono, monospace',
              }}>
                CURRENT PLAN
              </div>
            ) : (
              <Link to="/register" className="btn btn-secondary btn-full">
                <i className="fas fa-rocket" /> START FREE
              </Link>
            )}
          </div>

          {/* Pro tier */}
          <div className="pro-card pro" style={{
            borderRadius: 16,
            border: '1px solid rgba(255,214,0,0.2)',
            background: 'rgba(255,214,0,0.03)',
            padding: '36px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Pro glow overlay */}
            <div style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,214,0,0.06), transparent)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--neon-yellow)',
              color: '#020508',
              padding: '4px 20px',
              borderRadius: 100,
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: 2,
            }}>
              RECOMMENDED
            </div>

            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.85rem',
              color: 'var(--neon-yellow)',
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              UNLIMITED PRO
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--neon-yellow)',
              marginBottom: 6,
            }}>
              $29
            </div>
            <div style={{
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
              marginBottom: 28,
            }}>
              One-time — lifetime access
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              marginBottom: 32,
            }}>
              {PRO_FEATURES.map((f, i) => (
                <li key={i} style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 12,
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}>
                  <i className="fas fa-check-circle" style={{
                    color: 'var(--neon-yellow)',
                    flexShrink: 0,
                    fontSize: '0.85rem',
                  }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/upgrade" className="btn btn-yellow btn-full" style={{
              boxShadow: '0 0 30px rgba(255,214,0,0.2)',
            }}>
              <i className="fas fa-crown" /> UNLOCK PRO
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
