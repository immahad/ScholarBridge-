import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/reports.css'; // We'll create this CSS file later
import { FiCalendar, FiUsers, FiDollarSign, FiFileText, FiDownload } from 'react-icons/fi';

const DonorReports = () => {
  const { token, user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    startDate: '',
    endDate: '',
    includeStudentDetails: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchReport = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await axios.post('/api/donors/reports', params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReportData(response.data.report);
      } else {
        setError(response.data.message || 'Failed to generate report.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while generating the report.');
      console.error("Error generating report:", err);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Handle initial report generation if needed or leave it to user trigger
  // useEffect(() => {
  //   fetchReport(); // Example: Fetch report on load with default/empty params
  // }, [token]); // Careful with dependencies if auto-fetching

  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>My Impact Report</h1>
        <p>Review your donation history and the impact you've made.</p>
      </div>

      <div className="report-params-section card">
        <h2>Generate Report</h2>
        <div className="param-group">
          <label htmlFor="startDate">Start Date:</label>
          <input type="date" id="startDate" name="startDate" value={params.startDate} onChange={handleInputChange} />
        </div>
        <div className="param-group">
          <label htmlFor="endDate">End Date:</label>
          <input type="date" id="endDate" name="endDate" value={params.endDate} onChange={handleInputChange} />
        </div>
        <div className="param-group checkbox-group">
          <input type="checkbox" id="includeStudentDetails" name="includeStudentDetails" checked={params.includeStudentDetails} onChange={handleInputChange} />
          <label htmlFor="includeStudentDetails">Include Student Details</label>
        </div>
        <button onClick={fetchReport} disabled={loading} className="btn btn-primary">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <div className="error-message card">Error: {error}</div>}

      {reportData && (
        <div className="report-display-section card">
          <div className="report-header">
            <h2>Report Results</h2>
            {/* <button className="btn btn-outline"><FiDownload /> Download PDF</button> */}
          </div>

          <div className="report-summary">
            <h3>Summary</h3>
            <p><strong>Report Period:</strong> {formatDate(reportData.summary.startDate)} - {formatDate(reportData.summary.endDate)}</p>
            <p><strong><FiFileText /> Total Donations:</strong> {reportData.summary.totalDonations}</p>
            <p><strong><FiDollarSign /> Total Amount Donated:</strong> {formatCurrency(reportData.summary.totalAmount)}</p>
            <p><strong>Report Generated:</strong> {formatDate(reportData.summary.generatedAt)}</p>
            {reportData.donor && (
              <p><strong>For Donor:</strong> {reportData.donor.firstName} {reportData.donor.lastName} {reportData.donor.organizationName ? `(${reportData.donor.organizationName})` : ''}</p>
            )}
          </div>

          <div className="report-donations-list">
            <h3>Donation Details</h3>
            {reportData.donations.length === 0 ? (
              <p>No donations found for the selected criteria.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Scholarship</th>
                    {params.includeStudentDetails && <th>Student</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.donations.map(donation => (
                    <tr key={donation._id}>
                      <td>{formatDate(donation.donationDate)}</td>
                      <td>{formatCurrency(donation.amount)}</td>
                      <td>{donation.scholarship?.title || 'N/A'}</td>
                      {params.includeStudentDetails && (
                        <td>
                          {donation.student ? 
                           `${donation.student.firstName} ${donation.student.lastName} (${donation.student.institution} - ${donation.student.program})` :
                           'Details N/A'}
                        </td>
                      )}
                      <td>{donation.status || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorReports; 