import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiCheckCircle, 
  FiFileText, 
  FiDollarSign, 
  FiBarChart2, 
  FiPieChart,
  FiTrendingUp,
  FiPlusCircle,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/dashboard.css';
import '../../styles/admin-dashboard.css';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0,
    fundedStudents: 0,
    totalDonors: 0,
    activeDonors: 0,
    totalDonations: 0,
    pendingApprovals: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState({
    months: [],
    students: [],
    donors: []
  });
  const [applicationStatusData, setApplicationStatusData] = useState([]);

  useEffect(() => {
    // Replace mock data with real API call
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const dashboardResponse = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (dashboardResponse.data.success) {
          const data = dashboardResponse.data;
          
          // Set real stats
          setStats({
            totalStudents: data.stats.totalStudents || 0,
            approvedStudents: data.stats.approvedStudents || 0,
            rejectedStudents: data.stats.rejectedStudents || 0,
            fundedStudents: data.stats.fundedStudents || 0,
            totalDonors: data.stats.totalDonors || 0,
            activeDonors: data.stats.activeDonors || 0,
            totalDonations: data.stats.totalDonations || 0,
            pendingApprovals: data.stats.pendingApprovals || 0
          });
          
          // Set recent applications
          setRecentApplications(data.recentApplications || []);
          
          // Set growth data 
          setUserGrowthData({
            months: data.growthData?.months || [],
            students: data.growthData?.students || [],
            donors: data.growthData?.donors || []
          });
          
          // Set application status data
          setApplicationStatusData(data.applicationStatusData || []);
        } else {
          console.error('Failed to fetch dashboard data:', dashboardResponse.data.message);
          // Fallback to sample data if API fails
          setMockData();
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        // Fallback to sample data if API fails
        setMockData();
      } finally {
        setLoading(false);
      }
    };

    const setMockData = () => {
      // Mock statistics - only as fallback
      const mockStats = {
        totalStudents: 350,
        approvedStudents: 245,
        rejectedStudents: 65,
        fundedStudents: 180,
        totalDonors: 120,
        activeDonors: 85,
        totalDonations: 820000,
        pendingApprovals: 40
      };
      
      // Mock recent applications
      const mockApplications = [
        {
          id: 1,
          studentName: 'John Smith',
          scholarshipName: 'Engineering Excellence Scholarship',
          amount: 5000,
          status: 'pending',
          submittedDate: '2023-12-18'
        },
        {
          id: 2,
          studentName: 'Emily Johnson',
          scholarshipName: 'Future Leaders Fund',
          amount: 3500,
          status: 'approved',
          submittedDate: '2023-12-17'
        },
        {
          id: 3,
          studentName: 'Michael Brown',
          scholarshipName: 'STEM Diversity Grant',
          amount: 4000,
          status: 'rejected',
          submittedDate: '2023-12-15',
          reason: 'Incomplete application documentation.'
        },
        {
          id: 4,
          studentName: 'Jessica Williams',
          scholarshipName: 'Academic Achievement Award',
          amount: 2500,
          status: 'funded',
          submittedDate: '2023-12-10',
          donorName: 'The Wilson Foundation'
        },
        {
          id: 5,
          studentName: 'David Lee',
          scholarshipName: 'Community Service Scholarship',
          amount: 3000,
          status: 'pending',
          submittedDate: '2023-12-19'
        }
      ];
      
      // Mock growth data for chart
      const mockGrowthData = {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        students: [25, 35, 45, 65, 90, 120, 140, 170, 210, 250, 310, 350],
        donors: [5, 12, 18, 25, 35, 48, 55, 65, 78, 92, 105, 120]
      };
      
      // Mock pie chart data for application status
      const mockApplicationStatusData = [
        { label: 'Pending Review', value: 40, color: '#f97316' },
        { label: 'Approved', value: 65, color: '#10b981' },
        { label: 'Rejected', value: 65, color: '#ef4444' },
        { label: 'Funded', value: 180, color: '#2563eb' }
      ];
      
      setStats(mockStats);
      setRecentApplications(mockApplications);
      setUserGrowthData(mockGrowthData);
      setApplicationStatusData(mockApplicationStatusData);
    };

    // Call the fetch function
    fetchAdminData();
  }, [token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'funded': return 'status-funded';
      default: return '';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiFileText className="status-icon pending" />;
      case 'approved': return <FiCheckCircle className="status-icon approved" />;
      case 'rejected': return <FiUserX className="status-icon rejected" />;
      case 'funded': return <FiDollarSign className="status-icon funded" />;
      default: return null;
    }
  };

  // Function to generate line chart for user growth
  const generateGrowthChart = () => {
    const maxStudents = Math.max(...userGrowthData.students);
    const maxDonors = Math.max(...userGrowthData.donors);
    const maxValue = Math.max(maxStudents, maxDonors);
    
    // Calculate points for the line paths
    const studentPoints = userGrowthData.students.map((value, index) => {
      const x = (index / (userGrowthData.months.length - 1)) * 100;
      const y = 100 - ((value / maxValue) * 95);
      return `${x},${y}`;
    }).join(' ');
    
    const donorPoints = userGrowthData.donors.map((value, index) => {
      const x = (index / (userGrowthData.months.length - 1)) * 100;
      const y = 100 - ((value / maxValue) * 95);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="growth-chart">
        <h3 className="chart-title">User Growth (2023)</h3>
        <div className="chart-container">
          <svg width="100%" height="300" className="chart" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1="0" y1="99.8" x2="100" y2="99.8" stroke="#e5e7eb" strokeWidth="0.5" />
            
            {/* Students line */}
            <polyline
              points={studentPoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Donors line */}
            <polyline
              points={donorPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Students line markers */}
            {userGrowthData.students.map((value, index) => {
              const x = (index / (userGrowthData.months.length - 1)) * 100;
              const y = 100 - ((value / maxValue) * 95);
              return (
                <circle
                  key={`student-${index}`}
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill="#2563eb"
                />
              );
            })}
            
            {/* Donors line markers */}
            {userGrowthData.donors.map((value, index) => {
              const x = (index / (userGrowthData.months.length - 1)) * 100;
              const y = 100 - ((value / maxValue) * 95);
              return (
                <circle
                  key={`donor-${index}`}
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill="#10b981"
                />
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="x-axis-labels">
            {userGrowthData.months.map((month) => (
              <div key={month} className="axis-label">
                {month}
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2563eb' }}></span>
            <span className="legend-text">Students ({stats.totalStudents})</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            <span className="legend-text">Donors ({stats.totalDonors})</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to generate pie chart for application status
  const generatePieChart = () => {
    const total = applicationStatusData.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;
    
    return (
      <div className="pie-chart-container">
        <h3 className="chart-title">Application Status Distribution</h3>
        <div className="pie-chart">
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#f9fafb" />
            {applicationStatusData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              
              // Calculate start and end points for the arc
              const startAngle = cumulativeAngle;
              const endAngle = startAngle + angle;
              cumulativeAngle = endAngle;
              
              // Convert angles to radians
              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              
              // Calculate points on the circle
              const x1 = 50 + 48 * Math.cos(startAngleRad);
              const y1 = 50 + 48 * Math.sin(startAngleRad);
              const x2 = 50 + 48 * Math.cos(endAngleRad);
              const y2 = 50 + 48 * Math.sin(endAngleRad);
              
              // Determine if the arc should take the long path (> 180 degrees)
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              // Create the path for the arc
              const path = `
                M 50 50
                L ${x1} ${y1}
                A 48 48 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth="0.5"
                >
                  <title>{item.label}: {item.value} applications ({percentage.toFixed(1)}%)</title>
                </path>
              );
            })}
          </svg>
        </div>
        
        <div className="pie-chart-legend">
          {applicationStatusData.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span className="legend-text">{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-welcome">Welcome back, {user?.firstName || 'Admin'}!</p>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <FiUsers className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalStudents}</h3>
                <p className="stat-label">Total Students</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <FiUserCheck className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.approvedStudents}</h3>
                <p className="stat-label">Approved Students</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper purple">
                <FiDollarSign className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalDonors}</h3>
                <p className="stat-label">Total Donors</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper orange">
                <FiFileText className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.pendingApprovals}</h3>
                <p className="stat-label">Pending Approvals</p>
              </div>
            </div>
          </div>

          <div className="dashboard-analytics-grid">
            <div className="dashboard-section chart-section">
              <div className="section-header">
                <h2>User Growth</h2>
                <div className="growth-summary">
                  <div className="growth-item">
                    <FiTrendingUp className="growth-icon students" />
                    <span>+{userGrowthData.students[11] - userGrowthData.students[10]} students last month</span>
                  </div>
                  <div className="growth-item">
                    <FiTrendingUp className="growth-icon donors" />
                    <span>+{userGrowthData.donors[11] - userGrowthData.donors[10]} donors last month</span>
                  </div>
                </div>
              </div>
              
              {generateGrowthChart()}
            </div>
            
            <div className="dashboard-section chart-section">
              <div className="section-header">
                <h2>Application Status</h2>
                <span className="total-applications">{stats.totalStudents} total applications</span>
              </div>
              
              {generatePieChart()}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/admin/manage-scholarships" className="btn btn-primary">
                Manage All Applications
              </Link>
            </div>
            
            <div className="recent-applications">
              <div className="table-responsive">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Scholarship</th>
                      <th>Amount</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map(app => (
                      <tr key={app.id}>
                        <td>{app.studentName}</td>
                        <td>{app.scholarshipName}</td>
                        <td>{formatCurrency(app.amount)}</td>
                        <td>{formatDate(app.submittedDate)}</td>
                        <td>
                          <div className={`status-pill ${getStatusClass(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/admin/applications/${app.id}`} className="action-link">
                              Review
                            </Link>
                            {app.status === 'pending' && (
                              <>
                                <button className="action-button approve">Approve</button>
                                <button className="action-button reject">Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="dashboard-actions-grid">
            <div className="dashboard-action-card">
              <Link to="/admin/users" className="dashboard-action-link">
                <div className="action-icon">
                  <FiUsers size={24} />
                </div>
                <div className="action-content">
                  <h3>Manage Users</h3>
                  <p>View and manage student and donor accounts</p>
                </div>
              </Link>
            </div>

            <div className="dashboard-action-card">
              <Link to="/admin/scholarships" className="dashboard-action-link">
                <div className="action-icon">
                  <FiFileText size={24} />
                </div>
                <div className="action-content">
                  <h3>Manage Scholarships</h3>
                  <p>Review, edit, or create scholarship opportunities</p>
                </div>
              </Link>
            </div>
            
            <div className="dashboard-action-card">
              <Link to="/admin/students" className="dashboard-action-link">
                <div className="action-icon">
                  <FiUserCheck size={24} />
                </div>
                <div className="action-content">
                  <h3>Browse Students</h3>
                  <p>View and manage student applications</p>
                </div>
              </Link>
            </div>

            <div className="dashboard-action-card">
              <Link to="/admin/scholarships/create" className="dashboard-action-link">
                <div className="action-icon">
                  <FiPlusCircle size={24} />
                </div>
                <div className="action-content">
                  <h3>Create Scholarship</h3>
                  <p>Create a new scholarship opportunity</p>
                </div>
              </Link>
            </div>
            
            <div className="dashboard-action-card">
              <Link to="/admin/reports" className="dashboard-action-link">
                <div className="action-icon">
                  <FiBarChart2 size={24} />
                </div>
                <div className="action-content">
                  <h3>Generate Reports</h3>
                  <p>Create detailed system reports and analytics</p>
                </div>
              </Link>
            </div>

            <div className="dashboard-action-card">
              <Link to="/admin/profile" className="dashboard-action-link">
                <div className="action-icon">
                  <FiSettings size={24} />
                </div>
                <div className="action-content">
                  <h3>Profile Settings</h3>
                  <p>Manage your admin account settings</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 