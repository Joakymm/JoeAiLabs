import { useState, useCallback } from 'react';
import { followAPI } from '../services/socialApi';
import toast from 'react-hot-toast';

export function useFollow() {
  const [loading, setLoading] = useState({});

  const follow = useCallback(async (userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const { data: res } = await followAPI.follow(userId);
      toast.success(res.message || 'Followed!');
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to follow');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, []);

  const unfollow = useCallback(async (userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await followAPI.unfollow(userId);
      toast.success('Unfollowed');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unfollow');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, []);

  const acceptRequest = useCallback(async (requestId) => {
    try {
      await followAPI.acceptRequest(requestId);
      toast.success('Request accepted');
      return true;
    } catch (err) {
      toast.error('Failed to accept request');
      return false;
    }
  }, []);

  const declineRequest = useCallback(async (requestId) => {
    try {
      await followAPI.declineRequest(requestId);
      return true;
    } catch (err) {
      toast.error('Failed to decline request');
      return false;
    }
  }, []);

  return { follow, unfollow, acceptRequest, declineRequest, loading };
}
