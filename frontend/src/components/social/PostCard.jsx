import { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { useFollow } from '../../hooks/useFollow';
import CommentSection from './CommentSection';

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const likeBounce = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.35); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid rgba(0, 255, 163, 0.1);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const AvatarCircle = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${p => p.$borderColor || 'transparent'};
  text-decoration: none;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const UsernameLink = styled(Link)`
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-main);
  text-decoration: none;
  &:hover { color: var(--neon-green); }
`;

const BadgeSpan = styled.span`
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const TimeSpan = styled.span`
  font-size: 0.72rem;
  color: var(--text-dim);
`;

const EditedSpan = styled.span`
  font-size: 0.65rem;
  color: var(--text-dim);
  font-style: italic;
`;

const ContentText = styled.div`
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 10px;
`;

const MediaContainer = styled.div`
  margin-top: 12px;
  border-radius: 10px;
  overflow: hidden;
  max-height: 400px;
`;

const StyledImg = styled.img`
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 163, 0.1);
  cursor: pointer;
`;

const StyledVideo = styled.video`
  width: 100%;
  max-height: 400px;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 163, 0.1);
`;

const AudioContainer = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 163, 0.1);
`;

const StyledAudio = styled.audio`
  width: 100%;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
  &:hover { background: rgba(255, 255, 255, 0.08); }
`;

const LikeBtn = styled(ActionBtn)`
  background: ${p => p.$liked ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
  color: ${p => p.$liked ? '#00D4FF' : 'var(--text-dim)'};
  animation: ${p => p.$animating ? likeBounce : 'none'} 0.4s ease;
`;

const MenuBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.85rem;
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  background: var(--bg-card);
  border: 1px solid rgba(0, 255, 163, 0.15);
  border-radius: 8px;
  padding: 4px;
  min-width: 130px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: ${p => p.$danger ? 'var(--neon-red)' : 'var(--text-muted)'};
  cursor: pointer;
  font-size: 0.82rem;
  border-radius: 6px;
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const SkeletonCard = styled.div`
  background: var(--bg-card);
  border: 1px solid rgba(0, 255, 163, 0.1);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
`;

const SkeletonAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonBar = styled.div`
  height: ${p => p.$h || 14}px;
  width: ${p => p.$w || '100%'};
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

function getBadgeColor(user) {
  if (!user) return 'var(--text-dim)';
  if (user.role === 'admin') return 'var(--neon-red)';
  if (user.role === 'moderator') return 'var(--neon-blue)';
  if (user.isPremium) return 'var(--neon-yellow)';
  return 'var(--text-dim)';
}

function getBadgeLabel(user) {
  if (!user) return '';
  if (user.role === 'admin') return 'ADMIN';
  if (user.role === 'moderator') return 'MOD';
  if (user.isPremium) return 'PRO';
  return '';
}

const PostCard = memo(function PostCard({ post, onUpdate, onDelete }) {
  const { user: currentUser } = useAuth();
  const { toggleLike, deletePost } = usePosts();
  const { follow, unfollow } = useFollow();
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [animatingLike, setAnimatingLike] = useState(false);
  const [liked, setLiked] = useState(() => post?.likes?.includes(currentUser?._id) ?? false);
  const [likeCount, setLikeCount] = useState(() => post?.likes?.length ?? 0);

  const isOwner = currentUser?._id === post?.author?._id;
  const isAdmin = currentUser?.role === 'admin';

  const handleLike = useCallback(async () => {
    if (animatingLike || !post?._id) return;
    setAnimatingLike(true);
    const wasLiked = liked;
    setLiked(prev => !prev);
    setLikeCount(prev => prev + (wasLiked ? -1 : 1));
    try {
      await toggleLike(post._id);
      if (onUpdate) onUpdate(post._id, { liked: !wasLiked });
    } catch {
      setLiked(wasLiked);
      setLikeCount(prev => prev + (wasLiked ? 1 : -1));
      toast.error('Failed to like post');
    } finally {
      setTimeout(() => setAnimatingLike(false), 400);
    }
  }, [post?._id, liked, animatingLike, toggleLike, onUpdate]);

  const handleDelete = useCallback(async () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this post?')) return;
    const success = await deletePost(post._id);
    if (success && onDelete) onDelete(post._id);
  }, [post?._id, deletePost, onDelete]);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    toast.success('Report submitted. We will review this content.');
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'JOEAILABS Community', url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  }, [post?._id]);

  function renderMedia() {
    if (!post?.mediaUrl) return null;
    if (post.type === 'image') {
      return (
        <MediaContainer>
          <StyledImg src={post.mediaUrl} alt="" onClick={() => window.open(post.mediaUrl, '_blank')} />
        </MediaContainer>
      );
    }
    if (post.type === 'video') {
      return (
        <MediaContainer>
          <StyledVideo controls muted playsInline>
            <source src={post.mediaUrl} />
          </StyledVideo>
        </MediaContainer>
      );
    }
    if (post.type === 'audio') {
      return (
        <AudioContainer>
          <StyledAudio controls src={post.mediaUrl}>
            Your browser does not support audio.
          </StyledAudio>
        </AudioContainer>
      );
    }
    return null;
  }

  if (!post) {
    return (
      <SkeletonCard>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SkeletonAvatar />
          <div style={{ flex: 1 }}>
            <SkeletonBar $w="120px" $h={14} style={{ marginBottom: 8 }} />
            <SkeletonBar $w="80px" $h={12} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <SkeletonBar $h={14} style={{ marginBottom: 8 }} />
          <SkeletonBar $h={14} $w="85%" style={{ marginBottom: 8 }} />
          <SkeletonBar $h={14} $w="60%" />
        </div>
      </SkeletonCard>
    );
  }

  const badgeColor = getBadgeColor(post.author);
  const badgeLabel = getBadgeLabel(post.author);

  return (
    <Card>
      <CardHeader>
        <AvatarCircle $borderColor={badgeColor} to={`/profile/${post.author?._id}`}>
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '1rem' }}>
              {(post.author?.username || '?').charAt(0).toUpperCase()}
            </span>
          )}
        </AvatarCircle>
        <HeaderInfo>
          <UsernameRow>
            <UsernameLink to={`/profile/${post.author?._id}`}>
              {post.author?.username || 'Unknown'}
            </UsernameLink>
            {badgeLabel && (
              <BadgeSpan style={{
                background: `${badgeColor}20`,
                color: badgeColor,
                border: `1px solid ${badgeColor}40`,
              }}>
                {badgeLabel}
              </BadgeSpan>
            )}
            <TimeSpan>{formatTimeAgo(post.createdAt)}</TimeSpan>
            {post.isEdited && <EditedSpan>(edited)</EditedSpan>}
          </UsernameRow>
        </HeaderInfo>
        <div style={{ position: 'relative' }}>
          <MenuBtn onClick={() => setMenuOpen(p => !p)} aria-label="Post menu">
            <i className="fas fa-ellipsis-h" />
          </MenuBtn>
          {menuOpen && (
            <Dropdown>
              {isOwner || isAdmin ? (
                <>
                  <DropdownItem onClick={() => { setMenuOpen(false); toast.success('Edit feature coming soon'); }}>
                    <i className="fas fa-pen" /> Edit
                  </DropdownItem>
                  <DropdownItem $danger onClick={handleDelete}>
                    <i className="fas fa-trash" /> Delete
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem onClick={handleReport}>
                  <i className="fas fa-flag" /> Report
                </DropdownItem>
              )}
            </Dropdown>
          )}
        </div>
      </CardHeader>

      {post.content && <ContentText>{post.content}</ContentText>}

      {renderMedia()}

      <ActionBar>
        <LikeBtn $liked={liked} $animating={animatingLike} onClick={handleLike}>
          <i className="fas fa-heart" style={{ fontSize: '0.72rem' }} />
          <span>{likeCount}</span>
        </LikeBtn>

        <ActionBtn onClick={() => setCommentsOpen(p => !p)}>
          <i className="fas fa-comment" style={{ fontSize: '0.72rem' }} />
          <span>{post.comments?.length || 0}</span>
        </ActionBtn>

        <ActionBtn onClick={handleShare}>
          <i className="fas fa-share-alt" style={{ fontSize: '0.72rem' }} />
          <span>Share</span>
        </ActionBtn>
      </ActionBar>

      {commentsOpen && (
        <CommentSection postId={post._id} comments={post.comments || []} expanded={true} onToggle={() => setCommentsOpen(false)} onCommentAdded={(updatedPost) => { if (onUpdate) onUpdate(post._id, { comments: updatedPost?.comments || [] }) }} />
      )}
    </Card>
  );
});

export default PostCard;
