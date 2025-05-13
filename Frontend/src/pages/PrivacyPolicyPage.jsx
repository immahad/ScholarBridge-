import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Reusing about styles for content pages

const PrivacyPolicyPage = () => {
  const lastUpdated = "August 15, 2023";

  return (
    <div className="about-page privacy-page">
      <div className="container">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-description">
          Last Updated: {lastUpdated}
        </p>
        <p className="text-muted">
          This Privacy Policy describes how ScholarSync ("we", "our", or "us") collects, uses, and shares your personal information when you use our website and services.
        </p>
        
        <section className="about-section">
          <h2>Information We Collect</h2>
          <p>
            We collect several types of information from and about users of our website and services, including:
          </p>
          <ul className="feature-list">
            <li>
              <strong>Personal Information:</strong> Name, email address, postal address, phone number, date of birth, educational background, financial information (for needs-based scholarships), and demographic information.
            </li>
            <li>
              <strong>Account Information:</strong> Username, password, account preferences, and account activity.
            </li>
            <li>
              <strong>Scholarship Application Information:</strong> Academic records, essays, letters of recommendation, and other application materials that you submit.
            </li>
            <li>
              <strong>Technical Information:</strong> IP address, browser type, operating system, device information, and usage details.
            </li>
            <li>
              <strong>Communications:</strong> Records and copies of your correspondence with us.
            </li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>How We Collect Your Information</h2>
          <p>We collect information in the following ways:</p>
          <ul className="feature-list">
            <li>
              <strong>Direct Collection:</strong> Information you provide when creating an account, completing your profile, submitting scholarship applications, or contacting us.
            </li>
            <li>
              <strong>Automated Collection:</strong> As you navigate through our website, we may use cookies, web beacons, and other tracking technologies to collect information about your equipment, browsing actions, and patterns.
            </li>
            <li>
              <strong>Third Parties:</strong> We may receive information about you from educational institutions, scholarship providers, and identity verification services.
            </li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>How We Use Your Information</h2>
          <p>We use your personal information for the following purposes:</p>
          <ul className="feature-list">
            <li>To provide and maintain our services</li>
            <li>To process and manage scholarship applications</li>
            <li>To match you with relevant scholarship opportunities</li>
            <li>To communicate with you about our services, updates, and promotions</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To improve our website and services</li>
            <li>To ensure the security and integrity of our platform</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Information Sharing and Disclosure</h2>
          <p>We may share your personal information with the following parties:</p>
          <ul className="feature-list">
            <li>
              <strong>Scholarship Providers:</strong> When you apply for a scholarship, your application materials will be shared with the relevant scholarship provider for evaluation.
            </li>
            <li>
              <strong>Educational Institutions:</strong> With your consent, we may share your information with educational institutions for verification purposes.
            </li>
            <li>
              <strong>Service Providers:</strong> We may share your information with third-party vendors who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests from public authorities.
            </li>
          </ul>
          <p>
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or method of electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="feature-list">
            <li>The right to access and receive a copy of your personal information</li>
            <li>The right to correct inaccurate or incomplete information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and to store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Children's Privacy</h2>
          <p>
            Our services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly delete that information.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            Email: privacy@scholarsync.com<br />
            Address: 123 Scholarship Avenue, Education City, 10001<br />
            Phone: +1 (123) 456-7890
          </p>
        </section>
        
        <div className="cta-section">
          <p>By using our services, you consent to our Privacy Policy and agree to its terms.</p>
          <Link to="/terms" className="btn btn-secondary">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 