import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiBarChart2, FiFileText, FiCheckCircle, FiArrowRight, FiFilePlus, FiPlusCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  const [scholarships, setScholarships] = useState({
    pending: [],
    active: [],
    rejected: []
  });
  const [chartData, setChartData] = useState({
    months: [],
    values: []
  });
  const [welcomeName, setWelcomeName] = useState('Donor');
  const statsRef = useRef(null);
  const donationChartRef = useRef(null);
  const recentDonationsTableRef = useRef(null);

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

    const fetchDonorScholarships = async () => {
      try {
        const response = await axios.get('/api/scholarships/donor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setScholarships(response.data.scholarships);
        } else {
          console.error('Failed to fetch donor scholarships:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching donor scholarships:', error.response ? error.response.data : error.message);
      }
    };

    if (token) {
      fetchDonorDashboardData();
      fetchDonorScholarships();
    } else {
      setLoading(false);
    }
  }, [token, user?.id]);

  const addImageToPdf = async (pdf, elementRef, yPos) => {
    if (!elementRef.current) return yPos;
    const canvas = await html2canvas(elementRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY
    });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    const ratio = imgWidth / imgHeight;
    let newImgWidth = pdfWidth - 20;
    let newImgHeight = newImgWidth / ratio;

    if (yPos + newImgHeight > pdf.internal.pageSize.getHeight() - 10 && yPos > 20) {
      pdf.addPage();
      yPos = 15;
    }

    pdf.addImage(imgData, 'PNG', 10, yPos, newImgWidth, newImgHeight);
    return yPos + newImgHeight + 10;
  };

  const handleGenerateDashboardPdf = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      let yPos = 15;

      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.text(`Report Generated: ${currentDate}`, pdf.internal.pageSize.getWidth() - 10, 10, { align: 'right' });
      pdf.setFontSize(18);
      pdf.text('Donor Report', pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 10;

      if (statsRef.current) {
        pdf.setFontSize(14);
        pdf.text('Summary Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, statsRef, yPos);
      }
      
      if (donationChartRef.current) {
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() -10) { pdf.addPage(); yPos = 15; }
        pdf.text('Donation History', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, donationChartRef, yPos);
      }

      pdf.setFontSize(14);
      if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
      pdf.text('Recent Donations', 10, yPos);
      yPos += 7;

      if (donations.length === 0) {
        pdf.setFontSize(12);
        pdf.text('No donations yet.', 10, yPos);
        yPos += 10;
      } else if (recentDonationsTableRef.current) {
        yPos = await addImageToPdf(pdf, recentDonationsTableRef, yPos);
      }

      let donorNameForFile = 'Donor';
      if (user) {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
          donorNameForFile = fullName.replace(/\s+/g, '_');
        }
      }
      
      pdf.save(`ScholarBridge-${donorNameForFile}-Donor-Report.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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
      case 'pending_approval': return 'status-pending';
      case 'active': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval': return <FiClock className="status-icon pending" />;
      case 'active': return <FiCheckCircle className="status-icon approved" />;
      case 'rejected': return <FiXCircle className="status-icon rejected" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'active': return 'Active';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const generateChart = () => {
    const maxValue = Math.max(...chartData.values);
    const barWidth = 100 / chartData.months.length;
    
    return (
      <div className="donation-chart-content">
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

  // Get all scholarships combined for display
  const allScholarships = [
    ...scholarships.active.map(s => ({ ...s, statusLabel: 'Active' })),
    ...scholarships.pending.map(s => ({ ...s, statusLabel: 'Pending Approval' })),
    ...scholarships.rejected.map(s => ({ ...s, statusLabel: 'Rejected' }))
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Donor Dashboard</h1>
      <p className="dashboard-welcome">Welcome back, {welcomeName}!</p>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="dashboard-stats" ref={statsRef}>
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

          {/* My Scholarships Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Scholarships</h2>
              <Link to="/donor/scholarships/create" className="btn btn-primary">
                <FiPlusCircle className="btn-icon" /> Create New Scholarship
              </Link>
            </div>
            
            <div className="scholarships-list">
              {allScholarships.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't created any scholarships yet.</p>
                  <Link to="/donor/scholarships/create" className="btn btn-secondary">Create Your First Scholarship</Link>
                </div>
              ) : (
                <div className="scholarship-cards">
                  {allScholarships.slice(0, 4).map(scholarship => (
                    <div key={scholarship._id} className="application-card">
                      <div className="application-header">
                        <h3>{scholarship.title}</h3>
                        <div className={`status-badge ${getStatusClass(scholarship.status)}`}>
                          {getStatusIcon(scholarship.status)}
                          <span>{getStatusLabel(scholarship.status)}</span>
                        </div>
                      </div>
                      
                      <div className="application-details">
                        <div className="detail-item">
                          <span className="detail-label">Amount:</span>
                          <span className="detail-value">${scholarship.amount.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Deadline:</span>
                          <span className="detail-value">{formatDate(scholarship.deadlineDate)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Applicants:</span>
                          <span className="detail-value">{scholarship.applicantCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="application-actions">
                        <Link to={`/donor/scholarships/${scholarship._id}`} className="btn btn-outline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {allScholarships.length > 4 && (
                <div className="view-all-link">
                  <Link to="/donor/scholarships" className="btn btn-link">
                    View All Scholarships <FiArrowRight className="icon-right" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Donation Analytics</h2>
              <button onClick={handleGenerateDashboardPdf} className="btn btn-outline">
                <FiFileText className="btn-icon" /> Generate Report (PDF)
              </button>
            </div>
            <div ref={donationChartRef}>
              {generateChart()}
            </div>
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
                <div className="table-responsive" ref={recentDonationsTableRef}>
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
        </>
      )}
    </div>
  );
};

export default DonorDashboard; 