import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { postsAPI } from '../../services/socialApi';
import PostCard from '../../components/social/PostCard';

const PageWrapper = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 24px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(0, 255, 163, 0.15);
  border-radius: 8px;
  color: var(--neon-green);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  margin-bottom: 20px;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 255, 163, 0.08);
  }
`;

const Spinner = styled.div`
  display: flex; justify-content: center; align-items: center; min-height: 40vh;
  & > div {
    width: 32px; height: 32px;
    border: 3px solid rgba(0,255,163,0.15);
    border-top-color: var(--neon-green);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: var(--text-muted);
  & i { font-size: 3rem; margin-bottom: 16px; color: var(--text-dim); }
  & h3 { font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; margin-bottom: 8px; color: var(--text-main); }
  & p { font-size: 0.9rem; }
`;

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    postsAPI.get(postId)
      .then(({ data: res }) => setPost(res.data || res))
      .catch(err => {
        setError(err?.response?.status === 404 ? 'Post not found' : 'Failed to load post');
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <PageWrapper><Spinner><div /></Spinner></PageWrapper>;

  if (error || !post) {
    return (
      <PageWrapper>
        <BackButton onClick={() => navigate('/feed')}>
          <i className="fas fa-arrow-left" /> Back to Feed
        </BackButton>
        <ErrorState>
          <i className="fas fa-exclamation-circle" />
          <h3>{error || 'Post not found'}</h3>
          <p>The post you are looking for does not exist or has been removed.</p>
        </ErrorState>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left" /> Back
      </BackButton>
      <PostCard post={post} onUpdate={(id, updates) => setPost(prev => ({ ...prev, ...updates }))} />
    </PageWrapper>
  );
}
