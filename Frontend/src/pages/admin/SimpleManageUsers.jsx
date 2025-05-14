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
  FiFilter,
  FiUsers,
  FiUser
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import '../../styles/admin.css';
import '../../styles/admin-users.css';

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
            className="admin-button admin-button-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="admin-button admin-button-danger"
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
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manage Users</h1>
        <p className="admin-page-subtitle">View and manage all users of the platform</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'students' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          onClick={() => setActiveTab('students')}
        >
          <FiUsers />
          Students
        </button>
        <button
          className={`admin-tab ${activeTab === 'donors' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          onClick={() => setActiveTab('donors')}
        >
          <FiDollarSign />
          Donors
        </button>
      </div>
      
      {/* Search and Filter Section */}
      <div className="admin-card search-filter-container">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {activeTab === 'students' && (
          <div className="filter-wrapper">
            <FiFilter className="filter-icon" />
            <select 
              className="filter-select"
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
      
      {/* Users Table Section */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      ) : activeTab === 'students' ? (
        // Students Table
        getFilteredStudents().length === 0 ? (
          <div className="admin-empty-state">
            <FiAlertTriangle className="text-4xl text-blue-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">No students found</h2>
            <p>No students found matching your criteria. Try adjusting your search filters.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setApplicationStatusFilter('all');
              }}
              className="admin-button admin-button-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Institution</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStudents().map((student, index) => (
                  <tr key={student._id || index}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {student.firstName ? student.firstName.charAt(0) : 'S'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="user-email">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {student.institution || student.school || 'Not specified'}
                    </td>
                    <td>
                      <span className={`status-badge ${student.isActive ? 'status-active' : 'status-inactive'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleStatusToggle(student._id, student.isActive, 'student')}
                          className={`action-button ${student.isActive ? 'action-button-danger' : 'action-button-primary'}`}
                        >
                          {student.isActive ? (
                            <>
                              <FiUserX />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FiUserCheck />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(student._id, `${student.firstName} ${student.lastName}`, 'student')}
                          className="action-button action-button-secondary"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Donors Table
        getFilteredDonors().length === 0 ? (
          <div className="admin-empty-state">
            <FiAlertTriangle className="text-4xl text-green-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">No donors found</h2>
            <p>No donors found matching your criteria. Try adjusting your search filters.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
              }}
              className="admin-button admin-button-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Organization</th>
                  <th>Donations</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDonors().map((donor, index) => (
                  <tr key={donor._id || index}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {donor.firstName ? donor.firstName.charAt(0) : 'D'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {donor.firstName} {donor.lastName}
                          </div>
                          <div className="user-email">
                            {donor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {donor.organizationName || 'Individual Donor'}
                    </td>
                    <td>
                      {donor.donationsMade || 0}
                    </td>
                    <td>
                      ${(donor.totalDonated || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${donor.isActive ? 'status-active' : 'status-inactive'}`}>
                        {donor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleStatusToggle(donor._id, donor.isActive, 'donor')}
                          className={`action-button ${donor.isActive ? 'action-button-danger' : 'action-button-primary'}`}
                        >
                          {donor.isActive ? (
                            <>
                              <FiUserX />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FiUserCheck />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(donor._id, donor.organizationName || `${donor.firstName} ${donor.lastName}`, 'donor')}
                          className="action-button action-button-secondary"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      
      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="pagination-nav-button"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`pagination-button ${currentPage === page ? 'pagination-button-active' : 'pagination-button-inactive'}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-nav-button"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Delete confirmation modal */}
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
