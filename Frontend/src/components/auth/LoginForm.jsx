import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthUtils';
import { FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import { authService } from '../../services/api';
import '../../styles/auth.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  // Check for messages coming from other pages (e.g., after registration)
  const message = location.state?.message || '';

  // Form validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,    onSubmit: async (values) => {
      try {
        setLoading(true);
        setServerError('');
        
        console.log('Login submission - Mode:', isAdminLogin ? 'Admin Login' : 'Regular Login');
        console.log('Login values:', values);
        
        // If admin login, verify if email exists as admin first
        if (isAdminLogin) {
          setCheckingAdmin(true);
          try {
            console.log('Checking if email exists as admin:', values.email);
            const adminCheck = await authService.checkAdmin(values.email);
            console.log('Admin check response:', adminCheck.data);
            
            if (!adminCheck.data.adminExists) {
              console.log('Admin not found for email:', values.email);
              setServerError('No admin account found with this email.');
              setLoading(false);
              return;
            }
            console.log('Admin found, proceeding with login');
          } catch (error) {
            console.error('Error checking admin:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
            }
          } finally {
            setCheckingAdmin(false);
          }
        }
        
        // Add role field for admin logins
        const loginData = isAdminLogin 
          ? { ...values, role: 'admin' }
          : values;
        
        console.log('Attempting login with data:', loginData);
        const user = await login(loginData);
        console.log('Login successful, user:', user);
        
        // Redirect based on user role
        if (user.role === 'student') {
          console.log('Redirecting to student dashboard');
          navigate('/student/dashboard');
        } else if (user.role === 'donor') {
          console.log('Redirecting to donor dashboard');
          navigate('/donor/dashboard');
        } else if (user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('Redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
          setServerError(error.response.data?.message || 'Login failed. Please check your credentials.');
        } else if (error.request) {
          console.error('Request error:', error.request);
          setServerError('Network error. Please check your connection.');
        } else {
          console.error('Error message:', error.message);
          setServerError(error.message || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleAdminLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setServerError('');
  };

  // Clear server error when switching login modes or changing form values
  useEffect(() => {
    setServerError('');
  }, [isAdminLogin, formik.values.email, formik.values.password]);

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">
          {isAdminLogin ? 'Admin Login' : 'Login to Your Account'}
        </h2>
        
        {message && <div className="success-message">{message}</div>}
        {serverError && <div className="error-message">{serverError}</div>}
        
        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="error-text">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="error-text">{formik.errors.password}</div>
            )}
          </div>

          <div className="form-group text-right">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`btn btn-primary btn-block ${isAdminLogin ? 'admin-login-btn' : ''}`}
              disabled={loading || checkingAdmin}
            >
              {loading || checkingAdmin ? 'Logging in...' : (isAdminLogin ? 'Login as Admin' : 'Login')}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary btn-block admin-toggle-btn"
              onClick={toggleAdminLogin}
              disabled={loading || checkingAdmin}
            >
              {isAdminLogin ? (
                'Switch to Regular Login'
              ) : (
                <>
                  <FaUserShield style={{ marginRight: '8px' }} />
                  Admin Login
                </>
              )}
            </button>
          </div>
        </form>
        
        {!isAdminLogin && (
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        )}
        
        {isAdminLogin && (
          <div className="admin-notice">
            This login is for system administrators only. 
            If you need an admin account, please contact support.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;