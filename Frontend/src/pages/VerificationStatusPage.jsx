import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useEffect } from 'react';

const VerificationStatusPage = ({ status = 'success' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine status from the pathname if not explicitly provided
  const pageStatus = status === 'success' || location.pathname.includes('success') 
    ? 'success' 
    : 'failed';
  
  // Auto-redirect to login after success (5 seconds)
  useEffect(() => {
    if (pageStatus === 'success') {
      const timer = setTimeout(() => {
        navigate('/login?verified=true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [pageStatus, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {pageStatus === 'success' ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                You will be redirected to the login page automatically in 5 seconds.
              </p>
              <div className="mt-8">
                <Link to="/login?verified=true" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Login Now
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-600">
                We were unable to verify your email address. The verification link may be invalid or expired.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Try Logging In
                </Link>
                <Link to="/resend-verification" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Resend Verification Email
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusPage; 