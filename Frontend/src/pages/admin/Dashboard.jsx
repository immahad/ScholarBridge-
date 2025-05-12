import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FiSettings,
  FiCalendar,
  FiEye
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
    approvedApplications: 0,
    totalDonors: 0,
    pendingDonorScholarships: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [pendingScholarships, setPendingScholarships] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState({
    months: [],
    students: [],
    donors: []
  });
  const [applicationStatusData, setApplicationStatusData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard data from real API only
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
            totalStudents: data.stats?.totalStudents || 0,
            approvedApplications: data.stats?.approvedApplicationsCount || 0,
            totalDonors: data.stats?.totalDonors || 0,
            pendingDonorScholarships: data.stats?.pendingDonorScholarships || 0
          });
          
          // Debug growth chart data
          console.log('Growth chart data from backend:', data.growthChartData);
          
          // Set growth data with proper validation
          const monthData = data.growthChartData?.map(item => item.month) || [];
          const studentData = data.growthChartData?.map(item => typeof item.students === 'number' ? item.students : 0) || [];
          const donorData = data.growthChartData?.map(item => typeof item.donors === 'number' ? item.donors : 0) || [];
          
          setUserGrowthData({
            months: monthData,
            students: studentData,
            donors: donorData
          });
          
          console.log('Processed growth data:', {
            months: monthData,
            students: studentData,
            donors: donorData
          });
          
          // Set application status data
          setApplicationStatusData(data.applicationStatusData || []);
          
          // Set recent applications
          setRecentApplications(data.recentApplications || []);
           console.log('Recent applications from backend:', data.recentApplications);
          
          // Check if we have pending applications
          const hasPending = data.recentApplications?.some(app => app.status === 'pending') || false;
          console.log('Has pending applications:', hasPending);
          
          // Set all donor scholarships
          setPendingScholarships(data.donorScholarships || []);
        } else {
          console.error('Failed to fetch dashboard data:', dashboardResponse.data.message);
          setStats({
            totalStudents: 0,
            approvedApplications: 0,
            totalDonors: 0,
            pendingDonorScholarships: 0
          });
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setStats({
          totalStudents: 0,
          approvedApplications: 0,
          totalDonors: 0,
          pendingDonorScholarships: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'N/A';
    }
  };
  
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
  
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch (status) {
      case 'pending': return 'status-pending';
      case 'pending_approval': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'active': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'funded': return 'status-funded';
      default: return '';
    }
  };
  
  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch (status) {
      case 'pending': return <FiFileText className="status-icon pending" />;
      case 'pending_approval': return <FiFileText className="status-icon pending" />;
      case 'approved': return <FiCheckCircle className="status-icon approved" />;
      case 'active': return <FiCheckCircle className="status-icon approved" />;
      case 'rejected': return <FiUserX className="status-icon rejected" />;
      case 'funded': return <FiDollarSign className="status-icon funded" />;
      default: return null;
    }
  };

  const generateGrowthChart = () => {
    if (!userGrowthData.months || userGrowthData.months.length === 0) {
      return (
        <div className="no-data-message">
          <div className="flex flex-col items-center justify-center p-4">
            <FiBarChart2 className="text-gray-400 text-4xl mb-2" />
            <p className="text-gray-500">No user growth data available</p>
            <p className="text-sm text-gray-400">Check back later for statistics</p>
          </div>
        </div>
      );
    }

    // Ensure we have non-zero values for scaling - add a small value if all are zero
    const studentMax = Math.max(...userGrowthData.students);
    const donorMax = Math.max(...userGrowthData.donors);
    
    // Use a minimum scale value to ensure dots are visible even with small values
    const maxValue = Math.max(studentMax, donorMax, 1);

    return (
      <div className="growth-chart">
        <div className="chart-container">
          <svg width="100%" height="250" className="line-chart">
            <g className="grid-lines">
              {/* Generate horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line 
                  key={i} 
                  x1="0" 
                  y1={50 * i} 
                  x2="100%" 
                  y2={50 * i} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
              ))}
            </g>
            
            {/* Draw donor line FIRST (below student line) */}
            <path 
              d={generateLinePath(userGrowthData.donors, 200, maxValue)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Draw donor data points */}
            {userGrowthData.donors.map((value, index) => (
              <circle 
                key={`donor-${index}`}
                cx={`${index * (100 / (userGrowthData.months.length - 1))}%`}
                cy={200 - (value / maxValue * 180)}
                r="4"
                fill="#10b981"
              />
            ))}
            
            {/* Then draw student line LAST (on top of donor line) */}
            <path 
              d={generateLinePath(userGrowthData.students, 200, maxValue)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Draw student data points last (on top) */}
            {userGrowthData.students.map((value, index) => (
              <circle 
                key={`student-${index}`}
                cx={`${index * (100 / (userGrowthData.months.length - 1))}%`}
                cy={200 - (value / maxValue * 180)}
                r="4"
                fill="#3b82f6"
              />
            ))}
            
            {/* X-axis labels (months) */}
            {userGrowthData.months.map((month, index) => (
              <text 
                key={`month-${index}`}
                x={`${index * (100 / (userGrowthData.months.length - 1))}%`}
                y="225"
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {month}
              </text>
            ))}
          </svg>
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
            <span>Students</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            <span>Donors</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to generate the SVG path for the line chart
  const generateLinePath = (data, height, maxValue) => {
    if (!data || data.length === 0) return '';
    
    return data.map((value, index) => {
      const x = `${index * (100 / (data.length - 1))}%`;
      const y = height - (value / maxValue * 180);
      return (index === 0 ? 'M' : 'L') + `${x},${y}`;
    }).join(' ');
  };
  
  const generatePieChart = () => {
    if (!applicationStatusData || applicationStatusData.length === 0) {
      return <div className="no-data-message">No application data available</div>;
    }

    const total = applicationStatusData.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];
    
    // Calculate the pie segments
    let startAngle = 0;
    const segments = applicationStatusData.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Calculate coordinates
      const startX = 100 + Math.cos((startAngle - 90) * Math.PI / 180) * 80;
      const startY = 100 + Math.sin((startAngle - 90) * Math.PI / 180) * 80;
      const endAngle = startAngle + angle;
      const endX = 100 + Math.cos((endAngle - 90) * Math.PI / 180) * 80;
      const endY = 100 + Math.sin((endAngle - 90) * Math.PI / 180) * 80;
      
      // Calculate label position
      const labelAngle = startAngle + angle / 2;
      const labelRadius = 60;
      const labelX = 100 + Math.cos((labelAngle - 90) * Math.PI / 180) * labelRadius;
      const labelY = 100 + Math.sin((labelAngle - 90) * Math.PI / 180) * labelRadius;
      
      const path = `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
      
      const segment = {
        path,
        color: colors[index % colors.length],
        label: item.name,
        value: item.value,
        percentage,
        labelX,
        labelY
      };
      
      startAngle += angle;
      return segment;
    });

    return (
      <div className="pie-chart">
        <svg width="100%" height="200" viewBox="0 0 200 200">
          {segments.map((segment, index) => (
            <g key={index}>
              <path 
                d={segment.path} 
                fill={segment.color} 
                stroke="#fff" 
                strokeWidth="1"
              />
              {segment.percentage > 0.05 && (
                <text 
                  x={segment.labelX} 
                  y={segment.labelY} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#fff"
                >
                  {`${Math.round(segment.percentage * 100)}%`}
                </text>
              )}
            </g>
          ))}
        </svg>
        
        <div className="pie-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: segment.color }}></span>
              <span>{segment.label} ({segment.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Update the navigate function to validate application IDs first
  const handleViewDetails = (appId) => {
    // Check if we have a valid MongoDB ID (typically 24 hex chars)
    if (!appId || typeof appId !== 'string' || appId.startsWith('app-') || appId.startsWith('mock-')) {
      // For invalid IDs, show a message and don't navigate
      alert("Cannot view details for this application. It may be invalid or sample data.");
      return;
    }
    // Navigate to the application details
    navigate(`/admin/applications/${appId}`);
  };

  // Function to handle viewing scholarship details
  const handleViewScholarship = (scholarshipId) => {
    // Check if we have a valid MongoDB ID
    if (!scholarshipId || typeof scholarshipId !== 'string') {
      alert("Cannot view details for this scholarship. It may be invalid data.");
      return;
    }
    // Navigate to the scholarship details view
    navigate(`/admin/scholarships/view/${scholarshipId}`);
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
                <h3 className="stat-value">{stats.approvedApplications}</h3>
                <p className="stat-label">Approved Applications</p>
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
                <h3 className="stat-value">{stats.pendingDonorScholarships}</h3>
                <p className="stat-label">Pending Donor Scholarships</p>
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
                    <span>{(() => {
                      let growth = 0;
                      let current = 0;
                      let previous = 0;
                      
                      if (userGrowthData.students && userGrowthData.students.length >= 2) {
                        current = userGrowthData.students[userGrowthData.students.length - 1];
                        previous = userGrowthData.students[userGrowthData.students.length - 2];
                        growth = current - previous;
                      } else if (userGrowthData.students && userGrowthData.students.length === 1) {
                        growth = userGrowthData.students[0];
                        current = growth;
                      }
                      
                      const sign = growth >= 0 ? '+' : '';
                      return `${sign}${growth} students last month (${stats.totalStudents} total)`;
                    })()}</span>
                  </div>
                  <div className="growth-item">
                    <FiTrendingUp className="growth-icon donors" />
                    <span>{(() => {
                      let growth = 0;
                      let current = 0;
                      let previous = 0;
                      
                      if (userGrowthData.donors && userGrowthData.donors.length >= 2) {
                        current = userGrowthData.donors[userGrowthData.donors.length - 1];
                        previous = userGrowthData.donors[userGrowthData.donors.length - 2];
                        growth = current - previous;
                      } else if (userGrowthData.donors && userGrowthData.donors.length === 1) {
                        growth = userGrowthData.donors[0];
                        current = growth;
                      }
                      
                      const sign = growth >= 0 ? '+' : '';
                      return `${sign}${growth} donors last month (${stats.totalDonors} total)`;
                    })()}</span>
                  </div>
                </div>
              </div>
              
              {generateGrowthChart()}
            </div>
            
            <div className="dashboard-section chart-section">
              <div className="section-header">
                <h2>Application Status</h2>
                <span className="total-applications">
                  {(() => {
                    // Calculate total from actual stats instead of pie chart data which might be incomplete
                    const total = (stats.pendingApplicationsCount || 0) + 
                                  (stats.approvedApplicationsCount || 0) + 
                                  (stats.rejectedApplicationsCount || 0);
                    return total;
                  })()} total applications
                </span>
              </div>
              
              {generatePieChart()}
            </div>
          </div>

          {/* Pending Scholarships Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Donor Scholarships</h2>
              <Link to="/admin/donor-scholarships" className="btn btn-primary">
                Manage All Donor Scholarships
              </Link>
            </div>
            
            <div className="recent-applications">
              <div className="table-responsive">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Created By</th>
                      <th>Amount</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingScholarships.map((scholarship, index) => (
                      <tr key={`${scholarship._id || ''}-${index}`}>
                        <td>{scholarship.title || 'N/A'}</td>
                        <td>{scholarship.createdBy ? (scholarship.createdBy.organizationName || `${scholarship.createdBy.name || `${scholarship.createdBy.firstName || ''} ${scholarship.createdBy.lastName || ''}`}`) : 'Unknown'}</td>
                        <td>{formatCurrency(scholarship.amount)}</td>
                        <td>{formatDate(scholarship.deadlineDate)}</td>
                        <td>
                          <div className={`status-pill ${getStatusClass(scholarship.status)}`}>
                            {getStatusIcon(scholarship.status)}
                            <span>{scholarship.status === 'pending_approval' ? 'Pending Review' : 
                                   scholarship.status === 'active' ? 'Approved' : 
                                   scholarship.status === 'rejected' ? 'Rejected' : 
                                   scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleViewScholarship(scholarship._id)}
                              className="action-link"
                            >
                              <FiEye className="mr-1" /> View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingScholarships.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <div className="empty-state">
                            <FiFileText size={24} className="empty-icon" />
                            <p>No donor scholarships found</p>
                            <Link to="/admin/donor-scholarships/create" className="action-link">Create New Scholarship</Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/admin/applications" className="btn btn-primary">
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
                    {recentApplications.map((app, index) => (
                      <tr key={`${app._id || ''}-${index}`}>
                        <td>{`${app.firstName || ''} ${app.lastName || ''}`}</td>
                        <td>{app.scholarshipTitle || 'N/A'}</td>
                        <td>{formatCurrency(app.scholarshipAmount)}</td>
                        <td>{formatDate(app.applicationDate)}</td>
                        <td>
                          <div className={`status-pill ${getStatusClass(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span>{app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleViewDetails(app.applicationId)}
                              className="action-link"
                            >
                              <FiEye className="mr-1" /> View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentApplications.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <div className="empty-state">
                            <FiFileText size={24} className="empty-icon" />
                            <p>No recent applications found</p>
                            <p className="empty-description">Applications will appear here when students apply for scholarships</p>
                          </div>
                        </td>
                      </tr>
                    )}
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

            <div className="col-span-1">
              <Link to="/admin/donor-scholarships" className="quick-action-card">
                <div className="icon-container bg-amber-100 text-amber-600">
                  <FiFileText size={24} />
                </div>
                <div className="card-content">
                  <h3>Donor Scholarships</h3>
                  <p className="count">{stats.pendingDonorScholarships}</p>
                  <p className="action">Review Now</p>
                </div>
              </Link>
            </div>
            
            <div className="col-span-1">
              <Link to="/admin/applications" className="quick-action-card">
                <div className="icon-container bg-blue-100 text-blue-600">
                  <FiFileText size={24} />
                </div>
                <div className="card-content">
                  <h3>Pending Applications</h3>
                  <p className="count">{stats.pendingApplicationsCount || 0}</p>
                  <p className="action">Review Now</p>
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