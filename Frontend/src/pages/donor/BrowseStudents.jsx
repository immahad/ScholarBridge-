import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/browseStudents.css'; // We'll create this CSS file later
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
        limit: 10,
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Browse Students</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="w-full p-2 pl-10 pr-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <select
              id="institution"
              name="institution"
              value={filters.institution}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Institutions</option>
              <option value="University of Washington">University of Washington</option>
              <option value="Stanford University">Stanford University</option>
              <option value="MIT">MIT</option>
              <option value="Harvard University">Harvard University</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              id="program"
              name="program"
              value={filters.program}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2 min-w-[200px]">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiFilter className="mr-2" />
              Apply Filters
            </button>
            
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Student Cards */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiUser className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-600">No students found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Clear filters and try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
            <div key={`student-${student._id}-${index}`} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1">{student.firstName} {student.lastName}</h2>
                    <p className="text-gray-600 flex items-center">
                      <FiBook className="mr-1" />
                      {student.program}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <FiMapPin className="mr-1" />
                      {student.institution}
                    </p>
                    {student.graduationYear && (
                      <p className="text-gray-600 flex items-center">
                        <FiCalendar className="mr-1" />
                        Graduation: {student.graduationYear}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="text-blue-500 text-xl" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium">About</h3>
                  <p className="text-gray-700 text-sm mt-1 line-clamp-3">
                    {student.bio || 'No bio provided.'}
                  </p>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Link
                    to={`/donor/students/${student._id}`}
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FiInfo className="mr-2" />
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
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`mx-1 px-3 py-1 rounded ${
                page === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`mx-1 px-3 py-1 rounded ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
          </div>
      )}
    </div>
  );
};

export default BrowseStudents; 