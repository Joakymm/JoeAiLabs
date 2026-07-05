import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
`;

const Wrapper = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 480px;
  background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06));
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text, #e0e0e0);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: var(--accent, #6c63ff);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const MarkAllBtn = styled.button`
  background: none;
  border: none;
  color: var(--accent, #6c63ff);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: rgba(108,99,255,0.1);
  }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const Empty = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted, #888);
  font-size: 0.85rem;
`;

const Footer = styled.div`
  border-top: 1px solid var(--border-color, rgba(255,255,255,0.06));
  padding: 10px 16px;
  text-align: center;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: var(--accent, #6c63ff);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px;
  width: 100%;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
`;

export default function NotificationsDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const recent = notifications.slice(0, 10);

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleMarkAll = () => {
    markAllAsRead();
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <Wrapper ref={wrapperRef}>
        <Header>
          <Title>
            Notifications
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </Title>
          {unreadCount > 0 && (
            <MarkAllBtn onClick={handleMarkAll}>Mark all as read</MarkAllBtn>
          )}
        </Header>

        <List>
          {loading && notifications.length === 0 ? (
            <Empty>Loading notifications...</Empty>
          ) : recent.length === 0 ? (
            <Empty>No notifications yet</Empty>
          ) : (
            recent.map(n => (
              <NotificationItem
                key={n._id}
                notification={n}
                onMarkRead={markAsRead}
              />
            ))
          )}
        </List>

        <Footer>
          <ViewAllLink onClick={handleViewAll}>
            View all notifications
          </ViewAllLink>
        </Footer>
      </Wrapper>
    </>
  );
}
