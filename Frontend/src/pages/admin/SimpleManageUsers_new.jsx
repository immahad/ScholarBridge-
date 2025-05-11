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

const StudentStatusPill = ({ status }) => {
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

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.borderColor} shadow-sm`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({ title, value, icon, color, textColor, bgColor, delay }) => (
  <div 
    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 flex items-center ${color} transform hover:scale-102 transition-transform stat-card card-hover-effect border-l-4`}
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
            className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
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
      .transform.hover\\:scale-102:hover {
        transform: scale(1.02);
      }
      .table-container {
        animation: fadeIn 0.5s ease-in-out;
      }
      .stat-card {
        animation: slideInUp 0.4s ease-out;
        transition: all 0.3s ease;
      }
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .delete-btn {
        transition: all 0.2s;
      }
      .delete-btn:hover {
        transform: scale(1.15);
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
      
      .enhanced-table tr:hover td {
        background-color: rgba(37, 99, 235, 0.03);
      }
      
      /* Enhanced card styling */
      .card-hover-effect {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .card-hover-effect:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
      }
    `;    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // State management
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    approvedStudents: 0,
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
        
        // Fallback to mock data for development
        const mockStudents = [
          {
            _id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-01-15',
            school: 'University of Technology',
            graduationYear: 2024,
            applicationStatus: 'pending'
          },
          {
            _id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-02-20',
            school: 'State University',
            graduationYear: 2025,
            applicationStatus: 'approved'
          },
          {
            _id: '4',
            firstName: 'Maria',
            lastName: 'Garcia',
            email: 'maria.garcia@example.com',
            isActive: false,
            isVerified: true,
            createdAt: '2023-01-10',
            school: 'City College',
            graduationYear: 2023,
            applicationStatus: 'rejected'
          },
          {
            _id: '8',
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david.wilson@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-06-15',
            school: 'Tech Institute',
            graduationYear: 2024,
            applicationStatus: 'funded'
          },
          {
            _id: '9',
            firstName: 'Jennifer',
            lastName: 'Brown',
            email: 'jennifer.brown@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-07-05',
            school: 'State University',
            graduationYear: 2026,
            applicationStatus: 'pending'
          },
          {
            _id: '10',
            firstName: 'Michael',
            lastName: 'Miller',
            email: 'michael.miller@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-07-10',
            school: 'Tech Institute',
            graduationYear: 2025,
            applicationStatus: 'approved'
          },
          {
            _id: '11',
            firstName: 'Emily',
            lastName: 'Jones',
            email: 'emily.jones@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-07-20',
            school: 'City College',
            graduationYear: 2024,
            applicationStatus: 'pending'
          },
          {
            _id: '12',
            firstName: 'James',
            lastName: 'Taylor',
            email: 'james.taylor@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-08-01',
            school: 'University of Technology',
            graduationYear: 2025,
            applicationStatus: 'rejected'
          },
          {
            _id: '13',
            firstName: 'Sophia',
            lastName: 'Anderson',
            email: 'sophia.anderson@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-08-15',
            school: 'State University',
            graduationYear: 2024,
            applicationStatus: 'approved'
          },
          {
            _id: '14',
            firstName: 'William',
            lastName: 'Thomas',
            email: 'william.thomas@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-09-01',
            school: 'Tech Institute',
            graduationYear: 2026,
            applicationStatus: 'funded'
          },
          {
            _id: '15',
            firstName: 'Olivia',
            lastName: 'Jackson',
            email: 'olivia.jackson@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-09-10',
            school: 'City College',
            graduationYear: 2025,
            applicationStatus: 'pending'
          },
          {
            _id: '16',
            firstName: 'Ethan',
            lastName: 'White',
            email: 'ethan.white@example.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-10-05',
            school: 'University of Technology',
            graduationYear: 2024,
            applicationStatus: 'approved'
          }
        ];
        
        const mockDonors = [
          {
            _id: '3',
            firstName: 'XYZ',
            lastName: 'Foundation',
            email: 'contact@xyzfoundation.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-03-05',
            organizationName: 'XYZ Foundation',
            donationsMade: 12,
            totalDonated: 75000
          },
          {
            _id: '5',
            firstName: 'ABC',
            lastName: 'Corporation',
            email: 'scholarships@abccorp.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-04-12',
            organizationName: 'ABC Corporation',
            donationsMade: 8,
            totalDonated: 45000
          },
          {
            _id: '7',
            firstName: 'Community',
            lastName: 'Trust',
            email: 'info@communitytrust.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-05-01',
            organizationName: 'Community Trust',
            donationsMade: 5,
            totalDonated: 30000
          },
          {
            _id: '17',
            firstName: 'National',
            lastName: 'Scholarship Fund',
            email: 'info@nationalscholarship.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-06-15',
            organizationName: 'National Scholarship Fund',
            donationsMade: 20,
            totalDonated: 120000
          },
          {
            _id: '18',
            firstName: 'Global',
            lastName: 'Education Initiative',
            email: 'contact@globaleducation.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-07-20',
            organizationName: 'Global Education Initiative',
            donationsMade: 15,
            totalDonated: 90000
          },
          {
            _id: '19',
            firstName: 'Tech',
            lastName: 'Futures',
            email: 'scholarships@techfutures.com',
            isActive: true,
            isVerified: true,
            createdAt: '2023-08-10',
            organizationName: 'Tech Futures Inc.',
            donationsMade: 10,
            totalDonated: 60000
          },
          {
            _id: '20',
            firstName: 'Bright',
            lastName: 'Horizons Foundation',
            email: 'grants@brighthorizons.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-09-05',
            organizationName: 'Bright Horizons Foundation',
            donationsMade: 7,
            totalDonated: 40000
          },
          {
            _id: '21',
            firstName: 'Future',
            lastName: 'Leaders Fund',
            email: 'info@futureleaders.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-10-01',
            organizationName: 'Future Leaders Fund',
            donationsMade: 9,
            totalDonated: 55000
          },
          {
            _id: '22',
            firstName: 'City',
            lastName: 'Educational Trust',
            email: 'contact@cityeducation.org',
            isActive: false,
            isVerified: true,
            createdAt: '2023-10-15',
            organizationName: 'City Educational Trust',
            donationsMade: 3,
            totalDonated: 25000
          },
          {
            _id: '23',
            firstName: 'Innovation',
            lastName: 'Scholars',
            email: 'grants@innovationscholars.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-11-05',
            organizationName: 'Innovation Scholars Program',
            donationsMade: 6,
            totalDonated: 35000
          },
          {
            _id: '24',
            firstName: 'Tomorrow\'s',
            lastName: 'Leaders',
            email: 'info@tomorrowsleaders.org',
            isActive: true,
            isVerified: true,
            createdAt: '2023-11-20',
            organizationName: 'Tomorrow\'s Leaders Organization',
            donationsMade: 4,
            totalDonated: 28000
          }
        ];
        
        const mockStats = {
          totalStudents: mockStudents.length,
          pendingStudents: mockStudents.filter(s => s.applicationStatus === 'pending').length,
          approvedStudents: mockStudents.filter(s => s.applicationStatus === 'approved').length,
          rejectedStudents: mockStudents.filter(s => s.applicationStatus === 'rejected').length,
          fundedStudents: mockStudents.filter(s => s.applicationStatus === 'funded').length,
          totalDonors: mockDonors.length,
          activeDonors: mockDonors.filter(d => d.isActive).length,
          totalDonations: mockDonors.reduce((sum, donor) => sum + donor.totalDonated, 0)
        };
        
        setStudents(mockStudents);
        setDonors(mockDonors);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersData();
  }, []);
  
  // Delete user function
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
      
      // Update local state based on role
      if (userRole === 'student') {
        setStudents(students.filter(student => student._id !== userId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalStudents: prev.totalStudents - 1,
          pendingStudents: students.find(s => s._id === userId && s.applicationStatus === 'pending') ? prev.pendingStudents - 1 : prev.pendingStudents,
          approvedStudents: students.find(s => s._id === userId && s.applicationStatus === 'approved') ? prev.approvedStudents - 1 : prev.approvedStudents,
          rejectedStudents: students.find(s => s._id === userId && s.applicationStatus === 'rejected') ? prev.rejectedStudents - 1 : prev.rejectedStudents,
          fundedStudents: students.find(s => s._id === userId && s.applicationStatus === 'funded') ? prev.fundedStudents - 1 : prev.fundedStudents
        }));
      } else if (userRole === 'donor') {
        const donorToDelete = donors.find(d => d._id === userId);
        setDonors(donors.filter(donor => donor._id !== userId));
        
        // Update stats
        if (donorToDelete) {
          setStats(prev => ({
            ...prev,
            totalDonors: prev.totalDonors - 1,
            activeDonors: donorToDelete.isActive ? prev.activeDonors - 1 : prev.activeDonors,
            totalDonations: prev.totalDonations - donorToDelete.totalDonated
          }));
        }
      }
      
      toast.success('User successfully deleted', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
  
  // Toggle user active status
  const handleStatusToggle = async (userId, isCurrentlyActive, userRole) => {
    try {
      // Update local state based on role
      if (userRole === 'student') {
        setStudents(students.map(student => {
          if (student._id === userId) {
            return { ...student, isActive: !isCurrentlyActive };
          }
          return student;
        }));
      } else if (userRole === 'donor') {
        setDonors(donors.map(donor => {
          if (donor._id === userId) {
            return { ...donor, isActive: !isCurrentlyActive };
          }
          return donor;
        }));
        
        // Update activeDonors stat
        setStats(prev => ({
          ...prev,
          activeDonors: isCurrentlyActive 
            ? prev.activeDonors - 1 
            : prev.activeDonors + 1
        }));
      }
      
      toast.success(`User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`, {
        position: "top-right",
        autoClose: 2000
      });
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  };
  
  // Filter students based on search term and application status
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = applicationStatusFilter === 'all' || student.applicationStatus === applicationStatusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Filter donors based on search term
  const filteredDonors = donors.filter(donor => {
    const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donor.organizationName && donor.organizationName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });
  
  // Pagination logic
  const indexOfLastItem = currentPage * usersPerPage;
  const indexOfFirstItem = indexOfLastItem - usersPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const currentDonors = filteredDonors.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalStudentPages = Math.ceil(filteredStudents.length / usersPerPage);
  const totalDonorPages = Math.ceil(filteredDonors.length / usersPerPage);
  const totalPages = activeTab === 'students' ? totalStudentPages : totalDonorPages;
  
  // Pagination navigation functions
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
  
  // Reset to page 1 when changing tabs or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, applicationStatusFilter]);
  
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
              value={stats.pendingStudents} 
              icon={<FiClock size={20} className="text-blue-600" />}
              color="border-blue-600"
              textColor="text-blue-700"
              bgColor="bg-blue-100"
              delay={0.1}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-2">
            <StatCard 
              title="Approved Students" 
              value={stats.approvedStudents} 
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
              value={`$${stats.totalDonations.toLocaleString()}`} 
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
                `$${Math.round(stats.totalDonations / stats.activeDonors).toLocaleString()}` : 
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
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
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
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
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
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 transition-all duration-300 hover:shadow-lg animate-slideInUp card-hover-effect">
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
          filteredStudents.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm animate-fadeIn card-hover-effect">
              <FiAlertTriangle className="mx-auto text-blue-500 mb-3" size={40} />
              <p className="text-gray-700 font-medium">No students found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setApplicationStatusFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-xl shadow-md table-container card-hover-effect">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table enhanced-table">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">School</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Graduation</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentStudents.map((student, index) => (
                      <tr 
                        key={student._id} 
                        className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap group relative">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div className="ml-2">
                              <div className="text-base font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                            
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteUser(student._id, `${student.firstName} ${student.lastName}`, 'student')}
                              className="p-2 bg-red-100 text-red-600 rounded-full absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 delete-btn"
                              aria-label="Delete user"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.school}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.graduationYear}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StudentStatusPill status={student.applicationStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleStatusToggle(student._id, student.isActive, 'student')}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                student.isActive ? 'bg-green-500' : 'bg-red-300'
                              }`}
                              aria-pressed={student.isActive}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  student.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`ml-2 text-sm ${student.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </span>
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
          filteredDonors.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm animate-fadeIn card-hover-effect">
              <FiAlertTriangle className="mx-auto text-green-500 mb-3" size={40} />
              <p className="text-gray-700 font-medium">No donors found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-xl shadow-md table-container card-hover-effect">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table enhanced-table">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Donations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Total Donated</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentDonors.map((donor, index) => (
                      <tr 
                        key={donor._id} 
                        className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap group relative">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {donor.organizationName ? donor.organizationName[0] : donor.firstName[0]}
                            </div>
                            <div className="ml-2">
                              <div className="text-base font-medium text-gray-900">
                                {donor.organizationName || `${donor.firstName} ${donor.lastName}`}
                              </div>
                              <div className="text-sm text-gray-500">{donor.email}</div>
                            </div>
                            
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteUser(donor._id, donor.organizationName || `${donor.firstName} ${donor.lastName}`, 'donor')}
                              className="p-2 bg-red-100 text-red-600 rounded-full absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 delete-btn"
                              aria-label="Delete donor"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">
                              {donor.donationsMade} donations
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-700">
                            ${donor.totalDonated.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleStatusToggle(donor._id, donor.isActive, 'donor')}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                donor.isActive ? 'bg-green-500' : 'bg-red-300'
                              }`}
                              aria-pressed={donor.isActive}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  donor.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`ml-2 text-sm ${donor.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {donor.isActive ? 'Active' : 'Inactive'}
                            </span>
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
        {(activeTab === 'students' && filteredStudents.length > 0) || 
         (activeTab === 'donors' && filteredDonors.length > 0) ? (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, (activeTab === 'students' ? filteredStudents.length : filteredDonors.length))}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {activeTab === 'students' ? filteredStudents.length : filteredDonors.length}
                  </span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === number + 1
                          ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        ) : null}
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
