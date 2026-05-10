import aiAcademy from '../../images/cardsimage/AI_Academy.jpg';
import promptEngineering from '../../images/cardsimage/Prompt_Engineering.jpg';
import aiVideo from '../../images/cardsimage/AI_video_creation.jpg';
import toolNexus from '../../images/cardsimage/Ai_ToolBox.jpg';
import aiMarket from '../../images/cardsimage/AI-Market.jpg';
import neuralChats from '../../images/cardsimage/Connect_and_Chat.jpg';

const MASTER_ITEMS = [
  {
    icon: 'fa-graduation-cap',
    title: 'AI Academy',
    desc: 'Learn AI from beginner to advanced using real-world projects.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '🧠',
    image: aiAcademy,
  },
  {
    icon: 'fa-bolt',
    title: 'Prompt Engineering',
    desc: 'Master prompts that generate content, code, videos, and income.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '⚡',
    image: promptEngineering,
  },
  {
    icon: 'fa-film',
    title: 'AI Video Creation',
    desc: 'Create cinematic AI videos, voiceovers, and viral content.',
    color: 'var(--neon-blue)',
    accent: 'rgba(0,212,255,0.08)',
    preview: '🎬',
    image: aiVideo,
  },
  {
    icon: 'fa-cubes',
    title: 'Tool Nexus',
    desc: 'Discover the best AI tools for productivity and monetization.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '🛠️',
    image: toolNexus,
  },
  {
    icon: 'fa-store',
    title: 'AI Market',
    desc: 'Access premium prompts, templates, and digital AI assets.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '🏪',
    image: aiMarket,
  },
  {
    icon: 'fa-comments',
    title: 'Neural Chats',
    desc: 'Connect with creators and AI communities worldwide.',
    color: 'var(--neon-blue)',
    accent: 'rgba(0,212,255,0.08)',
    preview: '💬',
    image: neuralChats,
  },
];

export default function MasterSection() {
  return (
    <section className="master-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-green" style={{ marginBottom: 16 }}>WHAT YOU&apos;LL MASTER</span>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--text-main)',
            marginBottom: 12,
          }}>
            Your{' '}
            <span style={{
              color: 'var(--neon-green)',
              textShadow: '0 0 30px rgba(0,255,163,0.2)',
            }}>AI Ecosystem</span>
            {' '}Starts Here
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: 500,
            margin: '0 auto',
            fontSize: '0.95rem',
          }}>
            6 AI modules, 100+ lessons, and a thriving creator community to support you at every step.
          </p>
        </div>

        <div className="grid-3 master-grid">
          {MASTER_ITEMS.map((item, i) => (
            <div
              key={i}
              className="master-card"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="master-card-inner">
                {/* Glow accent */}
                <div className="master-card-glow" style={{ background: item.color }} />

                {/* Card Image */}
                <div className="master-card-img-wrap">
                  <img src={item.image} alt="" className="master-card-img" />
                  <div className="master-card-img-overlay" />
                </div>

                {/* Icon */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: item.accent,
                  border: `1px solid ${item.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: item.color,
                  marginBottom: 16,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <i className={`fas ${item.icon}`} />
                </div>

                <h3 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1rem',
                  color: 'var(--text-main)',
                  marginBottom: 10,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {item.title}
                </h3>

                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
