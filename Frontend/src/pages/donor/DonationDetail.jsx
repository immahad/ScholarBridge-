import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { 
  FiUser, 
  FiBook, 
  FiDollarSign, 
  FiCalendar, 
  FiArrowLeft, 
  FiMapPin,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard
} from 'react-icons/fi';

const DonationDetail = () => {
  const { donationId } = useParams();
  const { token } = useAuth();
  
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/donors/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setDonation(response.data.donation);
        } else {
          setError('Failed to load donation details');
        }
      } catch (err) {
        console.error('Error fetching donation details:', err);
        setError(err.response?.data?.message || 'Error loading donation details');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && donationId) {
      fetchDonationDetails();
    }
  }, [donationId, token]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2">Loading donation details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </p>
      </div>
    );
  }
  
  if (!donation) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          Donation not found.
        </p>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Donation Details</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="text-blue-500 text-4xl" />
              </div>
              <h2 className="text-xl font-semibold">{formatCurrency(donation.amount)}</h2>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <FiCalendar className="mr-1" />
                {formatDate(donation.donationDate)}
              </p>
              <div className="mt-4 py-2 px-3 rounded bg-green-100 text-green-800 inline-flex items-center">
                <FiCheckCircle className="mr-2" />
                {donation.status === 'completed' ? 'Completed' : donation.status}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-gray-600 text-sm">Payment Method</p>
                  <p className="font-medium flex items-center">
                    <FiCreditCard className="mr-1" />
                    {donation.paymentMethod || 'Credit Card'}
                  </p>
                </div>
                {donation.transactionId && (
                  <div>
                    <p className="text-gray-600 text-sm">Transaction ID</p>
                    <p className="font-medium">{donation.transactionId}</p>
                  </div>
                )}
                {donation.isAnonymous !== undefined && (
                  <div>
                    <p className="text-gray-600 text-sm">Anonymity</p>
                    <p className="font-medium">{donation.isAnonymous ? 'Anonymous Donation' : 'Public Donation'}</p>
                  </div>
                )}
              </div>
            </div>
            
            {donation.notes && (
              <div className="border-t mt-4 pt-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{donation.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recipient Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Scholarship Information</h2>
            
            {donation.scholarship ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Scholarship Name</p>
                  <p className="font-semibold">{donation.scholarship.title || 'General Donation'}</p>
                </div>
                {donation.scholarship.amount && (
                  <div>
                    <p className="text-gray-600">Scholarship Amount</p>
                    <p className="font-semibold text-green-600 flex items-center">
                      <FiDollarSign className="mr-1" />
                      {formatCurrency(donation.scholarship.amount)}
                    </p>
                  </div>
                )}
                {donation.scholarship.description && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Description</p>
                    <p className="text-gray-700">{donation.scholarship.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Donation Type</p>
                  <p className="font-semibold">General Donation</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600 flex items-center">
                    <FiDollarSign className="mr-1" />
                    {formatCurrency(donation.amount)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-600">Description</p>
                  <p className="text-gray-700">General donation to the ScholarBridge Foundation</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
            
            {donation.student ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Student Name</p>
                  <p className="font-semibold">
                    {(donation.student.firstName === 'General' && donation.student.lastName === 'Fund')
                      ? 'General Fund'
                      : `${donation.student.firstName || ''} ${donation.student.lastName || ''}`.trim() || 'N/A'}
                  </p>
                </div>
                {donation.student.institution && donation.student.institution !== 'ScholarBridge Foundation' && (
                  <div>
                    <p className="text-gray-600">Institution</p>
                    <p className="font-semibold flex items-center">
                      <FiMapPin className="mr-1" />
                      {donation.student.institution}
                    </p>
                  </div>
                )}
                {donation.student.program && donation.student.program !== 'General Support' && (
                  <div>
                    <p className="text-gray-600">Program</p>
                    <p className="font-semibold flex items-center">
                      <FiBook className="mr-1" />
                      {donation.student.program}
                    </p>
                  </div>
                )}
                {donation.application && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Application Status</p>
                    <p className="font-semibold">{donation.application.status}</p>
                    {donation.application.fundedAt && (
                      <p className="text-gray-600 text-sm">
                        Funded on {formatDate(donation.application.fundedAt)}
                      </p>
                    )}
                  </div>
                )}
                {(donation.student.firstName === 'General' && donation.student.lastName === 'Fund') && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Information</p>
                    <p className="text-gray-700">
                      This donation was made to the general fund and will be used to support multiple students.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-600">Donation Type</p>
                  <p className="font-semibold">General Fund</p>
                </div>
                <div>
                  <p className="text-gray-600">Information</p>
                  <p className="text-gray-700">
                    This donation was made to the general fund and will be used to support multiple students.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Link 
              to="/donor/dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetail; 