import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Using about styles as they should be suitable for this content page

const HowToApplyPage = () => {
  return (
    <div className="about-page how-to-apply-page">
      <div className="container">
        <h1 className="page-title">How to Apply for Scholarships</h1>
        <p className="page-description">
          Follow this step-by-step guide to successfully apply for scholarships through ScholarSync.
        </p>
        
        <section className="about-section">
          <h2>Step 1: Create Your Account</h2>
          <p>
            Start by <Link to="/register">creating an account</Link> on ScholarSync. You'll need to provide some basic information and verify your email address.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Step 2: Complete Your Profile</h2>
          <p>
            Fill out your profile with accurate information about your:
          </p>
          <ul className="feature-list">
            <li>Academic background and achievements</li>
            <li>Extracurricular activities and volunteer work</li>
            <li>Career goals and aspirations</li>
            <li>Financial information (if required for needs-based scholarships)</li>
          </ul>
          <p>
            A complete profile will help match you with suitable scholarships and simplify the application process.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Step 3: Browse Available Scholarships</h2>
          <p>
            Explore our <Link to="/scholarships">scholarships page</Link> to find opportunities that match your profile. You can filter by:
          </p>
          <ul className="feature-list">
            <li>Field of study</li>
            <li>Award amount</li>
            <li>Eligibility requirements</li>
            <li>Application deadlines</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Step 4: Prepare Required Documents</h2>
          <p>
            Most scholarships require supporting documents. Commonly requested items include:
          </p>
          <ul className="feature-list">
            <li>Academic transcripts</li>
            <li>Letters of recommendation</li>
            <li>Personal statement or essay</li>
            <li>Financial aid documents</li>
            <li>Resume or CV</li>
          </ul>
          <p>
            Have these documents ready in digital format (PDF preferred) for quick upload.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Step 5: Submit Your Applications</h2>
          <p>
            Once you've found scholarships you're eligible for and prepared your documents:
          </p>
          <ol className="feature-list">
            <li>Click "Apply" on each scholarship</li>
            <li>Complete all required fields</li>
            <li>Upload the necessary documents</li>
            <li>Review your application for errors</li>
            <li>Submit before the deadline</li>
          </ol>
        </section>
        
        <section className="about-section">
          <h2>Step 6: Track Your Applications</h2>
          <p>
            Monitor the status of your applications through your <Link to="/student/applications">student dashboard</Link>. You'll receive notifications about:
          </p>
          <ul className="feature-list">
            <li>Application receipt confirmation</li>
            <li>Additional information requests</li>
            <li>Interview invitations (if applicable)</li>
            <li>Final decisions</li>
          </ul>
        </section>

        <div className="cta-section">
          <h2>Ready to Start?</h2>
          <p>Find scholarships that match your profile and begin your application process today.</p>
          <Link to="/scholarships" className="btn btn-primary">Find Scholarships</Link>
          <Link to="/tips" className="btn btn-secondary">Application Tips</Link>
        </div>
      </div>
    </div>
  );
};

export default HowToApplyPage; 