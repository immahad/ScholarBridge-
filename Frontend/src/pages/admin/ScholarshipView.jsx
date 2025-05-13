import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiChevronLeft, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import { scholarshipService } from '../../services/api';

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
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
          <p>{error}</p>
        </div>
        <Link to="/admin/scholarships" className="text-blue-500 flex items-center">
          <FiChevronLeft className="mr-1" /> Back to Scholarships
        </Link>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
          <p>Scholarship not found</p>
        </div>
        <Link to="/admin/scholarships" className="text-blue-500 flex items-center">
          <FiChevronLeft className="mr-1" /> Back to Scholarships
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/admin/scholarships" className="text-blue-500 flex items-center mb-4">
        <FiChevronLeft className="mr-1" /> Back to Scholarships
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{scholarship.title}</h1>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
              ${scholarship.status === 'active' ? 'bg-green-100 text-green-800' : 
                scholarship.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                scholarship.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'}`}
            >
              {scholarship.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <FiDollarSign className="text-gray-500 mr-2" />
            <span className="text-lg font-semibold">${scholarship.amount?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="text-gray-500 mr-2" />
            <span>Deadline: {new Date(scholarship.deadlineDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FiBookOpen className="text-gray-500 mr-2" />
            <span>{scholarship.category}</span>
          </div>
          <div className="flex items-center">
            <FiUser className="text-gray-500 mr-2" />
            <span>{scholarship.creator?.name || scholarship.createdByName || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{scholarship.description}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Eligibility Requirements</h2>
          <p className="text-gray-700">{scholarship.eligibilityRequirements}</p>
        </div>
        
        {scholarship.status === 'pending_approval' && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Review Scholarship</h2>
            {showReviewForm ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Decision:</label>
                  <div className="flex space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setReviewStatus('approved')}
                      className={`px-4 py-2 rounded flex items-center ${
                        reviewStatus === 'approved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <FiCheck className="mr-2" /> Approve
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setReviewStatus('rejected')}
                      className={`px-4 py-2 rounded flex items-center ${
                        reviewStatus === 'rejected' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <FiX className="mr-2" /> Reject
                    </button>
                  </div>
                </div>
                
                {reviewStatus === 'rejected' && (
                  <div>
                    <label className="block text-gray-700 mb-2">Reason for Rejection:</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows="3"
                      placeholder="Explain why this scholarship is being rejected"
                      required
                    ></textarea>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Review
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Review This Scholarship
              </button>
            )}
          </div>
        )}
        
        {scholarship.status === 'rejected' && scholarship.rejectionReason && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Rejection Reason</h2>
            <p className="text-red-700 bg-red-50 p-3 rounded">{scholarship.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScholarshipView; 