import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { postsAPI } from '../../services/socialApi';

function timeAgo(date) {
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

function countAll(comments) {
  let count = 0;
  for (const c of comments) {
    count += 1;
    if (c.replies?.length) count += c.replies.length;
  }
  return count;
}

const Wrapper = styled.div`
  border-top: 1px solid rgba(0, 255, 163, 0.08);
  margin-top: 4px;
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--neon-green);
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  &:hover {
    background: rgba(0, 255, 163, 0.04);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-main);
  }
`;

const EmptyState = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
  font-style: italic;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentItemWrapper = styled.div`
  padding: 8px 16px;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const CommentRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

const Avatar = styled.div`
  width: ${({ $size }) => $size || 28}px;
  height: ${({ $size }) => $size || 28}px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(0, 255, 163, 0.08);
  border: 1px solid rgba(0, 255, 163, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round(($size || 28) * 0.45)}px;
  font-weight: 700;
  color: var(--neon-green);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
`;

const AuthorName = styled.span`
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-main);
`;

const Timestamp = styled.span`
  font-size: 0.68rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EditedTag = styled.span`
  font-size: 0.62rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
`;

const CommentText = styled.div`
  font-size: 0.84rem;
  color: var(--text-muted);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(255, 60, 90, 0.1)' : 'transparent'};
  color: ${({ $active, $danger }) =>
    $danger ? 'var(--neon-red)' : $active ? '#ff6090' : 'var(--text-dim)'};
  cursor: pointer;
  font-size: 0.72rem;
  transition: all 0.15s;
  &:hover {
    background: ${({ $danger }) =>
      $danger ? 'rgba(255, 60, 90, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
    color: ${({ $danger }) => $danger ? 'var(--neon-red)' : 'var(--text-main)'};
  }
`;

const ConfirmGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ConfirmButton = styled.button`
  padding: 3px 8px;
  border-radius: 5px;
  border: none;
  font-size: 0.7rem;
  cursor: pointer;
  background: ${({ $cancel }) => $cancel ? 'rgba(255, 255, 255, 0.06)' : 'var(--neon-red)'};
  color: ${({ $cancel }) => $cancel ? 'var(--text-dim)' : '#fff'};
  &:hover {
    opacity: 0.85;
  }
`;

const ReplyInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin: 6px 0 4px ${({ $depth }) => ($depth || 0) > 0 ? 38 : 0}px;
  padding-left: ${({ $depth }) => ($depth || 0) > 0 ? 0 : 38}px;
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 7px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 163, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  outline: none;
  &::placeholder {
    color: var(--text-dim);
  }
  &:focus {
    border-color: var(--neon-green);
  }
