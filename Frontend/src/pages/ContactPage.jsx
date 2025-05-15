import React, { useState } from 'react';
import { FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../styles/contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would normally send the form data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate successful submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  return (
    <div className="contact-page">
      <div className="container">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-description">
          Have questions about ScholarBridge? We're here to help. Reach out to our team using the information below.
        </p>
        
        <div className="contact-section">
          <div className="contact-info">
            <div className="info-card">
              <h3>General Inquiries</h3>
              <p>Email: info@scholarbridge.com</p>
              <p>Phone: +1 (123) 456-7890</p>
            </div>
            
            <div className="info-card">
              <h3>Technical Support</h3>
              <p>Email: support@scholarbridge.com</p>
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
            
            {formStatus.submitted && (
              <div className={formStatus.success ? "message-success" : "message-error"}>
                {formStatus.success ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                <span>{formStatus.message}</span>
              </div>
            )}
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required 
                />
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is your message about?"
                  required 
                />
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide details about your inquiry..."
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn-submit">
                <FiSend style={{ marginRight: '8px' }} />
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 