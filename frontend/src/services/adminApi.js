import api from './api';

export const adminAPI = {
  // Modules
  getModules:   ()              => api.get('/admin/modules'),
  createModule: (data)          => api.post('/admin/modules', data),
  updateModule: (id, data)      => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id)            => api.delete(`/admin/modules/${id}`),
  reorderModule:(id, order)     => api.patch(`/admin/modules/${id}/reorder`, { order }),

  // Lessons
  getLessons:     (moduleId)    => api.get(`/admin/modules/${moduleId}/lessons`),
  createLesson:   (data)        => api.post('/admin/lessons', data),
  updateLesson:   (id, data)    => api.put(`/admin/lessons/${id}`, data),
  deleteLesson:   (id)          => api.delete(`/admin/lessons/${id}`),

  // Prompts
  getPrompts:       (params)    => api.get('/admin/prompts', { params }),
  createPrompt:     (data)      => api.post('/admin/prompts', data),
  bulkImportPrompts:(prompts)   => api.post('/admin/prompts/bulk-import', { prompts }),
  updatePrompt:     (id, data)  => api.put(`/admin/prompts/${id}`, data),
  deletePrompt:     (id)        => api.delete(`/admin/prompts/${id}`),

  // Users
  getUsers:       (params)      => api.get('/admin/users', { params }),
  togglePremium:  (id, val)     => api.put(`/admin/users/${id}/premium`, { isPremium: val }),
  updateRole:     (id, role)    => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser:     (id)          => api.delete(`/admin/users/${id}`),

  // Analytics
  getAnalytics:   ()            => api.get('/admin/analytics'),

  // Payments
  getPayments:    (params)      => api.get('/admin/payments', { params }),

  // Quizzes
  getQuizzes:     ()            => api.get('/admin/quizzes'),
  createQuiz:     (data)        => api.post('/admin/quizzes', data),
  updateQuiz:     (id, data)    => api.put(`/admin/quizzes/${id}`, data),
  deleteQuiz:     (id)          => api.delete(`/admin/quizzes/${id}`),
  getQuizResults: (quizId)      => api.get(`/admin/quiz-results/${quizId}`),

  // Settings
  getSettings:    ()            => api.get('/admin/settings'),
  updateSetting:  (key, value)  => api.put(`/admin/settings/${key}`, { value }),
};
