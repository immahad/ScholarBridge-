import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiEdit, FiX, FiBriefcase, FiInfo } from 'react-icons/fi';
import '../../styles/donor-profile.css';

const DonorProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organizationName: '',
    bio: '',
    phoneNumber: '',
    donorType: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonorProfile = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found. Please log in.");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get('/api/donors/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success && response.data.donor) {
          const donorData = response.data.donor;
          const fetchedProfile = {
            firstName: donorData.firstName || '',
            lastName: donorData.lastName || '',
            email: donorData.email || '',
            organizationName: donorData.organizationName || '',
            bio: donorData.bio || '',
            phoneNumber: donorData.phoneNumber || '',
            donorType: donorData.donorType || 'individual'
          };
          setProfile(fetchedProfile);
          setFormData(fetchedProfile);
          setError(null);
        } else {
          setError(response.data.message || "Failed to fetch donor profile.");
        }
      } catch (err) {
        console.error("Error fetching donor profile:", err);
        setError(err.response?.data?.message || "An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
    }
    setSubmitLoading(true);
    setError(null);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        organizationName: formData.organizationName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        donorType: formData.donorType
      };

      const response = await axios.put('/api/donors/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.donor) {
        setProfile(formData);
        setIsEditing(false);
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating donor profile:", err);
      setError(err.response?.data?.message || "An error occurred while updating the profile.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="donor-profile-page">
        <div className="donor-profile-loading">
          <div className="donor-profile-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donor-profile-page">
        <div className="donor-profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="donor-profile-page">
      <div className="donor-profile-header">
        <h1 className="donor-profile-title">Donor Profile</h1>
      </div>
      
      {isEditing ? (
        <div className="donor-profile-card">
          <form onSubmit={handleSubmit}>
            <div className="donor-profile-avatar">
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "D"}
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                className="donor-profile-form-input"
              />
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className="donor-profile-form-input"
              />
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="donor-profile-form-input"
              />
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Organization</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName || ''}
                onChange={handleChange}
                className="donor-profile-form-input"
              />
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="donor-profile-form-textarea"
                rows="4"
              ></textarea>
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Contact Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                className="donor-profile-form-input"
              />
            </div>
            
            <div className="donor-profile-form-group">
              <label className="donor-profile-form-label">Donor Type</label>
              <select
                name="donorType"
                value={formData.donorType || 'individual'}
                onChange={handleChange}
                className="donor-profile-form-select"
              >
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            
            <div className="donor-profile-actions">
              <button 
                type="submit" 
                className="donor-profile-btn donor-profile-btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="donor-profile-btn donor-profile-btn-secondary"
                onClick={() => {
                  setFormData(profile);
                  setIsEditing(false);
                }}
              >
                <FiX />
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="donor-profile-card">
          <div className="donor-profile-avatar">
            {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "D"}
          </div>
          
          <h2 className="donor-profile-name">
            {`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Donor'}
          </h2>
          
          <p className="donor-profile-email">{profile.email}</p>
          
          <div className="donor-profile-section">
            <span className="donor-profile-label">
              <FiBriefcase className="mr-2" />
              Organization
            </span>
            <div className="donor-profile-value">
              {profile.organizationName || 'Not specified'}
            </div>
          </div>
          
          <div className="donor-profile-section">
            <span className="donor-profile-label">
              <FiInfo className="mr-2" />
              Bio
            </span>
            <div className="donor-profile-value">
              {profile.bio || 'No bio provided.'}
            </div>
          </div>
          
          <div className="donor-profile-section">
            <span className="donor-profile-label">
              <FiPhone className="mr-2" />
              Contact Phone
            </span>
            <div className="donor-profile-value">
              {profile.phoneNumber || 'Not provided'}
            </div>
          </div>
          
          <div className="donor-profile-section">
            <span className="donor-profile-label">Donor Type</span>
            <div className="donor-profile-value">
              {profile.donorType === 'individual' ? 'Individual' : 
               profile.donorType === 'organization' ? 'Organization' : 
               profile.donorType === 'corporate' ? 'Corporate' : 'Not specified'}
            </div>
          </div>
          
          <div className="donor-profile-actions">
            <button 
              className="donor-profile-btn donor-profile-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit />
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorProfile; 