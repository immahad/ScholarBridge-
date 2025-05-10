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
        
        // Using mock data for demo - create different scholarships based on ID
        const mockScholarships = {
          1: {
            id: 1,
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
          },
          2: {
            id: 2,
            title: "Engineering Excellence Award",
            description: "Supporting the next generation of innovative engineers.",
            amount: 3500,
            deadline: "2023-08-15",
            category: "Engineering",
            organization: "Engineering Society",
            requirements: "Engineering major, research project",
            details: "The Engineering Excellence Award is designed to nurture and support talented engineering students who demonstrate innovative thinking and problem-solving skills. This scholarship recognizes students who are committed to advancing the field of engineering through research and innovation.",
            eligibility: [
              "Currently pursuing a degree in any engineering discipline",
              "Minimum GPA of 3.3 on a 4.0 scale",
              "Involvement in at least one significant research or innovative project",
              "Active participation in engineering-related extracurricular activities"
            ],
            applicationProcess: [
              "Complete the online application form",
              "Submit engineering project portfolio or research abstract",
              "Provide two letters of recommendation (one from an engineering faculty member)",
              "Submit a 500-word statement describing your contribution to engineering innovation"
            ],
            selectionCriteria: [
              "Innovation and technical merit of engineering projects (35%)",
              "Academic performance (30%)",
              "Research potential and creativity (25%)",
              "Leadership in engineering activities (10%)"
            ],
            contactInfo: {
              email: "awards@engineeringsociety.org",
              phone: "(123) 555-4321",
              website: "www.engineeringsociety.org/excellence-award"
            }
          },
          3: {
            id: 3,
            title: "Business Leadership Scholarship",
            description: "For business students showing exceptional leadership potential.",
            amount: 4000,
            deadline: "2023-09-01",
            category: "Business",
            organization: "Business Leaders Association",
            requirements: "Business major, leadership experience",
            details: "The Business Leadership Scholarship recognizes and rewards students who demonstrate outstanding leadership qualities and business acumen. This scholarship aims to support future business leaders who show potential to make significant impacts in their chosen field.",
            eligibility: [
              "Enrolled in a business administration, management, finance, marketing, or related program",
              "Minimum GPA of 3.2 on a 4.0 scale",
              "Demonstrated leadership role in campus or community organizations",
              "Strong entrepreneurial mindset or business innovation experience"
            ],
            applicationProcess: [
              "Submit a completed application form",
              "Provide a current resume highlighting leadership experiences",
              "Submit a letter of recommendation from a business professional or professor",
              "Write a 700-word essay on a business challenge and your proposed solution"
            ],
            selectionCriteria: [
              "Leadership experience and potential (40%)",
              "Academic achievement (25%)",
              "Business innovation or entrepreneurial initiative (25%)",
              "Communication skills (10%)"
            ],
            contactInfo: {
              email: "scholarships@businessleaders.org",
              phone: "(123) 789-0123",
              website: "www.businessleaders.org/scholarships"
            }
          },
          4: {
            id: 4,
            title: "Medical Studies Grant",
            description: "Supporting students pursuing careers in healthcare and medicine.",
            amount: 6000,
            deadline: "2023-08-20",
            category: "Medical",
            organization: "Healthcare Foundation",
            requirements: "Pre-med or medical studies, volunteer experience",
            details: "The Medical Studies Grant is designed to support dedicated students who are pursuing careers in the medical field and healthcare professions. This grant helps alleviate financial burdens allowing students to focus on their studies and preparing for careers that will improve healthcare outcomes.",
            eligibility: [
              "Current enrollment in pre-medical studies, nursing, or other healthcare-related program",
              "Minimum GPA of 3.4 on a 4.0 scale",
              "Completion of at least 50 hours of healthcare-related volunteer or work experience",
              "Demonstrated commitment to serving underserved populations (preferred)"
            ],
            applicationProcess: [
              "Complete the online grant application",
              "Submit official transcripts from all post-secondary institutions attended",
              "Provide documentation of healthcare volunteer/work experience",
              "Write a personal statement describing your healthcare career goals",
              "Submit two letters of recommendation (one from a healthcare professional)"
            ],
            selectionCriteria: [
              "Academic excellence in science and healthcare courses (35%)",
              "Quality and quantity of healthcare-related experience (30%)",
              "Commitment to healthcare service (25%)",
              "Financial need (10%)"
            ],
            contactInfo: {
              email: "grants@healthcarefoundation.org",
              phone: "(123) 456-9876",
              website: "www.healthcarefoundation.org/grants"
            }
          },
          5: {
            id: 5,
            title: "Arts and Humanities Fellowship",
            description: "Promoting excellence in arts and humanities disciplines.",
            amount: 2500,
            deadline: "2023-09-15",
            category: "Arts",
            organization: "Creative Arts Council",
            requirements: "Arts or humanities major, portfolio",
            details: "The Arts and Humanities Fellowship supports talented students pursuing degrees in various artistic and humanities disciplines. This fellowship aims to nurture creativity, critical thinking, and cultural expression in the next generation of artists, writers, philosophers, and historians.",
            eligibility: [
              "Currently majoring in an arts or humanities discipline",
              "Demonstrated creative or scholarly achievement",
              "Minimum GPA of 3.0 on a 4.0 scale",
              "Strong portfolio of creative work or research in relevant field"
            ],
            applicationProcess: [
              "Submit completed application form",
              "Provide a portfolio of creative work or research writing samples",
              "Submit a personal statement on your artistic or scholarly vision",
              "Provide a letter of recommendation from a faculty member in your discipline"
            ],
            selectionCriteria: [
              "Quality and originality of portfolio or research (45%)",
              "Artistic vision or scholarly potential (25%)",
              "Academic performance in arts/humanities courses (20%)",
              "Contribution to cultural discourse (10%)"
            ],
            contactInfo: {
              email: "fellowships@creativeartscouncil.org",
              phone: "(123) 987-6543",
              website: "www.creativeartscouncil.org/fellowships"
            }
          }
        };
        
        // Get the scholarship based on ID or default to first one if not found
        const scholarshipId = parseInt(id);
        const selectedScholarship = mockScholarships[scholarshipId] || mockScholarships[1];
        
        setScholarship(selectedScholarship);
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