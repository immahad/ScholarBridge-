import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminManageScholarships = () => {
  const { token } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [scholarshipsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    fetchScholarships();
  }, [currentPage, filterStatus]);
  
  // Debug search term changes
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      console.log(`Searching for: "${searchTerm}"`);
      console.log('Available scholarships:', scholarships);
    }
  }, [searchTerm, scholarships]);
  
  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: scholarshipsPerPage
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Use the admin endpoint to get all scholarships including those created by donors
      const response = await axios.get('/api/admin/scholarships', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.scholarships) {
        console.log('Scholarships data:', response.data);
        setScholarships(response.data.scholarships);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.total / scholarshipsPerPage));
      } else {
        setError('Failed to fetch scholarships - unexpected response format');
        console.error('Unexpected response format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError('An error occurred while fetching scholarships');
      toast.error('Failed to load scholarships. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteScholarship = async (id) => {
    if (window.confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      try {
        // Use the admin endpoint for deletion
        const response = await axios.delete(`/api/admin/scholarships/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update the local state to remove the deleted scholarship
        setScholarships(prevScholarships => 
          prevScholarships.filter(scholarship => scholarship._id !== id)
        );
        
        toast.success('Scholarship deleted successfully!');
      } catch (err) {
        console.error('Error deleting scholarship:', err);
        toast.error(err.response?.data?.message || 'An error occurred while deleting the scholarship');
      }
    }
  };
  
  // Filter scholarships based on search term and status
  const filteredScholarships = scholarships.filter(scholarship => {
    if (!searchTerm.trim()) {
      return true; // Show all scholarships if search term is empty
    }
    
    const searchTermLower = searchTerm.trim().toLowerCase();
    
    // Search in title
    const titleMatches = scholarship.title && 
      scholarship.title.toLowerCase().includes(searchTermLower);
      
    // Search in description  
    const descMatches = scholarship.description && 
      scholarship.description.toLowerCase().includes(searchTermLower);
    
    // Search in category
    const categoryMatches = scholarship.category && 
      scholarship.category.toLowerCase().includes(searchTermLower);
    
    // Return true if any field matches
    return titleMatches || descMatches || categoryMatches;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Scholarships</h1>
        <Link to="/admin/scholarships/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
          <FiPlus className="mr-2" />
          Add New Scholarship
        </Link>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search scholarships..."
              className="w-full pl-10 p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select 
                className="w-full pl-10 p-2 border rounded appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchScholarships}
            className="mt-2 text-sm underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <p className="text-gray-600 mb-2">No scholarships found matching your criteria.</p>
          {searchTerm || filterStatus !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Clear filters
            </button>
          ) : (
            <Link 
              to="/admin/scholarships/create"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Create your first scholarship
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Created By</th>
                <th className="py-3 px-6 text-left">Deadline</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredScholarships.map((scholarship) => (
                <tr key={scholarship._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left font-medium">{scholarship.title}</td>
                  <td className="py-3 px-6 text-left">{formatCurrency(scholarship.amount)}</td>
                  <td className="py-3 px-6 text-left">
                    {scholarship.createdBy?.firstName ? `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName || ''}`.trim() : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {formatDate(scholarship.deadlineDate)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(scholarship.status)}`}>
                      {scholarship.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-3">
                      <Link to={`/admin/scholarships/view/${scholarship._id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye size={18} title="View" />
                      </Link>
                      <Link to={`/admin/scholarships/edit/${scholarship._id}`} className="text-yellow-500 hover:text-yellow-700">
                        <FiEdit size={18} title="Edit" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteScholarship(scholarship._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 size={18} title="Delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManageScholarships; 