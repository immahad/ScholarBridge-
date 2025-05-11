import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthUtils';
import '../styles/scholarship-detail.css';
import axios from 'axios';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/scholarships/${id}`);
        setScholarship(response.data.scholarship);
      } catch (err) {
        console.error('Failed to fetch scholarship details:', err);
        setError('Failed to load scholarship details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/scholarships/${id}` } });
      return;
    }

    if (user?.role !== 'student') {
      alert('Only students can apply for scholarships.');
      return;
    }

    setApplyModalOpen(true);
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
          </div>
        </div>
      </div>

      {applyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Apply for Scholarship</h2>
            <p>Complete the application form to apply for this scholarship.</p>
            <div className="modal-actions">
              <button onClick={() => setApplyModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Application submitted successfully!');
                  setApplyModalOpen(false);
                }}
                className="btn btn-primary"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipDetailPage;