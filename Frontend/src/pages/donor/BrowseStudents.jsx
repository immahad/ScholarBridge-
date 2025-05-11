import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/browseStudents.css'; // We'll create this CSS file later
import { FiUser, FiBookOpen, FiAward, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';

const BrowseStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // TODO: Add state for filters (institution, program)
  // const [filters, setFilters] = useState({ institution: '', program: '' });

  const fetchEligibleStudents = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Add filter parameters to the request
      const response = await axios.get(`/api/donors/eligible-students?page=${page}&limit=10`, {
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
      console.error("Error fetching eligible students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEligibleStudents(currentPage);
    }
  }, [token, currentPage]); // TODO: Add filters to dependency array when implemented

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
  
  // TODO: Implement filter change handlers and apply filters function

  if (loading) {
    return <div className="loading-spinner">Loading students...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="browse-students-container">
      <div className="page-header">
        <h1>Browse Eligible Students</h1>
        <p>Find students who have been approved for scholarships and are awaiting funding.</p>
      </div>

      {/* TODO: Add Filter Section */}
      {/* <div className="filters-section">
        <input type="text" placeholder="Filter by institution..." />
        <input type="text" placeholder="Filter by program..." />
        <button className="btn btn-outline"><FiFilter /> Apply Filters</button>
      </div> */}

      {students.length === 0 && !loading ? (
        <div className="empty-state">
          <p>No eligible students found at the moment.</p>
          <p>Please check back later or adjust your filters.</p>
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
                  <hr />
                  <h4>Approved for Scholarship:</h4>
                  <p><strong>Title:</strong> {student.scholarship?.title || 'N/A'}</p>
                  <p><strong><FiDollarSign /> Amount:</strong> ${student.scholarship?.amount?.toLocaleString() || '0'}</p>
                  <p><em>{student.scholarship?.description || 'No description provided.'}</em></p>
                </div>
                <div className="student-card-footer">
                  <Link to={`/donor/students/${student._id}`} className="btn btn-primary">
                    View Profile & Donate
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

export default BrowseStudents; 