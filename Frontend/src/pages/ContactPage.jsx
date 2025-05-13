import React from 'react';
import '../styles/support.css'; // Reusing support styles as they're likely suitable for a contact page

const ContactPage = () => {
  return (
    <div className="support-page contact-page">
      <div className="container">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-description">
          Have questions about ScholarSync? We're here to help. Reach out to our team using the information below.
        </p>
        
        <div className="contact-section">
          <div className="contact-info">
            <div className="info-card">
              <h3>General Inquiries</h3>
              <p>Email: info@scholarsync.com</p>
              <p>Phone: +1 (123) 456-7890</p>
            </div>
            
            <div className="info-card">
              <h3>Technical Support</h3>
              <p>Email: support@scholarsync.com</p>
              <p>Phone: +1 (123) 456-7891</p>
            </div>
            
            <div className="info-card">
              <h3>Office Location</h3>
              <p>123 Scholarship Avenue</p>
              <p>Education City, 10001</p>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 