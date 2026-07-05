import { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

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

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-card);
  border-right: 1px solid rgba(0, 255, 163, 0.1);
`;

const Header = styled.div`
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(0, 255, 163, 0.08);
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 163, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  font-size: 0.82rem;
  outline: none;
  box-sizing: border-box;
  &::placeholder { color: var(--text-dim); }
  &:focus { border-color: var(--neon-green); }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${p => p.$active ? 'rgba(0, 255, 163, 0.06)' : 'transparent'};
  border-left: 3px solid ${p => p.$active ? 'var(--neon-green)' : 'transparent'};

  &:hover {
    background: ${p => p.$active ? 'rgba(0, 255, 163, 0.06)' : 'rgba(255, 255, 255, 0.02)'};
  }
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 255, 163, 0.15);
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 255, 163, 0.08);
  border: 2px solid rgba(0, 255, 163, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-green);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
`;

const OnlineDot = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-card);
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
`;

const Username = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.span`
  font-size: 0.68rem;
  color: var(--text-dim);
  flex-shrink: 0;
  margin-left: 8px;
`;

const Preview = styled.div`
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const UnreadBadge = styled.span`
  background: var(--neon-green);
  color: #000;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-dim);
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.4;
`;

const EmptyText = styled.p`
  font-size: 0.88rem;
  margin: 0;
  color: var(--text-muted);
`;

const EmptySub = styled.p`
  font-size: 0.78rem;
  margin: 4px 0 0;
  color: var(--text-dim);
`;

const SkeletonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
`;

const SkeletonAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonLines = styled.div`
  flex: 1;
`;

const SkeletonBar = styled.div`
  height: ${p => p.$h || 14}px;
  width: ${p => p.$w || '100%'};
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-bottom: ${p => p.$mb || 6}px;
`;

export default function ChatList({ conversations = [], activeId, onSelect, loading }) {
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocial();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => {
      const other = c.participants?.find(p => p._id !== currentUser?._id);
      return other?.username?.toLowerCase().includes(q);
    });
  }, [conversations, search, currentUser]);

  function getOtherParticipant(conversation) {
    return conversation.participants?.find(p => p._id !== currentUser?._id) || conversation.participants?.[0];
  }

  if (loading) {
    return (
      <Wrapper>
        <Header>
          <Title>Messages</Title>
          <SearchInput placeholder="Search conversations..." disabled />
        </Header>
        <List>
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonItem key={i}>
              <SkeletonAvatar />
              <SkeletonLines>
                <SkeletonBar $w="120px" $h={14} />
                <SkeletonBar $w="200px" $h={12} />
              </SkeletonLines>
            </SkeletonItem>
          ))}
        </List>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <Title>Messages</Title>
        <SearchInput
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Header>
      <List>
        {filtered.length === 0 ? (
          <EmptyState>
            <EmptyIcon><i className="fas fa-comment-dots" /></EmptyIcon>
            <EmptyText>No conversations yet</EmptyText>
            <EmptySub>Start chatting with someone from the community!</EmptySub>
          </EmptyState>
        ) : (
          filtered.map(conversation => {
            const other = getOtherParticipant(conversation);
            const lastMsg = conversation.lastMessage;
            const isActive = conversation._id === activeId;
            const online = other ? isUserOnline(other._id) : false;
            const unread = conversation.unreadCount || 0;

            return (
              <ConversationItem
                key={conversation._id}
                $active={isActive}
                onClick={() => onSelect(conversation)}
              >
                <AvatarWrap>
                  {other?.avatar ? (
                    <Avatar src={other.avatar} alt={other.username} />
                  ) : (
                    <AvatarPlaceholder>
                      {(other?.username || '?').charAt(0).toUpperCase()}
                    </AvatarPlaceholder>
                  )}
                  {online && <OnlineDot />}
                </AvatarWrap>
                <Info>
                  <TopRow>
                    <Username>{other?.username || 'Unknown'}</Username>
                    {lastMsg?.createdAt && (
                      <Timestamp>{formatTimeAgo(lastMsg.createdAt)}</Timestamp>
                    )}
                  </TopRow>
                  <PreviewRow>
                    <Preview>
                      {lastMsg?.text || (lastMsg?.image ? '📷 Image' : lastMsg?.file ? '📎 File' : 'No messages yet')}
                    </Preview>
                    {unread > 0 && <UnreadBadge>{unread > 99 ? '99+' : unread}</UnreadBadge>}
                  </PreviewRow>
                </Info>
              </ConversationItem>
            );
          })
        )}
      </List>
    </Wrapper>
  );
}
