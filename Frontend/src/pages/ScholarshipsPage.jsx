import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiCalendar, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { scholarshipService } from '../services/api';
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

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const response = await scholarshipService.getAllScholarships();
        setScholarships(response.data);
      } catch (err) {
        console.error('Failed to fetch scholarships:', err);
        setError('Failed to load scholarships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  // For demo purposes, we'll use mock data
  useEffect(() => {
    const mockScholarships = [
      {
        id: 1,
        title: "Merit Scholarship for Computer Science",
        description: "Scholarship for outstanding CS students with demonstrated academic excellence.",
        amount: 5000,
        deadline: "2023-07-30",
        category: "Computer Science",
        organization: "Tech Foundation",
        requirements: "GPA 3.5+, CS major",
      },
      {
        id: 2,
        title: "Engineering Excellence Award",
        description: "Supporting the next generation of innovative engineers.",
        amount: 3500,
        deadline: "2023-08-15",
        category: "Engineering",
        organization: "Engineering Society",
        requirements: "Engineering major, research project",
      },
      {
        id: 3,
        title: "Business Leadership Scholarship",
        description: "For business students showing exceptional leadership potential.",
        amount: 4000,
        deadline: "2023-09-01",
        category: "Business",
        organization: "Business Leaders Association",
        requirements: "Business major, leadership experience",
      },
      {
        id: 4,
        title: "Medical Studies Grant",
        description: "Supporting students pursuing careers in healthcare and medicine.",
        amount: 6000,
        deadline: "2023-08-20",
        category: "Medical",
        organization: "Healthcare Foundation",
        requirements: "Pre-med or medical studies, volunteer experience",
      },
      {
        id: 5,
        title: "Arts and Humanities Fellowship",
        description: "Promoting excellence in arts and humanities disciplines.",
        amount: 2500,
        deadline: "2023-09-15",
        category: "Arts",
        organization: "Creative Arts Council",
        requirements: "Arts or humanities major, portfolio",
      },
    ];
    
    setScholarships(mockScholarships);
    setLoading(false);
  }, []);

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
                <div key={scholarship.id} className="scholarship-card">
                  <h3 className="scholarship-title">{scholarship.title}</h3>
                  <p className="scholarship-description">{scholarship.description}</p>
                  
                  <div className="scholarship-details">
                    <div className="detail-item">
                      <FiDollarSign className="detail-icon" />
                      <span>${scholarship.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <FiBookOpen className="detail-icon" />
                      <span>{scholarship.category}</span>
                    </div>
                  </div>
                  
                  <div className="scholarship-footer">
                    <Link to={`/scholarships/${scholarship.id}`} className="btn btn-primary">
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