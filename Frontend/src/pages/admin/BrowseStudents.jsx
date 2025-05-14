import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/browseStudents.css';
import { FiUser, FiBookOpen, FiAward, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiCheck, FiX, FiSearch, FiRefreshCw, FiMapPin, FiInfo, FiMail } from 'react-icons/fi';

const AdminBrowseStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [filters, setFilters] = useState({ 
    institution: '',
    program: '',
    search: '' 
  });

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        ...(filters.institution && { institution: filters.institution }),
        ...(filters.program && { program: filters.program }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get(`/api/admin/students?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStudents(response.data.students || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalStudents(response.data.total || 0);
      } else {
        setError(response.data.message || 'Failed to fetch students.');
        setStudents([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching students.');
      setStudents([]);
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents(currentPage);
    }
  }, [token, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying filters
    fetchStudents(1);
  };

  const clearFilters = () => {
    setFilters({ 
      institution: '',
      program: '',
      search: '' 
    });
    setCurrentPage(1);
    fetchStudents(1);
  };

  // Function to handle application approval/rejection
  const handleApplicationAction = async (studentId, applicationId, action) => {
    try {
      const response = await axios.put(`/api/admin/applications/${applicationId}`, 
        { action },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        // Update the student in the local state
        const updatedStudents = students.map(student => {
          if (student._id === studentId) {
            // Update the specific application's status
            const updatedApplications = student.scholarshipApplications.map(app => {
              if (app._id === applicationId) {
                return {
                  ...app,
                  status: action === 'approve' ? 'approved' : 'rejected'
                };
              }
              return app;
            });
            
            return {
              ...student,
              scholarshipApplications: updatedApplications
            };
          }
          return student;
        });
        
        setStudents(updatedStudents);
      } else {
        throw new Error(response.data.message || `Failed to ${action} application.`);
      }
    } catch (err) {
      console.error(`Error ${action}ing application:`, err);
      alert(`Failed to ${action} application: ${err.message}`);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="browse-students-page">
        <div className="browse-students-loading">
          <div className="browse-students-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-students-page">
      <div className="browse-students-header">
        <h1 className="browse-students-title">Browse All Students</h1>
        <p className="browse-students-subtitle">View and manage student profiles and scholarship applications.</p>
      </div>

      <div className="browse-students-filters">
        <form onSubmit={applyFilters} className="browse-students-form">
          <div className="browse-students-form-group">
            <label htmlFor="search" className="browse-students-form-label">Search</label>
            <div className="browse-students-input-wrapper">
              <input 
                type="text" 
                id="search"
                name="search"
                placeholder="Search by name or email..." 
                value={filters.search}
                onChange={handleFilterChange}
                className="browse-students-form-input"
              />
              <FiSearch className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-form-group">
            <label htmlFor="institution" className="browse-students-form-label">Institution</label>
            <div className="browse-students-input-wrapper">
              <input 
                type="text" 
                id="institution"
                name="institution"
                placeholder="Filter by institution..." 
                value={filters.institution}
                onChange={handleFilterChange}
                className="browse-students-form-input"
              />
              <FiBookOpen className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-form-group">
            <label htmlFor="program" className="browse-students-form-label">Program</label>
            <div className="browse-students-input-wrapper">
              <input 
                type="text" 
                id="program"
                name="program"
                placeholder="Filter by program..." 
                value={filters.program}
                onChange={handleFilterChange}
                className="browse-students-form-input"
              />
              <FiAward className="browse-students-input-icon" />
            </div>
          </div>
          
          <div className="browse-students-actions">
            <button type="submit" className="browse-students-btn browse-students-btn-primary">
              <FiFilter />
              Apply Filters
            </button>
            <button type="button" onClick={clearFilters} className="browse-students-btn browse-students-btn-secondary">
              <FiRefreshCw />
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {error && <div className="browse-students-error">{error}</div>}

      {students.length === 0 && !loading ? (
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
        <>
          <div className="browse-students-grid">
            {students.map(student => (
              <div key={student._id} className="browse-students-card">
                <div className="browse-students-card-body">
                  <div className="browse-students-card-header">
                    <div>
                      <h2 className="browse-students-card-title">{student.firstName} {student.lastName}</h2>
                      <div className="browse-students-card-info">
                        <FiBookOpen />
                        {student.program || 'No Program'}
                      </div>
                      <div className="browse-students-card-info">
                        <FiMapPin />
                        {student.institution || 'No Institution'}
                      </div>
                      <div className="browse-students-card-info">
                        <FiMail />
                        {student.email}
                      </div>
                    </div>
                    <div className="browse-students-avatar">
                      {student.firstName ? student.firstName.charAt(0).toUpperCase() : "S"}
                    </div>
                  </div>
                  
                  <div className="browse-students-card-section">
                    <h3 className="browse-students-card-section-title">Application Status</h3>
                    {student.scholarshipApplications && student.scholarshipApplications.length > 0 ? (
                      <div className="browse-students-card-section-content">
                        <p><strong>Total Applications:</strong> {student.scholarshipApplications.length}</p>
                        <div className="browse-students-status-badges">
                          <span className="browse-students-status-badge browse-students-status-badge-approved">
                            Approved: {student.scholarshipApplications.filter(app => app.status === 'approved').length}
                          </span>
                          <span className="browse-students-status-badge browse-students-status-badge-rejected">
                            Rejected: {student.scholarshipApplications.filter(app => app.status === 'rejected').length}
                          </span>
                          <span className="browse-students-status-badge browse-students-status-badge-pending">
                            Pending: {student.scholarshipApplications.filter(app => app.status === 'pending').length}
                          </span>
                          <span className="browse-students-status-badge browse-students-status-badge-funded">
                            Funded: {student.scholarshipApplications.filter(app => app.status === 'funded').length}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="browse-students-card-section-content">No applications submitted yet.</p>
                    )}
                  </div>
                  
                  <div className="browse-students-card-footer">
                    <Link to={`/admin/students/${student._id}`} className="browse-students-btn browse-students-btn-primary">
                      <FiInfo />
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="browse-students-pagination">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1} 
              className="browse-students-pagination-btn"
            >
              <FiChevronLeft />
              Previous
            </button>
            <span className="browse-students-pagination-info">
              Page {currentPage} of {totalPages} (Total: {totalStudents} students)
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages} 
              className="browse-students-pagination-btn"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBrowseStudents; 