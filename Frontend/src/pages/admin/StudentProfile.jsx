import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiMapPin, 
  FiCalendar, 
  FiBookOpen, 
  FiAward,
  FiChevronLeft
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/admin-profile.css';

const StudentProfile = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setStudent(response.data.student);
        } else {
          setError('Failed to load student data');
          toast.error('Failed to load student data');
        }
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        setError('Error loading student profile');
        toast.error('Error loading student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/admin/students" className="btn btn-primary">
            <FiChevronLeft /> Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <h1 className="admin-profile-title">Student Profile</h1>
        <Link to="/admin/students" className="admin-profile-btn admin-profile-btn-outline">
          <FiChevronLeft /> Back to Students List
        </Link>
      </div>

      {student && (
        <>
          <div className="admin-profile-section">
            <div className="profile-header-content">
              <div className="profile-avatar">
                {student.firstName?.charAt(0) || 'S'}
              </div>
              <h1 className="profile-name">{student.firstName} {student.lastName}</h1>
              <div className="profile-email">
                <FiMail />
                {student.email}
              </div>
              {student.location && (
                <div className="profile-location">
                  <FiMapPin />
                  {student.location}
                </div>
              )}
            </div>
          </div>

          <div className="admin-profile-section">
            <h2 className="admin-profile-section-title">Academic Information</h2>
            <div className="admin-profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Institution</span>
                <div className="profile-info-value">
                  <FiBookOpen />
                  {student.institution || 'Not specified'}
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Program</span>
                <div className="profile-info-value">
                  <FiAward />
                  {student.program || 'Not specified'}
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Graduation Year</span>
                <div className="profile-info-value">
                  <FiCalendar />
                  {student.graduationYear || 'Not specified'}
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">GPA</span>
                <div className="profile-info-value">
                  {student.gpa || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-profile-section">
            <h2 className="admin-profile-section-title">Account Status</h2>
            <div className="admin-profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Account Created</span>
                <div className="profile-info-value">
                  <FiCalendar />
                  {formatDate(student.createdAt)}
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Verified</span>
                <div className="profile-info-value">
                  {student.isVerified ? 
                    <span className="badge success">Verified</span> : 
                    <span className="badge warning">Not Verified</span>
                  }
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Active Status</span>
                <div className="profile-info-value">
                  {student.isActive ? 
                    <span className="badge success">Active</span> : 
                    <span className="badge danger">Inactive</span>
                  }
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Last Login</span>
                <div className="profile-info-value">
                  <FiCalendar />
                  {student.lastLogin ? formatDate(student.lastLogin) : 'Never logged in'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentProfile; 