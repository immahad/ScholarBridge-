import { Link } from 'react-router-dom';
import { FiSearch, FiUsers, FiDollarSign, FiAward } from 'react-icons/fi';
import '../styles/home.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Find the Perfect Scholarship for Your Education</h1>
            <p className="hero-description">
              ScholarSync connects students with donors to make higher education more accessible and affordable.
            </p>
            <div className="hero-buttons">
              <Link to="/scholarships" className="btn btn-primary">
                Find Scholarships
              </Link>
              <Link to="/register" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/hero-image.jpg" alt="Students celebrating graduation" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3 className="feature-title">Create an Account</h3>
              <p className="feature-description">
                Register as a student or donor. Students can browse and apply for scholarships, while donors can create and manage scholarship programs.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiSearch />
              </div>
              <h3 className="feature-title">Find Opportunities</h3>
              <p className="feature-description">
                Browse available scholarships filtered by field of study, institution, amount, and other criteria to find the perfect match.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiAward />
              </div>
              <h3 className="feature-title">Apply Online</h3>
              <p className="feature-description">
                Submit your applications directly through our platform. Track status and receive notifications about your applications.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiDollarSign />
              </div>
              <h3 className="feature-title">Receive Funding</h3>
              <p className="feature-description">
                If selected, funds will be disbursed directly to your institution or according to the scholarship terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">1000+</h3>
              <p className="stat-label">Active Scholarships</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">$5M+</h3>
              <p className="stat-label">Awarded Funds</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">5000+</h3>
              <p className="stat-label">Students Helped</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">300+</h3>
              <p className="stat-label">Partner Institutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-description">
              Whether you're looking for financial support or want to help students achieve their dreams, 
              ScholarSync is here to make a difference in education.
            </p>
            <div className="cta-buttons">
              <Link to="/register?role=student" className="btn btn-primary">
                I'm a Student
              </Link>
              <Link to="/register?role=donor" className="btn btn-secondary">
                I'm a Donor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 