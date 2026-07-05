import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useFeed } from '../../hooks/useFeed';
import { usePosts } from '../../hooks/usePosts';
import { useFollow } from '../../hooks/useFollow';
import { followAPI } from '../../services/socialApi';
import api, { paymentsAPI } from '../../services/api';
import PostComposer from '../../components/social/PostComposer';
import PostCard from '../../components/social/PostCard';
import UserCard from '../../components/social/UserCard';
import { useAuth } from '../../context/AuthContext';

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(0, 600px) 280px;
  gap: 24px;
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
  align-items: start;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    max-width: 640px;
  }
  @media (max-width: 640px) {
    padding: 0 12px;
    margin: 12px auto;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 80px;
  @media (max-width: 1100px) { display: none; }
`;

const SidebarCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
`;

const QuickLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: ${({ $active }) => $active ? 'var(--neon-green)' : 'var(--text-muted)'};
  font-weight: ${({ $active }) => $active ? 700 : 600};
  font-size: 0.9rem;
  transition: all 0.2s;
  background: ${({ $active }) => $active ? 'rgba(0,255,163,0.08)' : 'transparent'};
  &:hover { background: rgba(0,255,163,0.08); color: var(--neon-green); }
  & i { width: 20px; text-align: center; }
`;

const Center = styled.main`
  min-width: 0;
`;

const FeedTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius-lg);
  padding: 4px;
`;

const FeedTab = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(0,255,163,0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--neon-green)' : 'var(--text-muted)'};
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { color: var(--text-main); background: rgba(0,255,163,0.04); }
`;

const SideTitle = styled.h4`
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
`;

const NewPostBanner = styled.div`
  text-align: center;
  padding: 8px;
  background: rgba(0,255,163,0.08);
  border: 1px solid rgba(0,255,163,0.2);
  border-radius: var(--radius);
  color: var(--neon-green);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s;
  &:hover { background: rgba(0,255,163,0.12); }
`;

const CompactCommunityCard = styled(SidebarCard)`
  padding: 14px 16px;
`;

const CommunityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  &:last-of-type { border-bottom: none; }
`;

const CommunityRowLink = styled(CommunityRow.withComponent('a'))`
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  margin: 0 -8px;
  padding: 7px 8px;
  border-radius: 6px;
  &:hover { background: rgba(255,255,255,0.04); }
`;

const CommIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg || 'rgba(0,255,163,0.08)'};
  color: ${({ $color }) => $color || 'var(--neon-green)'};
`;

const CommInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommName = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
`;

const CommStatus = styled.span`
  font-size: 0.62rem;
  color: ${({ $active }) => $active ? 'var(--neon-green)' : 'var(--text-dim)'};
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const CommAction = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${({ $color }) => $color || 'var(--neon-green)'};
  flex-shrink: 0;
`;

const DiscordInline = styled.form`
  display: flex;
  gap: 4px;
  margin-top: 6px;
`;

const DiscordInput = styled.input`
  flex: 1;
  padding: 5px 8px;
  font-size: 0.7rem;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 163, 0.15);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  outline: none;
  &::placeholder { color: var(--text-dim); }
  &:focus { border-color: var(--neon-green); }
`;

const DiscordBtn = styled.button`
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  background: ${({ $disabled }) => $disabled ? 'rgba(255,255,255,0.06)' : 'var(--neon-green)'};
  color: ${({ $disabled }) => $disabled ? 'var(--text-dim)' : '#020508'};
  font-family: inherit;
  white-space: nowrap;
`;

const TrendsCard = styled(SidebarCard)`
  padding: 14px 16px;
`;

const TrendsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TrendItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(0, 255, 163, 0.04); }
`;

const TrendIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg || 'rgba(0,255,163,0.08)'};
  color: ${({ $color }) => $color || 'var(--neon-green)'};
`;

const TrendContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrendTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 2px;
`;

const TrendMeta = styled.div`
  font-size: 0.62rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TrendTag = styled.span`
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--neon-blue);
  background: rgba(0, 212, 255, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: var(--text-muted);
  & i { font-size: 3rem; margin-bottom: 16px; color: var(--text-dim); }
  & h3 { font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; margin-bottom: 8px; color: var(--text-main); }
  & p { font-size: 0.9rem; }
`;

function addUtm(url, source) {
  const params = `utm_source=${source}&utm_medium=community&utm_campaign=joeailabs`;
  return `${url}${url.includes('?') ? '&' : '?'}${params}`;
}

