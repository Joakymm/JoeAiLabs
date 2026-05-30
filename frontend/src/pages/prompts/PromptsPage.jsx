import { useState, useCallback } from 'react';
import { promptsAPI } from '../../services/api';
import { useFetch }   from '../../hooks/index.js';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext';

const toolTypeMeta = [
  { type: 'writing-copy',     icon: 'fa-pen-fancy',  label: 'Writing & Copy',     color: 'var(--neon-green)'  },
  { type: 'image-generation', icon: 'fa-image',      label: 'Image Generation',   color: '#a855f7'            },
  { type: 'video-generation', icon: 'fa-video',      label: 'Video Generation',   color: '#ef4444'            },
  { type: 'voice-audio',      icon: 'fa-microphone', label: 'Voice & Audio',      color: '#f97316'            },
  { type: 'code-generation',  icon: 'fa-code',       label: 'Code Generation',    color: '#3b82f6'            },
  { type: 'automation',       icon: 'fa-gear',       label: 'Automation',         color: '#14b8a6'            },
  { type: 'research-analysis',icon: 'fa-magnifying-glass-chart', label: 'Research', color: 'var(--neon-yellow)' },
  { type: 'presentation',     icon: 'fa-chart-simple', label: 'Presentation',     color: '#ec4899'            },
];

const DIFF_COLORS = {
  beginner:     { bg:'rgba(0,255,163,0.08)',  color:'var(--neon-green)',  label:'Beginner'     },
  intermediate: { bg:'rgba(0,212,255,0.08)',  color:'var(--neon-blue)',   label:'Intermediate' },
  advanced:     { bg:'rgba(255,60,90,0.08)',  color:'var(--neon-red)',    label:'Advanced'     },
};

