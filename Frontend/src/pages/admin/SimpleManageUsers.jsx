// filepath: d:\ScholarBridge-\Frontend\src\pages\admin\SimpleManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiUserCheck, 
  FiUserX, 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiTrash2, 
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';

const StudentStatusPill = ({ status }) => {
  // Add a default status if undefined
  const safeStatus = status || 'pending';
  
  const statusConfig = {
    pending: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      borderColor: 'border-blue-300',
      icon: <FiClock className="mr-1.5" size={14} /> 
    },
    approved: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      borderColor: 'border-green-300',
      icon: <FiCheckCircle className="mr-1.5" size={14} /> 
    },
    rejected: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      borderColor: 'border-red-300',
      icon: <FiUserX className="mr-1.5" size={14} /> 
    },
    funded: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      borderColor: 'border-blue-300',
      icon: <FiDollarSign className="mr-1.5" size={14} /> 
    }
  };

  const config = statusConfig[safeStatus] || statusConfig.pending;
  
  return (
    <span className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.borderColor} shadow-sm`}>
      {config.icon}
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

const StatCard = ({ title, value, icon, color, textColor, bgColor, delay }) => (
  <div 
    className={`bg-white rounded-xl shadow-md p-4 flex items-center ${color} stat-card border-l-4`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className={`rounded-full p-3 ${bgColor}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  </div>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md mx-auto w-full transform animate-scaleIn">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-rose-100 p-3 rounded-full mb-4">
            <FiTrash2 className="text-rose-500 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Delete User</h3>
        </div>
        <p className="text-center mb-6 text-gray-600">
          Are you sure you want to delete <strong className="text-gray-800">{userName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-rose-500 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SimpleManageUsers = () => {
  // Add custom animations to the component
  useEffect(() => {    
    const style = document.createElement('style');
    style.textContent = `
      /* Custom color variables for the required color scheme */
      :root {
        --primary-blue: #2563eb;
        --primary-blue-hover: #1d4ed8;
        --primary-green: #10b981;
        --primary-green-hover: #059669;
        --primary-red: #ef4444;
        --primary-red-hover: #dc2626;
        --neutral-white: #ffffff;
        --neutral-white-hover: #f9fafb;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes slideInRight {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
      }
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out;
      }
      .animate-slideInRight {
        animation: slideInRight 0.3s ease-out;
      }
      .animate-slideInUp {
        animation: slideInUp 0.3s ease-out;
      }
      .table-container {
        animation: fadeIn 0.5s ease-in-out;
      }
      .stat-card {
        animation: slideInUp 0.4s ease-out;
      }
      .delete-btn {
        transition: opacity 0.2s;
      }
      /* Enhanced table styling */
      .enhanced-table th {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding-top: 1rem;
        padding-bottom: 1rem;
        background-color: rgba(37, 99, 235, 0.05);
      }
      
      @media (max-width: 768px) {
        .responsive-table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        
        .stat-card {
          animation-delay: 0s !important;
        }
        
        th, td {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .tab-container {
          flex-wrap: wrap;
        }
        
        .search-filter-container {
          flex-direction: column;
        }
        
        .search-filter-container > div {
          width: 100% !important;
          margin-bottom: 0.5rem;
        }
        
        /* Responsive pagination */
        .pagination-container {
          flex-direction: column;
          align-items: flex-end;
        }
        
        .pagination-container > div {
          width: 100%;
          margin-top: 0.5rem;
          text-align: right;
        }
      }
    `;    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // State management
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedStudents: 0,
    fundedStudents: 0,
    totalDonors: 0,
    activeDonors: 0,
    totalDonations: 0
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    userRole: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        
        // First fetch dashboard stats to get accurate overall counts
        try {
          const dashboardResponse = await axios.get('/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (dashboardResponse.data && dashboardResponse.data.success) {
            const dashStats = dashboardResponse.data.stats;
            
            // Set base statistics from dashboard first
            setStats({
              totalStudents: dashStats.totalStudents || 0,
              pendingApplications: dashStats.pendingApplicationsCount || 0,
              approvedApplications: dashStats.approvedApplicationsCount || 0,
              rejectedStudents: dashStats.rejectedApplicationsCount || 0,
              fundedStudents: 0, // Will calculate from user data if available
              totalDonors: dashStats.totalDonors || 0,
              activeDonors: dashStats.totalDonors || 0, // Assuming all donors are active by default
              totalDonations: dashStats.totalDonationsAmount || 0
            });
            
            // Debug logs to check what values are coming from the dashboard
            console.log("Dashboard stats: ", dashStats);
            console.log("Pending applications count: ", dashStats.pendingApplicationsCount);
            console.log("Approved applications count: ", dashStats.approvedApplicationsCount);
          }
        } catch (dashError) {
          console.error('Error fetching dashboard stats:', dashError);
          // Continue with user data fetch
        }
        
        // For applications, directly fetch applications to get accurate counts
        try {
          // Fetch all applications to get accurate counts
          const applicationsResponse = await axios.get('/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (applicationsResponse.data && applicationsResponse.data.success) {
            const applications = applicationsResponse.data.applications || [];
            
            // Count applications by status
            const pendingCount = applications.filter(app => app.status === 'pending').length;
            const approvedCount = applications.filter(app => app.status === 'approved').length;
            const rejectedCount = applications.filter(app => app.status === 'rejected').length;
            const fundedCount = applications.filter(app => app.status === 'funded').length;
            
            // Update stats with accurate application counts
            setStats(prevStats => ({
              ...prevStats,
              pendingApplications: pendingCount,
              approvedApplications: approvedCount,
              rejectedStudents: rejectedCount,
              fundedStudents: fundedCount
            }));
            
            // Debug logs
            console.log("Applications fetched directly: ", applications.length);
            console.log("Pending count: ", pendingCount);
            console.log("Approved count: ", approvedCount);
          }
        } catch (appError) {
          console.error('Error fetching applications data:', appError);
          // Continue with user data fetch
        }
        
        // Fetch users based on current tab
        const params = {
          page: currentPage,
          limit: usersPerPage,
          role: activeTab === 'students' ? 'student' : activeTab === 'donors' ? 'donor' : undefined
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        if (activeTab === 'students' && applicationStatusFilter !== 'all') {
          params.applicationStatus = applicationStatusFilter;
        }

        console.log('Fetching users with params:', params);
        const response = await axios.get('/api/admin/users', {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Users API response:', response.data);
        
        if (response.data && response.data.success) {
          // Extract user data
          const userData = response.data;
          const usersList = userData.users || [];
          
          // Set users based on active tab
          if (activeTab === 'students') {
            setStudents(usersList.filter(user => user?.role === 'student') || []);
            
            // Try to update student-specific stats if no application data was fetched earlier
            const studentsData = usersList.filter(user => user?.role === 'student');
            if (studentsData.length > 0) {
              let pendingCount = 0, approvedCount = 0, rejectedCount = 0, fundedCount = 0;
              
              // Count application statuses across all students
              studentsData.forEach(student => {
                if (student.scholarshipApplications && student.scholarshipApplications.length > 0) {
                  student.scholarshipApplications.forEach(app => {
                    if (app.status === 'pending') pendingCount++;
                    else if (app.status === 'approved') approvedCount++;
                    else if (app.status === 'rejected') rejectedCount++;
                    else if (app.status === 'funded') fundedCount++;
                  });
                }
              });
              
              // Only update if we actually found applications
              if (pendingCount > 0 || approvedCount > 0 || rejectedCount > 0 || fundedCount > 0) {
                setStats(prevStats => ({
                  ...prevStats,
                  pendingApplications: pendingCount,
                  approvedApplications: approvedCount,
                  rejectedStudents: rejectedCount,
                  fundedStudents: fundedCount
                }));
              }
            }
          } else if (activeTab === 'donors') {
            setDonors(usersList.filter(user => user?.role === 'donor') || []);
            
            // Update donor-specific stats
            const donorsData = usersList.filter(user => user?.role === 'donor');
            if (donorsData.length > 0) {
              const activeDonorsCount = donorsData.filter(donor => donor?.isActive).length;
              
              setStats(prevStats => ({
                ...prevStats,
                activeDonors: activeDonorsCount
              }));
            }
          }
          
          // Set pagination info
          if (userData.totalPages) {
            setTotalPages(userData.totalPages);
          } else if (userData.total && usersPerPage) {
            setTotalPages(Math.ceil(userData.total / usersPerPage));
          }
        } else {
          toast.error('Received invalid data format from server');
        }
      } catch (error) {
        console.error('Error fetching users data:', error);
        toast.error(error.response?.data?.message || 'Failed to load users data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, [activeTab, currentPage, usersPerPage, token, searchTerm, applicationStatusFilter]);

  // Add a debounced search handler
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search or filters change
  }, [searchTerm, applicationStatusFilter, activeTab]);

  const handleDeleteUser = async (userId, userName, userRole) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      userRole
    });
  };

  const confirmDeleteUser = async () => {
    try {
      const { userId, userRole } = deleteModal;
      
      // Call API to delete the user
      await adminService.deleteUser(userId);
      
      // Update the UI to reflect the deletion
      if (userRole === 'student') {
        setStudents(prevStudents => prevStudents.filter(student => student._id !== userId));
      } else if (userRole === 'donor') {
        setDonors(prevDonors => prevDonors.filter(donor => donor._id !== userId));
      }
      
      toast.success('User deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: '',
      userRole: ''
    });
  };

  const handleStatusToggle = async (userId, isCurrentlyActive, userRole) => {
    try {
      // Call the appropriate API endpoint to activate or deactivate the user
      if (isCurrentlyActive) {
        await adminService.deactivateUser(userId);
      } else {
        await adminService.activateUser(userId);
      }
      
      // Update state to reflect the change
      const updateUserStatus = (userArray) => {
        return userArray.map(user => {
          if (user._id === userId) {
            return { ...user, isActive: !isCurrentlyActive };
          }
          return user;
        });
      };
      
      if (userRole === 'student') {
        setStudents(prev => updateUserStatus(prev));
      } else if (userRole === 'donor') {
        setDonors(prev => updateUserStatus(prev));
      }
      
      const action = isCurrentlyActive ? 'deactivated' : 'activated';
      toast.success(`User ${action} successfully!`);
    } catch (error) {
      console.error(`Error ${isCurrentlyActive ? 'deactivating' : 'activating'} user:`, error);
      toast.error(`Failed to update user status. Please try again.`);
    }
  };

  // Filter users based on search and status criteria
  const getFilteredStudents = () => {
    return students.filter(student => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const emailMatch = (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = fullName.includes(searchTerm.toLowerCase());
      const institutionMatch = (student.institution || student.school || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSearch = searchTerm === '' || emailMatch || nameMatch || institutionMatch;
      
      const matchesStatus = applicationStatusFilter === 'all' || 
                           (student.applicationStatus === applicationStatusFilter);
      
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredDonors = () => {
    return donors.filter(donor => {
      const fullName = `${donor.firstName || ''} ${donor.lastName || ''}`.toLowerCase();
      const emailMatch = (donor.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = fullName.includes(searchTerm.toLowerCase());
      const orgMatch = (donor.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchTerm === '' || emailMatch || nameMatch || orgMatch;
    });
  };

  // Pagination logic
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-7xl animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-gray-600 mt-1">Administer student and donor accounts</p>
          </div>
        </div>
        
        {/* Statistics Section - All in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          {/* Student Stats */}
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={<FiUserCheck size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Pending Applications" 
              value={stats.pendingApplications} 
              icon={<FiClock size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0.1}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Approved Applications" 
              value={stats.approvedApplications} 
              icon={<FiCheckCircle size={20} className="text-green-600" />}
              color="border-green-600"
              textColor="text-green-700"
              bgColor="bg-green-100"
              delay={0.2}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Funded Students" 
              value={stats.fundedStudents} 
              icon={<FiDollarSign size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0.3}
            />
          </div>
          
          {/* Donor Stats */}
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Total Donors" 
              value={stats.totalDonors} 
              icon={<FiUserCheck size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0.4}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Active Donors" 
              value={stats.activeDonors} 
              icon={<FiCheckCircle size={20} className="text-green-600" />}
              color="border-green-600"
              textColor="text-green-700"
              bgColor="bg-green-100"
              delay={0.5}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Total Donations" 
              value={`$${(stats.totalDonations || 0).toLocaleString()}`} 
              icon={<FiDollarSign size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0.6}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Average Donation" 
              value={stats.activeDonors > 0 ? 
                `$${Math.round((stats.totalDonations || 0) / Math.max(1, stats.activeDonors)).toLocaleString()}` : 
                '$0'} 
              icon={<FiRefreshCw size={20} className="text-green-600" />}
              color="border-green-600"
              textColor="text-green-700"
              bgColor="bg-green-100"
              delay={0.7}
            />
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex mb-6 bg-white rounded-xl shadow-sm p-2 overflow-hidden tab-container">
          <button
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 relative ${
              activeTab === 'students'
                ? 'text-white bg-blue-600 shadow-md'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <span className="flex items-center">
              <FiUserCheck className="mr-2" />
              Students
            </span>
          </button>
          <button
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 relative ${
              activeTab === 'donors'
                ? 'text-white bg-green-600 shadow-md'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('donors')}
          >
            <span className="flex items-center">
              <FiDollarSign className="mr-2" />
              Donors
            </span>
          </button>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 animate-slideInUp">
          <div className="flex flex-col md:flex-row gap-4 search-filter-container">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-blue-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 py-3 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {activeTab === 'students' && (
              <div className="md:w-1/4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-blue-400" />
                </div>
                <select 
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none"
                  value={applicationStatusFilter}
                  onChange={(e) => setApplicationStatusFilter(e.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="funded">Funded</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Users Table Section */}
        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow flex justify-center animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-700">Loading users...</p>
            </div>
          </div>
        ) : activeTab === 'students' ? (
          // Students Table
          getFilteredStudents().length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm animate-fadeIn">
              <FiAlertTriangle className="mx-auto text-blue-500 mb-3" size={40} />
              <p className="text-gray-700 font-medium">No students found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setApplicationStatusFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-xl shadow-md table-container">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table enhanced-table">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Institution</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredStudents().map((student, index) => (
                      <tr key={student._id || index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.institution || student.school || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-3 justify-end">
                            <button
                              onClick={() => handleStatusToggle(student._id, student.isActive, 'student')}
                              className={`px-3 py-1 rounded-md ${
                                student.isActive
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {student.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(student._id, `${student.firstName} ${student.lastName}`, 'student')}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // Donors Table
          getFilteredDonors().length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm animate-fadeIn">
              <FiAlertTriangle className="mx-auto text-green-500 mb-3" size={40} />
              <p className="text-gray-700 font-medium">No donors found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-md transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-xl shadow-md table-container">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table enhanced-table">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Donations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredDonors().map((donor, index) => (
                      <tr key={donor._id || index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donor.firstName} {donor.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {donor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {donor.organizationName || 'Individual Donor'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {donor.donationsMade || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${(donor.totalDonated || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-3 justify-end">
                            <button
                              onClick={() => handleStatusToggle(donor._id, donor.isActive, 'donor')}
                              className={`px-3 py-1 rounded-md ${
                                donor.isActive
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {donor.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(donor._id, donor.organizationName || `${donor.firstName} ${donor.lastName}`, 'donor')}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="mt-6">
            <div className="w-full flex justify-end">
              <div className="flex items-center bg-white p-4 rounded-xl shadow-sm">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  {/* Previous */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white transition duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                  >
                    <span className="sr-only">Prev</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`inline-flex items-center justify-center h-10 w-10 border text-sm font-medium rounded-md ${
                        currentPage === number + 1
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white transition duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
            <div className="mt-2 pr-4 text-right text-sm text-gray-700">
              {(activeTab === 'students' ? stats.totalStudents : stats.totalDonors) > 0 ? (
                <>
                  Showing <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * usersPerPage, activeTab === 'students' ? stats.totalStudents : stats.totalDonors)}</span> of <span className="font-medium">{activeTab === 'students' ? stats.totalStudents : stats.totalDonors}</span> results
                </>
              ) : (
                <>No results found</>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        userName={deleteModal.userName}
      />
    </div>
  );
};

export default SimpleManageUsers;
