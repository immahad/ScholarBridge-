import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Using about styles as they work well for content pages

const ApplicationTipsPage = () => {
  return (
    <div className="about-page tips-page">
      <div className="container">
        <h1 className="page-title">Scholarship Application Tips</h1>
        <p className="page-description">
          Maximize your chances of securing scholarships with these expert tips and strategies.
        </p>
        
        <section className="about-section">
          <h2>General Application Strategies</h2>
          <div className="tip-list">
            <div className="tip-item">
              <h3>Apply Early</h3>
              <p>
                Submit your applications well before deadlines. Early applications demonstrate responsibility and give you time to address any issues that might arise.
              </p>
            </div>
            
            <div className="tip-item">
              <h3>Apply for Multiple Scholarships</h3>
              <p>
                Don't put all your eggs in one basket. Apply for as many scholarships as you qualify for to increase your chances of receiving funding.
              </p>
            </div>
            
            <div className="tip-item">
              <h3>Read Instructions Carefully</h3>
              <p>
                Each scholarship has unique requirements. Pay close attention to eligibility criteria, application components, and submission guidelines.
              </p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Crafting a Strong Personal Statement</h2>
          <ul className="feature-list">
            <li><strong>Be authentic:</strong> Share your genuine story and aspirations.</li>
            <li><strong>Show, don't tell:</strong> Use specific examples and experiences to illustrate your qualities.</li>
            <li><strong>Tailor to each scholarship:</strong> Highlight aspects of your background that align with the scholarship's mission.</li>
            <li><strong>Address challenges:</strong> Demonstrate resilience by explaining how you've overcome obstacles.</li>
            <li><strong>Proofread thoroughly:</strong> Errors can detract from an otherwise strong application.</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Securing Strong Letters of Recommendation</h2>
          <ul className="feature-list">
            <li>Choose recommenders who know you well and can speak to your abilities and character</li>
            <li>Request recommendations at least 3-4 weeks in advance of deadlines</li>
            <li>Provide your recommenders with your resume, achievements, and application details</li>
            <li>Send thank-you notes to those who write recommendations for you</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Presenting Your Achievements</h2>
          <div className="tip-list">
            <div className="tip-item">
              <h3>Organize Your Information</h3>
              <p>
                Create a comprehensive list of your academic achievements, extracurricular activities, volunteer work, and employment history.
              </p>
            </div>
            
            <div className="tip-item">
              <h3>Quantify When Possible</h3>
              <p>
                Use numbers to demonstrate impact (e.g., "Led a team of 10 volunteers," "Raised $5,000 for charity").
              </p>
            </div>
            
            <div className="tip-item">
              <h3>Highlight Leadership</h3>
              <p>
                Emphasize instances where you've taken initiative, solved problems, or led others.
              </p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Interview Preparation</h2>
          <ul className="feature-list">
            <li>Research the scholarship organization and its values</li>
            <li>Practice answering common scholarship interview questions</li>
            <li>Prepare questions to ask the interviewers</li>
            <li>Dress professionally and arrive early</li>
            <li>Follow up with a thank-you note after the interview</li>
          </ul>
        </section>
        
        <div className="cta-section">
          <h2>Ready to Put These Tips to Use?</h2>
          <p>Apply these strategies to your scholarship applications and increase your chances of success.</p>
          <Link to="/how-to-apply" className="btn btn-primary">How to Apply</Link>
          <Link to="/resources" className="btn btn-secondary">Student Resources</Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTipsPage; 