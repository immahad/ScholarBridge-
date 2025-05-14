import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const DonationCancel = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <FiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-semibold mb-2">Donation Cancelled</h2>
        <p className="text-gray-600 mb-4">
          Your donation has been cancelled. No charges have been made to your account.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/donor/donate')}
            className="w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
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
};

export default DonationCancel; 