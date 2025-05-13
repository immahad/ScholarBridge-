import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the context
export const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/validate-token', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setUser(response.data.user);
            setRole(response.data.user.role);
            localStorage.setItem('role', response.data.user.role);
          } else {
            // If token is invalid, logout
            logout();
          }
        } catch (error) {
          console.error('Error validating token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      // Determine if it's an admin login
      const isAdminLogin = credentials.role === 'admin';
      const endpoint = isAdminLogin ? '/api/auth/admin-login' : '/api/auth/login';
      
      console.log(`Attempting ${isAdminLogin ? 'admin' : 'regular'} login`);
      
      const response = await axios.post(endpoint, credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Save to localStorage and state
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        
        setToken(token);
        setUser(user);
        setRole(user.role);
        
        // Redirect based on role
        if (user.role === 'student') {
          navigate('/student/dashboard');
        } else if (user.role === 'donor') {
          navigate('/donor/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        }
        
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
    navigate('/login');
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during registration' 
      };
    }
  };

  // Value to be provided
  const contextValue = {
    user,
    token,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};