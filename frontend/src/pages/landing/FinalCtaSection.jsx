import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function FinalCtaSection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="cta-section" style={{
      padding: '120px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, transparent, rgba(0,255,163,0.02))',
      borderTop: '1px solid rgba(0,255,163,0.06)',
    }}>
      {/* Glowing AI skyline */}
      <div className="cta-skyline" />
      <div className="particles" />

      <div className="container-sm" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '0.7rem',
          color: 'var(--neon-green)',
          letterSpacing: 3,
          marginBottom: 20,
          opacity: 0.6,
        }}>
          JOIN THE AI REVOLUTION
        </div>

        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 1.15,
          marginBottom: 20,
        }}>
          <span style={{
            color: '#fff',
            textShadow: '0 0 40px rgba(0,255,163,0.15)',
          }}>
            The AI Revolution{' '}
          </span>
          <span style={{
            color: 'var(--neon-green)',
            textShadow: '0 0 40px rgba(0,255,163,0.3)',
            display: 'block',
          }}>
            Already Started.
          </span>
        </h2>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.15rem',
          maxWidth: 500,
          margin: '0 auto 40px',
          lineHeight: 1.8,
        }}>
          The question is whether you&apos;ll{' '}
          <span style={{ color: 'var(--neon-green)' }}>lead it</span> or{' '}
          <span style={{ color: 'var(--text-dim)' }}>watch it happen</span>.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg" style={{
              padding: '18px 48px',
              fontSize: '1rem',
              animation: 'pulse-glow 2s infinite',
            }}>
              <i className="fas fa-gauge-high" /> ENTER DASHBOARD
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary btn-lg"
                style={{
                  padding: '18px 48px',
                  fontSize: '1rem',
                  animation: 'pulse-glow 2s infinite',
                }}
              >
                <i className="fas fa-rocket" /> ENTER JOEAILABS
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ padding: '18px 40px' }}>
                <i className="fas fa-right-to-bracket" /> SIGN IN
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
