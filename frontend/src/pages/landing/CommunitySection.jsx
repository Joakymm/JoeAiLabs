export default function CommunitySection() {
  return (
    <section className="community-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
      background: 'rgba(0,212,255,0.01)',
      borderTop: '1px solid rgba(0,255,163,0.05)',
    }}>
      <div className="container">
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          borderRadius: 24,
          border: '1px solid rgba(0,255,163,0.1)',
          background: 'rgba(8,15,29,0.4)',
          backdropFilter: 'blur(20px)',
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glass shine */}
          <div className="glass-shine" />

          <span className="badge badge-blue" style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <i className="fas fa-users" style={{ marginRight: 4 }} /> COMMUNITY
          </span>

          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            color: 'var(--text-main)',
            marginBottom: 12,
            position: 'relative',
            zIndex: 1,
          }}>
            Don&apos;t Learn AI{' '}
            <span style={{
              color: 'var(--neon-green)',
              textShadow: '0 0 30px rgba(0,255,163,0.2)',
            }}>Alone</span>
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            maxWidth: 450,
            margin: '0 auto 32px',
            fontSize: '0.95rem',
            position: 'relative',
            zIndex: 1,
          }}>
            Join 1,200+ creators, freelancers, and AI enthusiasts sharing prompts,
            wins, and breakthroughs every day.
          </p>

          {/* Community platforms */}
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}>
            {[
              {
                icon: 'fa-brands fa-whatsapp',
                color: '#25D366',
                label: 'WhatsApp',
                members: '340+',
                url: 'https://chat.whatsapp.com/joinjoeailabs?utm_source=landing&utm_medium=community_section&utm_campaign=joeailabs_community',
              },
              {
                icon: 'fa-brands fa-telegram',
                color: '#0088cc',
                label: 'Telegram',
                members: '180+',
                url: 'https://t.me/joeailabs?utm_source=landing&utm_medium=community_section&utm_campaign=joeailabs_community',
              },
              {
                icon: 'fa-brands fa-discord',
                color: '#5865F2',
                label: 'Discord',
                members: 'Coming Soon',
                url: '#',
                disabled: true,
              },
            ].map(c => (
              <a
                key={c.label}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`community-link ${c.disabled ? 'disabled' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 24px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${c.color}22`,
                  textDecoration: 'none',
                  minWidth: 200,
                  transition: 'all 0.3s ease',
                  opacity: c.disabled ? 0.5 : 1,
                  cursor: c.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${c.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  color: c.color,
                  flexShrink: 0,
                }}>
                  <i className={c.icon} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    marginBottom: 2,
                  }}>
                    {c.label}
                  </div>
                  <div style={{
                    color: c.disabled ? 'var(--text-dim)' : 'var(--neon-green)',
                    fontSize: '0.75rem',
                  }}>
                    <span style={{ color: c.disabled ? 'var(--text-dim)' : 'var(--neon-green)' }}>
                      ●
                    </span>
                    {' '}{c.members} members
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            marginTop: 32,
            padding: '20px 24px',
            borderRadius: 12,
            background: 'rgba(0,255,163,0.03)',
            border: '1px solid rgba(0,255,163,0.08)',
            position: 'relative',
            zIndex: 1,
          }}>
            <i className="fas fa-quote-left" style={{
              color: 'var(--neon-green)',
              opacity: 0.3,
              fontSize: '1.2rem',
              marginBottom: 8,
              display: 'block',
            }} />
            <p style={{
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              lineHeight: 1.7,
              margin: 0,
            }}>
              &ldquo;JOEAILABS changed how I work. The community is incredible — I&apos;ve
              gotten feedback on my prompts, landed freelance gigs, and learned more
              in 2 weeks than months of YouTube tutorials.&rdquo;
            </p>
            <div style={{
              marginTop: 12,
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.72rem',
              color: 'var(--neon-green)',
              letterSpacing: 1,
            }}>
              — Alex R., AI Freelancer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
