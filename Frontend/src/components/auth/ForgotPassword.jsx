import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/api';
import '../../styles/auth.css';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form validation schema
  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await authService.forgotPassword(values.email);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to process your request. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">Forgot Your Password?</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {success ? (
          <div className="success-message">
            <p>Password reset instructions have been sent to your email address.</p>
            <p>Please check your inbox and follow the instructions to reset your password.</p>
            <div className="auth-footer">
              <Link to="/login">Return to Login</Link>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}

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

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>

            <div className="auth-footer">
              Remember your password? <Link to="/login">Log in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 