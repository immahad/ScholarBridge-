import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiUser, FiDollarSign, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import '../../styles/dashboard.css';

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    confirmed: 0
  });
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [welcomeName, setWelcomeName] = useState('Student');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const userProfileResponse = await axios.get(`/api/students/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userProfileResponse.data.success && userProfileResponse.data.student) {
            setWelcomeName(userProfileResponse.data.student.firstName || 'Student');
          }
        }

        const response = await axios.get('/api/students/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const { applicationStats, recentApplications, profileCompletion } = response.data.data;
          
          setApplications(Array.isArray(recentApplications) ? recentApplications.map(app => ({
            id: app._id,
            scholarshipName: app.scholarshipTitle || 'N/A',
            amount: app.scholarshipAmount || 0,
            status: app.status,
            appliedDate: app.appliedAt,
          })) : []);
          
          setStats({
            total: applicationStats.total || 0,
            pending: applicationStats.pending || 0,
            approved: applicationStats.approved || 0,
            rejected: applicationStats.rejected || 0,
            confirmed: applicationStats.funded || 0
          });
          setProfileCompletionPercentage(profileCompletion || 0);
        } else {
          console.error('Failed to fetch dashboard data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, user?.id]);

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
        <p className="dashboard-welcome">Welcome back, {welcomeName}!</p>
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
                <div className="stat-icon-wrapper purple">
                  <FiDollarSign className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.confirmed || 0}</h3>
                  <p className="stat-label">Funded</p>
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
                    <div className="progress-fill" style={{ width: `${profileCompletionPercentage}%` }}></div>
                  </div>
                  <span className="completion-percentage">{profileCompletionPercentage}% Complete</span>
                </div>
                
                <div className="completion-items">
                  <div className={`completion-item ${profileCompletionPercentage >= 25 ? 'completed' : ''}`}>
                    <FiCheckCircle className="completion-icon" />
                    <span>Basic Information</span>
                  </div>
                  <div className={`completion-item ${profileCompletionPercentage >= 50 ? 'completed' : ''}`}>
                    <FiCheckCircle className="completion-icon" />
                    <span>Contact Details</span>
                  </div>
                  <div className={`completion-item ${profileCompletionPercentage >= 75 ? 'completed' : ''}`}>
                    <FiCheckCircle className="completion-icon" />
                    <span>Education Background</span>
                  </div>
                  <div className={`completion-item ${profileCompletionPercentage === 100 ? 'completed' : ''}`}>
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
                      </div>
                      
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