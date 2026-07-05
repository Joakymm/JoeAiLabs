import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const TYPE_CONFIG = {
  like: { icon: 'fa-heart', color: '#e74c3c' },
  comment: { icon: 'fa-comment', color: '#3498db' },
  follow_request: { icon: 'fa-user-plus', color: '#f39c12' },
  follow_accepted: { icon: 'fa-user-check', color: '#2ecc71' },
  message: { icon: 'fa-envelope', color: '#9b59b6' },
  achievement: { icon: 'fa-trophy', color: '#f1c40f' },
};

const RELATIVE_UNITS = [
  { label: 'y', seconds: 31536000 },
  { label: 'mo', seconds: 2592000 },
  { label: 'w', seconds: 604800 },
  { label: 'd', seconds: 86400 },
  { label: 'h', seconds: 3600 },
  { label: 'm', seconds: 60 },
];

function getRelativeTime(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 10) return 'just now';
  for (const { label, seconds } of RELATIVE_UNITS) {
    const value = Math.floor(diff / seconds);
    if (value >= 1) return `${value}${label} ago`;
  }
  return `${diff}s ago`;
}

function getNavPath(type, notification) {
  if (type === 'like' || type === 'comment') return `/feed?post=${notification.referenceId}`;
  if (type === 'follow_request' || type === 'follow_accepted') return `/profile/${notification.sender?._id}`;
  if (type === 'message') return '/messages';
  if (type === 'achievement') return '/feed';
  return '#';
}

function getText(type, notification) {
  const meta = notification.metadata || {};
  switch (type) {
    case 'like':
      return `liked your post${meta.postPreview ? `: "${meta.postPreview}"` : ''}`;
    case 'comment':
      return `commented on your post${meta.commentPreview ? `: "${meta.commentPreview}"` : ''}`;
    case 'follow_request':
      return `wants to follow you`;
    case 'follow_accepted':
      return `accepted your follow request`;
    case 'message':
      return `sent you a message`;
    case 'achievement':
      return `Congrats! You earned a new achievement${meta.courseName ? `: ${meta.courseName}` : ''}`;
    default:
      return `interacted with you`;
  }
}

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${({ $read }) => $read ? 'transparent' : 'var(--bg-card-hover, rgba(255,255,255,0.03))'};
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06));

  &:hover {
    background: var(--bg-card-hover, rgba(255,255,255,0.06));
  }
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card, #1a1a2e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #888);
  font-size: 0.85rem;
`;

const IconBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: #fff;
  border: 2px solid var(--bg-card, #0f0f1a);
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Text = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text, #e0e0e0);
  line-height: 1.4;
  word-break: break-word;
`;

const Name = styled.strong`
  color: var(--text-primary, #fff);
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted, #888);
  margin-top: 2px;
  display: block;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, #6c63ff);
  flex-shrink: 0;
  margin-top: 4px;
`;

export default function NotificationItem({ notification, onMarkRead }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const type = notification.type ?? 'like';
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.like;
  const sender = notification.sender;
  const isUnread = !notification.read;
  const senderAvatar = sender?.avatar;

  const handleClick = () => {
    if (isUnread && onMarkRead) onMarkRead(notification._id);
    navigate(getNavPath(type, notification));
  };

  return (
    <Item $read={!isUnread} onClick={handleClick}>
      <AvatarWrap>
        {senderAvatar ? (
          <AvatarImg src={senderAvatar} alt="" />
        ) : (
          <AvatarPlaceholder>
            <i className="fas fa-user" />
          </AvatarPlaceholder>
        )}
        <IconBadge $color={config.color}>
          <i className={`fas ${config.icon}`} />
        </IconBadge>
      </AvatarWrap>
      <Content>
        <Text>
          <Name>{sender?.name ?? sender?.username ?? 'Someone'}</Name>{' '}
          {getText(type, notification)}
        </Text>
        <Timestamp>{getRelativeTime(notification.createdAt)}</Timestamp>
      </Content>
      {isUnread && <UnreadDot />}
    </Item>
  );
}
