import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import '../../styles/Profile.css';

const StudentProfile = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: ""
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });
  
  const [educationInfo, setEducationInfo] = useState([{
    school: "",
    major: "",
    degree: "",
    gpa: "",
    gradYear: "",
    currentYear: ""
  }]);
  
  const [financialInfo, setFinancialInfo] = useState({
    household: "",
    dependents: "",
    fafsa: "",
    otherAid: ""
  });
  
  // Profile completion data
  const [profileCompletion, setProfileCompletion] = useState({
    overall: 0,
    basicInfo: false,
    contactDetails: false,
    education: false,
    financial: false,
  });

  // Fetch user profile data from backend on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setInitialLoading(true);
      console.log("Profile.jsx (fetchUserProfile): Using token:", token);
      try {
        const response = await axios.get('/api/students/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Profile.jsx (fetchUserProfile): Raw API Response:", response);

        if (response.data.success && response.data.student) {
          const studentData = response.data.student;
          console.log("Profile.jsx (fetchUserProfile): Student Data Received for form population:", JSON.stringify(studentData, null, 2));

          setBasicInfo({
            firstName: studentData.firstName || "",
            lastName: studentData.lastName || "",
            dob: studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : "",
            gender: studentData.gender || ""
          });
          setContactInfo({
            email: user?.email || studentData.email || "",
            phone: studentData.phoneNumber || "",
            address: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            zip: studentData.address?.postalCode || "",
            country: studentData.address?.country || ""
          });
          
          // Education Info population
          const eduState = {
            school: studentData.institution || "",
            major: studentData.program || "",
            degree: "",
            gpa: studentData.currentGPA?.toString() || "",
            gradYear: studentData.expectedGraduationYear?.toString() || "",
            currentYear: studentData.currentYear?.toString() || ""
          };
          if (studentData.education && studentData.education.length > 0) {
            const primaryEducation = studentData.education[0];
            eduState.degree = primaryEducation.degree || "";
          }
          setEducationInfo([eduState]);
          
          setFinancialInfo({
            household: studentData.financialInfo?.familyIncome?.toString() || "",
            dependents: studentData.financialInfo?.dependentFamilyMembers?.toString() || "",
            fafsa: studentData.financialInfo?.fafsaCompleted ? 'yes' : 'no',
            otherAid: studentData.financialInfo?.externalAidAmount?.toString() || ""
          });
          
          // Calculate profile completion (this seems okay)
          setProfileCompletion({
            overall: studentData.profileCompletionPercentage || 0,
            basicInfo: !!(studentData.firstName && studentData.lastName && studentData.dateOfBirth && studentData.gender && studentData.cnic && studentData.phoneNumber),
            contactDetails: !!(studentData.address && studentData.address.street && studentData.address.city && studentData.address.state && studentData.address.postalCode && studentData.address.country),
            education: !!(studentData.institution && studentData.program && studentData.currentYear && studentData.expectedGraduationYear && studentData.currentGPA !== null && studentData.currentGPA !== undefined),
            financial: !!(studentData.financialInfo && studentData.financialInfo.familyIncome !== null && studentData.financialInfo.familyIncome !== undefined && studentData.financialInfo.dependentFamilyMembers !== null && studentData.financialInfo.dependentFamilyMembers !== undefined && studentData.financialInfo.fafsaCompleted !== undefined && studentData.financialInfo.externalAidAmount !== null && studentData.financialInfo.externalAidAmount !== undefined)
          });

        } else {
          console.error("Failed to fetch profile data", response.data.message);
          setErrorMessage("Could not load your profile. Please try again.");
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
        console.error("Profile.jsx: Full error object during fetch:", error);
        setErrorMessage('An error occurred while loading your profile.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (token) {
      fetchUserProfile();
    } else {
      setInitialLoading(false);
      console.warn("Profile.jsx: No token available for fetching profile.");
      setErrorMessage("You are not authenticated. Please log in.");
    }
  }, [token, user?.email]);

  // Helper function to calculate profile completion for display
  const calculateProfileCompletion = (studentData) => {
    let completedSections = 0;
    const totalPotentialSections = 4; // basic, contact, education, financial
    let actualTotalSections = 0;

    // Basic Info (includes fields from User model like cnic, phoneNumber)
    if (studentData.firstName && studentData.lastName && studentData.dateOfBirth && studentData.gender && studentData.cnic && studentData.phoneNumber) {
      completedSections++;
    }
    actualTotalSections++;

    // Contact Details
    if (studentData.address && studentData.address.street && studentData.address.city && studentData.address.state && studentData.address.postalCode && studentData.address.country) {
      completedSections++;
    }
    actualTotalSections++;
    
    // Education
    if (studentData.institution && studentData.program && studentData.currentYear && studentData.expectedGraduationYear && studentData.currentGPA !== null && studentData.currentGPA !== undefined) {
      completedSections++;
    }
    actualTotalSections++;

    // Financial Info (all sub-fields should be considered for the section to be complete for this UI helper)
    if (studentData.financialInfo && 
        studentData.financialInfo.familyIncome !== null && studentData.financialInfo.familyIncome !== undefined && 
        studentData.financialInfo.dependentFamilyMembers !== null && studentData.financialInfo.dependentFamilyMembers !== undefined && 
        studentData.financialInfo.fafsaCompleted !== undefined &&  // boolean, so undefined is primary check
        studentData.financialInfo.externalAidAmount !== null && studentData.financialInfo.externalAidAmount !== undefined) {
      completedSections++;
    }
    actualTotalSections++;

    if (actualTotalSections === 0) return { overall: 0 }; // Should not happen if studentData is present
    return {
      overall: Math.round((completedSections / actualTotalSections) * 100),
    };
  };
  
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
    setEducationInfo(prev => [{
      ...prev[0],
      [id]: value
    }]);
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
    
    // Consolidate all profile data into a single object
    // Ensure all fields expected by the backend Joi schema are present
    const edu = educationInfo[0] || {}; // handle case where educationInfo might be empty initially

    const dataToSave = {
      // Basic Info
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      dateOfBirth: basicInfo.dob,
      gender: basicInfo.gender,

      // Contact Info
      phoneNumber: contactInfo.phone,
      // email is usually part of the user model and not updated here,
      // or it's taken from user context. Assuming it's not part of this direct student profile update payload
      // unless your backend schema specifically requires it in the student profile PUT body.
      // unless your backend schema specifically requires it in the student profile PUT body.
      address: {
        street: contactInfo.address,
        city: contactInfo.city,
        state: contactInfo.state,
        postalCode: contactInfo.zip,
        country: contactInfo.country || "", // Assuming you might add country to contactInfo state and form
      },

      // Education Info - map from educationInfo state
      // Joi schema expects institution, program, currentYear, expectedGraduationYear
      // currentGPA is not directly in the Joi student.profile schema but might be in student model
      institution: edu.school,
      program: edu.major,
      currentYear: edu.currentYear ? parseInt(edu.currentYear, 10) : null, // Ensure it's a number or null
      expectedGraduationYear: edu.gradYear ? parseInt(edu.gradYear, 10) : null, // Ensure it's a number or null
      currentGPA: edu.gpa ? parseFloat(edu.gpa) : null, // Uncommented and ensure float or null

      // Financial Info
      // Joi schema expects financialInfo as an object with familyIncome, dependentFamilyMembers
      financialInfo: {
        familyIncome: financialInfo.household ? parseInt(financialInfo.household, 10) : null, // Ensure number or null
        // Joi schema name: dependentFamilyMembers, frontend state: dependents
        dependentFamilyMembers: financialInfo.dependents ? parseInt(financialInfo.dependents, 10) : null, // Ensure number or null
        // fafsaCompleted and externalAidAmount are not in the base student.profile Joi schema,
        // but were in your previous dataToSave for financial section.
        // Add them if your backend student model / update logic handles them.
        fafsaCompleted: financialInfo.fafsa === 'yes', // Uncommented
        externalAidAmount: financialInfo.otherAid ? parseFloat(financialInfo.otherAid) : 0 // Uncommented, ensure float or 0
      }
    };
    
    // Remove null/undefined address or financialInfo if they are truly optional and should not be sent if empty
    if (!dataToSave.address.street && !dataToSave.address.city && !dataToSave.address.state && !dataToSave.address.postalCode && !dataToSave.address.country) {
      delete dataToSave.address; // Or set to null if your backend prefers that for optional objects
    }
    if (dataToSave.financialInfo.familyIncome === null && dataToSave.financialInfo.dependentFamilyMembers === null) {
      delete dataToSave.financialInfo; // Or set to null
    }


    console.log("handleSubmit: Token being sent:", token);
    console.log("handleSubmit: Data being sent:", JSON.stringify(dataToSave, null, 2));

    try {
      const response = await axios.put('/api/students/profile', dataToSave, { // Always PUT to the main profile endpoint
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccessMessage(`Your profile information has been successfully updated!`);
        console.log("handleSubmit: Backend response studentData for state update:", JSON.stringify(response.data.student, null, 2));
        if (response.data.student) {
          const studentData = response.data.student;
          console.log("handleSubmit: Backend response studentData for state update:", JSON.stringify(studentData, null, 2));

          // Basic Info Update
          setBasicInfo({
            firstName: studentData.firstName || "",
            lastName: studentData.lastName || "",
            dob: studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : "",
            gender: studentData.gender || ""
          });
          setContactInfo({
            email: user?.email || studentData.email || "",
            phone: studentData.phoneNumber || "",
            address: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            zip: studentData.address?.postalCode || "",
            country: studentData.address?.country || ""
          });

          // Education Info Update - mirror fetchUserProfile logic for consistency
          const updatedEduState = {
            school: studentData.institution || "",
            major: studentData.program || "",
            degree: "", 
            gpa: studentData.currentGPA?.toString() || "",
            gradYear: studentData.expectedGraduationYear?.toString() || "",
            currentYear: studentData.currentYear?.toString() || ""
          };
          if (studentData.education && studentData.education.length > 0) {
            const primaryEducation = studentData.education[0];
            updatedEduState.degree = primaryEducation.degree || "";
          }
          setEducationInfo([updatedEduState]);

          // Financial Info Update
          setFinancialInfo({
            household: studentData.financialInfo?.familyIncome?.toString() || "", 
            dependents: studentData.financialInfo?.dependentFamilyMembers?.toString() || "",
            fafsa: studentData.financialInfo?.fafsaCompleted ? 'yes' : 'no',
            otherAid: studentData.financialInfo?.externalAidAmount?.toString() || ""
          });

          // Recalculate profile completion based on potentially updated studentData
          setProfileCompletion(prev => ({ 
            ...prev, 
            overall: studentData.profileCompletionPercentage || 0,
            basicInfo: !!(studentData.firstName && studentData.lastName && studentData.dateOfBirth && studentData.gender && studentData.cnic && studentData.phoneNumber),
            contactDetails: !!(studentData.address && studentData.address.street && studentData.address.city && studentData.address.state && studentData.address.postalCode && studentData.address.country),
            education: !!(studentData.institution && studentData.program && studentData.currentYear && studentData.expectedGraduationYear && studentData.currentGPA !== null && studentData.currentGPA !== undefined),
            financial: !!(studentData.financialInfo && studentData.financialInfo.familyIncome !== null && studentData.financialInfo.familyIncome !== undefined && studentData.financialInfo.dependentFamilyMembers !== null && studentData.financialInfo.dependentFamilyMembers !== undefined && studentData.financialInfo.fafsaCompleted !== undefined && studentData.financialInfo.externalAidAmount !== null && studentData.financialInfo.externalAidAmount !== undefined)
          }));
        }
      } else {
        // Log the detailed errors if available from Joi
        if (response.data.errors) {
          console.error("Joi Validation Errors:", response.data.errors);
          setErrorMessage(response.data.message + ": " + response.data.errors.join(', '));
        } else {
          setErrorMessage(response.data.message || `Failed to update profile information. Please try again.`);
        }
      }
    } catch (error) {
      console.error(`Error updating profile information:`, error.response ? error.response.data : error.message);
      // Log detailed Joi errors from catch block as well
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Joi Validation Errors (catch):", error.response.data.errors);
        setErrorMessage(error.response.data.message + ": " + error.response.data.errors.join(', '));
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to update your profile. Please try again.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Calculate overall completion percentage
  const overallCompletionPercentage = profileCompletion.overall;

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
            <div className={`category ${profileCompletion.basicInfo ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaUser />
                {profileCompletion.basicInfo ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Basic Information</h3>
                <p>{profileCompletion.basicInfo ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${profileCompletion.contactDetails ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaPhone />
                {profileCompletion.contactDetails ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Contact Details</h3>
                <p>{profileCompletion.contactDetails ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${profileCompletion.education ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaGraduationCap />
                {profileCompletion.education ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Education Background</h3>
                <p>{profileCompletion.education ? 'Completed' : 'Incomplete'}</p>
              </div>
            </div>
            
            <div className={`category ${profileCompletion.financial ? 'complete' : 'incomplete'}`}>
              <div className="category-icon">
                <FaMoneyBillWave />
                {profileCompletion.financial ? <FaCheck className="check-icon" /> : <FaExclamationTriangle className="warning-icon" />}
              </div>
              <div className="category-info">
                <h3>Financial Information</h3>
                <p>{profileCompletion.financial ? 'Completed' : 'Incomplete'}</p>
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
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    className="form-control" 
                    value={contactInfo.country}
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
                    value={educationInfo[0].school}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="major">Major/Field of Study</label>
                  <input 
                    type="text" 
                    id="major" 
                    className="form-control" 
                    value={educationInfo[0].major}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="degree">Degree</label>
                  <select 
                    id="degree" 
                    className="form-control"
                    value={educationInfo[0].degree}
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
                    value={educationInfo[0].gpa}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gradYear">Expected Graduation Year</label>
                  <input 
                    type="number" 
                    id="gradYear" 
                    className="form-control" 
                    value={educationInfo[0].gradYear}
                    onChange={handleEducationInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currentYear">Current Year</label>
                  <input 
                    type="number" 
                    id="currentYear" 
                    className="form-control" 
                    value={educationInfo[0].currentYear}
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
                    <option value="20000">Below $25,000</option>
                    <option value="25000">$25,000 - $50,000</option>
                    <option value="50000">$50,000 - $75,000</option>
                    <option value="75000">$75,000 - $100,000</option>
                    <option value="100000">Above $100,000</option>
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