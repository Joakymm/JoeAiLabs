import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useFollow } from '../../hooks/useFollow';
import { useSocial } from '../../context/SocialContext';
import { socialUsersAPI } from '../../services/socialApi';

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const CoverContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 6;
  min-height: 200px;
  max-height: 340px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: var(--bg-card, #1a1a2e);
`;

const CoverImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${p => p.$src});
  background-size: cover;
  background-position: center;
`;

const CoverGradient = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    transparent 30%,
    rgba(0, 0, 0, 0.5) 70%,
    rgba(0, 0, 0, 0.85) 100%
  );
`;

const DefaultCover = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
`;

const ProfileBody = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 0 24px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 16px;
  }
`;

const AvatarWrapper = styled.div`
  width: 160px;
  height: 160px;
  min-width: 160px;
  border-radius: 50%;
  border: 4px solid var(--bg-dark, #0d0d1a);
  overflow: hidden;
  margin-top: -80px;
  background: var(--bg-card, #1a1a2e);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 128px;
    height: 128px;
    min-width: 128px;
    margin-top: -64px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatarIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2a2a4a, #1a1a3e);
  font-size: 3.2rem;
  color: var(--text-dim, #555);

  @media (max-width: 768px) {
    font-size: 2.6rem;
  }
`;

const InfoSection = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 16px;

  @media (max-width: 768px) {
    padding-top: 4px;
    width: 100%;
  }
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Username = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  color: var(--text-main, #fff);
  margin: 0;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FullName = styled.span`
  font-size: 0.95rem;
  color: var(--text-muted, #999);
`;

const PrivateBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--neon-yellow, #ffd600);
  background: rgba(255, 214, 0, 0.1);
  border: 1px solid rgba(255, 214, 0, 0.25);
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Bio = styled.p`
  font-size: 0.88rem;
  color: var(--text-muted, #aaa);
  line-height: 1.65;
  margin: 8px 0 14px;
  max-width: 560px;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SkillBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: var(--neon-blue, #4fc3f7);
  background: rgba(79, 195, 247, 0.08);
  border: 1px solid rgba(79, 195, 247, 0.18);
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: rgba(79, 195, 247, 0.16);
    border-color: rgba(79, 195, 247, 0.35);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 22px;
  background: none;
  border: none;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  font-family: inherit;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$clickable ? 'rgba(255,255,255,0.04)' : 'none'};
  }

  @media (max-width: 768px) {
    padding: 8px 18px;
  }
`;

const StatNumber = styled.span`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main, #fff);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatLabel = styled.span`
  font-size: 0.7rem;
  color: var(--text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding-top: 4px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const btnBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
  text-decoration: none;
  line-height: 1.2;

  &:active { transform: scale(0.97); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FollowButton = styled.button`
  ${btnBase}
  background: linear-gradient(135deg, var(--neon-green, #00ffa3), #00cc82);
  color: #000;

  &:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(0, 255, 163, 0.3);
  }
`;

const FollowingButton = styled.button`
  ${btnBase}
  background: transparent;
  color: var(--neon-green, #00ffa3);
  border: 1.5px solid var(--neon-green, #00ffa3);

  &:hover:not(:disabled) {
    background: rgba(0, 255, 163, 0.08);
  }
`;

const RequestedButton = styled.button`
  ${btnBase}
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted, #999);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  cursor: default;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const MessageBtn = styled.button`
  ${btnBase}
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main, #fff);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
  }
`;

const EditProfileBtn = styled.button`
  ${btnBase}
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main, #fff);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
  }
`;

/* ── Skeleton ── */
const SkeletonCover = styled.div`
  width: 100%;
  aspect-ratio: 16 / 6;
  min-height: 200px;
  max-height: 340px;
  border-radius: 16px;
  background: linear-gradient(90deg, var(--bg-card, #1a1a2e) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card, #1a1a2e) 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const SkeletonBody = styled.div`
  display: flex;
  gap: 24px;
  padding: 0 24px;
  margin-top: -48px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 0 16px;
  }
`;

const SkeletonAvatar = styled.div`
  width: 160px;
  height: 160px;
  min-width: 160px;
  border-radius: 50%;
  border: 4px solid var(--bg-dark, #0d0d1a);
  background: linear-gradient(90deg, var(--bg-card, #1a1a2e) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card, #1a1a2e) 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;

  @media (max-width: 768px) {
    width: 128px;
    height: 128px;
    min-width: 128px;
  }
`;

const SkeletonInfo = styled.div`
  flex: 1;
  padding-top: 32px;

  @media (max-width: 768px) {
    width: 100%;
    padding-top: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const SkeletonLine = styled.div`
  height: ${p => p.$h || '14px'};
  width: ${p => p.$w || '200px'};
  border-radius: 8px;
  margin-bottom: ${p => p.$mb || '12px'};
  background: linear-gradient(90deg, var(--bg-card, #1a1a2e) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card, #1a1a2e) 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const SkeletonActions = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 32px;

  @media (max-width: 768px) {
    padding-top: 8px;
    width: 100%;
    justify-content: center;
  }
`;

const SkeletonButton = styled.div`
  width: 110px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--bg-card, #1a1a2e) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card, #1a1a2e) 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

/* ── Component ── */
export default function ProfileHeader({ profile, onUpdate, onFollowersClick, onFollowingClick }) {
  const { user } = useAuth();
  const { follow, unfollow, loading } = useFollow();
  const { isUserOnline } = useSocial();

  const isOwnProfile = user?._id === profile?._id;
  const isPrivate = profile?.isPrivate;
  const isFollowing = profile?.isFollowing;
  const hasPendingRequest = profile?.followStatus === 'pending' || profile?.followRequested;
  const hasRequestedYou = profile?.followStatus === 'requested';

  const [optimisticFollowing, setOptimisticFollowing] = useState(isFollowing);
  const [optimisticPending, setOptimisticPending] = useState(hasPendingRequest);

  useEffect(() => {
    setOptimisticFollowing(isFollowing);
    setOptimisticPending(hasPendingRequest);
  }, [isFollowing, hasPendingRequest]);

  const followUserId = profile?._id;
  const isLoading = loading[followUserId];

  const handleFollow = useCallback(async () => {
    if (!followUserId || isLoading) return;

    const wasFollowing = optimisticFollowing;
    const wasPending = optimisticPending;

    if (wasFollowing) {
      setOptimisticFollowing(false);
      setOptimisticPending(false);
      try {
        await unfollow(followUserId);
        onUpdate?.();
      } catch {
        setOptimisticFollowing(true);
      }
    } else if (wasPending) {
      return;
    } else {
      if (isPrivate) {
        setOptimisticPending(true);
      } else {
        setOptimisticFollowing(true);
      }
      try {
        const res = await follow(followUserId);
        const status = res?.data?.status || res?.status;
        if (status === 'pending') {
          setOptimisticPending(true);
          setOptimisticFollowing(false);
        } else {
          setOptimisticFollowing(true);
          setOptimisticPending(false);
        }
        onUpdate?.();
      } catch {
        setOptimisticFollowing(wasFollowing);
        setOptimisticPending(wasPending);
      }
    }
  }, [followUserId, isLoading, optimisticFollowing, optimisticPending, follow, unfollow, isPrivate, onUpdate]);

  const handleMessage = useCallback(() => {
    // Router navigation or modal trigger handled by parent
  }, []);

  const handleEditProfile = useCallback(() => {
    // Router navigation handled by parent
  }, []);

  const handleSkillClick = useCallback((skill) => {
    // Could trigger skill search or filtering
  }, []);

  if (!profile) {
    return (
      <Wrapper>
        <SkeletonCover />
        <SkeletonBody>
          <SkeletonAvatar />
          <SkeletonInfo>
            <SkeletonLine $w="180px" $h="20px" $mb="12px" />
            <SkeletonLine $w="320px" $h="12px" $mb="8px" />
            <SkeletonLine $w="280px" $h="12px" $mb="8px" />
            <SkeletonLine $w="140px" $h="12px" $mb="0" />
          </SkeletonInfo>
          <SkeletonActions>
            <SkeletonButton />
            <SkeletonButton />
          </SkeletonActions>
        </SkeletonBody>
      </Wrapper>
    );
  }

  const avatarSrc = profile.avatar;
  const coverSrc = profile.coverPhoto;
  const username = profile.username;
  const fullName = profile.fullName || profile.name || '';
  const bio = profile.bio || '';
  const skills = profile.skills || [];
  const postsCount = profile.stats?.postsCount ?? 0;
  const followersCount = profile.followers?.length ?? 0;
  const followingCount = profile.following?.length ?? 0;

  const showFollow =
    !isOwnProfile && (profile.followStatus !== undefined || profile.isFollowing !== undefined);
  const isPendingOrRequested = optimisticPending || hasRequestedYou;

  const renderFollowButton = () => {
    if (isPendingOrRequested) {
      return <RequestedButton disabled><i className="fas fa-clock" /> Requested</RequestedButton>;
    }
    if (optimisticFollowing) {
      return (
        <FollowingButton onClick={handleFollow} disabled={isLoading}>
          <i className="fas fa-check" /> Following
        </FollowingButton>
      );
    }
    return (
      <FollowButton onClick={handleFollow} disabled={isLoading}>
        <i className="fas fa-plus" /> Follow
      </FollowButton>
    );
  };

  return (
    <Wrapper>
      <CoverContainer>
        {coverSrc ? (
          <CoverImage $src={coverSrc} />
        ) : (
          <DefaultCover />
        )}
        <CoverGradient />
      </CoverContainer>

      <ProfileBody>
        <AvatarWrapper>
          {avatarSrc ? (
            <AvatarImg src={avatarSrc} alt={username} />
          ) : (
            <DefaultAvatarIcon>
              <i className="fas fa-user" />
            </DefaultAvatarIcon>
          )}
        </AvatarWrapper>

        <InfoSection>
          <NameRow>
            <Username>{username}</Username>
            {fullName && <FullName>{fullName}</FullName>}
            {isPrivate && (
              <PrivateBadge>
                <i className="fas fa-lock" /> Private
              </PrivateBadge>
            )}
          </NameRow>

          {bio && <Bio>{bio}</Bio>}

          {skills.length > 0 && (
            <SkillsContainer>
              {skills.map(skill => (
                <SkillBadge key={skill} onClick={() => handleSkillClick(skill)}>
                  {skill}
                </SkillBadge>
              ))}
            </SkillsContainer>
          )}

          <StatsContainer>
            <StatItem $clickable={false}>
              <StatNumber>{postsCount}</StatNumber>
              <StatLabel>Posts</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem
              $clickable={typeof onFollowersClick === 'function'}
              onClick={onFollowersClick}
            >
              <StatNumber>{followersCount}</StatNumber>
              <StatLabel>Followers</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem
              $clickable={typeof onFollowingClick === 'function'}
              onClick={onFollowingClick}
            >
              <StatNumber>{followingCount}</StatNumber>
              <StatLabel>Following</StatLabel>
            </StatItem>
          </StatsContainer>
        </InfoSection>

        <ActionsContainer>
          {showFollow && renderFollowButton()}
          {(optimisticFollowing || isOwnProfile) && (
            <MessageBtn onClick={handleMessage}>
              <i className="fas fa-envelope" /> Message
            </MessageBtn>
          )}
          {isOwnProfile && (
            <EditProfileBtn onClick={handleEditProfile}>
              <i className="fas fa-pen" /> Edit Profile
            </EditProfileBtn>
          )}
        </ActionsContainer>
      </ProfileBody>
    </Wrapper>
  );
}
