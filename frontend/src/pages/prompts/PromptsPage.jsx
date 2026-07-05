import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { promptsAPI } from '../../services/api';
import { useFetch, useDebounce } from '../../hooks/index.js';
import { Spinner, EmptyState, SectionHeader } from '../../components/ui/index.jsx';
import { useAuth } from '../../context/AuthContext';

const TOOL_META = [
  { type:'writing-copy',      icon:'fa-pen-fancy',              label:'Writing',      color:'var(--neon-green)' },
  { type:'image-generation',  icon:'fa-image',                  label:'Image Gen',    color:'#a855f7' },
  { type:'video-generation',  icon:'fa-video',                  label:'Video',        color:'#ef4444' },
  { type:'voice-audio',       icon:'fa-microphone',             label:'Voice',        color:'#f97316' },
  { type:'code-generation',   icon:'fa-code',                   label:'Code',         color:'#3b82f6' },
  { type:'automation',        icon:'fa-gear',                   label:'Automation',   color:'#14b8a6' },
  { type:'research-analysis', icon:'fa-magnifying-glass-chart', label:'Research',     color:'var(--neon-yellow)' },
  { type:'presentation',      icon:'fa-chart-simple',           label:'Presentation', color:'#ec4899' },
];

const DIFF = {
  beginner:     { bg:'rgba(0,255,163,0.08)',  color:'var(--neon-green)',  label:'Beginner' },
  intermediate: { bg:'rgba(0,212,255,0.08)',  color:'var(--neon-blue)',   label:'Intermediate' },
  advanced:     { bg:'rgba(255,60,90,0.08)',  color:'var(--neon-red)',    label:'Advanced' },
};

