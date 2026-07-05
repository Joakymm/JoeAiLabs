import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { socialUsersAPI } from '../../services/socialApi';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid rgba(0, 255, 163, 0.15);
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Title = styled.h3`
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  color: var(--text-main);
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  line-height: 1;
  &:hover { color: var(--text-main); }
`;

const List = styled.div`
  overflow-y: auto;
  padding: 8px;
  flex: 1;
`;

const UserRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #2a2a4a, #1a1a3e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  font-size: 0.85rem;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserBio = styled.div`
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim);
  font-size: 0.85rem;
`;

const Spinner = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
`;

export default function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = type === 'followers'
      ? socialUsersAPI.getFollowers(userId)
      : socialUsersAPI.getFollowing(userId);
    fetcher
      .then(({ data: res }) => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, type]);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{type === 'followers' ? 'Followers' : 'Following'}</Title>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </Header>
        {loading ? (
          <Spinner><i className="fas fa-spinner fa-spin" /></Spinner>
        ) : users.length === 0 ? (
          <Empty>No {type} yet</Empty>
        ) : (
          <List>
            {users.map(u => (
              <UserRow key={u._id} to={`/profile/${u._id}`} onClick={onClose}>
                <UserAvatar>
                  {u.avatar ? <img src={u.avatar} alt="" /> : <i className="fas fa-user" />}
                </UserAvatar>
                <UserInfo>
                  <UserName>{u.username || 'Unknown'}</UserName>
                  <UserBio>{u.bio || `@${u.username}`}</UserBio>
                </UserInfo>
              </UserRow>
            ))}
          </List>
        )}
      </Modal>
    </Overlay>
  );
}
