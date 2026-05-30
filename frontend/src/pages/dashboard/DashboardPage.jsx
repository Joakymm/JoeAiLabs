import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { dashboardAPI } from '../../services/api';
import { useFetch }     from '../../hooks/index.js';
import { Spinner, StatCard, ProgressBar, EmptyState } from '../../components/ui/index.jsx';

const MODULE_COLORS = { green:'var(--neon-green)', yellow:'var(--neon-yellow)', blue:'var(--neon-blue)' };



function FeaturedPrompts() {
  const [prompts, setPrompts] = useState([]);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/prompts?featured=true&limit=6');
        setPrompts(data?.data?.slice(0, 6) || []);
      } catch {}
    };
    fetchFeatured();
  }, []);
  if (prompts.length === 0) return null;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
      {prompts.map(p => (
        <Link key={p._id} to="/prompts" style={{
          padding:'12px 14px', borderRadius:10, textDecoration:'none',
          background:'rgba(255,214,0,0.03)', border:'1px solid rgba(255,214,0,0.12)',
          display:'flex', flexDirection:'column', gap:6,
        }}>
          <span style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-main)', lineHeight:1.3 }}>{p.title}</span>
          <span style={{ fontSize:'0.65rem', color:'var(--text-dim)' }}>{p.category}</span>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useFetch(() => dashboardAPI.get());
  const [communityLinks, setCommunityLinks] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/public');
        const links = data?.data?.communityLinks || {};
        const result = [];
        if (links.whatsapp) result.push({ id:'whatsapp', icon:'fa-brands fa-whatsapp', color:'#25D366', label:'WhatsApp', members:'Online', url: links.whatsapp });
        if (links.telegram) result.push({ id:'telegram', icon:'fa-brands fa-telegram', color:'#0088cc', label:'Telegram', members:'Online', url: links.telegram });
        if (links.discord) result.push({ id:'discord', icon:'fa-brands fa-discord', color:'#5865F2', label:'Discord', members:'Online', url: links.discord });
        setCommunityLinks(result);
      } catch {}
    };
    fetchSettings();
  }, []);

  if (loading) return <Spinner text="LOADING DASHBOARD" />;
  if (error)   return <div className="container" style={{padding:60}}><p style={{color:'var(--neon-red)'}}>{error}</p></div>;

  const { user, stats, moduleCards, currentLesson } = data || {};

  return (
    <div className="container" style={{ padding:'40px 24px' }}>

      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <div className="card" style={{
        marginBottom:28,
        background:'linear-gradient(135deg, rgba(0,255,163,0.04) 0%, rgba(255,214,0,0.02) 100%)',
        borderColor:'rgba(0,255,163,0.15)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:56, height:56, borderRadius:'50%',
              background:'rgba(0,255,163,0.1)', border:'2px solid var(--neon-green)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.5rem', boxShadow:'0 0 20px rgba(0,255,163,0.2)',
            }}>⚡</div>
            <div>
              <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1rem,2.5vw,1.5rem)', marginBottom:4 }}>
                WELCOME BACK, <span style={{ color:'var(--neon-green)' }}>{user?.username?.toUpperCase()}</span>
              </h1>
              <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>Your AI journey continues — keep building momentum.</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {currentLesson && (
              <Link to={`/lessons/${currentLesson._id}`} className="btn btn-primary btn-sm">
                <i className="fas fa-play" /> CONTINUE LEARNING
              </Link>
            )}
            {user?.role === 'admin' && (
              <span className="badge badge-yellow"><i className="fas fa-shield" /> Admin</span>
            )}
            {user?.isPremium && (
              <span className="badge badge-yellow"><i className="fas fa-star" /> PRO</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom:32 }}>
        <StatCard icon="fa-graduation-cap" label="Lessons Done"  value={stats?.completedLessons ?? 0}    color="green" sub={`of ${stats?.totalLessons ?? 0} total`} />
        <StatCard icon="fa-percent"        label="Overall Progress" value={`${stats?.overallPct ?? 0}%`} color="blue"  />
        <StatCard icon="fa-bolt"           label="Prompts Available" value={stats?.totalPrompts ?? 0}    color="yellow"/>
        <StatCard icon="fa-trophy"         label="Reputation"     value={stats?.reputationScore ?? 0}    color="green" sub={`${stats?.modulesCompleted ?? 0} modules complete`} />
      </div>

      {/* ── Overall progress bar ─────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color:'var(--neon-green)', letterSpacing:2 }}>OVERALL PROGRESS</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:2 }}>
              {stats?.completedLessons} of {stats?.totalLessons} lessons completed
            </p>
          </div>
          <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.5rem', color:'var(--neon-green)' }}>{stats?.overallPct}%</span>
        </div>
        <ProgressBar pct={stats?.overallPct} height={8} />
      </div>

      {/* ── Continue learning card ────────────────────────────────────────── */}
      {currentLesson && (
        <div className="card" style={{ marginBottom:32, borderColor:'rgba(0,255,163,0.2)', background:'rgba(0,255,163,0.03)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom:8 }}>UP NEXT</span>
              <h3 style={{ fontSize:'1.1rem', marginBottom:4 }}>{currentLesson.title}</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
                <i className="fas fa-layer-group" style={{ marginRight:6 }} />
                {currentLesson.moduleTitle}
              </p>
            </div>
            <Link to={`/lessons/${currentLesson._id}`} className="btn btn-primary">
              <i className="fas fa-play" /> START LESSON
            </Link>
          </div>
        </div>
      )}

      {/* ── Community widget ──────────────────────────────────────────────── */}
      {communityLinks.length > 0 && (
        <div className="card" style={{ marginBottom:32, borderColor:'rgba(0,212,255,0.15)', background:'rgba(0,212,255,0.02)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color:'var(--neon-blue)', letterSpacing:2 }}>
              <i className="fas fa-users" style={{ marginRight:8 }} />COMMUNITY
            </h3>
            <Link to="/community" style={{ color:'var(--text-muted)', fontSize:'0.78rem', textDecoration:'none' }}>
              View all <i className="fas fa-arrow-right" style={{ marginLeft:4, fontSize:'0.65rem' }} />
            </Link>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {communityLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{
                  flex:1, display:'flex', alignItems:'center', gap:12,
                  padding:'12px 16px', borderRadius:10, textDecoration:'none',
                  background:`${link.color}08`, border:`1px solid ${link.color}22`,
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${link.color}15`; e.currentTarget.style.borderColor = `${link.color}44`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${link.color}08`; e.currentTarget.style.borderColor = `${link.color}22`; }}
              >
                <div style={{
                  width:40, height:40, borderRadius:10,
                  background:`${link.color}15`, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.3rem', color:link.color, flexShrink:0,
                }}>
                  <i className={link.icon} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-main)' }}>{link.label}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--neon-green)', display:'inline-block' }} />
                    {link.members}
                  </div>
                </div>
                <i className="fas fa-arrow-right" style={{ marginLeft:'auto', color:'var(--text-dim)', fontSize:'0.75rem' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Featured Prompts ──────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color:'var(--neon-yellow)', letterSpacing:2 }}>
            <i className="fas fa-star" style={{ marginRight:8 }} />FEATURED PROMPTS
          </h3>
          <Link to="/prompts" style={{ color:'var(--text-muted)', fontSize:'0.78rem', textDecoration:'none' }}>
            View all <i className="fas fa-arrow-right" style={{ marginLeft:4, fontSize:'0.65rem' }} />
          </Link>
        </div>
        <FeaturedPrompts />
      </div>

      {/* ── Module cards ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom:8 }}>
        <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1rem', color:'var(--text-main)', letterSpacing:2, marginBottom:20 }}>
          ALL MODULES
        </h2>
        <div className="grid-3">
          {(moduleCards || []).map((mod) => {
            const accentColor = MODULE_COLORS[mod.color] || 'var(--neon-green)';
            return (
              <div key={mod._id} className="card" style={{ position:'relative', borderTop:`2px solid ${mod.isLocked ? 'rgba(255,255,255,0.06)' : accentColor + '55'}` }}>
                {mod.isLocked && (
                  <div className="locked-overlay">
                    <i className="fas fa-lock" style={{ fontSize:'1.5rem', color:'var(--neon-yellow)' }} />
                    <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.75rem', color:'var(--neon-yellow)', letterSpacing:2 }}>PRO ONLY</span>
                    <Link to="/upgrade" className="btn btn-yellow btn-sm" style={{ marginTop:8 }}>UPGRADE</Link>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <span style={{ fontSize:'2rem' }}>{mod.emoji}</span>
                  <span className="badge badge-muted" style={{ fontSize:'0.65rem' }}>MODULE {String(mod.order).padStart(2,'0')}</span>
                </div>
                <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color: accentColor, letterSpacing:1.5, marginBottom:6 }}>{mod.title}</h3>
                {mod.subtitle && <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:14 }}>{mod.subtitle}</p>}

                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{mod.done}/{mod.total} lessons</span>
                    <span style={{ color: accentColor, fontSize:'0.75rem', fontFamily:'Orbitron,sans-serif' }}>{mod.progressPct}%</span>
                  </div>
                  <ProgressBar pct={mod.progressPct} />
                </div>

                <Link
                  to={mod.isLocked ? '/upgrade' : `/modules/${mod._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width:'100%', borderColor: accentColor + '40', color: accentColor }}
                >
                  {mod.progressPct === 100 ? <><i className="fas fa-check" /> COMPLETED</> :
                   mod.progressPct > 0     ? <><i className="fas fa-play" /> CONTINUE</> :
                                             <><i className="fas fa-arrow-right" /> START MODULE</>}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {!moduleCards?.length && <EmptyState emoji="📚" title="NO MODULES FOUND" description="Run the seed script to populate modules." />}
    </div>
  );
}
