import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiBarChart2, FiFileText, FiCheckCircle, FiArrowRight, FiFilePlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/dashboard.css';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonated: 0,
    studentsHelped: 0,
    activeScholarships: 0,
    pendingStudents: 0
  });
  const [donations, setDonations] = useState([]);
  const [chartData, setChartData] = useState({
    months: [],
    values: []
  });

  useEffect(() => {
    // Mock data - in a real app, this would be an API call
    const fetchDonorData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          // Mock stats
          const mockStats = {
            totalDonated: 32000,
            studentsHelped: 12,
            activeScholarships: 8,
            pendingStudents: 24
          };
          
          // Mock donations
          const mockDonations = [
            {
              id: 1,
              studentName: 'Alex Johnson',
              program: 'Computer Science',
              institution: 'Stanford University',
              amount: 5000,
              date: '2023-12-10',
              status: 'active'
            },
            {
              id: 2,
              studentName: 'Maria Garcia',
              program: 'Mechanical Engineering',
              institution: 'MIT',
              amount: 3500,
              date: '2023-11-15',
              status: 'active'
            },
            {
              id: 3,
              studentName: 'James Wilson',
              program: 'Chemistry',
              institution: 'UC Berkeley',
              amount: 4000,
              date: '2023-10-22',
              status: 'completed'
            },
            {
              id: 4,
              studentName: 'Sarah Chen',
              program: 'Environmental Science',
              institution: 'University of Washington',
              amount: 3000,
              date: '2023-09-05',
              status: 'completed'
            },
            {
              id: 5,
              studentName: 'David Kim',
              program: 'Business Administration',
              institution: 'Harvard University',
              amount: 4500,
              date: '2023-08-18',
              status: 'completed'
            }
          ];
          
          // Mock chart data
          const mockChartData = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [0, 0, 0, 0, 0, 0, 0, 3000, 3000, 4000, 3500, 5000]
          };
          
          setStats(mockStats);
          setDonations(mockDonations);
          setChartData(mockChartData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching donor data:', error);
        setLoading(false);
      }
    };

    fetchDonorData();
  }, []);

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

  // Function to generate a simple SVG bar chart
  const generateChart = () => {
    const maxValue = Math.max(...chartData.values);
    const barWidth = 100 / chartData.months.length;
    
    return (
      <div className="donation-chart">
        <h3 className="chart-title">Donation History</h3>
        <div className="chart-container">
          <svg width="100%" height="200" className="chart">
            {chartData.values.map((value, index) => {
              const barHeight = maxValue > 0 ? (value / maxValue) * 150 : 0;
              return (
                <g key={index} className="bar-group">
                  <rect
                    x={`${index * barWidth}%`}
                    y={200 - barHeight}
                    width={`${barWidth - 5}%`}
                    height={barHeight}
                    className="bar"
                    style={{ fill: `rgba(37, 99, 235, ${0.5 + (value / maxValue) * 0.5})` }}
                  />
                  <text
                    x={`${index * barWidth + barWidth / 2}%`}
                    y="195"
                    className="bar-label"
                  >
                    {chartData.months[index]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color"></span>
            <span className="legend-text">Monthly Donations</span>
          </div>
          <div className="total-donated">
            <strong>Total donated this year:</strong> {formatCurrency(chartData.values.reduce((a, b) => a + b, 0))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Donor Dashboard</h1>
      <p className="dashboard-welcome">Welcome back, {user?.firstName || 'Donor'}!</p>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <FiDollarSign className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{formatCurrency(stats.totalDonated)}</h3>
                <p className="stat-label">Total Donated</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <FiUsers className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.studentsHelped}</h3>
                <p className="stat-label">Students Helped</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper purple">
                <FiCheckCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.activeScholarships}</h3>
                <p className="stat-label">Active Scholarships</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper orange">
                <FiUsers className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.pendingStudents}</h3>
                <p className="stat-label">Pending Students</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Donation Analytics</h2>
              <Link to="/donor/reports" className="btn btn-outline">
                <FiFileText className="btn-icon" /> Generate Report
              </Link>
            </div>
            
            {generateChart()}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Donations</h2>
              <Link to="/donor/students" className="btn btn-primary">
                <FiFilePlus className="btn-icon" /> Donate to More Students
              </Link>
            </div>
            
            <div className="donations-list">
              {donations.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't made any donations yet.</p>
                  <Link to="/donor/students" className="btn btn-secondary">Browse Students</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="donations-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Program</th>
                        <th>Institution</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map(donation => (
                        <tr key={donation.id}>
                          <td>{donation.studentName}</td>
                          <td>{donation.program}</td>
                          <td>{donation.institution}</td>
                          <td>{formatCurrency(donation.amount)}</td>
                          <td>{formatDate(donation.date)}</td>
                          <td>
                            <span className={`status-pill status-${donation.status}`}>
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <Link to={`/donor/donations/${donation.id}`} className="action-link">
                              View <FiArrowRight />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Impact Summary</h2>
            </div>
            
            <div className="impact-summary">
              <div className="impact-card">
                <div className="impact-icon">
                  <FiBarChart2 />
                </div>
                <div className="impact-content">
                  <h3>Your contributions are making a difference</h3>
                  <p>Your generosity has helped {stats.studentsHelped} students pursue their educational dreams. For many of these students, your support has been transformative.</p>
                  <div className="impact-stats">
                    <div className="impact-stat">
                      <span className="stat-number">75%</span>
                      <span className="stat-label">of your supported students are first-generation college students</span>
                    </div>
                    <div className="impact-stat">
                      <span className="stat-number">90%</span>
                      <span className="stat-label">graduation rate for scholarship recipients</span>
                    </div>
                  </div>
                  <Link to="/donor/impact" className="btn btn-outline">View Full Impact Report</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DonorDashboard; 