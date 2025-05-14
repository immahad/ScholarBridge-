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
  FiLoader,
  FiArrowLeft
} from 'react-icons/fi';
import '../../styles/studentDetail.css';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        
        // Use different endpoint based on user role
        const endpoint = user?.role === 'admin' 
          ? `/api/admin/students/${studentId}` 
          : `/api/students/${studentId}`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const studentData = response.data.student;
          
          // Process scholarship applications to ensure titles are available
          if (studentData.scholarshipApplications && studentData.scholarshipApplications.length > 0) {
            studentData.scholarshipApplications = studentData.scholarshipApplications.map(app => {
              return {
                ...app,
                scholarshipTitle: app.scholarshipTitle || app.scholarshipId?.title || 'N/A'
              };
            });
          }
          
          setStudent(studentData);
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
  }, [studentId, token, user]);
  
  const handleFundScholarship = (scholarshipId) => {
    // Ensure we have a valid scholarshipId, either as a string or from an object
    const validScholarshipId = typeof scholarshipId === 'object' 
      ? scholarshipId._id || scholarshipId.toString()
      : scholarshipId;
      
    console.log("Navigating to payment form with:", {
      scholarshipId: validScholarshipId,
      studentId
    });
    
    // Redirect to the general donation form page
    navigate('/donor/payment');
  };
  
  if (loading) {
    return (
      <div className="student-detail-page">
        <div className="student-detail-loading">
          <div className="student-detail-loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="student-detail-page">
        <div className="student-detail-error">
          <FiAlertCircle />
          {error}
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="student-detail-page">
        <div className="student-detail-error">
          <FiAlertCircle />
          Student not found.
        </div>
      </div>
    );
  }
  
  // Get applications based on user role and status
  let displayedApplications = [];
  const isDonor = user?.role === 'donor';
  const isAdmin = user?.role === 'admin';
  
  if (isDonor) {
    // Donors only see approved applications they can fund
    displayedApplications = student.scholarshipApplications?.filter(app => 
      app.status === 'approved' && !app.paymentId
    ) || [];
    
    console.log("Approved applications for donor:", displayedApplications);
    
    // If no applications are found in scholarshipApplications, check approvedApplications
    if (displayedApplications.length === 0 && student.approvedApplications?.length > 0) {
      console.log("Using approvedApplications instead:", student.approvedApplications);
      displayedApplications = student.approvedApplications;
    }
  } else {
    // Admins see all applications
    displayedApplications = student.scholarshipApplications || [];
  }
  
  return (
    <div className="student-detail-page">
      <div className="student-detail-header">
        <h1 className="student-detail-title">Student Profile</h1>
      </div>
      
      <div className="student-detail-grid">
        {/* Student Profile */}
        <div>
          <div className="student-detail-card">
            <div className="student-detail-profile">
              <div className="student-detail-avatar">
                {student.firstName ? student.firstName.charAt(0).toUpperCase() : "S"}
              </div>
              <h2 className="student-detail-name">{student.firstName} {student.lastName}</h2>
              <div className="student-detail-info">
                <FiMail />
                {student.email}
              </div>
              {student.location && (
                <div className="student-detail-info">
                  <FiMapPin />
                  {student.location}
                </div>
              )}
            </div>
            
            <div className="student-detail-section">
              <h3 className="student-detail-section-title">Academic Information</h3>
              <div className="student-detail-academic-grid">
                <div className="student-detail-academic-item">
                  <div className="student-detail-label">Institution</div>
                  <div className="student-detail-value">
                    <FiBook />
                    {student.institution}
                  </div>
                </div>
                <div className="student-detail-academic-item">
                  <div className="student-detail-label">Program</div>
                  <div className="student-detail-value">{student.program}</div>
                </div>
                <div className="student-detail-academic-item">
                  <div className="student-detail-label">Graduation Year</div>
                  <div className="student-detail-value">
                    <FiCalendar />
                    {student.graduationYear || 'Not specified'}
                  </div>
                </div>
                <div className="student-detail-academic-item">
                  <div className="student-detail-label">GPA</div>
                  <div className="student-detail-value">{student.currentGPA || 'Not specified'}</div>
                </div>
              </div>
            </div>
            
            {student.achievements && student.achievements.length > 0 && (
              <div className="student-detail-section">
                <h3 className="student-detail-section-title">Achievements</h3>
                <ul className="student-detail-achievements">
                  {student.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Scholarship Applications */}
        <div>
          <div className="student-detail-card">
            <h2 className="student-detail-section-title">Scholarship Applications</h2>
            
            {displayedApplications.length === 0 ? (
              <div className="student-detail-empty">
                <div className="student-detail-empty-icon">
                  <FiFileText />
                </div>
                <p className="student-detail-empty-text">
                  {isDonor 
                    ? "This student doesn't have any approved scholarships available for funding."
                    : "This student hasn't submitted any scholarship applications."}
                </p>
              </div>
            ) : (
              <div>
                {displayedApplications.map(application => {
                  // Extract scholarship info differently based on where it is in the object
                  const scholarshipInfo = application.scholarship || {};
                  const scholarshipId = application.scholarshipId || scholarshipInfo._id;
                  const scholarshipTitle = application.scholarshipTitle || scholarshipInfo.title || 'Unknown Scholarship';
                  const scholarshipAmount = scholarshipInfo.amount || 0;
                  
                  return (
                    <div 
                      key={application._id} 
                      className="student-detail-application"
                    >
                      <div className="student-detail-app-header">
                        <div className="student-detail-app-info">
                          <h3 className="student-detail-app-title">
                            {scholarshipTitle}
                          </h3>
                          <div className="student-detail-app-meta">
                            <FiCalendar />
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                          <div className="student-detail-app-meta">
                            <FiAward />
                            Status: <span className={`student-detail-status student-detail-status-${application.status}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          {scholarshipAmount > 0 && (
                            <div className="student-detail-app-meta">
                              <FiDollarSign />
                              Amount: <span style={{fontWeight: '500', marginLeft: '4px'}}>
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(scholarshipAmount)}
                              </span>
                            </div>
                          )}
                          
                          {isDonor && application.status === 'approved' && (
                            <button
                              onClick={() => handleFundScholarship(scholarshipId)}
                              className="student-detail-fund-btn"
                            >
                              <FiDollarSign />
                              Fund Scholarship
                            </button>
                          )}
                        </div>
                        
                      </div>
                      
                      {application.statement && (
                        <div className="student-detail-statement">
                          <h4 className="student-detail-statement-title">Personal Statement</h4>
                          <p className="student-detail-statement-content">{application.statement}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div>
            {isDonor ? (
              <Link 
                to="/donor/students" 
                className="student-detail-back-link"
              >
                <FiArrowLeft />
                Back to Students
              </Link>
            ) : (
              <Link 
                to="/admin/students" 
                className="student-detail-back-link"
              >
                <FiArrowLeft />
                Back to Students
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail; 