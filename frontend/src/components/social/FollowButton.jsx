import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useFollow } from '../../hooks/useFollow';
import { useAuth } from '../../context/AuthContext';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${p => p.$size === 'sm' ? '5px 12px' : '8px 20px'};
  font-size: ${p => p.$size === 'sm' ? '0.75rem' : '0.85rem'};
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  transform: scale(${p => p.$animate ? 0.95 : 1});
  opacity: ${p => p.$disabled ? 0.6 : 1};

  background: ${p => p.$following
    ? 'transparent'
    : 'linear-gradient(135deg, var(--neon-green), #00cc82)'};
  border-color: ${p => p.$following ? 'var(--neon-green)' : 'transparent'};
  color: ${p => p.$following ? 'var(--neon-green)' : '#020508'};

  &:hover:not(:disabled) {
    background: ${p => p.$following
      ? 'rgba(0,255,163,0.08)'
      : 'linear-gradient(135deg, #00cc82, var(--neon-green))'};
    box-shadow: ${p => p.$following
      ? 'none'
      : '0 0 20px rgba(0,255,163,0.3)'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid ${p => p.$following ? 'rgba(0,255,163,0.3)' : 'rgba(2,5,8,0.3)'};
  border-top-color: ${p => p.$following ? 'var(--neon-green)' : '#020508'};
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  display: inline-block;
`;

const CheckIcon = styled.span`
  font-size: ${p => p.$size === 'sm' ? '0.65rem' : '0.75rem'};
  display: inline-flex;
  align-items: center;
`;

export default function FollowButton({ userId, isFollowing, size = 'md', onToggle }) {
  const { user } = useAuth();
  const { follow, unfollow, loading } = useFollow();
  const [animate, setAnimate] = useState(false);
  const isLoading = loading[userId];
  const isSelf = user?._id === userId || user?.id === userId;

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setAnimate(false), 200);
      return () => clearTimeout(t);
    }
  }, [animate]);

  const handleClick = async () => {
    if (isLoading || isSelf) return;
    setAnimate(true);
    try {
      if (isFollowing) {
        await unfollow(userId);
      } else {
        await follow(userId);
      }
      onToggle?.(!isFollowing);
    } catch {
      setAnimate(false);
    }
  };

  if (isSelf) return null;

  const label = isLoading
    ? '...'
    : isFollowing
      ? 'Following'
      : 'Follow';

  return (
    <StyledButton
      $size={size}
      $following={isFollowing}
      $animate={animate}
      $disabled={isLoading}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <Spinner $following={isFollowing} />
      ) : isFollowing ? (
        <CheckIcon $size={size}><i className="fas fa-check" /></CheckIcon>
      ) : null}
      {label}
    </StyledButton>
  );
}
