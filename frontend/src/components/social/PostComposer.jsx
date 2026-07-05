import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';

const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEOS = ['video/mp4', 'video/quicktime'];
const ACCEPTED_ALL = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS];
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024;
const MAX_CHARS = 5000;

const Wrapper = styled.div`
  background: ${({ theme }) => theme?.cardBackground || '#1a1a2e'};
  border: 1px solid ${({ theme }) => theme?.borderColor || '#2a2a4a'};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
`;

const Collapsed = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
  font: inherit;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #333;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #00D4FF, #7b2ff7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
`;

const Placeholder = styled.span`
  color: ${({ theme }) => theme?.textSecondary || '#888'};
  font-size: 14px;
`;

const Expanded = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const TextArea = styled.textarea`
  flex: 1;
  background: ${({ theme }) => theme?.inputBackground || '#16162a'};
  border: 1px solid ${({ theme }) => theme?.borderColor || '#2a2a4a'};
  border-radius: 8px;
  color: ${({ theme }) => theme?.text || '#eee'};
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 12px;
  resize: none;
  min-height: 80px;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #00D4FF;
  }

  &::placeholder {
    color: #666;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const MediaButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid transparent;
  color: ${({ $active, theme }) => ($active ? '#00D4FF' : theme?.textSecondary || '#888')};
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 212, 255, 0.08);
    color: #00D4FF;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CharCounter = styled.span`
  font-size: 12px;
  color: ${({ $over }) => ($over ? '#ff4444' : '#888')};
  font-weight: ${({ $over }) => ($over ? '600' : '400')};
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostButton = styled.button`
  background: ${({ $disabled }) => ($disabled ? '#444' : 'linear-gradient(135deg, #00D4FF, #7b2ff7)')};
  color: ${({ $disabled }) => ($disabled ? '#888' : '#fff')};
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  font-family: inherit;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const MediaPreviewContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  margin-top: 4px;
`;

const MediaPreviewImage = styled.img`
  max-height: 200px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const MediaPreviewVideo = styled.video`
  max-height: 200px;
  width: 100%;
  border-radius: 8px;
`;

const RemoveMediaButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

const DragOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 212, 255, 0.1);
  border: 2px dashed #00D4FF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00D4FF;
  font-weight: 600;
  font-size: 16px;
  pointer-events: none;
  z-index: 5;
`;

const FileInput = styled.input`
  display: none;
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 13px;
`;

export default function PostComposer({ onPostCreated }) {
  const { user } = useAuth();
  const { createPost, creating } = usePosts();

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    setError('');

    if (!file) return;

    const isImage = ACCEPTED_IMAGES.includes(file.type);
    const isVideo = ACCEPTED_VIDEOS.includes(file.type);

    if (!isImage && !isVideo) {
      setError('Unsupported file type. Please upload an image (jpg, png, gif, webp) or video (mp4, mov).');
      return;
    }

    if (isImage && file.size > IMAGE_SIZE_LIMIT) {
      setError('Image must be under 5MB.');
      return;
    }

    if (isVideo && file.size > VIDEO_SIZE_LIMIT) {
      setError('Video must be under 50MB.');
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  }, []);

  const handleInputChange = useCallback((e) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
      e.target.value = '';
    }
  }, [handleFileSelect]);

  const removeMedia = useCallback(() => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  }, [mediaPreview]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handlePost = useCallback(async () => {
    if ((!content.trim() && !mediaFile) || creating) return;

    setError('');
    try {
      const newPost = await createPost({ content: content.trim() }, mediaFile);
      setContent('');
      removeMedia();
      setExpanded(false);
      onPostCreated?.(newPost);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create post');
    }
  }, [content, mediaFile, creating, createPost, removeMedia, onPostCreated]);

  const handleCancel = useCallback(() => {
    if (content.trim() || mediaFile) {
      if (!window.confirm('Discard your post?')) return;
    }
    setContent('');
    removeMedia();
    setExpanded(false);
    setError('');
  }, [content, mediaFile, removeMedia]);

  const charsRemaining = MAX_CHARS - content.length;
  const canPost = (content.trim().length > 0 || mediaFile !== null) && !creating && charsRemaining >= 0;

  const avatarUrl = user?.avatar || user?.profilePicture || user?.profile_image || null;
  const displayName = user?.displayName || user?.username || user?.email || 'U';
  const initial = displayName.charAt(0).toUpperCase();

  if (!expanded) {
    return (
      <Wrapper ref={dropRef}>
        <Collapsed onClick={() => setExpanded(true)}>
          {avatarUrl ? (
            <Avatar src={avatarUrl} alt={displayName} />
          ) : (
            <AvatarPlaceholder>{initial}</AvatarPlaceholder>
          )}
          <Placeholder>What's on your mind?</Placeholder>
        </Collapsed>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ position: 'relative' }}
    >
      {isDragging && <DragOverlay>Drop file here</DragOverlay>}

      <Expanded>
        <TopRow>
          {avatarUrl ? (
            <Avatar src={avatarUrl} alt={displayName} />
          ) : (
            <AvatarPlaceholder>{initial}</AvatarPlaceholder>
          )}
          <TextArea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setContent(e.target.value);
              }
            }}
            autoFocus
          />
        </TopRow>

        {mediaPreview && (
          <MediaPreviewContainer>
            {mediaType === 'video' ? (
              <MediaPreviewVideo src={mediaPreview} controls />
            ) : (
              <MediaPreviewImage src={mediaPreview} alt="Preview" />
            )}
            <RemoveMediaButton onClick={removeMedia} title="Remove media">&times;</RemoveMediaButton>
          </MediaPreviewContainer>
        )}

        {error && <ErrorText>{error}</ErrorText>}

        <ActionBar>
          <MediaButtons>
            <IconButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              Photo
            </IconButton>
            <IconButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add video"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Video
            </IconButton>
            <IconButton type="button" disabled title="Emoji picker (coming soon)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </IconButton>
          </MediaButtons>

          <RightActions>
            <CharCounter $over={charsRemaining < 0 || charsRemaining <= 50}>
              {charsRemaining}
            </CharCounter>
            <IconButton type="button" onClick={handleCancel}>
              Cancel
            </IconButton>
            <PostButton
              $disabled={!canPost}
              disabled={!canPost}
              onClick={handlePost}
            >
              {creating ? 'Posting...' : 'Post'}
            </PostButton>
          </RightActions>
        </ActionBar>
      </Expanded>

      <FileInput
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ALL.join(',')}
        onChange={handleInputChange}
      />
    </Wrapper>
  );
}
