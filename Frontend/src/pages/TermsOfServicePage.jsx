import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Reusing about styles for content pages

const TermsOfServicePage = () => {
  const lastUpdated = "August 15, 2023";

  return (
    <div className="about-page terms-page">
      <div className="container">
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-description">
          Last Updated: {lastUpdated}
        </p>
        <p className="text-muted">
          Please read these Terms of Service ("Terms") carefully before using the ScholarSync website and services.
        </p>
        
        <section className="about-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using ScholarSync, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our services.
          </p>
        </section>
        
        <section className="about-section">
          <h2>2. Description of Services</h2>
          <p>
            ScholarSync provides a platform connecting students with scholarship opportunities and donors. Our services include:
          </p>
          <ul className="feature-list">
            <li>Scholarship discovery and application tools for students</li>
            <li>Scholarship creation and management tools for donors</li>
            <li>Application review and selection tools</li>
            <li>Communication tools between parties</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of our services, you must create an account. When you create an account, you agree to:
          </p>
          <ul className="feature-list">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Be responsible for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate your account if any information provided is inaccurate, false, or violates these Terms.
          </p>
        </section>
        
        <section className="about-section">
          <h2>4. User Conduct</h2>
          <p>
            When using our services, you agree not to:
          </p>
          <ul className="feature-list">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Submit false or misleading information</li>
            <li>Impersonate another person or entity</li>
            <li>Use our services for fraudulent or illegal purposes</li>
            <li>Interfere with the proper functioning of our services</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Transmit malware, viruses, or other harmful code</li>
            <li>Collect or harvest user information without consent</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>5. Content Submission</h2>
          <p>
            You retain ownership of any content you submit to ScholarSync, including scholarship applications, essays, and other materials. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of providing and improving our services.
          </p>
          <p>
            You are solely responsible for the content you submit. You represent and warrant that:
          </p>
          <ul className="feature-list">
            <li>You own or have the necessary rights to the content you submit</li>
            <li>Your content is accurate and complete</li>
            <li>Your content does not violate these Terms or any applicable laws</li>
            <li>Your content does not infringe upon the rights of any third party</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>6. Scholarship Applications and Awards</h2>
          <p>
            ScholarSync facilitates the connection between students and scholarship providers but does not guarantee:
          </p>
          <ul className="feature-list">
            <li>The accuracy of scholarship listings</li>
            <li>Acceptance of any scholarship application</li>
            <li>The receipt of any scholarship award</li>
            <li>The fairness of the selection process</li>
          </ul>
          <p>
            Scholarship providers are solely responsible for their selection criteria, processes, and award disbursements. We recommend that you review each scholarship's specific terms and requirements before applying.
          </p>
        </section>
        
        <section className="about-section">
          <h2>7. Intellectual Property</h2>
          <p>
            The ScholarSync name, logo, website, and all content and materials provided through our services (excluding user-submitted content) are owned by or licensed to us and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You may not use, reproduce, distribute, modify, or create derivative works from our intellectual property without our express written consent.
          </p>
        </section>
        
        <section className="about-section">
          <h2>8. Third-Party Links and Services</h2>
          <p>
            Our services may contain links to third-party websites or services that are not owned or controlled by ScholarSync. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by the use of such third-party websites or services.
          </p>
        </section>
        
        <section className="about-section">
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, THAT DEFECTS WILL BE CORRECTED, OR THAT OUR SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
        </section>
        
        <section className="about-section">
          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCHOLARSYNC AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, RESULTING FROM YOUR ACCESS TO OR USE OF OUR SERVICES.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING OR USING OUR SERVICES.
          </p>
        </section>
        
        <section className="about-section">
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless ScholarSync and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="feature-list">
            <li>Your use of our services</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of a third party</li>
            <li>Your content submitted to our services</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>12. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we will notify you by email or by posting a notice on our website. Your continued use of our services after such changes constitutes your acceptance of the new Terms.
          </p>
        </section>
        
        <section className="about-section">
          <h2>13. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our services at any time, without prior notice or liability, for any reason, including if you violate these Terms.
          </p>
          <p>
            Upon termination, your right to use our services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </section>
        
        <section className="about-section">
          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section className="about-section">
          <h2>15. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: legal@scholarsync.com<br />
            Address: 123 Scholarship Avenue, Education City, 10001<br />
            Phone: +1 (123) 456-7890
          </p>
        </section>
        
        <div className="cta-section">
          <p>By using ScholarSync, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          <Link to="/privacy" className="btn btn-secondary">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 