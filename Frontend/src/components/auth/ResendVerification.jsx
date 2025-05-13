import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useLocation } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertTriangle, FiUser } from 'react-icons/fi';
import axios from 'axios';
import '../../styles/auth.css';

const ResendVerification = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  
  // Extract email and role from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const emailFromUrl = queryParams.get('email') || '';
  const roleFromUrl = queryParams.get('role') || 'student';

  const formik = useFormik({
    initialValues: {
      email: emailFromUrl,
      role: roleFromUrl
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      role: Yup.string()
        .oneOf(['student', 'donor', 'admin'], 'Invalid role')
        .required('Role is required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        // Send request to resend verification email with role
        await axios.post('/api/auth/resend-verification', { 
          email: values.email
        }, {
          params: {
            role: values.role
          }
        });
        
        setSuccess(true);
      } catch (err) {
        console.error('Error resending verification:', err);
        setError(err.response?.data?.message || 'Failed to resend verification email');
      } finally {
        setLoading(false);
      }
    },
  });
  
  // Update form values when URL parameters change
  useEffect(() => {
    if (emailFromUrl) {
      formik.setFieldValue('email', emailFromUrl);
    }
    if (roleFromUrl) {
      formik.setFieldValue('role', roleFromUrl);
    }
  }, [emailFromUrl, roleFromUrl]);

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">Resend Verification Email</h2>

        {success ? (
          <div className="success-container">
            <FiCheckCircle className="success-icon" size={50} />
            <p className="success-message">
              If an account exists with this email and role, a verification link has been sent.
              Please check your inbox and spam folders.
            </p>
            <div className="auth-links">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message">
                <FiAlertTriangle /> {error}
              </div>
            )}

            <p className="auth-description">
              Enter your email address and account role below and we'll send you a new verification link.
            </p>

            <form onSubmit={formik.handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <div className="error-text">{formik.errors.email}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Account Role</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <select
                    id="role"
                    name="role"
                    className="form-control"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                  >
                    <option value="student">Student</option>
                    <option value="donor">Donor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {formik.touched.role && formik.errors.role && (
                  <div className="error-text">{formik.errors.role}</div>
                )}
              </div>

              <div className="form-group">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </form>

            <div className="auth-links">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
              <span className="auth-link-divider">•</span>
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;
