import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiBarChart2, FiFileText, FiCheckCircle, FiArrowRight, FiFilePlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import '../../styles/dashboard.css';

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonated: 0,
    studentsHelped: 0,
    eligibleStudentsCount: 0,
  });
  const [donations, setDonations] = useState([]);
  const [chartData, setChartData] = useState({
    months: [],
    values: []
  });
  const [welcomeName, setWelcomeName] = useState('Donor');

  useEffect(() => {
    const fetchDonorDashboardData = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const userProfileResponse = await axios.get(`/api/donors/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userProfileResponse.data.success && userProfileResponse.data.donor) {
            setWelcomeName(userProfileResponse.data.donor.firstName || 'Donor');
          }
        }

        const response = await axios.get('/api/donors/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const { donationSummary, recentDonations, monthlyDonations, eligibleStudentsCount } = response.data;
          
          setStats({
            totalDonated: donationSummary?.totalDonated || 0,
            studentsHelped: donationSummary?.studentsHelped || 0,
            eligibleStudentsCount: eligibleStudentsCount || 0,
          });
          
          setDonations(recentDonations.map(d => ({
            id: d._id,
            studentName: `${d.student?.firstName || 'N/A'} ${d.student?.lastName || ''}`.trim(),
            program: d.student?.program || 'N/A',
            institution: d.student?.institution || 'N/A',
            amount: d.amount || 0,
            date: d.donationDate,
            scholarshipName: d.scholarship?.title || 'N/A'
          })));
          
          if (monthlyDonations && monthlyDonations.length > 0) {
            const months = monthlyDonations.map(md => md.month);
            const values = monthlyDonations.map(md => md.amount);
            setChartData({ months, values });
          } else {
            const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const defaultValues = Array(12).fill(0);
            setChartData({ months: defaultMonths, values: defaultValues });
          }

        } else {
          console.error('Failed to fetch donor dashboard data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching donor dashboard data:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDonorDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, user?.id]);

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
      <p className="dashboard-welcome">Welcome back, {welcomeName}!</p>
      
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
              <div className="stat-icon-wrapper orange">
                <FiFileText className="stat-icon" />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.eligibleStudentsCount}</h3>
                <p className="stat-label">Eligible Students</p>
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
                        <th>Scholarship</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map(donation => (
                        <tr key={donation.id}>
                          <td>{donation.studentName}</td>
                          <td>{donation.program}</td>
                          <td>{donation.institution}</td>
                          <td>{donation.scholarshipName}</td>
                          <td>{formatCurrency(donation.amount)}</td>
                          <td>{formatDate(donation.date)}</td>
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
                  <p>Your generosity has helped {stats.studentsHelped} student{stats.studentsHelped === 1 ? '' : 's'} pursue their educational dreams. For many of these students, your support has been transformative.</p>
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