`;

const ReplySubmitButton = styled.button`
  padding: 7px 12px;
  border-radius: 6px;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $disabled }) => $disabled ? 'rgba(255, 255, 255, 0.06)' : 'var(--neon-green)'};
  color: ${({ $disabled }) => $disabled ? 'var(--text-dim)' : '#020508'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  white-space: nowrap;
`;

const RepliesList = styled.div`
  margin-left: 38px;
  border-left: 1px solid rgba(0, 255, 163, 0.06);
  padding-left: 0;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 16px 12px;
  border-top: 1px solid rgba(0, 255, 163, 0.06);
`;

const Input = styled.textarea`
  flex: 1;
  padding: 8px 12px;
  font-size: 0.84rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 163, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  min-height: 36px;
  max-height: 120px;
  &::placeholder {
    color: var(--text-dim);
  }
  &:focus {
    border-color: var(--neon-green);
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  align-self: flex-end;
  background: ${({ $disabled }) => $disabled ? 'rgba(255, 255, 255, 0.06)' : 'var(--neon-green)'};
  color: ${({ $disabled }) => $disabled ? 'var(--text-dim)' : '#020508'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  white-space: nowrap;
  transition: all 0.15s;
`;

function CommentItem({ comment, postId, depth, onCommentAdded }) {
  const { user } = useAuth();
  const { addComment, deleteComment } = usePosts();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [liked, setLiked] = useState(() => comment.likes?.includes(user?._id) ?? false);
  const [likeCount, setLikeCount] = useState(comment.likes?.length ?? comment.likeCount ?? 0);

  const author = comment.author || comment.user || {};
  const isOwner = user?._id === author._id;
  const isEdited = comment.updatedAt && (new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1500);
  const avatarSize = depth > 0 ? 24 : 28;

  useEffect(() => {
    setLiked(comment.likes?.includes(user?._id) ?? false);
    setLikeCount(comment.likes?.length ?? comment.likeCount ?? 0);
  }, [comment.likes, comment.likeCount, user?._id]);

  const handleLike = async () => {
    try {
      const { data } = await postsAPI.toggleCommentLike(postId, comment._id);
      if (data?.data) {
        setLiked(data.data.liked ?? !liked);
        setLikeCount(data.data.likeCount ?? data.data.likes?.length ?? likeCount);
      }
    } catch {}
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const updatedPost = await addComment(postId, replyText.trim(), comment._id);
      setReplyText('');
      setReplyOpen(false);
      if (updatedPost) onCommentAdded(updatedPost);
    } catch {} finally {
      setSendingReply(false);
    }
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  const handleDelete = async () => {
    const success = await deleteComment(postId, comment._id);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  const avatarLetter = (author.username || '?').charAt(0).toUpperCase();

  return (
    <CommentItemWrapper>
      <CommentRow>
        <Avatar $size={avatarSize}>
          {author.avatar
            ? <img src={author.avatar} alt="" />
            : <span>{avatarLetter}</span>
          }
        </Avatar>
        <CommentContent>
          <CommentHeader>
            <AuthorName>{author.username || 'Unknown'}</AuthorName>
            <Timestamp>
              {timeAgo(comment.createdAt)}
              {isEdited && <EditedTag>edited</EditedTag>}
            </Timestamp>
          </CommentHeader>
          <CommentText>{comment.text ?? comment.content ?? ''}</CommentText>
          <CommentActions>
            <ActionButton $active={liked} onClick={handleLike}>
              <i className={`fas fa-heart`} style={{ fontSize: '0.65rem' }} />
              <span>{likeCount}</span>
            </ActionButton>
            {depth < 2 && (
              <ActionButton onClick={() => setReplyOpen((p) => !p)}>
                <i className="fas fa-reply" style={{ fontSize: '0.62rem' }} />
                Reply
              </ActionButton>
            )}
            {isOwner && !showDeleteConfirm && (
              <ActionButton $danger onClick={() => setShowDeleteConfirm(true)}>
                <i className="fas fa-trash" style={{ fontSize: '0.6rem' }} />
              </ActionButton>
            )}
            {isOwner && showDeleteConfirm && (
              <ConfirmGroup>
                <ConfirmButton onClick={handleDelete}>Delete</ConfirmButton>
                <ConfirmButton $cancel onClick={() => setShowDeleteConfirm(false)}>Cancel</ConfirmButton>
              </ConfirmGroup>
            )}
          </CommentActions>
          {replyOpen && (
            <ReplyInputWrapper $depth={depth}>
              <ReplyInput
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleReplyKeyDown}
                placeholder="Write a reply..."
                autoFocus
              />
              <ReplySubmitButton
                onClick={handleReplySubmit}
                $disabled={!replyText.trim() || sendingReply}
                disabled={!replyText.trim() || sendingReply}
              >
                {sendingReply ? <i className="fas fa-circle-notch fa-spin" /> : 'Reply'}
              </ReplySubmitButton>
            </ReplyInputWrapper>
          )}
        </CommentContent>
      </CommentRow>

      {comment.replies?.length > 0 && depth < 2 && (
        <RepliesList>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </RepliesList>
      )}
    </CommentItemWrapper>
  );
}

export default function CommentSection({ postId, comments = [], expanded, onToggle, onCommentAdded }) {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const totalCount = countAll(comments);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    if (expanded) autoResize();
  }, [newComment, expanded]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const updatedPost = await addComment(postId, newComment.trim());
      setNewComment('');
      if (updatedPost) onCommentAdded(updatedPost);
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!expanded) {
    return (
      <Wrapper>
        <ToggleButton onClick={onToggle}>
          <i className="fas fa-comment" style={{ marginRight: 6, fontSize: '0.7rem' }} />
          View all {totalCount} {totalCount === 1 ? 'comment' : 'comments'}
        </ToggleButton>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <span>
          <i className="fas fa-comments" style={{ marginRight: 6, fontSize: '0.75rem', color: 'var(--neon-green)' }} />
          Comments ({totalCount})
        </span>
        <CollapseButton onClick={onToggle}>
          <i className="fas fa-times" />
        </CollapseButton>
      </Header>

      {comments.length === 0 ? (
        <EmptyState>
          <i className="fas fa-comment-slash" style={{ marginRight: 6, opacity: 0.5 }} />
          No comments yet. Be the first to share your thoughts!
        </EmptyState>
      ) : (
        <CommentList>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              depth={0}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </CommentList>
      )}

      <CommentInputWrapper>
        <Input
          ref={textareaRef}
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={user ? 'Write a comment...' : 'Log in to comment'}
          rows={1}
          disabled={!user}
        />
        <SubmitButton
          onClick={handleSubmit}
          $disabled={!newComment.trim() || submitting || !user}
          disabled={!newComment.trim() || submitting || !user}
        >
          {submitting ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-paper-plane" />}
        </SubmitButton>
      </CommentInputWrapper>
    </Wrapper>
  );
}
