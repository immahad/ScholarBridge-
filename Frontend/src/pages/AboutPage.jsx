import React from 'react';
import '../styles/about.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1 className="page-title">About ScholarSync</h1>
        <p className="page-description">
          ScholarSync is a comprehensive scholarship management system designed to connect students with educational funding opportunities.
        </p>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make higher education more accessible by bridging the gap between students seeking financial support
            and donors looking to make a positive impact on education.
          </p>
        </section>
        
        <section className="about-section">
          <h2>What We Do</h2>
          <p>
            ScholarSync provides a platform for:
          </p>
          <ul className="feature-list">
            <li>Students to discover and apply for scholarships tailored to their profile</li>
            <li>Donors to create and manage scholarship programs with customized criteria</li>
            <li>Educational institutions to collaborate and support their students</li>
            <li>Transparent and efficient scholarship application processing</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Accessibility</h3>
              <p>Making education funding accessible to all qualified students regardless of background.</p>
            </div>
            <div className="value-card">
              <h3>Transparency</h3>
              <p>Providing clear information about scholarship opportunities and selection processes.</p>
            </div>
            <div className="value-card">
              <h3>Diversity</h3>
              <p>Promoting diverse representation in educational advancement.</p>
            </div>
            <div className="value-card">
              <h3>Excellence</h3>
              <p>Recognizing and supporting academic and extracurricular excellence.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage; 