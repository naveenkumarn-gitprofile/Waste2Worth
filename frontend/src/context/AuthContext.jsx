import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const trialMode = localStorage.getItem('trialMode');
    
    if (trialMode === 'true') {
      setIsTrial(true);
      setLoading(false);
      return;
    }
    
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    setIsTrial(false);
    localStorage.removeItem('trialMode');
    return response.data;
  };

  const register = async (email, password, name) => {
    try {
      console.log('Attempting registration with:', { email, name });
      const response = await authAPI.register({ email, password, name });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsTrial(false);
    localStorage.removeItem('trialMode');
  };

  const startTrial = () => {
    setIsTrial(true);
    localStorage.setItem('trialMode', 'true');
  };

  const value = {
    user,
    loading,
    isTrial,
    login,
    register,
    logout,
    startTrial,
    isAuthenticated: !!user || isTrial,
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
