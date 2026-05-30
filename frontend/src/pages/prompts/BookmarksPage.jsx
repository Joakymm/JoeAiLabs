import { useState, useEffect } from 'react';
import { promptsAPI } from '../../services/api';
import PromptCard from './PromptsPage.jsx';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';

export default function BookmarksPage() {
  const [bookmarkedPrompts, setBookmarkedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const bookmarkRes = await promptsAPI.getBookmarks();
        const ids = bookmarkRes.data.data || [];
        if (ids.length === 0) {
          setBookmarkedPrompts([]);
          return;
        }
        const allPromptsRes = await promptsAPI.list({ limit: 200 });
        const all = allPromptsRes.data.data || [];
        setBookmarkedPrompts(all.filter(p => ids.some(id => id.toString() === p._id.toString())));
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  if (loading) return <Spinner text="LOADING BOOKMARKS" />;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="badge badge-green" style={{ marginBottom: 12 }}>BOOKMARKS</span>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)' }}>
          <i className="fas fa-heart" style={{ color: 'var(--neon-red)', marginRight: 12 }} />
          SAVED PROMPTS
        </h1>
      </div>
      {bookmarkedPrompts.length === 0 ? (
        <EmptyState emoji="❤️" title="NO BOOKMARKS YET" description="Bookmark prompts from the Prompt Library to see them here." />
      ) : (
        <div className="grid-auto">
          {bookmarkedPrompts.map(p => <PromptCard key={p._id} prompt={p} onCopy={() => {}} />)}
        </div>
      )}
    </div>
  );
}
