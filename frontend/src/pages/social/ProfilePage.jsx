import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { socialUsersAPI } from '../../services/socialApi';
import ProfileHeader from '../../components/social/ProfileHeader';
import PostCard from '../../components/social/PostCard';
import FollowListModal from '../../components/social/FollowListModal';

const PageWrapper = styled.div`
  max-width: 940px;
  margin: 0 auto;
  padding: 0 24px;
  @media (max-width: 640px) { padding: 0 12px; }
`;

const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--bg-border);
  margin-top: 20px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: ${({ $active }) => $active ? 'var(--neon-green)' : 'var(--text-muted)'};
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid ${({ $active }) => $active ? 'var(--neon-green)' : 'transparent'};
  transition: all 0.2s;
  margin-bottom: -1px;
  &:hover { color: var(--text-main); }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: var(--text-muted);
  & i { font-size: 3rem; margin-bottom: 16px; color: var(--text-dim); }
  & h3 { font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; margin-bottom: 8px; color: var(--text-main); }
  & p { font-size: 0.9rem; }
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const AboutItem = styled.div`
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius);
`;

const AboutLabel = styled.div`
  font-size: 0.72rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AboutValue = styled.div`
  font-size: 0.9rem;
  color: var(--text-main);
  font-weight: 600;
`;

const Spinner = styled.div`
  display: flex; justify-content: center; align-items: center; min-height: 60vh;
  & > div {
    width: 32px; height: 32px;
    border: 3px solid rgba(0,255,163,0.15);
    border-top-color: var(--neon-green);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
`;

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [profilePostsLoading, setProfilePostsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [followList, setFollowList] = useState(null); // 'followers' | 'following' | null

  useEffect(() => {
    setLoading(true);
    setTab('posts');
    setPosts([]);
    setCursor(null);
    setLoadTrigger(0);
    socialUsersAPI.getProfile(userId)
      .then(({ data: res }) => setProfile(res.data))
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  useEffect(() => {
    if (!profile) return;
    setProfilePostsLoading(true);
    const params = { limit: 10 };
    if (cursor) params.cursor = cursor;

    socialUsersAPI.getUserPosts(profile._id, params)
      .then(({ data: res }) => {
        if (cursor) {
          setPosts(prev => [...prev, ...(res.data || [])]);
        } else {
          setPosts(res.data || []);
        }
        setHasMore(res.hasMore);
        if (res.nextCursor) setCursor(res.nextCursor);
      })
      .catch(() => {})
      .finally(() => setProfilePostsLoading(false));
  }, [profile?._id, loadTrigger]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || profilePostsLoading) return;
    setLoadTrigger(prev => prev + 1);
  }, [hasMore, profilePostsLoading]);

  const handleUpdate = useCallback((postId, updates) => {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...updates } : p));
  }, []);

  const handleDelete = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  }, []);

  const filteredPosts = tab === 'posts' ? posts
    : tab === 'media' ? posts.filter(p => p.type === 'image' || p.type === 'video')
    : [];

  if (loading) {
    return <Spinner><div /></Spinner>;
  }

  if (!profile) return null;

  return (
    <PageWrapper>
      <ProfileHeader
        profile={profile}
        onUpdate={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        onFollowersClick={() => setFollowList('followers')}
        onFollowingClick={() => setFollowList('following')}
      />

      <TabBar>
        <Tab $active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</Tab>
        <Tab $active={tab === 'about'} onClick={() => setTab('about')}>About</Tab>
        <Tab $active={tab === 'courses'} onClick={() => setTab('courses')}>Courses</Tab>
        <Tab $active={tab === 'media'} onClick={() => setTab('media')}>Media</Tab>
      </TabBar>

      <TabContent>
        {tab === 'about' && (
          <AboutGrid>
            <AboutItem>
              <AboutLabel>Bio</AboutLabel>
              <AboutValue>{profile.bio || 'No bio yet'}</AboutValue>
            </AboutItem>
            <AboutItem>
              <AboutLabel>Location</AboutLabel>
              <AboutValue>{profile.location || 'Not set'}</AboutValue>
            </AboutItem>
            <AboutItem>
              <AboutLabel>Skills</AboutLabel>
              <AboutValue>{profile.skills?.length ? profile.skills.join(', ') : 'No skills added'}</AboutValue>
            </AboutItem>
            <AboutItem>
              <AboutLabel>Joined</AboutLabel>
              <AboutValue>{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</AboutValue>
            </AboutItem>
            <AboutItem>
              <AboutLabel>Role</AboutLabel>
              <AboutValue style={{ textTransform: 'capitalize' }}>{profile.role || 'user'}</AboutValue>
            </AboutItem>
            <AboutItem>
              <AboutLabel>Reputation</AboutLabel>
              <AboutValue>{profile.reputationScore || 0} pts</AboutValue>
            </AboutItem>
          </AboutGrid>
        )}

        {tab === 'courses' && (
          <EmptyState>
            <i className="fas fa-graduation-cap" />
            <h3>Courses Completed</h3>
            <p>{profile.stats?.coursesCompleted || 0} courses completed so far</p>
          </EmptyState>
        )}

        {(tab === 'posts' || tab === 'media') && (
          <>
            {filteredPosts.length === 0 && (
              <EmptyState>
                <i className="fas fa-file-alt" />
                <h3>No {tab === 'media' ? 'media' : 'posts'} yet</h3>
                <p>{profile.isOwnProfile ? 'Create your first post!' : 'No posts to show'}</p>
              </EmptyState>
            )}
            {filteredPosts.map(post => (
              <PostCard key={post._id} post={post} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <button className="btn btn-ghost" onClick={handleLoadMore} disabled={profilePostsLoading}>
                  {profilePostsLoading ? <i className="fas fa-spinner fa-spin" /> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </TabContent>

      {followList && (
        <FollowListModal
          userId={profile._id}
          type={followList}
          onClose={() => setFollowList(null)}
        />
      )}
    </PageWrapper>
  );
}
