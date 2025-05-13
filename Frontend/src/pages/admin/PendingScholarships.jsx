import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DonorScholarships = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState({
    scholarshipId: '',
    status: '',
    rejectionReason: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch pending scholarships
  const fetchPendingScholarships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/scholarships/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setScholarships(response.data.scholarships);
      } else {
        setError('Failed to load pending scholarships');
      }
    } catch (err) {
      console.error('Error fetching pending scholarships:', err);
      setError(err.response?.data?.message || 'Error loading scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingScholarships();
  }, [token]);

  // Handle opening review modal
  const handleReviewClick = (scholarship, initialStatus) => {
    setReviewData({
      scholarshipId: scholarship._id,
      status: initialStatus,
      rejectionReason: initialStatus === 'rejected' ? '' : reviewData.rejectionReason
    });
    setShowModal(true);
  };

  // Handle input change in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await axios.put(
        `/api/admin/scholarships/${reviewData.scholarshipId}/review`,
        {
          status: reviewData.status,
          rejectionReason: reviewData.status === 'rejected' ? reviewData.rejectionReason : ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setActionSuccess({
          message: `Scholarship ${reviewData.status === 'approved' ? 'approved' : 'rejected'} successfully`,
          status: reviewData.status
        });
        // Remove the reviewed scholarship from the list
        setScholarships(prev => prev.filter(s => s._id !== reviewData.scholarshipId));
        setShowModal(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error reviewing scholarship:', err);
      setError(err.response?.data?.message || 'Failed to process scholarship review');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="admin-pending-scholarships p-4">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Donor Scholarships</h1>
        <p className="text-gray-600">Review and approve scholarships created by donors</p>
      </div>

      {/* Success message */}
      {actionSuccess && (
        <div className={`mb-4 p-4 rounded-md ${
          actionSuccess.status === 'approved' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <p className="flex items-center">
            {actionSuccess.status === 'approved' 
              ? <FiCheckCircle className="mr-2" /> 
              : <FiXCircle className="mr-2" />}
            {actionSuccess.message}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          <p className="flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && !showModal && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No scholarships message */}
      {!loading && scholarships.length === 0 && (
        <div className="text-center my-12 p-6 bg-gray-50 rounded-lg">
          <FiCheckCircle className="mx-auto text-4xl text-green-500 mb-2" />
          <h2 className="text-xl font-semibold mb-2">All Clear!</h2>
          <p className="text-gray-600">There are no donor scholarships to review at this time.</p>
        </div>
      )}

      {/* Scholarships list */}
      {!loading && scholarships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholarships.map(scholarship => (
            <div 
              key={scholarship._id} 
              className="bg-white rounded-lg shadow p-5 transition-all duration-300 hover:shadow-md"
            >
              <div className="scholarship-header mb-4">
                <h3 className="text-xl font-semibold mb-1 line-clamp-1">{scholarship.title}</h3>
                <p className="text-gray-500 text-sm mb-2">Created on {formatDate(scholarship.createdAt)}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiUser className="mr-1" />
                  <span>Created by: {scholarship.createdBy?.firstName} {scholarship.createdBy?.lastName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {scholarship.category}
                  </span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <FiDollarSign className="inline mr-1" />
                    {formatCurrency(scholarship.amount)}
                  </span>
                  <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    <FiCalendar className="inline mr-1" />
                    Deadline: {formatDate(scholarship.deadlineDate)}
                  </span>
                </div>
              </div>
              
              <div className="scholarship-body mb-4">
                <p className="text-gray-700 line-clamp-3 mb-2">{scholarship.description}</p>
                <div className="mt-3">
                  <h4 className="font-semibold mb-1">Eligibility Requirements:</h4>
                  <p className="text-gray-700 line-clamp-2">{scholarship.eligibilityRequirements}</p>
                </div>
              </div>
              
              <div className="scholarship-actions flex mt-4 gap-2">
                <button
                  onClick={() => handleReviewClick(scholarship, 'approved')}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                >
                  <FiCheckCircle className="mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleReviewClick(scholarship, 'rejected')}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center"
                >
                  <FiXCircle className="mr-2" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {reviewData.status === 'approved' ? 'Approve Scholarship' : 'Reject Scholarship'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={reviewData.status === 'approved'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Approve
                </label>
                <label className="block text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={reviewData.status === 'rejected'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Reject
                </label>
              </div>
              
              {reviewData.status === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    name="rejectionReason"
                    value={reviewData.rejectionReason}
                    onChange={handleInputChange}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  ></textarea>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : reviewData.status === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={loading || (reviewData.status === 'rejected' && !reviewData.rejectionReason)}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    reviewData.status === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorScholarships; 