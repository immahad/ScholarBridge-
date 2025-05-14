import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiClock, 
  FiAward, 
  FiTag, 
  FiCalendar, 
  FiFileText, 
  FiAlertCircle,
  FiInfo,
  FiLoader
} from 'react-icons/fi';
import '../../styles/donor.css';

const DonorScholarshipView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/scholarships/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log('DEBUG: Scholarship data received:', response.data.scholarship);
          console.log('DEBUG: Criteria data received:', response.data.scholarship.criteria);
          setScholarship(response.data.scholarship);
        } else {
          setError('Failed to load scholarship details');
        }
      } catch (err) {
        console.error('Error fetching scholarship details:', err);
        setError(err.response?.data?.message || 'Error loading scholarship details');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipDetails();
  }, [id, token]);

  const getBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'donor-badge donor-badge-success';
      case 'pending_approval':
        return 'donor-badge donor-badge-pending';
      case 'rejected':
        return 'donor-badge donor-badge-error';
      default:
        return 'donor-badge';
    }
  };
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'active':
        return 'Active';
      case 'pending_approval':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      case 'closed':
        return 'Closed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="donor-page">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <FiLoader className="animate-spin mr-3" size={24} />
            <span>Loading scholarship details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donor-page">
        <div className="container">
          <Link to="/donor/scholarships" className="donor-back-link">
            <FiArrowLeft /> Back to Scholarships
          </Link>
          <div className="donor-card">
            <div className="donor-badge donor-badge-error">
              <FiAlertCircle /> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="donor-page">
        <div className="container">
          <Link to="/donor/scholarships" className="donor-back-link">
            <FiArrowLeft /> Back to Scholarships
          </Link>
          <div className="donor-card">
            <div className="donor-badge donor-badge-info">
              <FiInfo /> Scholarship not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-page">
      <div className="container">
        <Link to="/donor/scholarships" className="donor-back-link">
          <FiArrowLeft /> Back to Scholarships
        </Link>

        <div className="donor-card">
          <div className="scholarship-status-header">
            <h1 className="donor-page-title">{scholarship.title}</h1>
            <div>
              <span className={getBadgeClass(scholarship.status)}>
                {getStatusLabel(scholarship.status)}
              </span>
            </div>
          </div>

          {scholarship.status === 'rejected' && scholarship.rejectionReason && (
            <div className="donor-badge donor-badge-error" style={{ display: 'block', marginBottom: '20px', padding: '12px 15px' }}>
              <p style={{ fontWeight: '600', marginBottom: '5px' }}>Rejection Reason:</p>
              <p>{scholarship.rejectionReason}</p>
            </div>
          )}

          <div className="scholarship-detail-grid">
            <div>
              <h2 className="donor-card-title">Scholarship Details</h2>
              <div className="scholarship-detail-item">
                <div className="donor-label">Amount</div>
                <div className="scholarship-detail-value">
                  <FiAward /> ${scholarship.amount.toLocaleString()}
                </div>
              </div>
              
              <div className="scholarship-detail-item">
                <div className="donor-label">Deadline</div>
                <div className="scholarship-detail-value">
                  <FiCalendar /> {new Date(scholarship.deadlineDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="scholarship-detail-item">
                <div className="donor-label">Category</div>
                <div className="scholarship-detail-value">
                  <FiTag /> {scholarship.category}
                </div>
              </div>
              
              <div className="scholarship-detail-item">
                <div className="donor-label">Applicants</div>
                <div className="scholarship-detail-value">
                  <FiUsers /> {scholarship.applicantCount || 0}
                </div>
              </div>
              
              <div className="scholarship-detail-item">
                <div className="donor-label">Created</div>
                <div className="scholarship-detail-value">
                  <FiClock /> {new Date(scholarship.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h2 className="donor-card-title">Description</h2>
              <p className="scholarship-description">{scholarship.description}</p>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h2 className="donor-card-title">Eligibility Requirements</h2>
            <div className="scholarship-requirements">
              <p>{scholarship.eligibilityRequirements}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorScholarshipView; 