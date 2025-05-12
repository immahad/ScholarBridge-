import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthUtils';
import ScholarshipApplicationForm from '../components/ScholarshipApplicationForm';
import { toast } from 'react-toastify';
import '../styles/scholarship-detail.css';
import axios from 'axios';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/scholarships/${id}`);
        setScholarship(response.data.scholarship);
        
        // Check if student has already applied
        if (isAuthenticated && user?.role === 'student') {
          const applicationsResp = await axios.get('/api/students/applications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const existingApplication = applicationsResp.data.applications.find(
            app => app.scholarshipId === id
          );
          
          if (existingApplication) {
            setHasApplied(true);
            setApplicationStatus(existingApplication.status);
          }
        }
      } catch (err) {
        console.error('Failed to fetch scholarship details:', err);
        setError('Failed to load scholarship details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id, isAuthenticated, user, token]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/scholarships/${id}` } });
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can apply for scholarships.');
      return;
    }

    setShowApplicationForm(true);
  };
  
  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setHasApplied(true);
    setApplicationStatus('pending');
    toast.success('Your application has been submitted successfully!');
  };
  
  const renderApplicationStatus = () => {
    switch (applicationStatus) {
      case 'pending':
        return (
          <div className="application-status pending">
            <p>Your application is pending review</p>
          </div>
        );
      case 'approved':
        return (
          <div className="application-status approved">
            <p>Your application has been approved!</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="application-status rejected">
            <p>Your application was not approved</p>
          </div>
        );
      case 'funded':
        return (
          <div className="application-status funded">
            <p>Congratulations! Your scholarship has been funded</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container">
        <div className="error-message">Scholarship not found</div>
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
      </div>
    );
  }

  if (showApplicationForm) {
    return (
      <div className="container">
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
        
        <ScholarshipApplicationForm 
          scholarshipId={id} 
          onSuccess={handleApplicationSuccess}
          onCancel={() => setShowApplicationForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="scholarship-detail-page">
      <div className="container">
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>

        <div className="scholarship-header">
          <h1 className="scholarship-title">{scholarship.title}</h1>
          <div className="scholarship-meta">
            <div className="meta-item">
              <FiDollarSign className="meta-icon" />
              <span>${scholarship.amount.toLocaleString()}</span>
            </div>
            <div className="meta-item">
              <FiCalendar className="meta-icon" />
              <span>Deadline: {new Date(scholarship.deadlineDate).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <FiBookOpen className="meta-icon" />
              <span>{scholarship.category}</span>
            </div>
            <div className="meta-item">
              <FiUser className="meta-icon" />
              <span>{scholarship.createdBy?.name || 'Unknown Donor'}</span>
            </div>
          </div>
        </div>

        <div className="scholarship-content">
          <div className="content-main">
            <section className="content-section">
              <h2>Description</h2>
              <p>{scholarship.description}</p>
            </section>

            <section className="content-section">
              <h2>Eligibility Requirements</h2>
              <p>{scholarship.eligibilityRequirements}</p>
            </section>
            
            {hasApplied ? (
              <div className="application-info">
                <h3>Application Status</h3>
                {renderApplicationStatus()}
                <Link to="/student/applications" className="btn btn-outline">
                  View Your Applications
                </Link>
              </div>
            ) : (
              <div className="apply-section">
                <button onClick={handleApply} className="btn btn-primary btn-large">
                  Apply for this Scholarship
                </button>
                <p className="apply-note">
                  Make sure your profile is complete and you meet all eligibility requirements before applying.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;