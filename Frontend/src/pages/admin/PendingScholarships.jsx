import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiUser, FiCalendar, FiDollarSign, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/admin.css';

const DonorScholarships = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState('');
  const [currentScholarship, setCurrentScholarship] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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

  // Handle direct approval
  const handleDirectApproval = async (scholarship) => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        `/api/admin/scholarships/${scholarship._id}/review`,
        {
          status: 'approved',
          rejectionReason: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Scholarship "${scholarship.title}" approved successfully!`);
        // Remove the reviewed scholarship from the list
        setScholarships(prev => prev.filter(s => s._id !== scholarship._id));
      }
    } catch (err) {
      console.error('Error approving scholarship:', err);
      toast.error(err.response?.data?.message || 'Failed to approve scholarship');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct rejection (show prompt for reason)
  const handleDirectRejection = (scholarship) => {
    setCurrentScholarship(scholarship);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Handle rejection submission
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.put(
        `/api/admin/scholarships/${currentScholarship._id}/review`,
        {
          status: 'rejected',
          rejectionReason: rejectionReason
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Scholarship "${currentScholarship.title}" rejected successfully`);
        
        // Remove the reviewed scholarship from the list
        setScholarships(prev => prev.filter(s => s._id !== currentScholarship._id));
        setShowRejectModal(false);
      }
    } catch (err) {
      console.error('Error rejecting scholarship:', err);
      toast.error(err.response?.data?.message || 'Failed to reject scholarship');
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
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pending Donor Scholarships</h1>
          <p className="admin-page-subtitle">Review and approve scholarships created by donors</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="admin-card bg-red-50 border-l-4 border-red-500">
          <p className="flex items-center text-red-700">
            <FiAlertCircle className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && !showRejectModal && (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      )}

      {/* No scholarships message */}
      {!loading && scholarships.length === 0 && (
        <div className="admin-empty-state">
          <FiCheckCircle className="text-4xl text-green-500 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-2">All Clear!</h2>
          <p>There are no donor scholarships to review at this time.</p>
        </div>
      )}

      {/* Scholarships list */}
      {!loading && scholarships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map(scholarship => (
            <div 
              key={scholarship._id} 
              className="admin-card"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1 text-blue-900">{scholarship.title}</h3>
                <p className="text-gray-500 text-sm mb-3">Created on {formatDate(scholarship.createdAt)}</p>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <FiUser className="mr-2 text-blue-500" />
                  <span>Created by: {scholarship.createdBy?.firstName} {scholarship.createdBy?.lastName}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="admin-badge bg-blue-50 text-blue-700">
                    {scholarship.category}
                  </span>
                  <span className="admin-badge bg-green-50 text-green-700">
                    <FiDollarSign className="mr-1" />
                    {formatCurrency(scholarship.amount)}
                  </span>
                  <span className="admin-badge bg-amber-50 text-amber-700">
                    <FiCalendar className="mr-1" />
                    Deadline: {formatDate(scholarship.deadlineDate)}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 line-clamp-3 mb-3">{scholarship.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2">Eligibility Requirements:</h4>
                  <p className="text-gray-700 line-clamp-2">{scholarship.eligibilityRequirements}</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <Link 
                  to={`/admin/scholarships/view/${scholarship._id}`} 
                  className="admin-button admin-button-secondary w-full mb-3"
                >
                  <FiEye />
                  View Full Details
                </Link>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDirectApproval(scholarship)}
                    className="admin-button admin-button-success"
                  >
                    <FiCheckCircle />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDirectRejection(scholarship)}
                    className="admin-button admin-button-danger"
                  >
                    <FiXCircle />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && currentScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="admin-card-title mb-4">
              Reject Scholarship
            </h2>
            
            <form onSubmit={handleRejectSubmit}>
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-800 mb-1">{currentScholarship.title}</p>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting this scholarship:
                </p>
                
                <div className="mb-5">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="admin-button admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={loading ? 'admin-button admin-button-disabled' : 'admin-button admin-button-danger'}
                  disabled={loading || !rejectionReason.trim()}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    'Confirm Rejection'
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