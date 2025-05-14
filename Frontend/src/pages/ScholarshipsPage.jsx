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
          const response = await axios.get('/api/students/scholarships', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Scholarships API response:', response.data);
          
          if (response.data.success) {
            setScholarships(response.data.scholarships);
          } else {
            setError('Failed to load scholarships');
          }
        } else {
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
  }, [token, isStudent]);

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
              <button onClick={() => {
                setSearchTerm('');
                setFilters({ category: '', minAmount: '', maxAmount: '' });
              }} className="btn btn-primary">
                Reset Filters
              </button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipsPage; 