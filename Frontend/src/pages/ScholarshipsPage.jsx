import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiFilter, FiSearch, FiCalendar, FiDollarSign, FiBookOpen, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthUtils';
import '../styles/scholarships.css';

const ScholarshipsPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minAmount: '',
    maxAmount: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is a student, donor, admin or not logged in
  const userRole = user?.role || 'guest';
  const isStudent = userRole === 'student';
  const isDonor = userRole === 'donor';
  const isAdmin = userRole === 'admin';
  const isLoggedOut = !token;

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        // Only fetch scholarships if the user is a student
        if (isStudent) {
          console.log('Fetching scholarships for student...');
          const response = await axios.get('/api/students/scholarships', {
            params: { 
              limit: 20, // Changed from 100 to 20 for testing pagination
              page: currentPage
            },
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Scholarships API response:', response.data);
          
          if (response.data.success) {
            if (response.data.scholarships.length === 0) {
              console.log('No scholarships returned from API');
            } else {
              console.log(`Received ${response.data.scholarships.length} scholarships`);
            }
            setScholarships(response.data.scholarships);
            if (response.data.totalPages) {
              setTotalPages(response.data.totalPages);
            }
          } else {
            console.error('API returned failure:', response.data);
            setError('Failed to load scholarships');
          }
        } else {
          console.log('User is not a student, not fetching scholarships');
          // Set loading to false for non-student users since we're not fetching data
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch scholarships:', err);
        console.error('Error details:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to load scholarships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [token, isStudent, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const goToDashboard = () => {
    if (isDonor) {
      navigate('/donor/dashboard');
    } else if (isAdmin) {
      navigate('/admin/dashboard');
    }
  };

  // Filter scholarships based on search term and filters
  const filteredScholarships = scholarships.filter(scholarship => {
    // Search term filter
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || scholarship.category === filters.category;
    
    // Amount filter
    const matchesMinAmount = !filters.minAmount || scholarship.amount >= parseInt(filters.minAmount);
    const matchesMaxAmount = !filters.maxAmount || scholarship.amount <= parseInt(filters.maxAmount);
    
    return matchesSearch && matchesCategory && matchesMinAmount && matchesMaxAmount;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(scholarships.map(scholarship => scholarship.category))];

  // Render different content based on user role
  if (isDonor || isAdmin) {
    return (
      <div className="scholarships-page">
        <div className="container">
          <div className="access-restricted-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Access Restricted</h2>
            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
              This page is only available for student accounts.
            </p>
            <button 
              onClick={goToDashboard} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', margin: '0 auto' }}
            >
              <FiArrowLeft style={{ marginRight: '10px' }} />
              Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For logged out users
  if (isLoggedOut) {
    return (
      <div className="scholarships-page">
        <div className="container">
          <div className="access-restricted-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Find Scholarships</h2>
            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
              Create a student account to browse and apply for scholarships that match your profile.
            </p>
            <Link 
              to="/register?role=student" 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', margin: '0 auto', width: 'fit-content' }}
            >
              <FiUserPlus style={{ marginRight: '10px' }} />
              Sign Up as a Student
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For student users - show the normal page
  return (
    <div className="scholarships-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Available Scholarships</h1>
          <p className="page-description">
            Discover and apply for scholarships that match your profile and academic goals.
          </p>
        </div>

        <div className="search-filter-section">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-heading">
              <FiFilter />
              <span>Filters</span>
            </div>
            
            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="minAmount">Min Amount ($)</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Min"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxAmount">Max Amount ($)</label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Max"
              />
            </div>
            
            <div className="filter-group">
              {totalPages > 1 && (
                <button 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      // Fetch all scholarships without pagination
                      const response = await axios.get('/api/students/scholarships', {
                        params: { 
                          limit: 1000, // Set a very high limit to get all scholarships
                          nopage: true  // Signal to backend not to paginate
                        },
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      
                      if (response.data.success) {
                        setScholarships(response.data.scholarships);
                        console.log(`Loaded all ${response.data.scholarships.length} scholarships`);
                      }
                    } catch (err) {
                      console.error('Failed to fetch all scholarships:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', width: '100%' }}
                  disabled={loading}
                >
                  Show All Scholarships
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="scholarships-results">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading scholarships...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredScholarships.length === 0 ? (
            <div className="no-results">
              <p>No scholarships found matching your criteria.</p>
              {scholarships.length === 0 ? (
                <div>
                  <p>There are currently no active scholarships available. Please check back later.</p>
                  <p>Some common reasons:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Scholarships might still be under review</li>
                    <li>No scholarships have been created yet</li>
                    <li>All available scholarships might have expired</li>
                  </ul>
                </div>
              ) : (
                <button onClick={() => {
                  setSearchTerm('');
                  setFilters({ category: '', minAmount: '', maxAmount: '' });
                }} className="btn btn-primary">
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="scholarships-grid">
              {filteredScholarships.map(scholarship => (
                <div key={scholarship._id} className="scholarship-card">
                  <h3 className="scholarship-title">{scholarship.title}</h3>
                  <p className="scholarship-description">{scholarship.description}</p>
                  
                  <div className="scholarship-details">
                    <div className="detail-item">
                      <FiDollarSign className="detail-icon" />
                      <span>${scholarship.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <span>Deadline: {new Date(scholarship.deadlineDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <FiBookOpen className="detail-icon" />
                      <span>{scholarship.category}</span>
                    </div>
                  </div>
                  
                  <div className="scholarship-footer">
                    <Link to={`/scholarships/${scholarship._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls - Only show if totalPages > 1 */}
              {totalPages > 1 && (
                <div className="pagination-container" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <div className="pagination">
                    <button 
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo(0, 0);
                        }
                      }}
                      disabled={currentPage === 1}
                      className="pagination-button"
                      style={{ 
                        padding: '0.5rem 1rem', 
                        marginRight: '0.5rem',
                        backgroundColor: currentPage === 1 ? '#f0f0f0' : '#007bff',
                        color: currentPage === 1 ? '#888' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentPage === 1 ? 'default' : 'pointer'
                      }}
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => {
                          setCurrentPage(index + 1);
                          window.scrollTo(0, 0);
                        }}
                        className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          margin: '0 0.25rem',
                          backgroundColor: currentPage === index + 1 ? '#0056b3' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo(0, 0);
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                      style={{ 
                        padding: '0.5rem 1rem', 
                        marginLeft: '0.5rem',
                        backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#007bff',
                        color: currentPage === totalPages ? '#888' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentPage === totalPages ? 'default' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipsPage; 