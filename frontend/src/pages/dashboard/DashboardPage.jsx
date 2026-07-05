import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { dashboardAPI } from '../../services/api';
import { useFetch } from '../../hooks/index.js';
import { Spinner, StatCard, ProgressBar, EmptyState, SectionHeader } from '../../components/ui/index.jsx';

const MODULE_COLORS = { green:'var(--neon-green)', yellow:'var(--neon-yellow)', blue:'var(--neon-blue)' };

function QuickActionCard({ icon, title, desc, to, color }) {
  return (
    <Link to={to} style={{ textDecoration:'none' }}>
      <div className="card" style={{ display:'flex', alignItems:'center', gap:14, cursor:'pointer', borderColor:`${color}20` }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = color + '20'; e.currentTarget.style.background = 'var(--bg-card)'; }}
      >
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', color, fontSize:'1.1rem', flexShrink:0 }}>
          <i className={`fas ${icon}`} />
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-main)', marginBottom:2 }}>{title}</div>
          <div style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{desc}</div>
        </div>
        <i className="fas fa-chevron-right" style={{ color:'var(--text-dim)', fontSize:'0.75rem', marginLeft:'auto', flexShrink:0 }} />
      </div>
    </Link>
  );
}

function FeaturedPrompts() {
  const [prompts, setPrompts] = useState([]);
  useEffect(() => {
    api.get('/prompts?featured=true&limit=6').then(({ data }) => {
      setPrompts(data?.data?.slice(0, 6) || []);
    }).catch(() => {});
  }, []);

  if (!prompts.length) return (
    <div style={{ textAlign:'center', padding:'20px', color:'var(--text-dim)', fontSize:'0.85rem' }}>
      <i className="fas fa-bolt" style={{ marginRight:8, opacity:0.5 }} />No featured prompts yet.
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:10 }}>
      {prompts.map(p => (
        <Link key={p._id} to="/prompts" style={{ textDecoration:'none' }}>
          <div style={{
            padding:'12px 14px', borderRadius:10,
            background:'rgba(255,214,0,0.03)', border:'1px solid rgba(255,214,0,0.1)',
            display:'flex', flexDirection:'column', gap:5, height:'100%',
            transition:'all 0.2s', cursor:'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,214,0,0.25)'; e.currentTarget.style.background = 'rgba(255,214,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,214,0,0.1)'; e.currentTarget.style.background = 'rgba(255,214,0,0.03)'; }}
          >
            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-main)', lineHeight:1.4 }}>{p.title}</span>
            <span style={{ fontSize:'0.68rem', color:'var(--neon-yellow)', opacity:0.7, textTransform:'uppercase', letterSpacing:0.5 }}>{p.category}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ModuleCard({ mod }) {
  const accentColor = MODULE_COLORS[mod.color] || 'var(--neon-green)';
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        position:'relative',
        borderTop:`3px solid ${mod.isLocked ? 'rgba(255,255,255,0.06)' : accentColor + '70'}`,
        transition:'all 0.2s',
      }}
    >
      {mod.isLocked && (
        <div className="locked-overlay">
          <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,214,0,0.1)', border:'2px solid rgba(255,214,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fas fa-lock" style={{ fontSize:'1.3rem', color:'var(--neon-yellow)' }} />
          </div>
          <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.75rem', color:'var(--neon-yellow)', letterSpacing:2 }}>PRO ONLY</span>
          <Link to="/upgrade" className="btn btn-yellow btn-sm" style={{ marginTop:6 }}>UPGRADE →</Link>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <span style={{ fontSize:'2rem', filter: mod.isLocked ? 'grayscale(1) opacity(0.5)' : 'none' }}>{mod.emoji}</span>
        <span className="badge badge-muted" style={{ fontSize:'0.62rem' }}>MODULE {String(mod.order).padStart(2,'0')}</span>
      </div>

      <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color: accentColor, letterSpacing:1.5, marginBottom:6, lineHeight:1.4 }}>{mod.title}</h3>
      {mod.subtitle && <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:14, lineHeight:1.5 }}>{mod.subtitle}</p>}

      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
          <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>
            <i className="fas fa-book-open" style={{ marginRight:5, opacity:0.7 }} />
            {mod.done}/{mod.total} lessons
          </span>
          <span style={{ color: accentColor, fontSize:'0.78rem', fontFamily:'Orbitron,sans-serif', fontWeight:700 }}>{mod.progressPct}%</span>
        </div>
        <ProgressBar pct={mod.progressPct} />
      </div>

      <Link
        to={mod.isLocked ? '/upgrade' : `/modules/${mod._id}`}
        className="btn btn-secondary btn-sm"
        style={{ width:'100%', borderColor: accentColor + '40', color: accentColor }}
      >
        {mod.progressPct === 100 ? <><i className="fas fa-check-circle" /> COMPLETED</> :
         mod.progressPct > 0     ? <><i className="fas fa-play" /> CONTINUE</> :
                                   <><i className="fas fa-arrow-right" /> START MODULE</>}
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useFetch(() => dashboardAPI.get());
  const [communityLinks, setCommunityLinks] = useState([]);

  useEffect(() => {
    api.get('/settings/public').then(({ data }) => {
      const links = data?.data?.communityLinks || {};
      const result = [];
      if (links.whatsapp) result.push({ id:'whatsapp', icon:'fa-brands fa-whatsapp', color:'#25D366', label:'WhatsApp', url: links.whatsapp });
      if (links.telegram) result.push({ id:'telegram', icon:'fa-brands fa-telegram', color:'#0088cc', label:'Telegram', url: links.telegram });
      if (links.discord) result.push({ id:'discord', icon:'fa-brands fa-discord', color:'#5865F2', label:'Discord', url: links.discord });
      setCommunityLinks(result);
    }).catch(() => {});
  }, []);

  if (loading) return <Spinner text="LOADING DASHBOARD" />;
  if (error) return (
    <div className="container" style={{ padding:'60px 24px', textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>⚠️</div>
      <h3 style={{ color:'var(--neon-red)', fontFamily:'Orbitron,sans-serif', marginBottom:8 }}>LOAD FAILED</h3>
      <p style={{ color:'var(--text-muted)' }}>{error}</p>
    </div>
  );

  const { user, stats, moduleCards, currentLesson } = data || {};

  const quickActions = [
    { icon:'fa-graduation-cap', title:'AI Academy', desc:'Continue learning AI skills', to:'/modules', color:'var(--neon-green)' },
    { icon:'fa-bolt', title:'Prompt Library', desc:'Browse AI prompt templates', to:'/prompts', color:'var(--neon-yellow)' },
    { icon:'fa-users', title:'Community Feed', desc:'Connect with other learners', to:'/feed', color:'var(--neon-blue)' },
    { icon:'fa-trophy', title:'Leaderboard', desc:'See where you rank', to:'/leaderboard', color:'var(--neon-green)' },
  ];

  return (
    <div className="container" style={{ padding:'40px 24px 60px' }}>

      {/* ── Welcome Banner ───────────────────────────────────────────────── */}
      <div className="card animate-fade-in-up" style={{
        marginBottom:28,
        background:'linear-gradient(135deg, rgba(0,255,163,0.05) 0%, rgba(0,212,255,0.02) 50%, rgba(255,214,0,0.02) 100%)',
        borderColor:'rgba(0,255,163,0.2)',
        boxShadow:'0 0 40px rgba(0,255,163,0.05)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:60, height:60, borderRadius:'50%',
              background:'linear-gradient(135deg, rgba(0,255,163,0.15), rgba(0,212,255,0.1))',
              border:'2px solid rgba(0,255,163,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.8rem', boxShadow:'0 0 24px rgba(0,255,163,0.2)',
              flexShrink:0,
            }}>⚡</div>
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Welcome back</p>
              <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', marginBottom:4, lineHeight:1.2 }}>
                <span style={{ color:'var(--neon-green)' }}>{user?.username?.toUpperCase()}</span>
              </h1>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Your AI journey continues — keep building momentum.</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            {user?.role === 'admin' && <span className="badge badge-yellow"><i className="fas fa-shield" /> Admin</span>}
            {user?.isPremium && <span className="badge badge-yellow"><i className="fas fa-star" /> PRO</span>}
            {currentLesson && (
              <Link to={`/lessons/${currentLesson._id}`} className="btn btn-primary btn-sm">
                <i className="fas fa-play" /> CONTINUE LEARNING
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        <StatCard icon="fa-graduation-cap" label="Lessons Done"     value={stats?.completedLessons ?? 0}  color="green" sub={`of ${stats?.totalLessons ?? 0} total`} />
        <StatCard icon="fa-percent"        label="Overall Progress" value={`${stats?.overallPct ?? 0}%`}  color="blue" />
        <StatCard icon="fa-bolt"           label="Prompts Available" value={stats?.totalPrompts ?? 0}     color="yellow" />
        <StatCard icon="fa-trophy"         label="Reputation"       value={stats?.reputationScore ?? 0}   color="green" sub={`${stats?.modulesCompleted ?? 0} modules complete`} />
      </div>

      {/* ── Overall Progress ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-green)', letterSpacing:2, marginBottom:4 }}>OVERALL PROGRESS</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
              {stats?.completedLessons} of {stats?.totalLessons} lessons completed
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'2rem', color:'var(--neon-green)', fontWeight:900 }}>{stats?.overallPct}%</span>
          </div>
        </div>
        <ProgressBar pct={stats?.overallPct} height={10} />
        {stats?.overallPct >= 80 && (
          <p style={{ color:'var(--neon-yellow)', fontSize:'0.78rem', marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
            <i className="fas fa-fire" /> Outstanding progress! You're almost there.
          </p>
        )}
      </div>

      {/* ── Continue Lesson ──────────────────────────────────────────────── */}
      {currentLesson && (
        <div className="card animate-fade-in-up" style={{
          marginBottom:28, borderColor:'rgba(0,255,163,0.25)',
          background:'linear-gradient(135deg, rgba(0,255,163,0.04), rgba(0,212,255,0.02))',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom:10 }}>
                <i className="fas fa-play" /> UP NEXT
              </span>
              <h3 style={{ fontSize:'1.1rem', marginBottom:6, fontWeight:700 }}>{currentLesson.title}</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                <i className="fas fa-layer-group" style={{ color:'var(--neon-blue)' }} />
                {currentLesson.moduleTitle}
              </p>
            </div>
            <Link to={`/lessons/${currentLesson._id}`} className="btn btn-primary">
              <i className="fas fa-play" /> START LESSON
            </Link>
          </div>
        </div>
      )}

      {/* ── Two-Column: Quick Actions + Community ────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
        {/* Quick Actions */}
        <div>
          <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--text-muted)', letterSpacing:2, marginBottom:14 }}>QUICK ACTIONS</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {quickActions.map(qa => (
              <QuickActionCard key={qa.to} {...qa} />
            ))}
          </div>
        </div>

        {/* Community + Featured Prompts stacked */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Community */}
          {communityLinks.length > 0 && (
            <div className="card" style={{ borderColor:'rgba(0,212,255,0.15)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-blue)', letterSpacing:2 }}>
                  <i className="fas fa-users" style={{ marginRight:8 }} />COMMUNITY
                </h3>
                <Link to="/feed" style={{ color:'var(--text-muted)', fontSize:'0.78rem', textDecoration:'none' }}>
                  View all <i className="fas fa-arrow-right" style={{ marginLeft:4, fontSize:'0.65rem' }} />
                </Link>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {communityLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                      borderRadius:10, textDecoration:'none',
                      background:`${link.color}08`, border:`1px solid ${link.color}20`,
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${link.color}15`; e.currentTarget.style.borderColor = `${link.color}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${link.color}08`; e.currentTarget.style.borderColor = `${link.color}20`; }}
                  >
                    <div style={{ width:36, height:36, borderRadius:10, background:`${link.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:link.color, flexShrink:0 }}>
                      <i className={link.icon} />
                    </div>
                    <span style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-main)' }}>{link.label}</span>
                    <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--neon-green)', display:'inline-block' }} />
                      <i className="fas fa-arrow-right" style={{ color:'var(--text-dim)', fontSize:'0.7rem' }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Certificates & Leaderboard Links */}
          <div className="card" style={{ borderColor:'rgba(255,214,0,0.15)', background:'rgba(255,214,0,0.02)' }}>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-yellow)', letterSpacing:2, marginBottom:14 }}>
              <i className="fas fa-award" style={{ marginRight:8 }} />ACHIEVEMENTS
            </h3>
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/certificates" className="btn btn-ghost btn-sm" style={{ flex:1, borderColor:'rgba(255,214,0,0.2)', color:'var(--neon-yellow)' }}>
                <i className="fas fa-certificate" /> Certificates
              </Link>
              <Link to="/leaderboard" className="btn btn-ghost btn-sm" style={{ flex:1, borderColor:'rgba(0,255,163,0.2)', color:'var(--neon-green)' }}>
                <i className="fas fa-trophy" /> Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Prompts ──────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom:28 }}>
        <SectionHeader
          title="FEATURED PROMPTS"
          color="var(--neon-yellow)"
          action={<Link to="/prompts" className="btn btn-ghost btn-sm">View All <i className="fas fa-arrow-right" /></Link>}
        />
        <FeaturedPrompts />
      </div>

      {/* ── All Modules ───────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          badge="AI ACADEMY"
          title="ALL MODULES"
          subtitle="Track your progress across all AI learning modules."
          action={<Link to="/modules" className="btn btn-secondary btn-sm">Browse All</Link>}
        />

        {moduleCards?.length ? (
          <div className="grid-3">
            {moduleCards.map(mod => <ModuleCard key={mod._id} mod={mod} />)}
          </div>
        ) : (
          <EmptyState
            emoji="📚"
            title="NO MODULES FOUND"
            description="Run the seed script to populate modules, or check your API connection."
          />
        )}
      </div>
    </div>
  );
}
