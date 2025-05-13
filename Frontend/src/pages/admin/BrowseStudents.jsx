import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/browseStudents.css';
import { FiUser, FiBookOpen, FiAward, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiCheck, FiX, FiSearch } from 'react-icons/fi';

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
        limit: 10,
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
    return <div className="loading-spinner">Loading students...</div>;
  }

  return (
    <div className="browse-students-container">
      <div className="page-header">
        <h1>Browse All Students</h1>
        <p>View and manage student profiles and scholarship applications.</p>
      </div>

      <div className="filters-section">
        <form onSubmit={applyFilters} className="flex flex-wrap gap-4 w-full">
          <input 
            type="text" 
            name="search"
            placeholder="Search by name or email..." 
            value={filters.search}
            onChange={handleFilterChange}
            className="flex-grow"
          />
          <input 
            type="text" 
            name="institution"
            placeholder="Filter by institution..." 
            value={filters.institution}
            onChange={handleFilterChange}
            className="flex-grow md:flex-grow-0 w-full md:w-auto"
          />
          <input 
            type="text" 
            name="program"
            placeholder="Filter by program..." 
            value={filters.program}
            onChange={handleFilterChange}
            className="flex-grow md:flex-grow-0 w-full md:w-auto"
          />
          <button type="submit" className="btn btn-primary">
            <FiSearch /> Apply Filters
          </button>
          <button type="button" onClick={clearFilters} className="btn btn-outline">
            Clear Filters
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {students.length === 0 && !loading ? (
        <div className="empty-state">
          <p>No students found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="students-list">
            {students.map(student => (
              <div key={student._id} className="student-card-item">
                <div className="student-card-header">
                  <FiUser className="student-icon" />
                  <h3>{student.firstName} {student.lastName}</h3>
                </div>
                <div className="student-card-body">
                  <p><strong><FiBookOpen /> Program:</strong> {student.program || 'N/A'}</p>
                  <p><strong><FiAward /> Institution:</strong> {student.institution || 'N/A'}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <hr />
                  <h4>Application Status:</h4>
                  {student.scholarshipApplications && student.scholarshipApplications.length > 0 ? (
                    <div>
                      {student.scholarshipApplications.map(app => (
                        <div key={app._id} className="application-item mb-3 p-2 border-l-4 border-blue-500 bg-blue-50">
                          <p><strong>Scholarship:</strong> {app.scholarshipTitle || 'N/A'}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              app.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </p>
                          <div className="flex gap-2 mt-2">
                            {app.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApplicationAction(student._id, app._id, 'approve')}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs flex items-center"
                                >
                                  <FiCheck className="mr-1" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleApplicationAction(student._id, app._id, 'reject')}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-xs flex items-center"
                                >
                                  <FiX className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No applications submitted yet.</p>
                  )}
                </div>
                <div className="student-card-footer">
                  <Link to={`/admin/students/${student._id}`} className="btn btn-primary">
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn">
              <FiChevronLeft /> Previous
            </button>
            <span>Page {currentPage} of {totalPages} (Total: {totalStudents} students)</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn">
              Next <FiChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBrowseStudents; 