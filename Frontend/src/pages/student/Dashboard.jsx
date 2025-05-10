import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiUser, FiDollarSign, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    confirmed: 0
  });

  useEffect(() => {
    // Mock data - in a real app, this would be an API call
    const fetchApplications = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          const mockApplications = [
            {
              id: 1,
              scholarshipName: 'Engineering Excellence Scholarship',
              amount: 5000,
              status: 'pending',
              appliedDate: '2023-10-15',
              institution: 'MIT'
            },
            {
              id: 2,
              scholarshipName: 'Future Leaders Fund',
              amount: 3500,
              status: 'approved',
              appliedDate: '2023-09-20',
              institution: 'Stanford University'
            },
            {
              id: 3,
              scholarshipName: 'STEM Diversity Grant',
              amount: 4000,
              status: 'confirmed',
              appliedDate: '2023-08-05',
              institution: 'UC Berkeley',
              donorInfo: {
                name: 'Jane Smith Foundation',
                email: 'contact@janesmith.org',
                paymentProof: '/images/payment-confirmation.jpg',
                message: 'We are happy to support your education journey!'
              }
            },
            {
              id: 4,
              scholarshipName: 'Academic Achievement Award',
              amount: 2000,
              status: 'rejected',
              appliedDate: '2023-07-10',
              institution: 'Harvard University',
              rejectionReason: 'Limited funds available, highly competitive selection process.'
            }
          ];

          setApplications(mockApplications);
          
          // Calculate stats
          const stats = mockApplications.reduce((acc, app) => {
            acc.total += 1;
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          }, { total: 0, pending: 0, approved: 0, rejected: 0, confirmed: 0 });
          
          setStats(stats);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'confirmed': return 'status-confirmed';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="status-icon pending" />;
      case 'approved': return <FiCheckCircle className="status-icon approved" />;
      case 'confirmed': return <FiDollarSign className="status-icon confirmed" />;
      case 'rejected': return <FiXCircle className="status-icon rejected" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Student Dashboard</h1>
        <p className="dashboard-welcome">Welcome back, {user?.firstName || 'John'}!</p>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-left-panel">
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <FiFileText className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.total}</h3>
                  <p className="stat-label">Total Applications</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <FiClock className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.pending || 0}</h3>
                  <p className="stat-label">Pending</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <FiCheckCircle className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.approved || 0}</h3>
                  <p className="stat-label">Approved</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-wrapper red">
                  <FiXCircle className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.rejected || 0}</h3>
                  <p className="stat-label">Rejected</p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Profile Completion</h2>
                <Link to="/student/profile" className="btn btn-outline">Update Profile</Link>
              </div>
              
              <div className="profile-completion-card">
                <div className="completion-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <span className="completion-percentage">75% Complete</span>
                </div>
                
                <div className="completion-items">
                  <div className="completion-item completed">
                    <FiCheckCircle className="completion-icon" />
                    <span>Basic Information</span>
                  </div>
                  <div className="completion-item completed">
                    <FiCheckCircle className="completion-icon" />
                    <span>Contact Details</span>
                  </div>
                  <div className="completion-item completed">
                    <FiCheckCircle className="completion-icon" />
                    <span>Education Background</span>
                  </div>
                  <div className="completion-item">
                    <FiInfo className="completion-icon" />
                    <span>Financial Information</span>
                  </div>
                </div>
                
                <div className="completion-note">
                  Complete your profile to improve your chances of receiving scholarships
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-right-panel">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>My Applications</h2>
                <Link to="/scholarships" className="btn btn-primary">Apply for Scholarships</Link>
              </div>
              
              <div className="applications-list">
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven't applied to any scholarships yet.</p>
                    <Link to="/scholarships" className="btn btn-secondary">Browse Scholarships</Link>
                  </div>
                ) : (
                  applications.map(app => (
                    <div key={app.id} className="application-card">
                      <div className="application-header">
                        <h3>{app.scholarshipName}</h3>
                        <div className={`status-badge ${getStatusClass(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </div>
                      </div>
                      
                      <div className="application-details">
                        <div className="detail-item">
                          <span className="detail-label">Amount:</span>
                          <span className="detail-value">${app.amount.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Applied:</span>
                          <span className="detail-value">{formatDate(app.appliedDate)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Institution:</span>
                          <span className="detail-value">{app.institution}</span>
                        </div>
                      </div>
                      
                      {app.status === 'confirmed' && app.donorInfo && (
                        <div className="donor-information">
                          <h4>Donor Information</h4>
                          <p><strong>Donor:</strong> {app.donorInfo.name}</p>
                          <p><strong>Contact:</strong> {app.donorInfo.email}</p>
                          <p><strong>Message:</strong> {app.donorInfo.message}</p>
                          <div className="payment-proof">
                            <h5>Payment Confirmation</h5>
                            <img src={app.donorInfo.paymentProof} alt="Payment Proof" />
                          </div>
                        </div>
                      )}
                      
                      {app.status === 'rejected' && app.rejectionReason && (
                        <div className="rejection-reason">
                          <h4>Reason for Rejection</h4>
                          <p>{app.rejectionReason}</p>
                        </div>
                      )}
                      
                      <div className="application-actions">
                        <Link to={`/student/applications/${app.id}`} className="btn btn-outline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 