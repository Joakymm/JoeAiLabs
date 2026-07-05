import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/socialApi';
import { useSocial } from '../context/SocialContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const { setUnreadNotifications } = useSocial();

  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await notificationsAPI.getAll({ page, limit: 20 });
      if (page === 1) {
        setNotifications(res.data);
      } else {
        setNotifications(prev => [...prev, ...res.data]);
      }
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch {}
  }, [setUnreadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch {}
  }, [setUnreadNotifications]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.pages) {
      fetchNotifications(pagination.page + 1);
    }
  }, [pagination, fetchNotifications]);

  return {
    notifications, loading, pagination,
    markAsRead, markAllAsRead, loadMore, fetchNotifications,
  };
}
