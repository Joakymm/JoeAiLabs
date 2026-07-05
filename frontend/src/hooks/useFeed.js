import { useState, useEffect, useCallback, useRef } from 'react';
import { postsAPI } from '../services/socialApi';

export function useFeed(type = 'feed') {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const cursorRef = useRef(null);
  const observerRef = useRef(null);
  const loadRef = useRef(null);

  const fetchPosts = useCallback(async (cursor = null) => {
    try {
      const params = { limit: 10 };
      if (cursor) params.cursor = cursor;

      const endpoint = type === 'discover' ? postsAPI.getDiscover : postsAPI.getFeed;
      const { data: res } = await endpoint(params);

      const newPosts = res.data || [];
      cursorRef.current = res.nextCursor;
      setHasMore(res.hasMore);

      return newPosts;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return [];
    }
  }, [type]);

  useEffect(() => {
    setLoading(true);
    fetchPosts().then(newPosts => {
      setPosts(newPosts);
      setLoading(false);
    });
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    const newPosts = await fetchPosts(cursorRef.current);
    setPosts(prev => [...prev, ...newPosts]);
    setLoadingMore(false);
  }, [fetchPosts, loadingMore, hasMore]);

  const lastPostRef = useCallback((node) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, loadMore]);

  const prependPost = useCallback((post) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const updatePost = useCallback((postId, updates) => {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...updates } : p));
  }, []);

  const removePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    const newPosts = await fetchPosts();
    setPosts(newPosts);
    setLoading(false);
  }, [fetchPosts]);

  return {
    posts, loading, loadingMore, hasMore, error,
    lastPostRef, loadMore, prependPost, updatePost, removePost, refresh,
  };
}
