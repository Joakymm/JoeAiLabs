import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import chatgpt from '../../images/aitoolslogo/chatgpt_ai_logo.jpg';
import claude from '../../images/aitoolslogo/claude_ai_logo.jpg';
import google from '../../images/aitoolslogo/Google_ai_logo.jpg';
import gemini from '../../images/aitoolslogo/Gemini_ai_logo.jpg';
import copilot from '../../images/aitoolslogo/copilot_ai_logo.jpg';
import deepseek from '../../images/aitoolslogo/deepseek_ai_logo.jpg';
import perplexity from '../../images/aitoolslogo/perplexity_ai_logo.jpg';
import grok from '../../images/aitoolslogo/Grok_ai_logo.jpg';
import heygen from '../../images/aitoolslogo/Heygen_ai_logo.jpg';
import elevenlabs from '../../images/aitoolslogo/Elevenlabs_ai_logo.jpg';
import lovable from '../../images/aitoolslogo/Lovable_ai_logo.jpg';
import make from '../../images/aitoolslogo/Make_ai_logo.jpg';
import n8n from '../../images/aitoolslogo/n8n_ai_logo.jpg';
import canva from '../../images/aitoolslogo/Canva_ai_logo.jpg';

const AI_LOGOS = [
  chatgpt, claude, google, gemini, copilot, deepseek,
  perplexity, grok, heygen, elevenlabs, lovable, make, n8n, canva,
];

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
      {/* Animated grid background */}
      <div className="hero-grid-bg" />
      {/* Glowing neural lines */}
      <div className="hero-neural-lines" />
      {/* Floating particles */}
      <div className="particles" />

      {/* AI Tools Marquee — Top */}
      <div className="ai-tools-marquee">
        <div className="ai-tools-marquee-bg" />
        <div className="ai-tools-marquee-track">
          <div className="ai-tools-marquee-content">
            {AI_LOGOS.map((src, i) => (
              <img key={i} src={src} alt="" className="ai-tool-logo" />
            ))}
          </div>
          <div className="ai-tools-marquee-content">
            {AI_LOGOS.map((src, i) => (
              <img key={`dup-${i}`} src={src} alt="" className="ai-tool-logo" />
            ))}
          </div>
        </div>
      </div>

      <div className="hero-main" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}>
        <div className="landing-grid-2" style={{
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
        {/* Left: Headline + CTA */}
        <div>
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
            <span style={{ display: 'block', color: '#fff' }}>
              The AI{' '}
              <span style={{
                color: 'var(--neon-green)',
                textShadow: '0 0 40px rgba(0,255,163,0.3)',
              }}>
                Operating System
              </span>
            </span>
            <span style={{ display: 'block', color: '#fff' }}>
              for{' '}
              <span style={{
                color: 'var(--neon-yellow)',
                textShadow: '0 0 40px rgba(255,214,0,0.3)',
              }}>
                Creators.
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
            JOEAILABS helps creators, students, freelancers, and entrepreneurs
            master AI tools, prompt engineering, content creation, automation,
            and monetization through real-world workflows.
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

          {/* Stats strip */}
          <div className="hero-stats" style={{
            display: 'flex',
            gap: 40,
            marginTop: 56,
            flexWrap: 'wrap',
          }}>
            {[
              { num: '6', label: 'AI Modules' },
              { num: '226+', label: 'Prompt Templates' },
              { num: '1,200+', label: 'Active Creators' },
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

        {/* Right: AI Dashboard Preview */}
        <div style={{ position: 'relative' }}>
          {/* Main holographic card */}
          <div className="holographic-card" style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(0,255,163,0.15)',
            background: 'rgba(8,15,29,0.6)',
            backdropFilter: 'blur(20px)',
            padding: 28,
            boxShadow: '0 0 80px rgba(0,255,163,0.08)',
            position: 'relative',
          }}>
            {/* Animated glow border */}
            <div className="glow-border" />

            {/* Dashboard mockup content */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--neon-green)',
                  boxShadow: '0 0 10px var(--neon-green)',
                }} />
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  letterSpacing: 1,
                }}> </span>
              </div>

              {/* Mini analytics row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}>
                {[
                  { label: 'MODULES', value: '6/6', color: 'var(--neon-green)' },
                  { label: 'PROMPTS', value: '226', color: 'var(--neon-blue)' },
                  { label: 'PROGRESS', value: '87%', color: 'var(--neon-yellow)' },
                  { label: 'STREAK', value: '12d', color: 'var(--neon-green)' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'rgba(0,255,163,0.03)',
                    borderRadius: 10,
                    border: '1px solid rgba(0,255,163,0.08)',
                    padding: '12px 14px',
                  }}>
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                      fontFamily: 'Share Tech Mono, monospace',
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}>{stat.label}</div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: stat.color,
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                  fontFamily: 'Share Tech Mono, monospace',
                  marginBottom: 6,
                }}>
                  <span>AI MASTERY PROGRESS</span>
                  <span>87%</span>
                </div>
                <div className="progress-track" style={{ height: 4 }}>
                  <div className="progress-fill" style={{ width: '87%' }} />
                </div>
              </div>

              {/* Floating prompt cards */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {[
                  { text: 'Generate viral video script for...', tag: 'VIDEO', color: 'var(--neon-green)' },
                  { text: 'Create cinematic AI voiceover us...', tag: 'AUDIO', color: 'var(--neon-blue)' },
                  { text: 'Build automation workflow for c...', tag: 'AUTO', color: 'var(--neon-yellow)' },
                ].map((prompt, i) => (
                  <div key={i} className="floating-prompt" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(0,255,163,0.03)',
                    border: '1px solid rgba(0,255,163,0.08)',
                    animationDelay: `${i * 0.15}s`,
                  }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.6rem',
                      fontFamily: 'Share Tech Mono, monospace',
                      background: `${prompt.color}15`,
                      color: prompt.color,
                      letterSpacing: 1,
                      flexShrink: 0,
                    }}>{prompt.tag}</span>
                    <span style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{prompt.text}</span>
                    <i className="fas fa-arrow-right" style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-dim)',
                      marginLeft: 'auto',
                      flexShrink: 0,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating holographic elements */}
          <div className="floating-element e1" style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: 20,
            border: '1px solid rgba(255,214,0,0.15)',
            background: 'rgba(255,214,0,0.04)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 16,
            animation: 'float 6s ease-in-out infinite',
          }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.6rem',
              color: 'var(--neon-yellow)',
              letterSpacing: 1,
              marginBottom: 4,
            }}>PROMPT</div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: 'var(--neon-yellow)',
            }}>226+</div>
            <div style={{
              fontSize: '0.55rem',
              color: 'var(--text-dim)',
              textAlign: 'center',
            }}>Templates</div>
          </div>

          <div className="floating-element e2" style={{
            position: 'absolute',
            bottom: -10,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: 20,
            border: '1px solid rgba(0,255,163,0.15)',
            background: 'rgba(0,255,163,0.04)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 14,
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '-3s',
          }}>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.55rem',
              color: 'var(--neon-green)',
              letterSpacing: 1,
              marginBottom: 6,
            }}>AI VIDEO</div>
            <i className="fas fa-film" style={{
              fontSize: '1.4rem',
              color: 'var(--neon-green)',
              opacity: 0.6,
            }} />
          </div>
        </div>
      </div>

      </div>{/* end hero-main */}

      {/* Scroll indicator */}
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
