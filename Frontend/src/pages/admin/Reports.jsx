import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FiDownload, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiPieChart,
  FiBarChart2, 
  FiCalendar,
} from 'react-icons/fi';
import {
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C'];

const AdminReports = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      console.log('Generating report with params:', {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await axios.post('/api/admin/reports', {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Report API response:', response.data);

      if (response.data.success) {
        const responseData = response.data.report;
        if (!responseData) {
          throw new Error('No report data returned from server');
        }
        setReportData(responseData);
      } else {
        throw new Error(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    // Format report data as JSON
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Report sections refs for PDF generation
  const reportHeaderRef = useRef(null);
  const statsSummaryRef = useRef(null);
  const userStatsRef = useRef(null);
  const scholarshipStatsRef = useRef(null);
  const donationStatsRef = useRef(null);
  const applicationStatsRef = useRef(null);

  // Chart refs for PDF capture
  const userChartRef = useRef(null);
  const scholarshipChartRef = useRef(null);
  const donationChartRef = useRef(null);
  const applicationChartRef = useRef(null);

  const addImageToPdf = async (pdf, elementRef, yPos) => {
    if (!elementRef.current) return yPos;
    try {
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollY: -window.scrollY,
        removeContainer: true
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
    } catch (error) {
      console.error('Error capturing section:', error);
      return yPos + 10;
    }
  };

  const generatePDF = async () => {
    if (!reportData) return;
    
    try {
      console.log('Starting PDF generation');
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
      
      const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      pdf.text(reportTitle, pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 10;

      pdf.setFontSize(12);
      pdf.text(`Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 
        pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 10;

      // Report period section
      if (reportHeaderRef.current) {
        console.log('Adding header section to PDF');
        yPos = await addImageToPdf(pdf, reportHeaderRef, yPos);
      }
      
      // Stats summary section
      if (statsSummaryRef.current) {
        console.log('Adding summary section to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Summary Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, statsSummaryRef, yPos);
      }
      
      // User statistics section
      if ((reportType === 'comprehensive' || reportType === 'users') && userStatsRef.current) {
        console.log('Adding user stats to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('User Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, userStatsRef, yPos);
      }
      
      // User chart section
      if ((reportType === 'comprehensive' || reportType === 'users') && userChartRef.current) {
        console.log('Adding user charts to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('User Distribution Charts', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, userChartRef, yPos);
      }

      // Scholarship statistics section
      if ((reportType === 'comprehensive' || reportType === 'scholarships') && scholarshipStatsRef.current) {
        console.log('Adding scholarship stats to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Scholarship Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, scholarshipStatsRef, yPos);
      }

      // Scholarship chart section
      if ((reportType === 'comprehensive' || reportType === 'scholarships') && scholarshipChartRef.current) {
        console.log('Adding scholarship charts to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Scholarship Distribution Charts', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, scholarshipChartRef, yPos);
      }
      
      // Donation statistics section
      if ((reportType === 'comprehensive' || reportType === 'donations') && donationStatsRef.current) {
        console.log('Adding donation stats to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Donation Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, donationStatsRef, yPos);
      }

      // Donation chart section
      if ((reportType === 'comprehensive' || reportType === 'donations') && donationChartRef.current) {
        console.log('Adding donation charts to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Donation Trends', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, donationChartRef, yPos);
      }
      
      // Application statistics section
      if ((reportType === 'comprehensive' || reportType === 'applications') && applicationStatsRef.current) {
        console.log('Adding application stats to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Application Statistics', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, applicationStatsRef, yPos);
      }

      // Application chart section
      if ((reportType === 'comprehensive' || reportType === 'applications') && applicationChartRef.current) {
        console.log('Adding application charts to PDF');
        pdf.setFontSize(14);
        if (yPos + 10 > pdf.internal.pageSize.getHeight() - 10) { pdf.addPage(); yPos = 15; }
        pdf.text('Application Distribution', 10, yPos);
        yPos += 7;
        yPos = await addImageToPdf(pdf, applicationChartRef, yPos);
      }
      
      console.log('Saving PDF');
      pdf.save(`ScholarBridge-${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Helper functions to prepare chart data
  const prepareUserRoleChartData = (data) => {
    if (!data?.summary?.usersByRole) return [];
    return data.summary.usersByRole.map(item => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
      value: item.count
    }));
  };

  const prepareUserGrowthChartData = (data) => {
    if (!data?.details?.monthlyGrowth) return [];
    return data.details.monthlyGrowth.map(item => ({
      name: `${item.year}-${item.month}`,
      Students: item.student || 0,
      Donors: item.donor || 0,
      Admins: item.admin || 0
    }));
  };

  const prepareScholarshipStatusData = (data) => {
    if (!data?.summary?.statusDistribution) return [];
    return data.summary.statusDistribution.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count
    }));
  };

  const prepareScholarshipCategoryData = (data) => {
    if (!data?.summary?.categoryDistribution) return [];
    return data.summary.categoryDistribution.map(item => ({
      name: item.category || 'Uncategorized',
      value: item.count
    }));
  };

  const prepareDonationMonthlyData = (data) => {
    if (!data?.summary?.monthlyTotals) return [];
    return data.summary.monthlyTotals.map(item => ({
      name: `${item.month}/${item.year}`,
      amount: item.total || 0,
      count: item.count || 0
    }));
  };

  const prepareApplicationStatusData = (data) => {
    if (!data?.summary?.statusDistribution) return [];
    return data.summary.statusDistribution.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count
    }));
  };

  // Custom pie chart label component
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="admin-reports-container p-4">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Generate Reports</h1>
        <p className="text-gray-600">Create detailed reports for system analytics and insights</p>
      </div>

      <div className="report-generator bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="reportType" className="block text-gray-700 mb-1">Report Type</label>
            <select 
              id="reportType" 
              value={reportType}
              onChange={handleReportTypeChange}
              className="w-full p-2 border rounded"
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="users">User Statistics</option>
              <option value="scholarships">Scholarship Statistics</option>
              <option value="donations">Donation Statistics</option>
              <option value="applications">Application Statistics</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label htmlFor="startDate" className="block text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input 
                  type="date" 
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate" className="block text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input 
                  type="date" 
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={generateReport}
            disabled={loading}
            className={`px-4 py-2 rounded text-white flex items-center ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {reportData && (
        <>
          <div className="report-actions bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">Report Results</h2>
            <div className="flex gap-2">
              <button 
                onClick={downloadReport}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 flex items-center"
              >
                <FiDownload className="mr-2" /> Download JSON
              </button>
              <button 
                onClick={generatePDF}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center"
              >
                <FiDownload className="mr-2" /> Download PDF
              </button>
            </div>
          </div>

          <div className="report-content">
            {/* Report Header/Period Information */}
            <div ref={reportHeaderRef} className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Report Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Report Type:</span> {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                  <p><span className="font-medium">Period:</span> {formatDate(reportData.period?.startDate)} - {formatDate(reportData.period?.endDate)}</p>
                </div>
                <div>
                  <p><span className="font-medium">Generated On:</span> {formatDate(reportData.generatedAt)}</p>
                </div>
              </div>
            </div>
            
            {/* Summary Statistics */}
            <div ref={statsSummaryRef} className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiUsers className="text-blue-500 mr-2 text-xl" />
                    <h4 className="font-medium">Total Users</h4>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(reportData.summary?.totalUsers || 0)}</p>
                </div>
                
                <div className="stat-card bg-green-50 border border-green-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiFileText className="text-green-500 mr-2 text-xl" />
                    <h4 className="font-medium">Scholarships</h4>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(reportData.summary?.totalScholarships || 0)}</p>
                </div>
                
                <div className="stat-card bg-purple-50 border border-purple-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiPieChart className="text-purple-500 mr-2 text-xl" />
                    <h4 className="font-medium">Applications</h4>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(reportData.summary?.totalApplications || 0)}</p>
                </div>
                
                <div className="stat-card bg-amber-50 border border-amber-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiDollarSign className="text-amber-500 mr-2 text-xl" />
                    <h4 className="font-medium">Donations</h4>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalDonationAmount || 0)}</p>
                </div>
              </div>
            </div>
            
            {/* User Statistics */}
            {(reportType === 'comprehensive' || reportType === 'users') && reportData.users && (
              <>
                <div ref={userStatsRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
                  
                  <div className="mb-5">
                    <h4 className="font-medium text-md mb-3">User Distribution</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Total Count</th>
                            <th className="px-4 py-2 text-left">Active Users</th>
                            <th className="px-4 py-2 text-left">Verified Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.users?.summary?.usersByRole?.map((role, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{role.role.charAt(0).toUpperCase() + role.role.slice(1)}</td>
                              <td className="px-4 py-2">{formatNumber(role.count)}</td>
                              <td className="px-4 py-2">{formatNumber(role.active)}</td>
                              <td className="px-4 py-2">{formatNumber(role.verified)}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="4" className="px-4 py-2 text-center">No user data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-md mb-3">New Users (This Period)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">New Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.users?.summary?.newUsers?.map((role, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{role.role.charAt(0).toUpperCase() + role.role.slice(1)}</td>
                              <td className="px-4 py-2">{formatNumber(role.count)}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="2" className="px-4 py-2 text-center">No new user data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div ref={userChartRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">User Visualizations</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User role distribution pie chart */}
                    <div className="chart-container">
                      <h4 className="font-medium text-md mb-3 text-center">User Distribution by Role</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareUserRoleChartData(reportData.users)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareUserRoleChartData(reportData.users).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* User growth line chart */}
                    <div className="chart-container">
                      <h4 className="font-medium text-md mb-3 text-center">Monthly User Growth</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prepareUserGrowthChartData(reportData.users)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="Students" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Donors" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="Admins" stroke="#ffc658" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Scholarship Statistics */}
            {(reportType === 'comprehensive' || reportType === 'scholarships') && reportData.scholarships && (
              <>
                <div ref={scholarshipStatsRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Scholarship Statistics</h3>
                  
                  <div className="mb-5">
                    <h4 className="font-medium text-md mb-3">Scholarship Status Distribution</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.scholarships?.summary?.statusDistribution?.map((status, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</td>
                              <td className="px-4 py-2">{formatNumber(status.count)}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="2" className="px-4 py-2 text-center">No scholarship status data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {reportData.scholarships?.summary?.categoryDistribution && (
                    <div>
                      <h4 className="font-medium text-md mb-3">Scholarship Categories</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Category</th>
                              <th className="px-4 py-2 text-left">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.scholarships.summary.categoryDistribution.map((category, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">{category.category || 'Uncategorized'}</td>
                                <td className="px-4 py-2">{formatNumber(category.count)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={scholarshipChartRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Scholarship Visualizations</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scholarship status pie chart */}
                    <div className="chart-container">
                      <h4 className="font-medium text-md mb-3 text-center">Scholarships by Status</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareScholarshipStatusData(reportData.scholarships)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareScholarshipStatusData(reportData.scholarships).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Scholarship category bar chart */}
                    <div className="chart-container">
                      <h4 className="font-medium text-md mb-3 text-center">Scholarships by Category</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareScholarshipCategoryData(reportData.scholarships)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Legend />
                            <Bar dataKey="value" name="Count" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Donation Statistics */}
            {(reportType === 'comprehensive' || reportType === 'donations') && reportData.donations && (
              <>
                <div ref={donationStatsRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Donation Statistics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="stat-card bg-green-50 border border-green-100 p-4 rounded-lg">
                      <h4 className="font-medium mb-1">Total Donations</h4>
                      <p className="text-2xl font-bold">{formatNumber(reportData.donations?.summary?.totalDonations || 0)}</p>
                    </div>
                    
                    <div className="stat-card bg-amber-50 border border-amber-100 p-4 rounded-lg">
                      <h4 className="font-medium mb-1">Total Amount</h4>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.donations?.summary?.totalAmount || 0)}</p>
                    </div>
                  </div>
                  
                  {reportData.donations?.summary?.monthlyTotals && (
                    <div>
                      <h4 className="font-medium text-md mb-3">Monthly Donation Totals</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Month</th>
                              <th className="px-4 py-2 text-left">Year</th>
                              <th className="px-4 py-2 text-left">Donations</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.donations.summary.monthlyTotals.map((month, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">{month.month}</td>
                                <td className="px-4 py-2">{month.year}</td>
                                <td className="px-4 py-2">{formatNumber(month.count)}</td>
                                <td className="px-4 py-2">{formatCurrency(month.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={donationChartRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Donation Visualizations</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-md mb-3 text-center">Monthly Donation Trends</h4>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={prepareDonationMonthlyData(reportData.donations)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === 'amount') return formatCurrency(value);
                              return formatNumber(value);
                            }} 
                          />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="amount" name="Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="count" name="Count" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Application Statistics */}
            {(reportType === 'comprehensive' || reportType === 'applications') && reportData.applications && (
              <>
                <div ref={applicationStatsRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Application Statistics</h3>
                  
                  <div className="mb-5">
                    <h4 className="font-medium text-md mb-3">Application Status Distribution</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.applications?.summary?.statusDistribution?.map((status, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</td>
                              <td className="px-4 py-2">{formatNumber(status.count)}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan="2" className="px-4 py-2 text-center">No application status data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {reportData.applications?.summary?.monthlyTotals && (
                    <div>
                      <h4 className="font-medium text-md mb-3">Monthly Application Totals</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Month</th>
                              <th className="px-4 py-2 text-left">Year</th>
                              <th className="px-4 py-2 text-left">Applications</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.applications.summary.monthlyTotals.map((month, index) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">{month.month}</td>
                                <td className="px-4 py-2">{month.year}</td>
                                <td className="px-4 py-2">{formatNumber(month.count)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={applicationChartRef} className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Application Visualizations</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-md mb-3 text-center">Applications by Status</h4>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareApplicationStatusData(reportData.applications)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatNumber(value)} />
                          <Legend />
                          <Bar dataKey="value" name="Applications" fill="#8884d8">
                            {prepareApplicationStatusData(reportData.applications).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {reportData.applications.summary?.monthlyTotals && (
                    <div>
                      <h4 className="font-medium text-md mb-3 text-center">Monthly Application Submissions</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={reportData.applications.summary.monthlyTotals.map(item => ({
                              name: `${item.month}/${item.year}`,
                              Applications: item.count
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="Applications" stroke="#8884d8" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports; 