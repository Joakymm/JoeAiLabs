import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptsAPI } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';

export default function BookmarksPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promptsAPI.getBookmarks().then(({ data }) => {
      setPrompts(data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await promptsAPI.bookmark(id);
      setPrompts(p => p.filter(b => b._id !== id));
    } catch {}
  };

  const handleCopy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  if (loading) return <Spinner text="LOADING BOOKMARKS" />;

  return (
    <div className="container" style={{ padding:'40px 24px 60px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:12 }}>
        <div>
          <Link to="/prompts" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.85rem', display:'inline-flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <i className="fas fa-arrow-left" /> Back to Prompts
          </Link>
          <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--neon-yellow)' }}>
            <i className="fas fa-bookmark" style={{ marginRight:12 }} />MY BOOKMARKS
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:6 }}>{prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {prompts.length === 0 ? (
        <EmptyState
          emoji="🔖"
          title="NO BOOKMARKS YET"
          description="Browse the Prompt Library and bookmark prompts you want to save for later."
          action={<Link to="/prompts" className="btn btn-primary"><i className="fas fa-bolt" /> Browse Prompts</Link>}
        />
      ) : (
        <div className="grid-auto">
          {prompts.map(p => (
            <div key={p._id} className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <h3 style={{ fontSize:'0.92rem', fontWeight:700, lineHeight:1.4, color:'var(--text-main)', flex:1 }}>{p.title}</h3>
                <button onClick={() => handleRemove(p._id)}
                  style={{ background:'none', border:'none', color:'var(--neon-yellow)', cursor:'pointer', padding:4, fontSize:'0.9rem' }}
                  title="Remove bookmark">
                  <i className="fas fa-bookmark" />
                </button>
              </div>
              <div className="prompt-text" style={{ fontSize:'0.8rem', maxHeight:80, overflow:'hidden', position:'relative' }}>
                {p.promptText}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:30, background:'linear-gradient(transparent, var(--bg-card))' }} />
              </div>
              <button onClick={() => handleCopy(p.promptText)} className="btn btn-secondary btn-sm">
                <i className="fas fa-copy" /> COPY PROMPT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
