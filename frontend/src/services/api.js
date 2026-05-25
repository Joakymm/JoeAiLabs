import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('joeailabs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('joeailabs_token');
      localStorage.removeItem('joeailabs_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
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

export const quizzesAPI = {
  getByModule: (moduleId) => api.get(`/quizzes/module/${moduleId}`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
};

export default api;
