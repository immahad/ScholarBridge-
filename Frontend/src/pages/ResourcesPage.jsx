import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Reusing about styles as they fit this content page

const ResourcesPage = () => {
  return (
    <div className="about-page resources-page">
      <div className="container">
        <h1 className="page-title">Student Resources</h1>
        <p className="page-description">
          Access valuable resources to help you succeed in your educational journey and scholarship applications.
        </p>
        
        <section className="about-section">
          <h2>Scholarship Guides</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <h3>Scholarship Essay Writing Guide</h3>
              <p>Learn how to craft compelling scholarship essays that stand out to selection committees.</p>
              <a href="#" className="resource-link">Download Guide</a>
            </div>
            
            <div className="resource-card">
              <h3>Financial Aid Handbook</h3>
              <p>Understand the different types of financial aid and how to maximize your funding opportunities.</p>
              <a href="#" className="resource-link">Download Handbook</a>
            </div>
            
            <div className="resource-card">
              <h3>Scholarship Interview Preparation</h3>
              <p>Prepare for scholarship interviews with common questions and expert tips.</p>
              <a href="#" className="resource-link">View Guide</a>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Educational Planning</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <h3>College Planning Timeline</h3>
              <p>Stay on track with this comprehensive timeline for college preparation and applications.</p>
              <a href="#" className="resource-link">View Timeline</a>
            </div>
            
            <div className="resource-card">
              <h3>Major Selection Guide</h3>
              <p>Tools and assessments to help you choose a major that aligns with your interests and goals.</p>
              <a href="#" className="resource-link">Explore Guide</a>
            </div>
            
            <div className="resource-card">
              <h3>Career Exploration Tools</h3>
              <p>Resources to help you research career paths related to your academic interests.</p>
              <a href="#" className="resource-link">Access Tools</a>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Financial Literacy</h2>
          <div className="resource-grid">
            <div className="resource-card">
              <h3>Student Budget Template</h3>
              <p>Create a realistic budget for your education expenses with this customizable template.</p>
              <a href="#" className="resource-link">Download Template</a>
            </div>
            
            <div className="resource-card">
              <h3>Understanding Student Loans</h3>
              <p>Learn about different types of student loans, interest rates, and repayment options.</p>
              <a href="#" className="resource-link">Read Guide</a>
            </div>
            
            <div className="resource-card">
              <h3>Financial Literacy Course</h3>
              <p>Free online course covering essential financial concepts for students.</p>
              <a href="#" className="resource-link">Start Course</a>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>External Resources</h2>
          <ul className="resource-list">
            <li>
              <strong>FAFSA (Free Application for Federal Student Aid)</strong>
              <p>The gateway to federal financial aid programs, including grants, work-study, and loans.</p>
              <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">Visit FAFSA</a>
            </li>
            
            <li>
              <strong>College Board</strong>
              <p>Resources for college planning, SAT preparation, and scholarship searches.</p>
              <a href="https://www.collegeboard.org/" target="_blank" rel="noopener noreferrer">Visit College Board</a>
            </li>
            
            <li>
              <strong>National Association of Student Financial Aid Administrators</strong>
              <p>Information about financial aid programs and policies.</p>
              <a href="https://www.nasfaa.org/students" target="_blank" rel="noopener noreferrer">Visit NASFAA</a>
            </li>
            
            <li>
              <strong>Occupational Outlook Handbook</strong>
              <p>Career information including education requirements, job outlook, and earnings.</p>
              <a href="https://www.bls.gov/ooh/" target="_blank" rel="noopener noreferrer">Visit OOH</a>
            </li>
          </ul>
        </section>
        
        <div className="cta-section">
          <h2>Need More Help?</h2>
          <p>Check out our other student resources or contact us for personalized assistance.</p>
          <Link to="/how-to-apply" className="btn btn-primary">How to Apply</Link>
          <Link to="/faqs" className="btn btn-secondary">FAQs</Link>
          <Link to="/contact" className="btn btn-outline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage; 