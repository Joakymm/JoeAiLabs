import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('joeailabs_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data: res }) => setUser(res?.data ?? res?.user ?? null))
      .catch(() => {
        localStorage.removeItem('joeailabs_token');
        localStorage.removeItem('joeailabs_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (emailOrObj, maybePassword) => {
    const body = typeof emailOrObj === 'string' ? { email: emailOrObj, password: maybePassword } : emailOrObj;
    const { data: res } = await api.post('/auth/login', body);
    const token = res?.data?.token ?? res?.token;
    const userData = res?.data?.user ?? res?.user ?? null;
    localStorage.setItem('joeailabs_token', token);
    if (userData) localStorage.setItem('joeailabs_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (a, b, c) => {
    const body = typeof a === 'string' ? { username: a, email: b, password: c } : a;
    const { data: res } = await api.post('/auth/register', body);
    const token = res?.data?.token ?? res?.token;
    const userData = res?.data?.user ?? res?.user ?? null;
    localStorage.setItem('joeailabs_token', token);
    if (userData) localStorage.setItem('joeailabs_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('joeailabs_token');
    localStorage.removeItem('joeailabs_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: res } = await api.get('/auth/me');
      const u = res?.data ?? res?.user ?? null;
      setUser(u);
      if (u) localStorage.setItem('joeailabs_user', JSON.stringify(u));
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, refreshUser,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
