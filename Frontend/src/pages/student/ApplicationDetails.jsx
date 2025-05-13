import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiCalendar, FiDollarSign, FiFileText, FiUser, FiClock } from 'react-icons/fi';
import '../../styles/application-details.css';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setApplication(response.data.application);
        } else {
          setError('Failed to load application details');
        }
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError(err.response?.data?.message || 'Failed to load application details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplicationDetails();
    }
  }, [id, token]);

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

  if (loading) {
    return (
      <div className="application-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="application-details-page">
        <div className="error-message">{error}</div>
        <Link to="/student/applications" className="back-link">
          <FiChevronLeft /> Back to Applications
        </Link>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="application-details-page">
        <div className="message-box">
          <h3>Application Not Found</h3>
          <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/student/applications" className="btn btn-primary">
            View Your Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="application-details-page">
      <Link to="/student/applications" className="back-link">
        <FiChevronLeft /> Back to Applications
      </Link>
      
      <div className="application-header">
        <h1>Application Details</h1>
        <div className={`application-status ${getStatusClass(application.status)}`}>
          {getStatusLabel(application.status)}
        </div>
      </div>
      
      <div className="details-grid">
        <div className="scholarship-info card">
          <h2>Scholarship Information</h2>
          <div className="info-group">
            <div className="info-item">
              <FiFileText className="info-icon" />
              <div className="info-content">
                <span className="label">Title</span>
                <span className="value">{application.scholarship?.title || 'N/A'}</span>
              </div>
            </div>
            
            <div className="info-item">
              <FiDollarSign className="info-icon" />
              <div className="info-content">
                <span className="label">Amount</span>
                <span className="value">${application.scholarship?.amount?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
            
            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div className="info-content">
                <span className="label">Deadline</span>
                <span className="value">
                  {application.scholarship?.deadlineDate
                    ? new Date(application.scholarship.deadlineDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {application.scholarship?.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{application.scholarship.description}</p>
            </div>
          )}
          
          <Link 
            to={`/scholarships/${application.scholarshipId}`} 
            className="btn btn-outline btn-sm"
          >
            View Scholarship Details
          </Link>
        </div>
        
        <div className="application-info card">
          <h2>Application Information</h2>
          <div className="info-group">
            <div className="info-item">
              <FiClock className="info-icon" />
              <div className="info-content">
                <span className="label">Submitted On</span>
                <span className="value">{new Date(application.appliedAt).toLocaleString()}</span>
              </div>
            </div>
            
            {application.reviewedAt && (
              <div className="info-item">
                <FiClock className="info-icon" />
                <div className="info-content">
                  <span className="label">Reviewed On</span>
                  <span className="value">{new Date(application.reviewedAt).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {application.admin && (
              <div className="info-item">
                <FiUser className="info-icon" />
                <div className="info-content">
                  <span className="label">Reviewed By</span>
                  <span className="value">{`${application.admin.firstName} ${application.admin.lastName}`}</span>
                </div>
              </div>
            )}
            
            {application.fundedAt && (
              <div className="info-item">
                <FiClock className="info-icon" />
                <div className="info-content">
                  <span className="label">Funded On</span>
                  <span className="value">{new Date(application.fundedAt).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {application.donor && (
              <div className="info-item">
                <FiUser className="info-icon" />
                <div className="info-content">
                  <span className="label">Funded By</span>
                  <span className="value">
                    {application.donor.donorType === 'organization' 
                      ? application.donor.organizationName 
                      : `${application.donor.firstName} ${application.donor.lastName}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="submitted-content card">
          <h2>Your Submission</h2>
          
          {application.essays && application.essays.length > 0 && (
            <div className="essays-section">
              <h3>Essays</h3>
              {application.essays.map((essay, index) => (
                <div key={index} className="essay-item">
                  <h4>{essay.question}</h4>
                  <p>{essay.answer}</p>
                </div>
              ))}
            </div>
          )}
          
          {application.documents && application.documents.length > 0 && (
            <div className="documents-section">
              <h3>Submitted Documents</h3>
              <ul className="documents-list">
                {application.documents.map((doc, index) => (
                  <li key={index} className="document-item">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <span className="doc-type">{doc.type}</span> - {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {application.comments && (
            <div className="comments-section">
              <h3>Admin Comments</h3>
              <p>{application.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails; 