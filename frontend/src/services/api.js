import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('joeailabs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Auto-refresh on 401, then redirect on failure
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const token = localStorage.getItem('joeailabs_token');
      if (!token) throw new Error('No token');
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('joeailabs_token', data.token);
      processQueue(null, data.token);
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch {
      processQueue(err);
      localStorage.removeItem('joeailabs_token');
      localStorage.removeItem('joeailabs_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export const authAPI = {
  register: (data)    => api.post('/auth/register', data),
  login:    (data)    => api.post('/auth/login', data),
  me:       ()        => api.get('/auth/me'),
  update:   (data)    => api.put('/auth/profile', data),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export const modulesAPI = {
  list:   ()   => api.get('/modules'),
  get:    (id) => api.get(`/modules/${id}`),
};

export const lessonsAPI = {
  get:      (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
};

export const progressAPI = {
  get: () => api.get('/progress'),
};

export const promptsAPI = {
  list:        (params)    => api.get('/prompts', { params }),
  get:         (id)        => api.get(`/prompts/${id}`),
  copy:        (id)        => api.post(`/prompts/${id}/copy`),
  bookmark:    (id)        => api.post(`/prompts/${id}/bookmark`),
  getBookmarks:()          => api.get('/prompts/bookmarks/list'),
  getRelated:  (id)        => api.get(`/prompts/${id}/related`),
};

export const paymentsAPI = {
  createOrder: (planType) => api.post('/payments/binance/create-order', { planType }),
  getStatus:   (orderId)  => api.get(`/payments/status/${orderId}`),
  joinWaitlist:(email, source) => api.post('/payments/waitlist', { email, source }),
};

export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
};

export const usersAPI = {
  leaderboard: () => api.get('/users/leaderboard'),
};

export const quizzesAPI = {
  getByModule: (moduleId) => api.get(`/quizzes/module/${moduleId}`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
};

export default api;
