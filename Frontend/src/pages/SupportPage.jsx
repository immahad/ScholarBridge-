import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthUtils';
import { toast } from 'react-toastify';
import '../styles/support.css';

const SupportPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuth();

  const handleDonateClick = () => {
    if (!token) {
      // If user is not logged in, redirect to login page with return URL
      toast.info('Please log in to make a donation');
      navigate('/login', { state: { from: '/donor/payment' } });
    } else if (role !== 'donor') {
      // If user is logged in but not a donor
      toast.info('Please register as a donor to make donations');
      navigate('/register', { state: { role: 'donor' } });
    } else {
      // User is logged in and is a donor
      navigate('/donor/payment');
    }
  };

  return (
    <div className="support-page">
      <div className="container">
        <h1 className="page-title">Support ScholarBridge</h1>
        <p className="page-description">
          Your contribution helps us connect more students with life-changing educational opportunities.
        </p>
        
        <section className="support-section">
          <h2>Why Support Us</h2>
          <p>
            By supporting ScholarBridge, you're investing in the future of education and helping us:
          </p>
          <ul className="support-list">
            <li>Connect more students with scholarship opportunities</li>
            <li>Develop advanced features to improve scholarship matching</li>
            <li>Reduce barriers to higher education</li>
            <li>Create a more equitable educational landscape</li>
          </ul>
        </section>
        
        <section className="support-section">
          <h2>Ways to Support</h2>
          <div className="support-options">
            <div className="support-card">
              <h3>Become a Donor</h3>
              <p>Create scholarships and directly fund students' educational journeys.</p>
              <a href="/register" className="btn-primary">Register as Donor</a>
            </div>
            <div className="support-card">
              <h3>Make a Donation</h3>
              <p>Support our platform operations with a one-time or recurring donation.</p>
              <button onClick={handleDonateClick} className="btn-primary">Donate Now</button>
            </div>
            <div className="support-card">
              <h3>Partner with Us</h3>
              <p>Organizations and institutions can partner to expand our impact.</p>
              <a href="/about" className="btn-outline">Learn More</a>
            </div>
          </div>
        </section>
        
        <section className="support-section">
          <h2>Our Impact</h2>
          <div className="impact-stats">
            <div className="stat-card">
              <h3>Students Helped</h3>
              <p className="stat-number">1,000+</p>
            </div>
            <div className="stat-card">
              <h3>Scholarships Awarded</h3>
              <p className="stat-number">$2M+</p>
            </div>
            <div className="stat-card">
              <h3>Educational Partners</h3>
              <p className="stat-number">50+</p>
            </div>
          </div>
        </section>
        
        <section className="support-section">
          <h2>Contact Us</h2>
          <p>Have questions about supporting ScholarBridge? Reach out to our team.</p>
          <div className="contact-info">
            <p><strong>Email:</strong> support@scholarbridge.edu</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
