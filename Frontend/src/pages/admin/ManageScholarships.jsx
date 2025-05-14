import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

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
        <h1 className="admin-page-title">Manage Scholarships</h1>
        <div className="admin-header-actions">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await axios.post('/api/admin/scholarships/fix', {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                  toast.success('Scholarships repaired successfully');
                  console.log('Fix results:', response.data.fixed);
                  // Show detailed message
                  const { activeFixCount, approvedFixCount, totalFixed } = response.data.fixed;
                  if (totalFixed > 0) {
                    toast.info(`Fixed ${totalFixed} scholarships: ${activeFixCount} active + ${approvedFixCount} approved`);
                  } else {
                    toast.info('No scholarships needed fixing');
                  }
                  // Refresh the scholarship list
                  fetchScholarships();
                } else {
                  toast.error('Failed to repair scholarships');
                }
              } catch (error) {
                console.error('Error fixing scholarships:', error);
                toast.error(error.response?.data?.message || 'Failed to repair scholarships');
              } finally {
                setLoading(false);
              }
            }}
            className="admin-button admin-button-warning"
            disabled={loading}
          >
            <FiFilter />
            Fix Visibility Issues
          </button>
          <Link to="/admin/scholarships/create" className="admin-button admin-button-primary">
            <FiPlus />
            Add New Scholarship
          </Link>
        </div>
      </div>
      
      <div className="admin-filters">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="admin-search-wrapper">
            <FiSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search scholarships..."
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-filter-wrapper md:w-48">
            <select 
              className="admin-filter-select"
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
      
      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="admin-card">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchScholarships}
            className="admin-button admin-button-secondary mt-2"
          >
            Retry
          </button>
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="admin-empty-state">
          <p>No scholarships found matching your criteria.</p>
          {searchTerm || filterStatus !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="admin-button admin-button-secondary"
            >
              Clear filters
            </button>
          ) : (
            <Link 
              to="/admin/scholarships/create"
              className="admin-button admin-button-primary"
            >
              Create your first scholarship
            </Link>
          )}
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Created By</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScholarships.map((scholarship) => (
                <tr key={scholarship._id}>
                  <td className="admin-table-title">{scholarship.title}</td>
                  <td>{formatCurrency(scholarship.amount)}</td>
                  <td>
                    {scholarship.createdBy?.firstName ? `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName || ''}`.trim() : 'N/A'}
                  </td>
                  <td>
                    {formatDate(scholarship.deadlineDate)}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${scholarship.status?.toLowerCase() || 'inactive'}`}>
                      {scholarship.status || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link to={`/admin/scholarships/view/${scholarship._id}`} className="admin-table-action">
                        <FiEye size={18} title="View" />
                      </Link>
                      <Link to={`/admin/scholarships/edit/${scholarship._id}`} className="admin-table-action edit">
                        <FiEdit size={18} title="Edit" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteScholarship(scholarship._id)}
                        className="admin-table-action delete"
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
            <div className="admin-pagination">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="admin-pagination-button nav"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`admin-pagination-button ${
                    currentPage === page ? 'active' : ''
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="admin-pagination-button nav"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManageScholarships; 