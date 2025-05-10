import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthUtils';
import '../styles/scholarship-detail.css';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        // This would normally fetch from the API
        // const response = await scholarshipService.getScholarship(id);
        // setScholarship(response.data);
        
        // Using mock data for demo
        const mockScholarship = {
          id: parseInt(id),
          title: "Merit Scholarship for Computer Science",
          description: "Scholarship for outstanding CS students with demonstrated academic excellence.",
          amount: 5000,
          deadline: "2023-07-30",
          category: "Computer Science",
          organization: "Tech Foundation",
          requirements: "GPA 3.5+, CS major",
          details: "This scholarship aims to recognize and support outstanding students in Computer Science who have demonstrated exceptional academic achievement and potential. Recipients will receive financial support for tuition, books, and related educational expenses.",
          eligibility: [
            "Currently enrolled in a Computer Science or related program",
            "Minimum GPA of 3.5 on a 4.0 scale",
            "Demonstrated leadership and involvement in extracurricular activities",
            "Financial need may be considered but is not required"
          ],
          applicationProcess: [
            "Complete the online application form",
            "Submit official academic transcripts",
            "Provide a letter of recommendation from a faculty member",
            "Write a 500-word essay on how this scholarship will help you achieve your academic and career goals"
          ],
          selectionCriteria: [
            "Academic excellence (40%)",
            "Demonstrated leadership and extracurricular involvement (30%)",
            "Quality of essay and future goals (20%)",
            "Financial need (10%)"
          ],
          contactInfo: {
            email: "scholarships@techfoundation.org",
            phone: "(123) 456-7890",
            website: "www.techfoundation.org/scholarships"
          }
        };
        
        setScholarship(mockScholarship);
      } catch (err) {
        console.error('Failed to fetch scholarship details:', err);
        setError('Failed to load scholarship details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/scholarships/${id}` } });
      return;
    }
    
    if (user?.role !== 'student') {
      alert('Only students can apply for scholarships.');
      return;
    }
    
    setApplyModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container">
        <div className="error-message">Scholarship not found</div>
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
      </div>
    );
  }

  return (
    <div className="scholarship-detail-page">
      <div className="container">
        <Link to="/scholarships" className="back-link">
          <FiChevronLeft /> Back to Scholarships
        </Link>
        
        <div className="scholarship-header">
          <h1 className="scholarship-title">{scholarship.title}</h1>
          <div className="scholarship-meta">
            <div className="meta-item">
              <FiDollarSign className="meta-icon" />
              <span>${scholarship.amount.toLocaleString()}</span>
            </div>
            <div className="meta-item">
              <FiCalendar className="meta-icon" />
              <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <FiBookOpen className="meta-icon" />
              <span>{scholarship.category}</span>
            </div>
            <div className="meta-item">
              <FiUser className="meta-icon" />
              <span>{scholarship.organization}</span>
            </div>
          </div>
        </div>
        
        <div className="scholarship-content">
          <div className="content-main">
            <section className="content-section">
              <h2>Description</h2>
              <p>{scholarship.details}</p>
            </section>
            
            <section className="content-section">
              <h2>Eligibility Requirements</h2>
              <ul className="requirements-list">
                {scholarship.eligibility.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            
            <section className="content-section">
              <h2>Application Process</h2>
              <ol className="process-list">
                {scholarship.applicationProcess.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
            
            <section className="content-section">
              <h2>Selection Criteria</h2>
              <ul className="criteria-list">
                {scholarship.selectionCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            </section>
          </div>
          
          <div className="content-sidebar">
            <div className="apply-card">
              <h3>Ready to Apply?</h3>
              <p>Application deadline: <strong>{new Date(scholarship.deadline).toLocaleDateString()}</strong></p>
              <button onClick={handleApply} className="btn btn-primary btn-block">
                Apply for this Scholarship
              </button>
              <div className="contact-info">
                <h4>Contact Information</h4>
                <p><strong>Email:</strong> {scholarship.contactInfo.email}</p>
                <p><strong>Phone:</strong> {scholarship.contactInfo.phone}</p>
                <p><strong>Website:</strong> {scholarship.contactInfo.website}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {applyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Apply for Scholarship</h2>
            <p>Complete the application form to apply for this scholarship.</p>
            <p>This is a placeholder for the scholarship application form.</p>
            <div className="modal-actions">
              <button onClick={() => setApplyModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={() => {
                alert('Application submitted successfully!');
                setApplyModalOpen(false);
              }} className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipDetailPage; 