import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css'; // Reusing about styles for consistency

const FAQsPage = () => {
  // State to track which FAQs are open
  const [openFaqs, setOpenFaqs] = useState({});

  // Toggle FAQ open/closed state
  const toggleFaq = (id) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // FAQ categories with their questions and answers
  const faqCategories = [
    {
      title: "General Questions",
      faqs: [
        {
          id: "general1",
          question: "What is ScholarSync?",
          answer: "ScholarSync is a comprehensive scholarship management platform that connects students with educational funding opportunities. We help students find and apply for scholarships while providing donors with a streamlined way to create and manage scholarship programs."
        },
        {
          id: "general2",
          question: "Is ScholarSync free to use?",
          answer: "Yes, ScholarSync is completely free for students. We do not charge application fees or take a percentage of scholarship awards. Our platform is funded by partnerships with educational institutions and donors."
        },
        {
          id: "general3",
          question: "How do I create an account?",
          answer: "To create an account, click the 'Register' button in the top right corner of the homepage. You'll need to provide basic information including your name, email address, and password, then verify your email to complete registration."
        }
      ]
    },
    {
      title: "Scholarship Application",
      faqs: [
        {
          id: "application1",
          question: "How do I find scholarships that match my profile?",
          answer: "After creating an account and completing your profile, navigate to the Scholarships page where you can browse all available opportunities. Use the filters to narrow down scholarships based on criteria like field of study, award amount, and eligibility requirements."
        },
        {
          id: "application2",
          question: "What documents do I need to apply for scholarships?",
          answer: "Required documents vary by scholarship, but commonly requested items include academic transcripts, letters of recommendation, personal statements, financial information, and a resume or CV. Each scholarship listing clearly indicates its specific requirements."
        },
        {
          id: "application3",
          question: "Can I save an application and finish it later?",
          answer: "Yes, you can save your progress on applications at any time. Simply click the 'Save Draft' button at the bottom of the application form. You can return to complete it later through your student dashboard under 'My Applications'."
        },
        {
          id: "application4",
          question: "How will I know if I've been selected for a scholarship?",
          answer: "You'll receive notifications through your ScholarSync account and via email when there are updates to your application status. You can also check the status of all your applications in your student dashboard."
        }
      ]
    },
    {
      title: "Technical Questions",
      faqs: [
        {
          id: "tech1",
          question: "What file formats are accepted for document uploads?",
          answer: "We accept PDF, DOC, DOCX, JPG, and PNG files for document uploads. However, PDF is preferred for all documents as it maintains formatting and is generally more accessible."
        },
        {
          id: "tech2",
          question: "Is my information secure on ScholarSync?",
          answer: "Yes, we take data security seriously. All personal information and documents are encrypted, and we never share your data with third parties without your explicit consent. You can read more in our Privacy Policy."
        },
        {
          id: "tech3",
          question: "What should I do if I'm having technical difficulties?",
          answer: "If you encounter any technical issues, please visit our Support page or contact us directly at support@scholarsync.com. Our technical team is available to help Monday through Friday, 9am-5pm EST."
        }
      ]
    },
    {
      title: "For Donors",
      faqs: [
        {
          id: "donor1",
          question: "How can I create a scholarship on ScholarSync?",
          answer: "To create a scholarship, you need to register for a donor account. Once registered, you can set up your scholarship program by defining criteria, funding amounts, application requirements, and selection processes."
        },
        {
          id: "donor2",
          question: "What fees are associated with creating scholarships?",
          answer: "ScholarSync charges a small administrative fee to cover the costs of managing scholarship programs. This fee is a percentage of the total scholarship amount and varies based on the program size. Please contact us for specific pricing details."
        },
        {
          id: "donor3",
          question: "How is the selection process managed?",
          answer: "You have full control over the selection process. You can review all applications through your donor dashboard, invite committee members to help with reviews, and make final selections. We also offer tools to streamline this process and ensure fairness."
        }
      ]
    }
  ];

  return (
    <div className="about-page faqs-page">
      <div className="container">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-description">
          Find answers to commonly asked questions about ScholarSync, scholarship applications, and more.
        </p>
        
        {/* FAQ Categories */}
        {faqCategories.map((category, index) => (
          <section className="about-section faq-category" key={index}>
            <h2>{category.title}</h2>
            <div className="faq-list">
              {category.faqs.map((faq) => (
                <div 
                  className={`faq-item ${openFaqs[faq.id] ? 'open' : ''}`} 
                  key={faq.id}
                >
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3>{faq.question}</h3>
                    <span className="faq-toggle">
                      {openFaqs[faq.id] ? '−' : '+'}
                    </span>
                  </div>
                  {openFaqs[faq.id] && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        
        <div className="cta-section">
          <h2>Didn't Find Your Answer?</h2>
          <p>Our support team is ready to help with any questions not covered in our FAQs.</p>
          <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          <Link to="/resources" className="btn btn-secondary">Student Resources</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage; 