import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/browseStudents.css';
import { FiUser, FiBookOpen, FiAward, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiSearch, FiRefreshCw, FiBook, FiMapPin, FiCalendar, FiInfo } from 'react-icons/fi';

const BrowseStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    institution: '',
    program: '',
    search: ''
  });
  
  // For pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchStudents();
  }, [page, filters]);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        )
      });
      
      const response = await axios.get(`/api/donors/eligible-students?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStudents(response.data.students);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };
  
  const clearFilters = () => {
    setFilters({
      institution: '',
      program: '',
      search: ''
    });
    setPage(1);
  };

  return (
    <div className="browse-students-page">
      <div className="browse-students-header">
        <h1 className="browse-students-title">Browse Students</h1>
        <p className="browse-students-subtitle">Find students who match your scholarship criteria</p>
      </div>
      
      {/* Filters */}
      <div className="browse-students-filters">
        <form onSubmit={handleSearch} className="browse-students-form">
          <div className="browse-students-form-group">
            <label htmlFor="search" className="browse-students-form-label">
              Search
            </label>
            <div className="browse-students-input-wrapper">
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="browse-students-form-input"
              />
              <FiSearch className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-form-group">
            <label htmlFor="institution" className="browse-students-form-label">
              Institution
            </label>
            <div className="browse-students-input-wrapper">
            <select
              id="institution"
              name="institution"
              value={filters.institution}
              onChange={handleFilterChange}
                className="browse-students-form-select"
            >
              <option value="">All Institutions</option>
              <option value="University of Washington">University of Washington</option>
              <option value="Stanford University">Stanford University</option>
              <option value="MIT">MIT</option>
              <option value="Harvard University">Harvard University</option>
              <option value="Other">Other</option>
            </select>
              <FiBookOpen className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-form-group">
            <label htmlFor="program" className="browse-students-form-label">
              Program
            </label>
            <div className="browse-students-input-wrapper">
            <select
              id="program"
              name="program"
              value={filters.program}
              onChange={handleFilterChange}
                className="browse-students-form-select"
            >
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
              <option value="Other">Other</option>
            </select>
              <FiBook className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-actions">
            <button
              type="submit"
              className="browse-students-btn browse-students-btn-primary"
            >
              <FiFilter />
              Apply Filters
            </button>
            
            <button
              type="button"
              onClick={clearFilters}
              className="browse-students-btn browse-students-btn-secondary"
            >
              <FiRefreshCw />
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Student Cards */}
      {loading ? (
        <div className="browse-students-loading">
          <div className="browse-students-loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="browse-students-error">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="browse-students-empty">
          <div className="browse-students-empty-icon">
            <FiUser />
          </div>
          <p className="browse-students-empty-text">No students found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="browse-students-btn browse-students-btn-primary"
          >
            Clear filters and try again
          </button>
        </div>
      ) : (
        <div className="browse-students-grid">
            {students.map((student, index) => (
            <div key={`student-${student._id}-${index}`} className="browse-students-card">
              <div className="browse-students-card-body">
                <div className="browse-students-card-header">
                  <div>
                    <h2 className="browse-students-card-title">{student.firstName} {student.lastName}</h2>
                    <div className="browse-students-card-info">
                      <FiBook />
                      {student.program}
                    </div>
                    <div className="browse-students-card-info">
                      <FiMapPin />
                      {student.institution}
                    </div>
                    {student.graduationYear && (
                      <div className="browse-students-card-info">
                        <FiCalendar />
                        Graduation: {student.graduationYear}
                      </div>
                    )}
                  </div>
                  <div className="browse-students-avatar">
                    {student.firstName ? student.firstName.charAt(0).toUpperCase() : "S"}
                  </div>
                </div>
                
                <div className="browse-students-card-section">
                  <h3 className="browse-students-card-section-title">About</h3>
                  <p className="browse-students-card-section-content">
                    {student.bio ? (
                      student.bio.length > 150 ? `${student.bio.substring(0, 150)}...` : student.bio
                    ) : 'No bio provided.'}
                  </p>
                </div>
                
                <div className="browse-students-card-footer">
                  <Link
                    to={`/donor/students/${student._id}`}
                    className="browse-students-btn browse-students-btn-primary"
                  >
                    <FiInfo />
                    View Profile
                  </Link>
                </div>
                </div>
              </div>
            ))}
          </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="browse-students-pagination">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            className="browse-students-pagination-btn"
          >
            <FiChevronLeft />
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
              className={`browse-students-pagination-btn ${page === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            className="browse-students-pagination-btn"
            >
              Next
            <FiChevronRight />
            </button>
          </div>
      )}
    </div>
  );
};

export default BrowseStudents; 