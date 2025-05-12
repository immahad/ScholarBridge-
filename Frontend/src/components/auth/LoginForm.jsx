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
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setServerError('');
        
        console.log('Login submission - Mode:', isAdminLogin ? 'Admin Login' : 'Regular Login');
        
        // Add role field for admin logins
        const loginData = isAdminLogin 
          ? { ...values, role: 'admin' }
          : values;
        
        const result = await login(loginData);
        
        if (!result.success) {
          setServerError(result.message);
        }
        // Navigation is handled inside the login function
      } catch (error) {
        console.error('Login error:', error);
        setServerError('An unexpected error occurred. Please try again.');
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