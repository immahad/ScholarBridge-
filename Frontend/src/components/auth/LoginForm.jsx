import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthUtils';
import { FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import '../../styles/auth.css';

const LoginForm = () => {
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAdmin] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Check for verification success message from URL params
  const queryParams = new URLSearchParams(location.search);
  const verificationSuccess = queryParams.get('verified') === 'true';

  // Form validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required'),
    role: Yup.string()
      .oneOf(['student', 'donor', 'admin'], 'Invalid role')
      .required('Please select a role')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      role: 'student' // Default role selection
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setServerError('');
        setShowVerificationMsg(false);
        setUserEmail(values.email);
        
        console.log('Login submission - Role:', values.role);
        
        // Make sure role is explicitly set in the login data
        const loginData = isAdminLogin 
          ? { email: values.email, password: values.password } 
          : { email: values.email, password: values.password };
        
        // Use the role as a URL parameter to work around body parsing issues
        const selectedRole = isAdminLogin ? 'admin' : values.role;
        console.log(`Sending login data with role=${selectedRole}:`, loginData);
        
        const result = await login(loginData, selectedRole);
        
        if (!result.success) {
          setServerError(result.message);
          
          // Check if this is a verification issue
          if (result.message && result.message.toLowerCase().includes('verify')) {
            setShowVerificationMsg(true);
          }
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
    setShowVerificationMsg(false);
    // Reset role selection when toggling admin login
    formik.setFieldValue('role', isAdminLogin ? 'student' : 'admin');
  };

  // Clear server error when switching login modes or changing form values
  useEffect(() => {
    setServerError('');
    setShowVerificationMsg(false);
  }, [isAdminLogin, formik.values.email, formik.values.password, formik.values.role]);

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">
          {isAdminLogin ? 'Admin Login' : 'Login to Your Account'}
        </h2>
        
        {verificationSuccess && (
          <div className="success-message">
            <div className="alert alert-success">
              Email verified successfully! You can now log in to your account.
            </div>
          </div>
        )}
        
        {location.state?.message && (
          <div className="success-message">
            <div className="alert alert-success">
              {location.state.message}
            </div>
          </div>
        )}
        
        {showVerificationMsg && (
          <div className="verify-message alert alert-warning">
            <p>Your email is not verified. Please check your inbox for a verification email or request a new one.</p>
            <Link to={`/resend-verification?email=${encodeURIComponent(userEmail)}&role=${encodeURIComponent(formik.values.role)}`} className="btn btn-sm btn-primary mt-2">
              Resend Verification Email
            </Link>
          </div>
        )}
        
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

          {!isAdminLogin && (
            <div className="form-group">
              <label htmlFor="role">Login As</label>
              <select
                id="role"
                name="role"
                className="form-control"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="student">Student</option>
                <option value="donor">Donor</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <div className="error-text">{formik.errors.role}</div>
              )}
            </div>
          )}

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
            {serverError && serverError.includes('verify') && (
              <div className="verify-link">
                <Link to={`/resend-verification?email=${encodeURIComponent(formik.values.email)}&role=${encodeURIComponent(formik.values.role)}`}>
                  Resend verification email
                </Link>
              </div>
            )}
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