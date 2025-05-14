import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID found');
        }
        
        console.log('Verifying payment for session:', sessionId);
        
        // Verify the payment status
        const response = await axios.get(`/api/payments/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Payment verification response:', response.data);
        
        if (response.data.success) {
          if (response.data.status === 'completed' || response.data.status === 'paid') {
            // Payment is confirmed successful
            setTimeout(() => {
              navigate('/donor/dashboard');
            }, 5000);
            setLoading(false);
          } else if ((response.data.status === 'processing' || response.data.status === 'pending') && retryCount < MAX_RETRIES) {
            // Payment is still processing, retry after delay
            console.log(`Retrying verification (${retryCount + 1}/${MAX_RETRIES})...`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => verifyPayment(), 2000);
          } else {
            // Max retries reached or payment failed
            setError(`Payment verification timeout. Status: ${response.data.status}`);
            setLoading(false);
          }
        } else {
          setError(response.data.message || 'Payment verification failed');
          setLoading(false);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
        setError(`Verification failed: ${errorMessage}`);
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [searchParams, token, navigate, retryCount]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <FiLoader className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-semibold mb-2">Processing Your Donation</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Verification attempt: {retryCount}/{MAX_RETRIES}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                setRetryCount(0);
              }}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Verifying Again
            </button>
            <button
              onClick={() => navigate('/donor/dashboard')}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-semibold mb-2">Thank You for Your Donation!</h2>
        <p className="text-gray-600 mb-4">
          Your generous contribution will help support educational opportunities.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          You will be redirected to your dashboard in a few seconds...
        </p>
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DonationSuccess; 