function PromptCard({ prompt, onCopy, onBookmark, bookmarked }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const dc = DIFF[prompt.difficulty] || DIFF.beginner;
  const tm = TOOL_META.find(t => t.type === prompt.toolType) || TOOL_META[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      onCopy?.(prompt._id);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            <span style={{ fontSize:'0.68rem', padding:'2px 10px', borderRadius:100, fontWeight:700, letterSpacing:1, textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:4, background:`${tm.color}15`, color:tm.color, border:`1px solid ${tm.color}30` }}>
              <i className={`fas ${tm.icon}`} style={{ fontSize:'0.6rem' }} />{tm.label}
            </span>
            <span style={{ fontSize:'0.68rem', padding:'2px 9px', borderRadius:100, background:dc.bg, color:dc.color, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
              {dc.label}
            </span>
            {prompt.estimatedTime && (
              <span style={{ fontSize:'0.68rem', padding:'2px 9px', borderRadius:100, background:'rgba(255,255,255,0.05)', color:'var(--text-muted)' }}>
                <i className="fas fa-clock" style={{ marginRight:4, fontSize:'0.6rem' }} />{prompt.estimatedTime}
              </span>
            )}
          </div>
          <h3 style={{ fontSize:'0.92rem', fontWeight:700, lineHeight:1.4, color:'var(--text-main)' }}>{prompt.title}</h3>
          {prompt.toolName && (
            <span style={{ color:'var(--text-dim)', fontSize:'0.75rem', display:'block', marginTop:4 }}>
              <i className="fas fa-bolt" style={{ marginRight:4, color:'var(--neon-yellow)', fontSize:'0.6rem' }} />
              {prompt.toolName}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-dim)', fontSize:'0.78rem', flexShrink:0 }}>
          <i className="fas fa-copy" /><span>{prompt.copyCount}</span>
        </div>
      </div>

      {/* Prompt text preview */}
      <div className="prompt-text" style={{ fontSize:'0.8rem', maxHeight: expanded ? 'none' : '90px', overflow:'hidden', position:'relative' }}>
        {prompt.promptText}
        {!expanded && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'linear-gradient(transparent, var(--bg-card))', borderRadius:'0 0 8px 8px' }} />
        )}
      </div>
      <button onClick={() => setExpanded(p => !p)}
        style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:'0.78rem', padding:0, textAlign:'left', display:'flex', alignItems:'center', gap:6 }}>
        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} />
        {expanded ? 'Collapse' : 'Expand prompt'}
      </button>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', borderTop:'1px solid rgba(0,255,163,0.06)', paddingTop:12 }}>
        <button onClick={handleCopy} className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`} style={{ flex:1 }}>
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
          {copied ? 'COPIED!' : 'COPY'}
        </button>
        <button onClick={() => onBookmark?.(prompt._id)} className="btn btn-ghost btn-sm"
          style={{ color: bookmarked ? 'var(--neon-yellow)' : 'var(--text-muted)', borderColor: bookmarked ? 'rgba(255,214,0,0.3)' : undefined }}>
          <i className={`${bookmarked ? 'fas' : 'far'} fa-bookmark`} />
        </button>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('');
  const [activeDiff, setActiveDiff] = useState('');
  const [bookmarks, setBookmarks] = useState(new Set());
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, refetch } = useFetch(
    () => promptsAPI.list({ search: debouncedSearch, toolType: activeType, difficulty: activeDiff, page, limit: 12 }),
    [debouncedSearch, activeType, activeDiff, page]
  );

  const prompts = data?.prompts || data || [];
  const total   = data?.total || prompts.length;
  const totalPages = data?.totalPages || 1;

  const handleCopy = useCallback(async (id) => {
    try { await promptsAPI.copy(id); } catch {}
  }, []);

  const handleBookmark = useCallback(async (id) => {
    try {
      await promptsAPI.bookmark(id);
      setBookmarks(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    } catch {}
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-yellow" style={{ marginBottom:12 }}><i className="fas fa-bolt" /> PROMPT LIBRARY</span>
          <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.5rem,3vw,2.2rem)', marginBottom:8 }}>
            AI <span style={{ color:'var(--neon-yellow)' }}>PROMPT TEMPLATES</span>
          </h1>
          <p style={{ color:'var(--text-muted)', maxWidth:500 }}>500+ curated prompts for every AI tool. Copy, remix, and master AI-powered workflows.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:60 }}>
        {/* Search + Bookmark link */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:240 }}>
            <i className="fas fa-search" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              placeholder="Search prompts..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft:40 }}
            />
          </div>
          <Link to="/prompts/bookmarks" className="btn btn-ghost btn-sm">
            <i className="far fa-bookmark" /> My Bookmarks
          </Link>
        </div>

        {/* Tool type filter pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          <button
            onClick={() => { setActiveType(''); setPage(1); }}
            className={`btn btn-sm ${!activeType ? 'btn-primary' : 'btn-ghost'}`}
          >ALL</button>
          {TOOL_META.map(t => (
            <button key={t.type}
              onClick={() => { setActiveType(activeType === t.type ? '' : t.type); setPage(1); }}
              style={{
                padding:'7px 14px', borderRadius:8, border:'1px solid', cursor:'pointer',
                fontSize:'0.78rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:6,
                letterSpacing:0.5, fontFamily:'Rajdhani,sans-serif', transition:'all 0.15s',
                background: activeType === t.type ? `${t.color}18` : 'transparent',
                color: activeType === t.type ? t.color : 'var(--text-muted)',
                borderColor: activeType === t.type ? `${t.color}50` : 'rgba(255,255,255,0.08)',
              }}>
              <i className={`fas ${t.icon}`} style={{ fontSize:'0.7rem' }} />{t.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter pills */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {['','beginner','intermediate','advanced'].map(d => (
            <button key={d || 'all'}
              onClick={() => { setActiveDiff(d); setPage(1); }}
              style={{
                padding:'5px 14px', borderRadius:100, border:'1px solid', cursor:'pointer',
                fontSize:'0.72rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase',
                fontFamily:'Rajdhani,sans-serif', transition:'all 0.15s',
                background: activeDiff === d ? (d ? DIFF[d]?.bg : 'rgba(0,255,163,0.08)') : 'transparent',
                color: activeDiff === d ? (d ? DIFF[d]?.color : 'var(--neon-green)') : 'var(--text-dim)',
                borderColor: activeDiff === d ? (d ? DIFF[d]?.color + '40' : 'rgba(0,255,163,0.3)') : 'rgba(255,255,255,0.06)',
              }}>
              {d || 'All Levels'}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ color:'var(--text-dim)', fontSize:'0.8rem', marginBottom:16 }}>
            {total} prompt{total !== 1 ? 's' : ''} found
          </p>
        )}

        {loading ? <Spinner text="LOADING PROMPTS" /> : prompts.length === 0 ? (
          <EmptyState
            emoji="⚡"
            title="NO PROMPTS FOUND"
            description="Try adjusting your search or filter to find what you're looking for."
            action={<button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setActiveType(''); setActiveDiff(''); }}>Clear Filters</button>}
          />
        ) : (
          <div className="grid-auto">
            {prompts.map(p => (
              <PromptCard
                key={p._id}
                prompt={p}
                onCopy={handleCopy}
                onBookmark={handleBookmark}
                bookmarked={bookmarks.has(p._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32, flexWrap:'wrap' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost btn-sm">
              <i className="fas fa-chevron-left" /> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = i + 1;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`btn btn-sm ${page === pg ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ minWidth:40 }}>{pg}</button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-ghost btn-sm">
              Next <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
