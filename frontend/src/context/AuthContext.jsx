import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('joeailabs_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.me();
        setUser(data.user);
        localStorage.setItem('joeailabs_user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('joeailabs_token');
        localStorage.removeItem('joeailabs_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('joeailabs_token', data.token);
    localStorage.setItem('joeailabs_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('joeailabs_token', data.token);
    localStorage.setItem('joeailabs_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('joeailabs_token');
    localStorage.removeItem('joeailabs_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      localStorage.setItem('joeailabs_user', JSON.stringify(data.user));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
