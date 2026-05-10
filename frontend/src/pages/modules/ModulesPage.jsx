import { Link, useParams } from 'react-router-dom';
import { modulesAPI } from '../../services/api';
import { useFetch }   from '../../hooks/index.js';
import { Spinner, ProgressBar, EmptyState } from '../../components/ui/index.jsx';

const COLOR_MAP = { green:'var(--neon-green)', yellow:'var(--neon-yellow)', blue:'var(--neon-blue)' };

/* ── Modules List ─────────────────────────────────────────────────────────── */
export function ModulesPage() {
  const { data, loading } = useFetch(() => modulesAPI.list());
  const modules = data || [];

  if (loading) return <Spinner text="LOADING MODULES" />;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div>
            <span className="badge badge-green" style={{ marginBottom:12 }}>CURRICULUM</span>
            <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.5rem,3vw,2.2rem)', marginBottom:8 }}>AI LEARNING MODULES</h1>
            <p style={{ color:'var(--text-muted)' }}>6 structured modules. Go at your own pace. Start free.</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:60 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {modules.map((mod) => {
            const accent = COLOR_MAP[mod.color] || 'var(--neon-green)';
            return (
              <div key={mod._id} className="card" style={{
                display:'grid', gridTemplateColumns:'80px 1fr auto', gap:24, alignItems:'center',
                borderLeft:`3px solid ${mod.isLocked ? 'rgba(255,255,255,0.06)' : accent}`,
                borderRadius:'0 12px 12px 0', padding:'24px',
                opacity: mod.isLocked ? 0.75 : 1,
              }}>
                {/* Order + emoji */}
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'2.2rem', marginBottom:4 }}>{mod.emoji}</div>
                  <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.65rem', color:'var(--text-dim)', letterSpacing:2 }}>
                    {String(mod.order).padStart(2,'0')}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                    <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.95rem', color: accent, letterSpacing:1.5 }}>{mod.title}</h3>
                    {mod.isPremium && <span className="badge badge-yellow"><i className="fas fa-lock" style={{fontSize:'0.6rem'}} /> PRO</span>}
                    {mod.progressPct === 100 && <span className="badge badge-green"><i className="fas fa-check" /> Done</span>}
                  </div>
                  {mod.subtitle && <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:10 }}>{mod.subtitle}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:120 }}>
                      <ProgressBar pct={mod.progressPct} />
                    </div>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', whiteSpace:'nowrap' }}>
                      {mod.userCompletedCount}/{mod.lessonCount} lessons · {mod.progressPct}%
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ flexShrink:0 }}>
                  {mod.isLocked ? (
                    <Link to="/upgrade" className="btn btn-yellow btn-sm"><i className="fas fa-lock" /> UPGRADE</Link>
                  ) : (
                    <Link to={`/modules/${mod._id}`} className="btn btn-secondary btn-sm" style={{ borderColor: accent + '50', color: accent }}>
                      {mod.progressPct === 100 ? 'REVIEW' : mod.progressPct > 0 ? 'CONTINUE' : 'START'} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!modules.length && <EmptyState emoji="📚" title="NO MODULES YET" description="Run the seed script to populate modules." />}
      </div>
    </div>
  );
}

/* ── Module Detail (lesson list) ──────────────────────────────────────────── */
export function ModuleDetailPage() {
  const { id }  = useParams();
  const { data, loading, error } = useFetch(() => modulesAPI.get(id), [id]);

  if (loading) return <Spinner text="LOADING MODULE" />;
  if (error)   return (
    <div className="container" style={{ padding:60, textAlign:'center' }}>
      <p style={{ color:'var(--neon-red)', fontFamily:'Orbitron,sans-serif' }}>
        {error.includes('Premium') ? '🔒 PREMIUM MODULE — Upgrade to access.' : error}
      </p>
      <Link to="/modules" className="btn btn-secondary" style={{ marginTop:20 }}>← BACK TO MODULES</Link>
    </div>
  );

  const { module: mod, lessons } = data || {};
  const accent = COLOR_MAP[mod?.color] || 'var(--neon-green)';
  const completedCount = lessons?.filter(l => l.isCompleted).length || 0;
  const totalCount     = lessons?.length || 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ borderBottom:`1px solid ${accent}22` }}>
        <div className="container">
          <Link to="/modules" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.85rem', display:'inline-block', marginBottom:16 }}>
            <i className="fas fa-arrow-left" style={{ marginRight:8 }} /> All Modules
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:'3rem' }}>{mod?.emoji}</span>
            <div>
              <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.2rem,3vw,2rem)', color: accent, marginBottom:6 }}>{mod?.title}</h1>
              {mod?.subtitle && <p style={{ color:'var(--text-muted)' }}>{mod.subtitle}</p>}
              <div style={{ display:'flex', gap:16, marginTop:8, flexWrap:'wrap' }}>
                <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}><i className="fas fa-list" style={{ marginRight:6 }} />{totalCount} lessons</span>
                <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}><i className="fas fa-clock" style={{ marginRight:6 }} />{mod?.estimatedHours}h estimated</span>
                <span style={{ color: accent, fontSize:'0.82rem' }}><i className="fas fa-check-circle" style={{ marginRight:6 }} />{completedCount} completed</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop:20, maxWidth:400 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>Module Progress</span>
              <span style={{ color: accent, fontSize:'0.78rem', fontFamily:'Orbitron,sans-serif' }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} height={8} />
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="container-sm" style={{ padding:'40px 24px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {(lessons || []).map((lesson, idx) => (
            <Link key={lesson._id} to={`/lessons/${lesson._id}`} style={{ textDecoration:'none' }}>
              <div className="card" style={{
                display:'flex', alignItems:'center', gap:20, padding:'18px 24px',
                borderLeft: lesson.isCompleted ? `3px solid ${accent}` : '3px solid rgba(255,255,255,0.06)',
                borderRadius:'0 12px 12px 0',
                background: lesson.isCompleted ? `rgba(0,255,163,0.03)` : undefined,
              }}>
                {/* Number / check */}
                <div style={{
                  width:36, height:36, borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: lesson.isCompleted ? accent : 'rgba(255,255,255,0.04)',
                  color: lesson.isCompleted ? '#020508' : 'var(--text-dim)',
                  fontFamily:'Orbitron,sans-serif', fontSize:'0.75rem', fontWeight:700,
                }}>
                  {lesson.isCompleted ? <i className="fas fa-check" /> : idx + 1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, color: lesson.isCompleted ? accent : 'var(--text-main)', marginBottom:2 }}>
                    {lesson.title}
                  </div>
                  {lesson.summary && <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lesson.summary}</div>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                  <span style={{ color:'var(--text-dim)', fontSize:'0.78rem' }}><i className="fas fa-clock" style={{ marginRight:4 }} />{lesson.duration}m</span>
                  <i className="fas fa-chevron-right" style={{ color:'var(--text-dim)', fontSize:'0.75rem' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
