import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function FounderSection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="founder-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
          <div className="landing-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}>
          {/* Text */}
          <div>
            <span className="badge badge-green" style={{ marginBottom: 20 }}>
              <i className="fas fa-quote-left" style={{ marginRight: 4 }} /> FOUNDER STORY
            </span>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              marginBottom: 20,
              color: 'var(--text-main)',
              lineHeight: 1.3,
            }}>
              The Future of AI in{' '}
              <span style={{
                color: 'var(--neon-green)',
                textShadow: '0 0 30px rgba(0,255,163,0.2)',
              }}>
                Africa
              </span>{' '}
              Starts Here
            </h2>

            <p style={{
              color: 'var(--text-muted)',
              lineHeight: 1.9,
              marginBottom: 16,
              fontSize: '0.95rem',
            }}>
              <strong style={{ color: 'var(--neon-green)' }}>Joakim Ngiciri (Joetechie)</strong>{' '}
              founded JOEAILABS with a clear mission: empower African creators and entrepreneurs
              to lead the AI revolution — not just consume it.
            </p>
            <p style={{
              color: 'var(--text-muted)',
              lineHeight: 1.9,
              marginBottom: 24,
              fontSize: '0.95rem',
            }}>
                  Instead of scattered tutorials and disconnected tools, JOEAILABS delivers
                  structured AI education, real-world prompt systems, and monetization pathways
                  into one unified ecosystem — built for the ambitious creator.
                </p>

            <blockquote style={{
              borderLeft: '3px solid var(--neon-green)',
              paddingLeft: 20,
              color: 'var(--text-main)',
              fontStyle: 'italic',
              lineHeight: 1.8,
              marginBottom: 32,
              fontSize: '1rem',
              background: 'rgba(0,255,163,0.02)',
              padding: '16px 24px',
              borderRadius: '0 12px 12px 0',
              border: '1px solid rgba(0,255,163,0.06)',
              borderLeftWidth: 3,
            }}>
              &ldquo;The AI economy is here. The question isn&apos;t whether you&apos;ll use AI —
              it&apos;s whether you&apos;ll build with it. JOEAILABS is my answer to that question.&rdquo;
            </blockquote>

            {!isLoggedIn && (
              <Link to="/register" className="btn btn-primary">
                <i className="fas fa-arrow-right" /> JOIN THE MOVEMENT
              </Link>
            )}
          </div>

          {/* Visual */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(0,255,163,0.15)',
              boxShadow: '0 0 80px rgba(0,255,163,0.08)',
              aspectRatio: '3/4',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div className="founder-glow" />
              <div style={{ textAlign: 'center', padding: 40, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(0,255,163,0.2), rgba(255,214,0,0.1))',
                  border: '3px solid var(--neon-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  boxShadow: '0 0 40px rgba(0,255,163,0.3)',
                  animation: 'pulse-glow 3s infinite',
                }}>
                  🔥
                </div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.2rem',
                  color: 'var(--neon-green)',
                  marginBottom: 6,
                }}>
                  JOETECHIE
                </div>
                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}>
                  Joakim Ngiciri
                </div>
                <div style={{
                  color: 'var(--text-dim)',
                  fontSize: '0.75rem',
                  marginTop: 4,
                  fontFamily: 'Share Tech Mono, monospace',
                }}>
                  CEO & FOUNDER
                </div>
                <div style={{ marginTop: 20 }}>
                  <span className="badge badge-green">Founded 2024</span>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: 20,
                  justifyContent: 'center',
                  marginTop: 24,
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: 'rgba(0,255,163,0.03)',
                  border: '1px solid rgba(0,255,163,0.06)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--neon-green)',
                    }}>KE</div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                      fontFamily: 'Share Tech Mono, monospace',
                    }}>BUILT IN</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(0,255,163,0.1)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--neon-yellow)',
                    }}>2024</div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                      fontFamily: 'Share Tech Mono, monospace',
                    }}>FOUNDED</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(0,255,163,0.1)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--neon-blue)',
                    }}>AI</div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                      fontFamily: 'Share Tech Mono, monospace',
                    }}>FOCUSED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
