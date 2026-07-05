import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import heroImage from '../../assets/hero-image.png';
import chatgpt from '../../images/aitoolslogo/chatgpt_ai_logo.jpg';
import claude from '../../images/aitoolslogo/claude_ai_logo.jpg';
import gemini from '../../images/aitoolslogo/Gemini_ai_logo.jpg';
import perplexity from '../../images/aitoolslogo/perplexity_ai_logo.jpg';
import canva from '../../images/aitoolslogo/Canva_ai_logo.jpg';
import grok from '../../images/aitoolslogo/Grok_ai_logo.jpg';
import deepseek from '../../images/aitoolslogo/deepseek_ai_logo.jpg';
import copilot from '../../images/aitoolslogo/copilot_ai_logo.jpg';

const ORBIT_RADIUS = 200;

const logos = [
  { src: chatgpt, label: 'ChatGPT', delay: 0, duration: 4 },
  { src: claude, label: 'Claude', delay: 0.5, duration: 4.5 },
  { src: gemini, label: 'Gemini', delay: 1, duration: 3.8 },
  { src: perplexity, label: 'Perplexity', delay: 1.5, duration: 5.2 },
  { src: canva, label: 'Canva', delay: 2, duration: 4.2 },
  { src: grok, label: 'Grok', delay: 2.5, duration: 3.5 },
  { src: deepseek, label: 'DeepSeek', delay: 3, duration: 4.8 },
  { src: copilot, label: 'Copilot', delay: 3.5, duration: 4.6 },
].map((logo, i) => {
  const angle = (i * 360) / 8;
  const rad = (angle * Math.PI) / 180;
  return {
    ...logo,
    x: Math.cos(rad) * ORBIT_RADIUS,
    y: Math.sin(rad) * ORBIT_RADIUS,
    angle,
  };
});

export default function HeroSection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="hero-section" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 24px 80px',
    }}>
      <div className="hero-grid-bg" />
      <div className="hero-neural-lines" />
      <div className="particles" />

      <div className="hero-main" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}>
        <div className="landing-grid-2 hero-grid" style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <div className="hero-text-col">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(0,255,163,0.06)',
              border: '1px solid rgba(0,255,163,0.2)',
              borderRadius: 100,
              padding: '8px 20px',
              marginBottom: 32,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--neon-green)',
                boxShadow: '0 0 8px var(--neon-green)',
                animation: 'pulse-glow 2s infinite',
              }} />
              <span style={{
                color: 'var(--neon-green)',
                fontSize: '0.75rem',
                fontFamily: 'Share Tech Mono, monospace',
                letterSpacing: 2,
              }}>
                JOEAILABS v2.0 — THE AI ECOSYSTEM
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.1,
              marginBottom: 20,
            }}>
              <span style={{ display: 'block', color: '#fff', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                Master{' '}
                <span style={{
                  color: 'var(--neon-green)',
                  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 40px rgba(0,255,163,0.3)',
                }}>
                  AI Creation
                </span>
              </span>
              <span style={{ display: 'block', color: '#fff', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                in{' '}
                <span style={{
                  color: 'var(--neon-yellow)',
                  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 40px rgba(255,214,0,0.3)',
                }}>
                  One Place.
                </span>
              </span>
            </h1>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              maxWidth: 500,
              marginBottom: 36,
            }}>
             Learn how to use AI to create music, images, videos, presentations, documents, websites, social media content, and more — with step-by-step real-world tutorials designed for creators, students, freelancers, entrepreneurs, and 
             anyone who wants to work smarter, create faster, and build powerful digital skills using modern AI tools.
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg hero-cta">
                  <i className="fas fa-gauge-high" /> GO TO DASHBOARD
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg hero-cta">
                    <i className="fas fa-rocket" /> ENTER JOEAILABS
                  </Link>
                  <button className="btn btn-secondary btn-lg" onClick={() => {
                    document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <i className="fas fa-play" /> WATCH DEMO
                  </button>
                </>
              )}
            </div>

            <div className="hero-stats" style={{
              display: 'flex',
              gap: 40,
              marginTop: 56,
              flexWrap: 'wrap',
            }}>
              {[
                { num: '13+', label: 'AI Lessons' },
                { num: '226+', label: 'Prompt Templates' },
                { num: '1,200+', label: 'Active Users' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: 'var(--neon-green)',
                    lineHeight: 1,
                  }}>{s.num}</div>
                  <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    marginTop: 4,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image-col">
            <div className="hero-visual-container">
              <div className="hero-orbit-area">
                {logos.map((logo, i) => (
                  <div
                    key={i}
                    className="orbit-logo"
                    style={{
                      left: `calc(50% + ${logo.x}px - 24px)`,
                      top: `calc(50% + ${logo.y}px - 24px)`,
                      '--duration': `${logo.duration}s`,
                      '--delay': `${logo.delay}s`,
                    }}
                  >
                    <img src={logo.src} alt={logo.label} />
                  </div>
                ))}
                <img
                  src={heroImage}
                  alt="JOEAILABS — Master AI Creation"
                  className="hero-image-core"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span style={{
          fontSize: '0.6rem',
          color: 'var(--text-dim)',
          fontFamily: 'Share Tech Mono, monospace',
          letterSpacing: 2,
          display: 'block',
          marginBottom: 8,
        }}>SCROLL</span>
        <div style={{
          width: 1,
          height: 40,
          background: 'linear-gradient(180deg, var(--neon-green), transparent)',
          margin: '0 auto',
          animation: 'scrollPulse 2s ease-in-out infinite',
        }} />
      </div>
    </section>
  );
}
