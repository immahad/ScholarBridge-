import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/Profile.css';

const StudentProfile = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth(); // Keeping for future use but explicitly disabling the linter warning
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    firstName: "John",
    lastName: "Smith",
    dob: "2000-01-01",
    gender: "male"
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62704"
  });
  
  const [educationInfo, setEducationInfo] = useState({
    school: "State University",
    major: "Computer Science",
    degree: "bachelors",
    gpa: "3.8",
    gradYear: "2024"
  });
  
  const [financialInfo, setFinancialInfo] = useState({
    household: "",
    dependents: "",
    fafsa: "",
    otherAid: ""
  });
  
  // Simulate profile completion data
  const [completionData, setCompletionData] = useState({
    basicInfo: { completed: true, percentage: 100 },
    contactDetails: { completed: true, percentage: 100 },
    education: { completed: true, percentage: 100 },
    financial: { completed: false, percentage: 0 },
  });
  
  // Calculate overall completion percentage
  const overallCompletionPercentage = 
    (completionData.basicInfo.percentage + 
     completionData.contactDetails.percentage + 
     completionData.education.percentage + 
     completionData.financial.percentage) / 4;

  // Fetch user profile data from backend on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      // In a real application, you would fetch from your API
      // Example: const response = await axios.get('/api/student/profile');
      // setBasicInfo(response.data.basicInfo);
      // etc.
      
      // For now, we'll use the default mock data
    };
    
    fetchUserProfile();
  }, []);
  
  // Handle form field changes
  const handleBasicInfoChange = (e) => {
    const { id, value } = e.target;
    setBasicInfo({
      ...basicInfo,
      [id]: value
    });
  };
  
  const handleContactInfoChange = (e) => {
    const { id, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [id]: value
    });
  };
  
  const handleEducationInfoChange = (e) => {
    const { id, value } = e.target;
    setEducationInfo({
      ...educationInfo,
      [id]: value
    });
  };
  
  const handleFinancialInfoChange = (e) => {
    const { id, value, name, type } = e.target;
    
    // Handle radio buttons differently
    if (type === 'radio') {
      setFinancialInfo({
        ...financialInfo,
        [name]: value
      });
    } else {
      setFinancialInfo({
        ...financialInfo,
        [id]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (section) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // In a real application, you would save to your API
      // Example: 
      // let dataToSave;
      // if (section === 'basic') dataToSave = basicInfo;
      // else if (section === 'contact') dataToSave = contactInfo;
      // else if (section === 'education') dataToSave = educationInfo;
      // else if (section === 'financial') dataToSave = financialInfo;
      
      // const response = await axios.put(`/api/student/profile/${section}`, dataToSave);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update completion data based on section
      if (section === 'financial' && !completionData.financial.completed) {
        const updatedCompletionData = {
          ...completionData,
          financial: { completed: true, percentage: 100 }
        };
        setCompletionData(updatedCompletionData);
      }
      
      setSuccessMessage(`Your ${section} information has been successfully updated!`);
    } catch (error) {
      console.error(`Error updating ${section} information:`, error);
      setErrorMessage('Failed to update your profile. Please try again.');
    } finally {
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  return (
    <div className="container">
      <div className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Complete your profile to improve your chances of receiving scholarships</p>
        </div>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <div className="profile-completion-card">
          <div className="completion-header">
            <h2>Profile Completion</h2>
            <span className="completion-percentage">{Math.round(overallCompletionPercentage)}%</span>
          </div>
          
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${overallCompletionPercentage}%` }}
            ></div>
          </div>
          
          <div className="completion-categories">
            <div className={`category ${completionData.basicInfo.completed ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaUser />
                {completionData.basicInfo.completed ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Basic Information</h3>
                <p>{completionData.basicInfo.completed ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${completionData.contactDetails.completed ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaPhone />
                {completionData.contactDetails.completed ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Contact Details</h3>
                <p>{completionData.contactDetails.completed ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${completionData.education.completed ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaGraduationCap />
                {completionData.education.completed ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Educational Background</h3>
                <p>{completionData.education.completed ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${completionData.financial.completed ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaMoneyBillWave />
                {completionData.financial.completed ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Financial Information</h3>
                <p>{completionData.financial.completed ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <FaUser /> Basic Information
          </button>
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <FaPhone /> Contact Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <FaGraduationCap /> Education
          </button>
          <button 
            className={`tab-button ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <FaMoneyBillWave /> Financial
          </button>
        </div>
        
        <div className="profile-form">
          {activeTab === 'basic' && (
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="form-control" 
                    value={basicInfo.firstName}
                    onChange={handleBasicInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="form-control" 
                    value={basicInfo.lastName}
                    onChange={handleBasicInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input 
                    type="date" 
                    id="dob" 
                    className="form-control" 
                    value={basicInfo.dob}
                    onChange={handleBasicInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select 
                    id="gender" 
                    className="form-control"
                    value={basicInfo.gender}
                    onChange={handleBasicInfoChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <button 
                className="save-button" 
                onClick={() => handleSubmit('basic')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
          
          {activeTab === 'contact' && (
            <div className="form-section">
              <h2>Contact Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-control" 
                    value={contactInfo.email}
                    onChange={handleContactInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="form-control" 
                    value={contactInfo.phone}
                    onChange={handleContactInfoChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    className="form-control" 
                    value={contactInfo.address}
                    onChange={handleContactInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    className="form-control" 
                    value={contactInfo.city}
                    onChange={handleContactInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input 
                    type="text" 
                    id="state" 
                    className="form-control" 
                    value={contactInfo.state}
                    onChange={handleContactInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip">ZIP Code</label>
                  <input 
                    type="text" 
                    id="zip" 
                    className="form-control" 
                    value={contactInfo.zip}
                    onChange={handleContactInfoChange}
                  />
                </div>
              </div>
              <button 
                className="save-button" 
                onClick={() => handleSubmit('contact')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
          
          {activeTab === 'education' && (
            <div className="form-section">
              <h2>Educational Background</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="school">Current School</label>
                  <input 
                    type="text" 
                    id="school" 
                    className="form-control" 
                    value={educationInfo.school}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="major">Major/Field of Study</label>
                  <input 
                    type="text" 
                    id="major" 
                    className="form-control" 
                    value={educationInfo.major}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="degree">Degree</label>
                  <select 
                    id="degree" 
                    className="form-control"
                    value={educationInfo.degree}
                    onChange={handleEducationInfoChange}
                  >
                    <option value="bachelors">Bachelor's</option>
                    <option value="masters">Master's</option>
                    <option value="phd">PhD</option>
                    <option value="associates">Associate's</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gpa">GPA</label>
                  <input 
                    type="text" 
                    id="gpa" 
                    className="form-control" 
                    value={educationInfo.gpa}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gradYear">Expected Graduation Year</label>
                  <input 
                    type="number" 
                    id="gradYear" 
                    className="form-control" 
                    value={educationInfo.gradYear}
                    onChange={handleEducationInfoChange}
                  />
                </div>
              </div>
              <button 
                className="save-button" 
                onClick={() => handleSubmit('education')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
          
          {activeTab === 'financial' && (
            <div className="form-section">
              <h2>Financial Information</h2>
              <p className="section-notice">Please complete this section to be eligible for need-based scholarships.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="household">Household Income</label>
                  <select 
                    id="household" 
                    className="form-control"
                    value={financialInfo.household}
                    onChange={handleFinancialInfoChange}
                  >
                    <option value="">Please select</option>
                    <option value="below25k">Below $25,000</option>
                    <option value="25k-50k">$25,000 - $50,000</option>
                    <option value="50k-75k">$50,000 - $75,000</option>
                    <option value="75k-100k">$75,000 - $100,000</option>
                    <option value="above100k">Above $100,000</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dependents">Number of Dependents</label>
                  <input 
                    type="number" 
                    id="dependents" 
                    className="form-control" 
                    placeholder="0"
                    value={financialInfo.dependents}
                    onChange={handleFinancialInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fafsa">Have you filed FAFSA?</label>
                  <div className="radio-group">
                    <label>
                      <input 
                        type="radio" 
                        name="fafsa" 
                        value="yes"
                        checked={financialInfo.fafsa === 'yes'}
                        onChange={handleFinancialInfoChange}
                      /> Yes
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="fafsa" 
                        value="no"
                        checked={financialInfo.fafsa === 'no'}
                        onChange={handleFinancialInfoChange}
                      /> No
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="otherAid">Other Financial Aid (Optional)</label>
                  <textarea 
                    id="otherAid" 
                    className="form-control" 
                    placeholder="List any other financial aid or scholarships you currently receive"
                    rows="3"
                    value={financialInfo.otherAid}
                    onChange={handleFinancialInfoChange}
                  ></textarea>
                </div>
              </div>
              <button 
                className="save-button" 
                onClick={() => handleSubmit('financial')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 