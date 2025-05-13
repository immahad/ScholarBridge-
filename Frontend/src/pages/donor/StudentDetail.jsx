import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { 
  FiUser, 
  FiBook, 
  FiFileText, 
  FiCalendar, 
  FiMapPin, 
  FiAward,
  FiDollarSign,
  FiMail,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setStudent(response.data.student);
        } else {
          setError('Failed to load student details');
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError(err.response?.data?.message || 'Error loading student details');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchStudentDetails();
    }
  }, [studentId, token]);
  
  const handleFundScholarship = (scholarshipId) => {
    navigate(`/donor/fund-scholarship/${scholarshipId}/${studentId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2">Loading student details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </p>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          Student not found.
        </p>
      </div>
    );
  }
  
  // Get approved applications that can be funded
  const approvedApplications = student.scholarshipApplications?.filter(app => 
    app.status === 'approved' && !app.paymentId
  ) || [];
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Student Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-blue-500 text-4xl" />
              </div>
              <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <FiMail className="mr-1" />
                {student.email}
              </p>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <FiMapPin className="mr-1" />
                {student.location || 'No location provided'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Academic Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-gray-600 text-sm">Institution</p>
                  <p className="font-medium flex items-center">
                    <FiBook className="mr-1" />
                    {student.institution}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Program</p>
                  <p className="font-medium">{student.program}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Graduation Year</p>
                  <p className="font-medium flex items-center">
                    <FiCalendar className="mr-1" />
                    {student.graduationYear || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">GPA</p>
                  <p className="font-medium">{student.currentGPA || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {student.achievements && student.achievements.length > 0 && (
              <div className="border-t mt-4 pt-4">
                <h3 className="font-semibold mb-2">Achievements</h3>
                <ul className="list-disc list-inside">
                  {student.achievements.map((achievement, index) => (
                    <li key={index} className="text-gray-700 mb-1">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Scholarship Applications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Scholarship Applications</h2>
            
            {approvedApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiFileText className="mx-auto text-gray-400 text-4xl mb-2" />
                <p>This student doesn't have any approved scholarships available for funding.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedApplications.map(application => (
                  <div 
                    key={application._id} 
                    className="border rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {application.scholarshipId?.title || 'Scholarship'}
                        </h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <FiCalendar className="mr-1" />
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 flex items-center mt-1">
                          <FiAward className="mr-1" />
                          Status: <span className="ml-1 text-green-600 font-medium">Approved</span>
                        </p>
                        {application.scholarshipId?.amount && (
                          <p className="text-gray-600 flex items-center mt-1">
                            <FiDollarSign className="mr-1" />
                            Amount: <span className="ml-1 font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(application.scholarshipId.amount)}
                            </span>
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleFundScholarship(application.scholarshipId._id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
                      >
                        <FiDollarSign className="mr-2" />
                        Fund Scholarship
                      </button>
                    </div>
                    
                    {application.statement && (
                      <div className="mt-3">
                        <h4 className="font-medium">Personal Statement</h4>
                        <p className="text-gray-700 text-sm mt-1">{application.statement}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-2">Financial Need</h2>
            <p className="text-gray-700">
              {student.financialNeedStatement || 'No financial need statement provided.'}
            </p>
          </div>
          
          <div className="mt-6">
            <Link 
              to="/donor/students" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail; 