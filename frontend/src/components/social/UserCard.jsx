import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FollowButton from './FollowButton';

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(0,255,163,0.2);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 30px rgba(0,255,163,0.04);
    transform: translateY(-1px);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,255,163,0.15);
  flex-shrink: 0;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,255,163,0.08);
  border: 2px solid rgba(0,255,163,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-green);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Bio = styled.div`
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

const Meta = styled.div`
  display: flex;
  gap: 10px;
  font-size: 0.7rem;
  color: var(--text-dim);
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const Tags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  overflow: hidden;
`;

const Tag = styled.span`
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0,255,163,0.06);
  border: 1px solid rgba(0,255,163,0.12);
  color: var(--neon-green);
  white-space: nowrap;
`;

export default function UserCard({ user }) {
  const navigate = useNavigate();
  if (!user) return null;

  const {
    _id, id,
    username,
    avatar,
    bio,
    skills = [],
    followersCount = 0,
    postsCount = 0,
    isFollowing = false,
  } = user;

  const userId = _id || id;
  const displaySkills = skills.slice(0, 2);
  const avatarUrl = avatar || null;
  const initials = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <Card onClick={() => navigate(`/profile/${userId}`)}>
      {avatarUrl ? (
        <Avatar src={avatarUrl} alt={username} />
      ) : (
        <AvatarPlaceholder>{initials}</AvatarPlaceholder>
      )}
      <Info>
        <Username>{username}</Username>
        {bio && <Bio>{bio}</Bio>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Tags>
            {displaySkills.map((skill, i) => (
              <Tag key={i}>{skill}</Tag>
            ))}
          </Tags>
          <Meta>
            <MetaItem><i className="fas fa-users" />{followersCount}</MetaItem>
            <MetaItem><i className="fas fa-file-alt" />{postsCount}</MetaItem>
          </Meta>
        </div>
      </Info>
      <FollowButton
        userId={userId}
        isFollowing={isFollowing}
        size="sm"
      />
    </Card>
  );
}
