import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('illuminati_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or server unavailable:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = (authToken, userData) => {
    localStorage.setItem('illuminati_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('illuminati_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.user) setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isLoading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

