import api from './api';

export const postsAPI = {
  create: (data) => api.post('/posts', data),
  createWithMedia: (formData) => api.post('/posts/with-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFeed: (params) => api.get('/posts/feed', { params }),
  getDiscover: (params) => api.get('/posts/discover', { params }),
  get: (id) => api.get(`/posts/${id}`),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  editComment: (postId, commentId, data) => api.put(`/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  toggleCommentLike: (postId, commentId) => api.post(`/posts/${postId}/comments/${commentId}/like`),
  createAchievement: (data) => api.post('/posts/achievement', data),
  report: (id) => api.post(`/posts/${id}/report`),
};

export const followAPI = {
  follow: (userId) => api.post(`/follow/${userId}`),
  unfollow: (userId) => api.delete(`/follow/${userId}`),
  acceptRequest: (requestId) => api.put(`/follow/requests/${requestId}/accept`),
  declineRequest: (requestId) => api.put(`/follow/requests/${requestId}/decline`),
  getPendingRequests: () => api.get('/follow/requests/pending'),
  getSuggestions: () => api.get('/follow/suggestions'),
  getStatus: (userId) => api.get(`/follow/${userId}/status`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  createOrGet: (participantId) => api.post('/conversations', { participantId }),
  getMessages: (convId, params) => api.get(`/conversations/${convId}/messages`, { params }),
  sendMessage: (convId, data) => api.post(`/conversations/${convId}/messages`, data),
  markRead: (messageId) => api.put(`/conversations/messages/${messageId}/read`),
  getUnreadTotal: () => api.get('/conversations/unread/total'),
};

export const socialUsersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  getUserPosts: (userId, params) => api.get(`/users/${userId}/posts`, { params }),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  search: (params) => api.get('/users/search', { params }),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadCover: (formData) => api.post('/users/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  addSkill: (skill) => api.post('/users/skills', { skill }),
  removeSkill: (skill) => api.delete(`/users/skills/${encodeURIComponent(skill)}`),
};
