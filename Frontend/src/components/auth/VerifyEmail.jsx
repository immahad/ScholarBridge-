import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { FiCheck, FiAlertTriangle } from 'react-icons/fi';

const VerifyEmail = ({ initialState = {} }) => {
  const { role, token } = useParams();
  const [loading, setLoading] = useState(!initialState.verified && !initialState.error);
  const [verified, setVerified] = useState(initialState.verified || false);
  const [error, setError] = useState(initialState.error || '');

  useEffect(() => {
    // Skip verification if we already have an initial state
    if (initialState.verified || initialState.error) {
      return;
    }

    const verifyEmail = async () => {
      try {
        setLoading(true);
        console.log('Verifying email with role:', role, 'and token:', token);
        
        let success = false;
        let errorMsg = null;
        
        // First try the standard endpoint
        try {
          console.log('Trying standard verification endpoint...');
          const response = await authService.verifyEmail(role, token);
          console.log('Standard verification response:', response);
          
          if (response.data.success) {
            success = true;
          }
        } catch (err) {
          console.log('Standard verification failed, trying direct verification...');
          errorMsg = err.response?.data?.message;
          
          // If the first method fails, try the direct method
          try {
            const directResponse = await authService.directVerify(role, token);
            console.log('Direct verification response:', directResponse);
            
            if (directResponse.data.success) {
              success = true;
              errorMsg = null;
            }
          } catch (directErr) {
            console.error('Direct verification also failed:', directErr);
            errorMsg = directErr.response?.data?.message || errorMsg;
          }
        }
        
        if (success) {
          setVerified(true);
        } else {
          setError(errorMsg || 'Verification failed with an unknown error');
        }
      } catch (err) {
        console.error('Email verification error:', err);
        console.error('Error details:', err.response?.data);
        
        // Handle network errors
        if (!err.response) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (role && token) {
      verifyEmail();
    } else if (!initialState.verified && !initialState.error) {
      setError('Invalid verification link. Missing role or token.');
      setLoading(false);
    }
  }, [role, token, initialState.verified, initialState.error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifying your email</h2>
            <p className="mt-2 text-sm text-gray-600">Please wait, we are confirming your email address...</p>
          </div>
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-8">
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Register Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Pending</h2>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't confirm your email verification. Please try again or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verified!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been successfully verified. You can now login to your account.
          </p>
          <div className="mt-8">
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
