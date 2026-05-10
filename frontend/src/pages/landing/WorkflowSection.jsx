const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Generate Script',
    desc: 'Use AI to write a compelling video script optimized for engagement.',
    icon: 'fa-pen-fancy',
    color: 'var(--neon-green)',
  },
  {
    step: '02',
    title: 'Create Voiceover',
    desc: 'Generate realistic AI voiceovers with emotion and pacing.',
    icon: 'fa-microphone',
    color: 'var(--neon-blue)',
  },
  {
    step: '03',
    title: 'Generate Visuals',
    desc: 'Create cinematic AI visuals, animations, and effects.',
    icon: 'fa-image',
    color: 'var(--neon-yellow)',
  },
  {
    step: '04',
    title: 'Edit & Produce',
    desc: 'Assemble everything into a polished, viral-ready video.',
    icon: 'fa-video',
    color: 'var(--neon-green)',
  },
  {
    step: '05',
    title: 'Publish & Monetize',
    desc: 'Upload, optimize, and start earning from your content.',
    icon: 'fa-dollar-sign',
    color: 'var(--neon-yellow)',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="workflow-section" style={{
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>AI WORKFLOW</span>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--text-main)',
            marginBottom: 12,
          }}>
            Create an{' '}
            <span style={{
              color: 'var(--neon-green)',
              textShadow: '0 0 30px rgba(0,255,163,0.2)',
            }}>AI YouTube Video</span>
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: 500,
            margin: '0 auto',
            fontSize: '0.95rem',
          }}>
            See exactly how JOEAILABS teaches real, monetizable workflows — step by step.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          maxWidth: 700,
          margin: '0 auto',
        }}>
          {WORKFLOW_STEPS.map((ws, i) => (
            <div key={i} style={{ width: '100%', position: 'relative' }}>
              <div className="workflow-step" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '24px 28px',
                borderRadius: 14,
                background: 'rgba(8,15,29,0.5)',
                border: '1px solid rgba(0,255,163,0.06)',
                position: 'relative',
                zIndex: 1,
                animationDelay: `${i * 0.12}s`,
              }}>
                {/* Step number */}
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: ws.color,
                  opacity: 0.3,
                  lineHeight: 1,
                  minWidth: 50,
                }}>
                  {ws.step}
                </div>

                {/* Icon */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${ws.color}10`,
                  border: `1px solid ${ws.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  color: ws.color,
                  flexShrink: 0,
                }}>
                  <i className={`fas ${ws.icon}`} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    marginBottom: 4,
                  }}>
                    {ws.title}
                  </h4>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.83rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {ws.desc}
                  </p>
                </div>

                {/* Arrow icon */}
                <i className="fas fa-check-circle" style={{
                  color: ws.color,
                  fontSize: '1.1rem',
                  opacity: 0.6,
                  flexShrink: 0,
                }} />
              </div>

              {/* Connector line (not after last) */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '4px 0',
                  position: 'relative',
                  zIndex: 0,
                }}>
                  <div style={{
                    width: 2,
                    height: 24,
                    background: `linear-gradient(180deg, ${ws.color}, ${WORKFLOW_STEPS[i + 1].color})`,
                    opacity: 0.3,
                    borderRadius: 1,
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
