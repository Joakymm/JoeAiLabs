import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, getSocket, disconnectSocket } from '../services/socketService';
import { notificationsAPI, conversationsAPI } from '../services/socialApi';

const SocialContext = createContext(null);

export function SocialProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingFollowRequests, setPendingFollowRequests] = useState(0);

  // Connect socket when user logs in
  useEffect(() => {
    if (!isLoggedIn || !user) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const token = localStorage.getItem('joeailabs_token');
    const s = connectSocket(token);
    setSocket(s);

    return () => {
      disconnectSocket();
    };
  }, [isLoggedIn, user?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handlePresence = ({ userId, online }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };

    const handleNewMessage = () => {
      setUnreadMessages(prev => prev + 1);
    };

    socket.on('presence-update', handlePresence);
    socket.on('send-message', handleNewMessage);

    return () => {
      socket.off('presence-update', handlePresence);
      socket.off('send-message', handleNewMessage);
    };
  }, [socket]);

  // Fetch unread counts
  const refreshUnreadCounts = useCallback(async () => {
    try {
      const [notifRes, msgRes] = await Promise.allSettled([
        notificationsAPI.getUnreadCount(),
        conversationsAPI.getUnreadTotal(),
      ]);
      if (notifRes.value?.data?.data) setUnreadNotifications(notifRes.value.data.data.count);
      if (msgRes.value?.data?.data) setUnreadMessages(msgRes.value.data.data.count);
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshUnreadCounts();
      const interval = setInterval(refreshUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, refreshUnreadCounts]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return (
    <SocialContext.Provider value={{
      socket,
      onlineUsers,
      isUserOnline,
      unreadNotifications,
      setUnreadNotifications,
      unreadMessages,
      setUnreadMessages,
      pendingFollowRequests,
      setPendingFollowRequests,
      refreshUnreadCounts,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => useContext(SocialContext);
