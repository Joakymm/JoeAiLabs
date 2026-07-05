import { useState, useCallback } from 'react';
import { postsAPI } from '../services/socialApi';
import toast from 'react-hot-toast';

export function usePosts() {
  const [creating, setCreating] = useState(false);

  const createPost = useCallback(async (data, file = null) => {
    setCreating(true);
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('media', file);
        if (data.content) fd.append('content', data.content);
        if (data.type) fd.append('type', data.type);
        res = await postsAPI.createWithMedia(fd);
      } else {
        res = await postsAPI.create({ ...data, type: 'text' });
      }
      toast.success('Post created!');
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      await postsAPI.delete(postId);
      toast.success('Post deleted');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
      return false;
    }
  }, []);

  const toggleLike = useCallback(async (postId) => {
    try {
      const { data: res } = await postsAPI.toggleLike(postId);
      return res.data;
    } catch (err) {
      toast.error('Failed to like post');
      throw err;
    }
  }, []);

  const addComment = useCallback(async (postId, text, parentComment = null) => {
    try {
      const { data: res } = await postsAPI.addComment(postId, { text, parentComment });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      await postsAPI.deleteComment(postId, commentId);
      return true;
    } catch (err) {
      toast.error('Failed to delete comment');
      return false;
    }
  }, []);

  return { createPost, deletePost, toggleLike, addComment, deleteComment, creating };
}
