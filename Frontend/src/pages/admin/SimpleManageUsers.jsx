import React, { useState, useEffect } from 'react';
import { FiUserCheck, FiUserX, FiDollarSign, FiClock, FiCheckCircle, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
// Importing adminService but commenting it out as it's not needed for mock data
// import { adminService } from '../../services/api';

const StudentStatusPill = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="mr-1" /> },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle className="mr-1" /> },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <FiUserX className="mr-1" /> },
    funded: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiDollarSign className="mr-1" /> }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`flex items-center px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow p-4 flex items-center ${color}`}>
    <div className={`rounded-full p-3 ${color.replace('border-', 'bg-').replace('700', '100')}`}>
      {icon}
    </div>
    <div className="ml-3">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
        <p className="mb-4">
          Are you sure you want to delete the user <strong>{userName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
  // State management
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
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
      } else if (userRole === 'donor') {
        setDonors(donors.filter(donor => donor._id !== userId));
      }
      
      toast.success('User successfully deleted');
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
      }
      
      toast.success(`User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`);
      
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>
      
      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {activeTab === 'students' ? (
          <>
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={<FiUserCheck size={20} />}
              color="border-l-4 border-blue-700"
            />
            <StatCard 
              title="Pending Applications" 
              value={stats.pendingStudents} 
              icon={<FiClock size={20} />}
              color="border-l-4 border-yellow-700"
            />
            <StatCard 
              title="Approved Students" 
              value={stats.approvedStudents} 
              icon={<FiCheckCircle size={20} />}
              color="border-l-4 border-green-700"
            />
            <StatCard 
              title="Funded Students" 
              value={stats.fundedStudents} 
              icon={<FiDollarSign size={20} />}
              color="border-l-4 border-purple-700"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Donors" 
              value={stats.totalDonors} 
              icon={<FiUserCheck size={20} />}
              color="border-l-4 border-blue-700"
            />
            <StatCard 
              title="Active Donors" 
              value={stats.activeDonors} 
              icon={<FiCheckCircle size={20} />}
              color="border-l-4 border-green-700"
            />
            <StatCard 
              title="Total Donations" 
              value={`$${stats.totalDonations.toLocaleString()}`} 
              icon={<FiDollarSign size={20} />}
              color="border-l-4 border-purple-700"
            />
            <StatCard 
              title="Average Donation" 
              value={stats.activeDonors > 0 ? 
                `$${Math.round(stats.totalDonations / stats.activeDonors).toLocaleString()}` : 
                '$0'} 
              icon={<FiRefreshCw size={20} />}
              color="border-l-4 border-indigo-700"
            />
          </>
        )}
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'students'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'donors'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('donors')}
        >
          Donors
        </button>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === 'students' && (
            <div>
              <select 
                className="p-2 border rounded w-full"
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
        <div className="bg-white p-8 rounded-lg shadow flex justify-center">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p>Loading users...</p>
          </div>
        </div>
      ) : activeTab === 'students' ? (
        // Students Table
        filteredStudents.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <FiAlertTriangle className="mx-auto text-yellow-500 mb-2" size={30} />
            <p className="text-gray-600">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.school || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">Grad: {student.graduationYear || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={student.isActive}
                          onChange={() => handleStatusToggle(student._id, student.isActive, 'student')}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="ms-3 text-sm">{student.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StudentStatusPill status={student.applicationStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-red-600 hover:text-red-900 ml-4"
                        onClick={() => handleDeleteUser(
                          student._id, 
                          `${student.firstName} ${student.lastName}`,
                          'student'
                        )}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Donors Table
        filteredDonors.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <FiAlertTriangle className="mx-auto text-yellow-500 mb-2" size={30} />
            <p className="text-gray-600">No donors found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonors.map((donor) => (
                  <tr key={donor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donor.firstName} {donor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{donor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{donor.organizationName || 'Individual'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={donor.isActive}
                          onChange={() => handleStatusToggle(donor._id, donor.isActive, 'donor')}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="ms-3 text-sm">{donor.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${donor.totalDonated?.toLocaleString() || '0'}</div>
                      <div className="text-sm text-gray-500">{donor.donationsMade || 0} donations</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-red-600 hover:text-red-900 ml-4"
                        onClick={() => handleDeleteUser(
                          donor._id, 
                          donor.organizationName || `${donor.firstName} ${donor.lastName}`,
                          'donor'
                        )}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      
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