const TRENDING_TRENDS = [
  { icon: 'fa-brain', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', title: 'GPT-5 expected to ship with 10x improved reasoning by Q4', tag: 'AI Models', time: '2h ago' },
  { icon: 'fa-code', color: '#00D4FF', bg: 'rgba(0,212,255,0.1)', title: 'OpenAI launches free Codex CLI for terminal-based coding', tag: 'Tools', time: '5h ago' },
  { icon: 'fa-robot', color: '#f97316', bg: 'rgba(249,115,22,0.1)', title: 'Meta releases Llama 4 with native multimodal support', tag: 'Open Source', time: '12h ago' },
  { icon: 'fa-gemini', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', title: 'Google DeepMind achieves breakthrough in protein folding', tag: 'Research', time: '1d ago' },
  { icon: 'fa-video', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', title: 'Sora 2 brings 4K video generation to all ChatGPT users', tag: 'Product', time: '2d ago' },
  { icon: 'fa-microchip', color: '#eab308', bg: 'rgba(234,179,8,0.1)', title: 'Anthropic raises $3.5B to scale Claude enterprise features', tag: 'Industry', time: '3d ago' },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('following');
  const [suggestions, setSuggestions] = useState([]);
  const [links, setLinks] = useState({});
  const [discordEmail, setDiscordEmail] = useState('');
  const [discordLoading, setDiscordLoading] = useState(false);
  const [discordMessage, setDiscordMessage] = useState('');
  const [discordError, setDiscordError] = useState('');
  const { posts, loading, hasMore, lastPostRef, prependPost, updatePost, removePost, refresh } = useFeed(tab === 'following' ? 'feed' : 'discover');
  const { createPost } = usePosts();

  useEffect(() => {
    followAPI.getSuggestions().then(({ data: res }) => setSuggestions(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/settings/public').then(({ data }) => {
      setLinks(data?.data?.communityLinks || {});
    }).catch(() => {});
  }, []);

  const handlePostCreated = useCallback((post) => {
    prependPost(post);
  }, [prependPost]);

  const handleDiscordWaitlist = useCallback(async (e) => {
    e.preventDefault();
    if (!discordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(discordEmail)) {
      setDiscordError('Enter a valid email address.'); return;
    }
    setDiscordLoading(true); setDiscordError(''); setDiscordMessage('');
    try {
      const { data } = await paymentsAPI.joinWaitlist(discordEmail, 'discord');
      setDiscordMessage(data.message || "You're on the waitlist!");
      setDiscordEmail('');
    } catch (err) {
      setDiscordError(err.response?.data?.message || 'Something went wrong.');
    } finally { setDiscordLoading(false); }
  }, [discordEmail]);

  return (
    <PageGrid>
      <Sidebar>
        <SidebarCard>
          <Link to={`/profile/${user?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--bg-border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--neon-green)', overflow: 'hidden', flexShrink: 0 }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-user" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.bio || 'Welcome to JOEAILABS'}</div>
            </div>
          </Link>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <QuickLink to="/feed" $active><i className="fas fa-newspaper" /> Feed</QuickLink>
            <QuickLink to="/feed" onClick={(e) => { e.preventDefault(); setTab('discover'); }} $active={tab === 'discover'}><i className="fas fa-compass" /> Discover</QuickLink>
            <QuickLink to="/messages"><i className="fas fa-envelope" /> Messages</QuickLink>
            <QuickLink to="/notifications"><i className="fas fa-bell" /> Notifications</QuickLink>
            <QuickLink to={`/profile/${user?._id}`}><i className="fas fa-user" /> Profile</QuickLink>
          </nav>
        </SidebarCard>

        <CompactCommunityCard>
          <SideTitle>Connect</SideTitle>

          {links.whatsapp ? (
            <CommunityRowLink href={addUtm(links.whatsapp, 'whatsapp')} target="_blank" rel="noopener noreferrer">
              <CommIcon $bg="rgba(37,211,102,0.1)" $color="#25D366"><i className="fa-brands fa-whatsapp" /></CommIcon>
              <CommInfo><CommName>WhatsApp</CommName></CommInfo>
              <CommStatus $active><span style={{ width:5, height:5, borderRadius:'50%', background:'var(--neon-green)', display:'inline-block', marginRight:2 }} />Active</CommStatus>
              <CommAction $color="#25D366">Join</CommAction>
            </CommunityRowLink>
          ) : (
            <CommunityRow>
              <CommIcon $bg="rgba(37,211,102,0.1)" $color="#25D366"><i className="fa-brands fa-whatsapp" /></CommIcon>
              <CommInfo><CommName>WhatsApp</CommName></CommInfo>
              <CommStatus>Not configured</CommStatus>
            </CommunityRow>
          )}

          {links.telegram ? (
            <CommunityRowLink href={addUtm(links.telegram, 'telegram')} target="_blank" rel="noopener noreferrer">
              <CommIcon $bg="rgba(0,136,204,0.1)" $color="#0088cc"><i className="fa-brands fa-telegram" /></CommIcon>
              <CommInfo><CommName>Telegram</CommName></CommInfo>
              <CommStatus $active><span style={{ width:5, height:5, borderRadius:'50%', background:'var(--neon-green)', display:'inline-block', marginRight:2 }} />Active</CommStatus>
              <CommAction $color="#0088cc">Join</CommAction>
            </CommunityRowLink>
          ) : (
            <CommunityRow>
              <CommIcon $bg="rgba(0,136,204,0.1)" $color="#0088cc"><i className="fa-brands fa-telegram" /></CommIcon>
              <CommInfo><CommName>Telegram</CommName></CommInfo>
              <CommStatus>Not configured</CommStatus>
            </CommunityRow>
          )}

          <CommunityRow>
            <CommIcon $bg="rgba(88,101,242,0.1)" $color="#5865F2"><i className="fa-brands fa-discord" /></CommIcon>
            <CommInfo>
              <CommName>Discord</CommName>
              {links.discord ? null : (
                <>
                  {discordMessage && <span style={{ fontSize:'0.62rem', color:'var(--neon-green)' }}>{discordMessage}</span>}
                  {discordError && <span style={{ fontSize:'0.62rem', color:'var(--neon-red)' }}>{discordError}</span>}
                </>
              )}
            </CommInfo>
            {links.discord ? (
              <a href={links.discord} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                <CommAction $color="#5865F2">Join</CommAction>
              </a>
            ) : (
              <CommStatus>Soon</CommStatus>
            )}
          </CommunityRow>
          {!links.discord && (
            <DiscordInline onSubmit={handleDiscordWaitlist}>
              <DiscordInput
                type="email" placeholder="your@email.com"
                value={discordEmail} onChange={e => setDiscordEmail(e.target.value)}
              />
              <DiscordBtn type="submit" $disabled={discordLoading} disabled={discordLoading}>
                {discordLoading ? <i className="fas fa-circle-notch fa-spin" /> : 'Join waitlist'}
              </DiscordBtn>
            </DiscordInline>
          )}

          <CommunityRowLink as={Link} to="/messages" style={{ textDecoration:'none' }}>
            <CommIcon $bg="rgba(0,255,163,0.08)" $color="var(--neon-green)"><i className="fas fa-comments" /></CommIcon>
            <CommInfo><CommName>Live Chat</CommName></CommInfo>
            <CommAction $color="var(--neon-green)">Chat</CommAction>
          </CommunityRowLink>
        </CompactCommunityCard>
      </Sidebar>

      <Center>
        <PostComposer onPostCreated={handlePostCreated} />

        <FeedTabs>
          <FeedTab $active={tab === 'following'} onClick={() => setTab('following')}>Following</FeedTab>
          <FeedTab $active={tab === 'discover'} onClick={() => setTab('discover')}>For You</FeedTab>
        </FeedTabs>

        {loading && [1,2,3].map(i => (
          <div key={i} className="post-skeleton">
            <div className="skeleton-row">
              <div className="skeleton-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skeleton-line w60" />
                <div className="skeleton-line w40" style={{ marginTop: 6 }} />
              </div>
            </div>
            <div className="skeleton-line w80 h24" />
            <div className="skeleton-line w60" style={{ marginTop: 8 }} />
            <div className="skeleton-line h200" style={{ marginTop: 12 }} />
          </div>
        ))}

        {!loading && posts.length === 0 && (
          <EmptyState>
            <i className="fas fa-newspaper" />
            <h3>No posts yet</h3>
            <p>{tab === 'following' ? 'Follow creators to see their posts here!' : 'Explore more creators to discover content'}</p>
          </EmptyState>
        )}

        {posts.map((post, index) => (
          <div key={post._id} ref={index === posts.length - 1 ? lastPostRef : null}>
            <PostCard post={post} onUpdate={updatePost} onDelete={removePost} />
          </div>
        ))}

        {hasMore && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)' }}><i className="fas fa-spinner fa-spin" /> Loading more...</div>}
      </Center>

      <Sidebar>
        <SidebarCard>
          <SideTitle>Suggested Creators</SideTitle>
          {suggestions.length === 0 && <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No suggestions yet</div>}
          {suggestions.map(s => (
            <UserCard key={s._id} user={s} />
          ))}
        </SidebarCard>

        <TrendsCard>
          <SideTitle>AI Trends</SideTitle>
          <TrendsList>
            {TRENDING_TRENDS.map((t, i) => (
              <TrendItem key={i}>
                <TrendIcon $bg={t.bg} $color={t.color}><i className={`fas ${t.icon}`} /></TrendIcon>
                <TrendContent>
                  <TrendTitle>{t.title}</TrendTitle>
                  <TrendMeta>
                    <TrendTag>{t.tag}</TrendTag>
                    {t.time}
                  </TrendMeta>
                </TrendContent>
              </TrendItem>
            ))}
          </TrendsList>
        </TrendsCard>
      </Sidebar>
    </PageGrid>
  );
}
