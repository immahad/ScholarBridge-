import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import AuthContext from './AuthUtils';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const response = await authService.getCurrentUser();
          setUser(response.data.user);
          const storedUser = localStorage.getItem('user');
          if (storedUser && !response.data.user) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user data or validate token:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const { token: apiToken, user: apiUser } = response.data;
      
      localStorage.setItem('token', apiToken);
      localStorage.setItem('user', JSON.stringify(apiUser));
      
      setToken(apiToken);
      setUser(apiUser);
      return apiUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to login';
      setError(message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to register';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 