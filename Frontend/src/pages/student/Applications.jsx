import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/student-applications.css';

const StudentApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/applications${statusFilter ? `?status=${statusFilter}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setApplications(response.data.applications);
        } else {
          setError('Failed to load applications');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token, statusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'funded':
        return 'status-funded';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Approved';
      case 'funded':
        return 'Funded';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="student-applications-page">
      <div className="page-header">
        <h1>My Scholarship Applications</h1>
        <p>Track the status of your scholarship applications</p>
      </div>
      
      <div className="filter-section">
        <label htmlFor="statusFilter">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Applications</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Not Approved</option>
          <option value="funded">Funded</option>
        </select>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications found</h3>
          {statusFilter ? (
            <p>You don't have any applications with status "{getStatusLabel(statusFilter)}".</p>
          ) : (
            <p>You haven't applied to any scholarships yet.</p>
          )}
          <Link to="/scholarships" className="btn btn-primary">
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((application) => (
            <div key={application._id} className="application-card">
              <div className={`application-status ${getStatusClass(application.status)}`}>
                {getStatusLabel(application.status)}
              </div>
              
              <h2 className="scholarship-title">
                {application.scholarship?.title || 'Unnamed Scholarship'}
              </h2>
              
              <div className="application-details">
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span className="value">${application.scholarship?.amount.toLocaleString() || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Applied:</span>
                  <span className="value">{new Date(application.appliedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Deadline:</span>
                  <span className="value">
                    {application.scholarship?.deadlineDate 
                      ? new Date(application.scholarship.deadlineDate).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="application-footer">
                <Link 
                  to={`/student/applications/${application._id}`} 
                  className="btn btn-outline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications; 