function PromptCard({ prompt, onCopy, onBookmark, isBookmarked }) {
  const [expanded, setExpanded] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [copied, setCopied] = useState(false);
  const dc = DIFF_COLORS[prompt.difficulty] || DIFF_COLORS.beginner;
  const tm = toolTypeMeta.find(t => t.type === prompt.toolType) || toolTypeMeta[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      onCopy(prompt._id);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const hasSample = prompt.sampleOutput?.type && prompt.sampleOutput?.url;

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
            <span style={{
              fontSize:'0.68rem', padding:'2px 10px', borderRadius:100, fontWeight:700, letterSpacing:1,
              textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:4,
              background: `${tm.color}15`, color: tm.color, border:`1px solid ${tm.color}30`,
            }}>
              <i className={`fas ${tm.icon}`} style={{ fontSize:'0.6rem' }} />
              {tm.label}
            </span>
            <span style={{ fontSize:'0.68rem', padding:'2px 8px', borderRadius:100, background: dc.bg, color: dc.color, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
              {dc.label}
            </span>
            <span style={{ fontSize:'0.68rem', padding:'2px 8px', borderRadius:100, background:'rgba(255,255,255,0.05)', color:'var(--text-muted)', letterSpacing:0.5 }}>
              {prompt.estimatedTime}
            </span>
          </div>
          <h3 style={{ fontSize:'0.92rem', fontWeight:700, lineHeight:1.4, color:'var(--text-main)' }}>{prompt.title}</h3>
        </div>
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4, color:'var(--text-dim)', fontSize:'0.78rem' }}>
          <i className="fas fa-copy" />
          <span>{prompt.copyCount}</span>
        </div>
      </div>

      {prompt.toolName && (
        <span style={{ color:'var(--text-dim)', fontSize:'0.75rem', marginBottom:8 }}>
          <i className="fas fa-bolt" style={{ marginRight:4, color:'var(--neon-yellow)', fontSize:'0.6rem' }} />
          Tool: {prompt.toolName}
        </span>
      )}

      {prompt.subcategory && (
        <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:10 }}>
          <i className="fas fa-folder" style={{ marginRight:6, color:'var(--neon-green)', opacity:0.5 }} />
          {prompt.subcategory}
        </p>
      )}

      {prompt.description && (
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', lineHeight:1.6, marginBottom:14 }}>{prompt.description}</p>
      )}

      <div style={{ position:'relative', marginBottom:14 }}>
        <pre className="prompt-text" style={{
          maxHeight: expanded ? 'none' : 120,
          overflow: expanded ? 'visible' : 'hidden',
          transition:'max-height 0.3s ease',
        }}>
          {prompt.promptText}
        </pre>
        {!expanded && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:50,
            background:'linear-gradient(transparent, var(--bg-card))',
            borderRadius:'0 0 8px 8px',
          }} />
        )}
      </div>

      {hasSample && (
        <div style={{ marginBottom:10 }}>
          <button
            onClick={() => setShowSample(p => !p)}
            className="btn btn-ghost btn-sm"
            style={{ width:'100%', fontSize:'0.72rem' }}
          >
            <i className={`fas fa-${showSample ? 'chevron-up' : 'eye'}`} style={{ marginRight:6 }} />
            {showSample ? 'HIDE EXAMPLE OUTPUT' : 'SEE EXAMPLE OUTPUT'}
          </button>
          {showSample && (
            <div style={{ marginTop:10, borderRadius:8, overflow:'hidden', border:'1px solid rgba(0,255,163,0.1)' }}>
              {prompt.sampleOutput.type === 'image' && (
                <img src={prompt.sampleOutput.url} alt="Sample output"
                  style={{ width:'100%', display:'block', cursor:'pointer' }}
                  onClick={() => window.open(prompt.sampleOutput.url, '_blank')} />
              )}
              {prompt.sampleOutput.type === 'video' && (
                <video controls style={{ width:'100%', display:'block' }}>
                  <source src={prompt.sampleOutput.url} />
                </video>
              )}
              {prompt.sampleOutput.type === 'audio' && (
                <div style={{ padding:16 }}>
                  <audio controls style={{ width:'100%' }}>
                    <source src={prompt.sampleOutput.url} />
                  </audio>
                </div>
              )}
              {prompt.sampleOutput.type === 'text' && (
                <pre style={{ padding:16, fontSize:'0.82rem', color:'var(--text-muted)', whiteSpace:'pre-wrap', background:'rgba(0,0,0,0.3)' }}>
                  {prompt.sampleOutput.text || 'Sample output text'}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {prompt.tags?.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {prompt.tags.map(t => (
            <span key={t} style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:4, background:'rgba(255,255,255,0.04)', color:'var(--text-dim)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
        <button onClick={() => setExpanded(p => !p)} className="btn btn-ghost btn-sm" style={{ flex:1 }}>
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} />
          {expanded ? 'COLLAPSE' : 'EXPAND'}
        </button>
        <button onClick={handleCopy} className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`} style={{ flex:1 }}>
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
          {copied ? 'COPIED!' : 'COPY PROMPT'}
        </button>
        <button onClick={() => onBookmark?.(prompt._id)}
          className="btn btn-sm btn-ghost"
          style={{ flexShrink:0, color: isBookmarked ? 'var(--neon-red)' : 'var(--text-dim)' }}>
          <i className={`${isBookmarked ? 'fas' : 'far'} fa-heart`} />
        </button>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const { user } = useAuth();
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [toolType,  setToolType]  = useState('');
  const [diff,      setDiff]      = useState('');
  const [featured,  setFeatured]  = useState(false);
  const [page,      setPage]      = useState(1);
  const [bookmarks, setBookmarks] = useState([]);

  const fetchFn = useCallback(
    () => promptsAPI.list({ search, category, difficulty: diff, toolType, featured: featured || undefined, page, limit: 12 }),
    [search, category, diff, toolType, featured, page]
  );
  const { data, loading, refetch } = useFetch(fetchFn, [search, category, diff, toolType, featured, page]);

  const prompts    = data?.data       || [];
  const meta       = data?.meta       || {};
  const categories = meta.categories  || [];
  const toolTypeCounts = meta.toolTypeCounts || {};
  const totalPrompts = meta.total || 0;

  const handleCopy = async (id) => {
    try { await promptsAPI.copy(id); refetch(); } catch {}
  };

  const handleBookmark = async (id) => {
    try {
      const { data } = await promptsAPI.bookmark(id);
      if (data.bookmarked) {
        setBookmarks(prev => [...prev, id]);
      } else {
        setBookmarks(prev => prev.filter(b => b !== id));
      }
    } catch {}
  };

  const loadBookmarks = async () => {
    try {
      const { data } = await promptsAPI.getBookmarks();
      if (data.data) {
        setBookmarks(data.data.map(b => b.toString()));
      }
    } catch {}
  };

  useState(() => { loadBookmarks(); });

  const handleSelectToolType = (tt) => {
    setToolType(t => t === tt ? '' : tt);
    setPage(1);
    if (category) setCategory('');
  };

  const handleCat = (cat) => {
    setCategory(c => c === cat ? '' : cat);
    setPage(1);
    if (toolType) setToolType('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div>
            <span className="badge badge-yellow" style={{ marginBottom:12 }}>PROMPT LIBRARY</span>
            <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.5rem,3vw,2.2rem)', marginBottom:8 }}>
              226+ AI PROMPT TEMPLATES
            </h1>
            <p style={{ color:'var(--text-muted)' }}>
              Filter by AI tool type. Copy, customise, and use with any tool.
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <a href="/prompts/bookmarks" className="btn btn-ghost btn-sm">
              <i className="fas fa-heart" style={{ color:'var(--neon-red)' }} /> BOOKMARKS
            </a>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'2rem', color:'var(--neon-yellow)' }}>
                {totalPrompts || '—'}
              </div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.78rem', letterSpacing:1 }}>PROMPTS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:60 }}>
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:220, position:'relative' }}>
            <i className="fas fa-search" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none' }} />
            <input placeholder="Search prompts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft:40 }} />
          </div>
          <select value={diff} onChange={e => { setDiff(e.target.value); setPage(1); }} style={{ minWidth:160 }}>
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Featured + Tool type filter chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          <button onClick={() => { setFeatured(f => !f); setPage(1); }}
            style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 14px', borderRadius:100, fontSize:'0.75rem', fontWeight:700,
              cursor:'pointer', letterSpacing:0.5,
              background: featured ? 'rgba(255,214,0,0.2)' : 'rgba(255,255,255,0.04)',
              color: featured ? 'var(--neon-yellow)' : 'var(--text-muted)',
              border: featured ? '1px solid rgba(255,214,0,0.5)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            <i className="fas fa-star" style={{ fontSize:'0.7rem' }} />
            FEATURED
          </button>
          {toolTypeMeta.map(t => (
            <button key={t.type} onClick={() => handleSelectToolType(t.type)}
              style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'6px 14px', borderRadius:100, fontSize:'0.75rem', fontWeight:700,
                cursor:'pointer', letterSpacing:0.5,
                background: toolType === t.type ? `${t.color}20` : 'rgba(255,255,255,0.04)',
                color: toolType === t.type ? t.color : 'var(--text-muted)',
                border: toolType === t.type ? `1px solid ${t.color}50` : '1px solid rgba(255,255,255,0.06)',
              }}>
              <i className={`fas ${t.icon}`} style={{ fontSize:'0.7rem' }} />
              {t.label}
              <span style={{
                fontSize:'0.65rem', padding:'1px 6px', borderRadius:6,
                background: toolType === t.type ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              }}>
                {toolTypeCounts[t.type] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          <button onClick={() => { setCategory(''); setPage(1); }}
            style={{
              padding:'5px 14px', borderRadius:100, fontSize:'0.78rem', fontWeight:700,
              cursor:'pointer', letterSpacing:0.5,
              background: !category ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)',
              color: !category ? '#020508' : 'var(--text-muted)',
              border: !category ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}>
            All ({totalPrompts || 0})
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => handleCat(cat)} style={{
              padding:'5px 14px', borderRadius:100, fontSize:'0.78rem', fontWeight:700,
              cursor:'pointer', letterSpacing:0.5,
              background: category === cat ? 'rgba(0,255,163,0.15)' : 'rgba(255,255,255,0.04)',
              color: category === cat ? 'var(--neon-green)' : 'var(--text-muted)',
              border: category === cat ? '1px solid rgba(0,255,163,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>{cat}</button>
          ))}
        </div>

        {loading
          ? <Spinner text="LOADING PROMPTS" />
          : prompts.length === 0
            ? <EmptyState emoji="🔍" title="NO PROMPTS FOUND" description="Try a different search or clear the filters." />
            : <div className="grid-auto">{prompts.map(p => <PromptCard key={p._id} prompt={p} onCopy={handleCopy} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(p._id)} />)}</div>
        }

        {meta.pages > 1 && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:40 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
              <i className="fas fa-chevron-left" /> Prev
            </button>
            <span style={{ display:'flex', alignItems:'center', padding:'0 16px', color:'var(--text-muted)', fontSize:'0.85rem' }}>
              Page {page} of {meta.pages}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(meta.pages, p+1))} disabled={page === meta.pages}>
              Next <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
