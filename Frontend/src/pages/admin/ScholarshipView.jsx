import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiChevronLeft, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import { scholarshipService } from '../../services/api';
import '../../styles/admin.css';

const AdminScholarshipView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the adminGetScholarship method to ensure consistency with admin operations
        const response = await scholarshipService.adminGetScholarship(id);
        
        console.log('Admin scholarship data:', response.data);
        setScholarship(response.data.scholarship);
      } catch (err) {
        console.error('Failed to fetch scholarship details:', err);
        setError('Failed to load scholarship details. Please try again later.');
        toast.error('Error loading scholarship details');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id, token]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewStatus) {
      toast.error('Please select approve or reject');
      return;
    }
    
    if (reviewStatus === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      const response = await scholarshipService.adminReviewScholarship(
        id,
        {
          status: reviewStatus,
          rejectionReason: rejectionReason
        }
      );
      
      toast.success(`Scholarship ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      setScholarship(response.data.scholarship);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Failed to review scholarship:', err);
      toast.error(err.response?.data?.message || 'Error processing your review');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/admin/scholarships" className="admin-button admin-button-secondary">
            <FiChevronLeft /> Back to Scholarships
          </Link>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p className="text-amber-700 mb-4">Scholarship not found</p>
          <Link to="/admin/scholarships" className="admin-button admin-button-secondary">
            <FiChevronLeft /> Back to Scholarships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Link to="/admin/scholarships" className="donor-back-link mb-6">
        <FiChevronLeft /> Back to Scholarships
      </Link>
      
      <div className="flex justify-between items-start mb-8">
        <h1 className="admin-page-title mb-0">{scholarship.title}</h1>
        <span className={`admin-badge admin-badge-${scholarship.status?.toLowerCase() || 'inactive'}`}>
          {scholarship.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scholarship details card */}
        <div className="admin-card">
          <h2 className="admin-card-title">Scholarship Details</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <FiDollarSign className="scholarship-detail-icon mt-1" />
              <div>
                <div className="scholarship-detail-label">Award Amount</div>
                <div className="scholarship-detail-value">${scholarship.amount?.toLocaleString() || 0}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiCalendar className="scholarship-detail-icon mt-1" />
              <div>
                <div className="scholarship-detail-label">Application Deadline</div>
                <div className="scholarship-detail-value">{new Date(scholarship.deadlineDate).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiBookOpen className="scholarship-detail-icon mt-1" />
              <div>
                <div className="scholarship-detail-label">Category</div>
                <div className="scholarship-detail-value">{scholarship.category}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiUser className="scholarship-detail-icon mt-1" />
              <div>
                <div className="scholarship-detail-label">Created By</div>
                <div className="scholarship-detail-value">{scholarship.creator?.name || scholarship.createdByName || 'Unknown'}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description card */}
        <div className="admin-card">
          <h2 className="admin-card-title">Description</h2>
          <p className="scholarship-description">{scholarship.description}</p>
        </div>
        
        {/* Eligibility Requirements card */}
        <div className="admin-card">
          <h2 className="admin-card-title">Eligibility Requirements</h2>
          <div className="scholarship-requirements">
            {scholarship.eligibilityRequirements}
          </div>
        </div>
        
        {/* Review card - only shown for pending approval */}
        {scholarship.status === 'pending_approval' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Review Scholarship</h2>
            {showReviewForm ? (
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 mb-3 font-medium">Decision:</label>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      type="button" 
                      onClick={() => setReviewStatus('approved')}
                      className={
                        reviewStatus === 'approved' 
                          ? 'admin-button admin-button-success' 
                          : 'admin-button admin-button-secondary'
                      }
                    >
                      <FiCheck /> Approve
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setReviewStatus('rejected')}
                      className={
                        reviewStatus === 'rejected' 
                          ? 'admin-button admin-button-danger' 
                          : 'admin-button admin-button-secondary'
                      }
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                </div>
                
                {reviewStatus === 'rejected' && (
                  <div>
                    <label className="block scholarship-detail-label mb-2">
                      Reason for Rejection:
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                      rows="3"
                      placeholder="Explain why this scholarship is being rejected"
                      required
                    ></textarea>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    type="submit" 
                    className="admin-button admin-button-primary"
                  >
                    Submit Review
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)}
                    className="admin-button admin-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4 text-gray-600">Please review this scholarship before it becomes visible to students.</p>
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="admin-button admin-button-primary"
                >
                  Review This Scholarship
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Rejection Reason card - only shown for rejected scholarships */}
        {scholarship.status === 'rejected' && scholarship.rejectionReason && (
          <div className="admin-card">
            <h2 className="admin-card-title">Rejection Reason</h2>
            <div className="bg-red-50 p-5 border-l-4 border-red-500 rounded text-red-700">
              {scholarship.rejectionReason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScholarshipView; 