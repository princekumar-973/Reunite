import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<User>('/v1/auth/me/');
      setUser(res.data);
    } catch (err) {
      console.warn('Failed to fetch authenticated user session:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post<{ access: string; refresh: string }>('/v1/auth/login/', {
      username,
      password,
    });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
    await fetchUser();
  };

  const register = async (data: any) => {
    const res = await api.post<{ tokens: { access: string; refresh: string }; user: User }>(
      '/v1/auth/register/',
      data
    );
    if (res.data?.tokens) {
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.tokens.access}`;
      setUser(res.data.user);
    }
  };

  const demoLogin = async () => {
    try {
      const res = await api.post<{ tokens: { access: string; refresh: string }; user: User }>(
        '/v1/auth/demo/'
      );
      if (res.data?.tokens) {
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        setUser(res.data.user);
      }
    } catch (err) {
      await login('demo_user', 'password123');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
