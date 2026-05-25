import aiAcademy from '../../images/cardsimage/AI_Academy.jpg';
import promptEngineering from '../../images/cardsimage/Prompt_Engineering.jpg';
import aiVideo from '../../images/cardsimage/AI_video_creation.jpg';
import toolNexus from '../../images/cardsimage/Ai_ToolBox.jpg';
import aiMarket from '../../images/cardsimage/AI-Market.jpg';
import neuralChats from '../../images/cardsimage/Connect_and_Chat.jpg';

const MASTER_ITEMS = [
  {
    icon: 'fa-robot',
    title: 'AI Assistants & Problem Solving',
    desc: 'Master ChatGPT, Claude, Gemini and Copilot for coding, research, business, and productivity.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '🧠',
    image: aiAcademy,
  },
  {
    icon: 'fa-film',
    title: 'AI Video Generation',
    desc: 'Create cinematic AI videos from text prompts using Runway, Pika, RecCloud and Luma AI.',
    color: 'var(--neon-blue)',
    accent: 'rgba(0,212,255,0.08)',
    preview: '🎬',
    image: aiVideo,
  },
  {
    icon: 'fa-palette',
    title: 'Graphic Design with AI',
    desc: 'Design social posts, brands, posters and ads using Canva, Microsoft Designer and Adobe Express.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '🎨',
    image: promptEngineering,
  },
  {
    icon: 'fa-image',
    title: 'AI Image Generation',
    desc: 'Generate realistic and artistic images with Midjourney, DALL·E, Stable Diffusion and Leonardo AI.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '🖼️',
    image: toolNexus,
  },
  {
    icon: 'fa-file-powerpoint',
    title: 'AI Presentation Design',
    desc: 'Build professional business presentations with PowerPoint, Google Slides and Beautiful.ai.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '📊',
    image: neuralChats,
  },
  {
    icon: 'fa-pen-fancy',
    title: 'AI Content Creation',
    desc: 'Use AI for blogs, scripts, copywriting, SEO and email marketing at 10x speed.',
    color: 'var(--neon-blue)',
    accent: 'rgba(0,212,255,0.08)',
    preview: '✍️',
    image: aiMarket,
  },
  {
    icon: 'fa-gears',
    title: 'AI Automation & No-Code',
    desc: 'Automate businesses and workflows with Zapier, Bardeen and Make — no coding required.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '⚡',
    image: toolNexus,
  },
  {
    icon: 'fa-clipboard-list',
    title: 'AI Meeting Notes & Productivity',
    desc: 'Turn meetings into searchable knowledge with Fireflies.ai, Laxis and Otter.ai.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '📝',
    image: promptEngineering,
  },
  {
    icon: 'fa-user-robot',
    title: 'AI Avatar & Faceless Content',
    desc: 'Create AI avatars and digital humans with Synthesia, HeyGen and D-ID.',
    color: 'var(--neon-blue)',
    accent: 'rgba(0,212,255,0.08)',
    preview: '👤',
    image: aiVideo,
  },
  {
    icon: 'fa-crop',
    title: 'Photo Editing & UI/UX Design',
    desc: 'Edit photos and design interfaces with Photoshop, Photopea and Figma.',
    color: 'var(--neon-green)',
    accent: 'rgba(0,255,163,0.08)',
    preview: '🖌️',
    image: neuralChats,
  },
  {
    icon: 'fa-globe',
    title: 'AI Website Building',
    desc: 'Build websites using AI and no-code tools like Durable, 10Web and Framer.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '🌐',
    image: toolNexus,
  },
 
  {
    icon: 'fa-cubes',
    title: 'AI Tools Mastery',
    desc: 'Discover the best AI tools for productivity, creativity, and monetization.',
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
  {
    icon: 'fa-coins',
    title: 'AI Content Monetization',
    desc: 'Build income streams with AI freelancing, digital products, automation agencies, and more.',
    color: 'var(--neon-yellow)',
    accent: 'rgba(255,214,0,0.08)',
    preview: '💰',
    image: aiAcademy,
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
            maxWidth: 600,
            margin: '0 auto',
            fontSize: '0.95rem',
          }}>
            13+ AI modules, hands-on lessons, and a thriving creator community to support you at every step.
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
                <div className="master-card-glow" style={{ background: item.color }} />

                <div className="master-card-img-wrap">
                  <img src={item.image} alt="" className="master-card-img" />
                  <div className="master-card-img-overlay" />
                </div>

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
