import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/admin-applications.css';
import { FiCheckCircle, FiXCircle, FiFileText, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

const AdminApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all applications or a specific one
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch a specific application - always use real data
          try {
            // Fetch a specific application
            console.log('Fetching application details for ID:', id);
            const response = await axios.get(`/api/applications/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
              console.log('Fetched application data:', response.data.application);
              setApplication(response.data.application);
            } else {
              setError('Failed to load application details');
            }
          } catch (err) {
            console.error('Error fetching application data:', err);
            if (err.response && err.response.status === 404) {
              setError('Application not found. It may have been deleted or you do not have permission to view it.');
            } else if (err.response && err.response.status === 400) {
              setError('Invalid application ID format. Please check the URL and try again.');
            } else {
              setError('An error occurred while fetching the application details.');
            }
          }
        } else {
          // Fetch all applications with optional filters
          const queryParams = [];
          if (statusFilter) queryParams.push(`status=${statusFilter}`);
          if (searchTerm) queryParams.push(`search=${searchTerm}`);
          
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
          
          try {
            const response = await axios.get(`/api/applications${queryString}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
              const apps = response.data.applications || [];
              setApplications(apps);
              console.log('Fetched applications:', apps);
            } else {
              setError('Failed to load applications');
            }
          } catch (err) {
            console.error('Error fetching applications list:', err);
            setError('Failed to load applications. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error fetching application data:', err);
        // Providing more detailed error messages based on the response
        if (err.response) {
          if (err.response.status === 400) {
            setError('Invalid application ID - Please check the URL and try again.');
          } else if (err.response.status === 404) {
            setError('Application not found - It may have been deleted or you do not have permission to view it.');
          } else if (err.response.status === 500) {
            setError('Server error occurred. Please try again later.');
          } else {
            setError(err.response.data?.message || 'An error occurred while fetching data');
          }
        } else if (err.request) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, id, statusFilter, searchTerm]);

  // Handle application review (approve/reject)
  const handleReview = async (applicationId, status, reason = '') => {
    try {
      // Make sure we have a valid reason when rejecting
      if (status === 'rejected' && !reason.trim()) {
        setError('A reason is required when rejecting an application');
        return;
      }
      
      const response = await axios.put(
        `/api/applications/${applicationId}/review`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        if (id) {
          // If in detailed view, update the current application
          setApplication(prev => ({ ...prev, status, rejectionReason: status === 'rejected' ? reason : null }));
        } else {
          // If in list view, update the application in the list
          setApplications(prev => 
            prev.map(app => app._id === applicationId ? 
              { ...app, status, rejectionReason: status === 'rejected' ? reason : null } : app)
          );
        }
        
        // Show success message
        alert(`Application successfully ${status}`);
      } else {
        setError('Failed to update application status');
      }
    } catch (err) {
      console.error('Error reviewing application:', err);
      setError(err.response?.data?.message || 'Failed to update application status');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'N/A';
    }
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'N/A';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get CSS class for status pill
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'funded': return 'status-funded';
      default: return '';
    }
  };
  
  // Get icon for status
  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch (status) {
      case 'pending': return <FiFileText className="status-icon pending" />;
      case 'approved': return <FiCheckCircle className="status-icon approved" />;
      case 'rejected': return <FiXCircle className="status-icon rejected" />;
      case 'funded': return <FiDollarSign className="status-icon funded" />;
      default: return null;
    }
  };

  // Render application details view
  const renderApplicationDetails = () => {
    if (!application) return <div className="empty-state">No application data found</div>;
    
    return (
      <div className="application-details">
        <div className="detail-header">
          <button onClick={() => navigate('/admin/applications')} className="back-button">
            <FiArrowLeft /> Back to Applications
          </button>
          <div className="header-right">
            <div className={`status-pill ${getStatusClass(application.status)}`}>
              {getStatusIcon(application.status)}
              <span>{application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Unknown'}</span>
            </div>
            {application.status === 'pending' && (
              <div className="action-buttons">
                <button 
                  onClick={() => handleReview(application._id, 'approved')}
                  className="approve-button"
                >
                  Approve
                </button>
                <button 
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) handleReview(application._id, 'rejected', reason);
                  }}
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Student Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Student Name</span>
              <span className="detail-value">{application.studentName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{application.studentEmail || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">University</span>
              <span className="detail-value">{application.university || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Major</span>
              <span className="detail-value">{application.major || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GPA</span>
              <span className="detail-value">{application.gpa || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expected Graduation</span>
              <span className="detail-value">{application.expectedGraduation || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Scholarship Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Scholarship Name</span>
              <span className="detail-value">{application.scholarshipName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value">{formatCurrency(application.amount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted Date</span>
              <span className="detail-value">{formatDate(application.submittedDate)}</span>
            </div>
            {application.status === 'funded' && (
              <div className="detail-item">
                <span className="detail-label">Donor</span>
                <span className="detail-value">{application.donorName || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Application Essay</h3>
          <div className="essay-content">
            {application.essay || 'No essay provided'}
          </div>
        </div>
        
        {application.additionalDocuments && application.additionalDocuments.length > 0 && (
          <div className="detail-section">
            <h3>Additional Documents</h3>
            <div className="documents-list">
              {application.additionalDocuments.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="document-name">{doc.name}</span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="document-link">
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {application.status === 'rejected' && application.rejectionReason && (
          <div className="detail-section">
            <h3>Rejection Reason</h3>
            <div className="reason-content">
              {application.rejectionReason}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render list view of all applications
  const renderApplicationsList = () => {
    return (
      <>
        <div className="filters-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by student or scholarship name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="status-filters">
            <button 
              className={`filter-button ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => setStatusFilter('')}
            >
              All
            </button>
            <button 
              className={`filter-button ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-button ${statusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-button ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </button>
            <button 
              className={`filter-button ${statusFilter === 'funded' ? 'active' : ''}`}
              onClick={() => setStatusFilter('funded')}
            >
              Funded
            </button>
          </div>
        </div>
        
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Scholarship</th>
                <th>Amount</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? applications.map((app, index) => (
                <tr key={`${app._id || ''}-${index}`}>
                  <td>{app.studentName || 'N/A'}</td>
                  <td>{app.scholarshipName || 'N/A'}</td>
                  <td>{formatCurrency(app.amount)}</td>
                  <td>{formatDate(app.submittedDate)}</td>
                  <td>
                    <div className={`status-pill ${getStatusClass(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                        className="view-button"
                      >
                        View Details
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleReview(app._id, 'approved')}
                            className="approve-button"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) handleReview(app._id, 'rejected', reason);
                            }}
                            className="reject-button"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No applications found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div className="admin-applications-container">
        <h1 className="page-title">
          {id ? 'Application Details' : 'Manage Scholarship Applications'}
        </h1>
        <div className="error-message">
          <p>{error}</p>
          {id && (
            <button 
              onClick={() => navigate('/admin/applications')}
              className="back-button"
              style={{ marginTop: '1rem' }}
            >
              <FiArrowLeft /> Back to Applications
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-applications-container">
      <h1 className="page-title">
        {id ? 'Application Details' : 'Manage Scholarship Applications'}
      </h1>
      
      {id ? renderApplicationDetails() : renderApplicationsList()}
    </div>
  );
};

export default AdminApplications; 