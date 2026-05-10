const FUTURE_POINTS = [
  { icon: 'fa-brain', text: 'Learn practical AI skills that matter in the real world' },
  { icon: 'fa-coins', text: 'Build digital income streams with AI-powered systems' },
  { icon: 'fa-robot', text: 'Automate your workflow and save hours every day' },
  { icon: 'fa-bolt', text: 'Create faster, better, and smarter with AI tools' },
  { icon: 'fa-globe', text: 'Join a global AI network of ambitious creators' },
];

export default function FutureSection() {
  return (
    <section className="future-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, transparent, rgba(0,255,163,0.015), transparent)',
      borderTop: '1px solid rgba(0,255,163,0.05)',
      borderBottom: '1px solid rgba(0,255,163,0.05)',
    }}>
      {/* Cyberpunk grid overlay */}
      <div className="section-grid-bg" />

      <div className="container">
          <div className="landing-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}>
          {/* Left: Cyberpunk visual */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(0,255,163,0.1)',
              background: 'rgba(8,15,29,0.4)',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* Animated grid inside */}
              <div className="inner-grid" />
              {/* Glow orbs */}
              <div className="glow-orb o1" />
              <div className="glow-orb o2" />

              <div style={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
              }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: 'var(--neon-green)',
                  textShadow: '0 0 60px rgba(0,255,163,0.3)',
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  AI
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  letterSpacing: 3,
                }}>
                  FUTURE IS BUILT HERE
                </div>
                {/* Circuit lines */}
                <div className="circuit-lines" />
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute',
              bottom: -12,
              right: -12,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'rgba(255,214,0,0.08)',
              border: '1px solid rgba(255,214,0,0.2)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--neon-yellow)',
              letterSpacing: 1,
              animation: 'float 5s ease-in-out infinite',
            }}>
              <i className="fas fa-crown" style={{ marginRight: 6 }} />
              BUILT FOR AMBITIOUS MINDS
            </div>
          </div>

          {/* Right: Messaging */}
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: 20 }}>
              BUILT FOR THE FUTURE
            </span>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              color: 'var(--text-main)',
              marginBottom: 28,
              lineHeight: 1.3,
            }}>
              The AI Economy is Here.{' '}
              <span style={{
                color: 'var(--neon-green)',
                textShadow: '0 0 30px rgba(0,255,163,0.2)',
              }}>
                Will You Build or Watch?
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {FUTURE_POINTS.map((pt, i) => (
                <div
                  key={i}
                  className="future-point"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: 'rgba(0,255,163,0.02)',
                    border: '1px solid rgba(0,255,163,0.06)',
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(0,255,163,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    color: 'var(--neon-green)',
                    flexShrink: 0,
                  }}>
                    <i className={`fas ${pt.icon}`} />
                  </div>
                  <span style={{
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                  }}>
                    {pt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
