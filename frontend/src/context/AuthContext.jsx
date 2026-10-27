import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import { setOnUnauthorized } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request warning:', err.message);
    } finally {
      setUser(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    setOnUnauthorized(() => {
      setUser(null);
    });
  }, [fetchUser]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser: fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
