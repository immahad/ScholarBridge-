import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiShield, FiEdit, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/admin-profile.css';

const AdminProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setProfile(response.data.admin);
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/admin/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...formData
        }));
        setShowEditModal(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Error updating profile');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
        </div>
      </div>
    );
  }

  const displayUser = currentUser || user;

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <h1 className="admin-profile-title">Admin Profile</h1>
      </div>

      <div className="admin-profile-section">
        <div className="profile-header-content">
          <div className="profile-avatar">
            {displayUser?.firstName?.charAt(0) || 'A'}
          </div>
          <h1 className="profile-name">{displayUser?.firstName} {displayUser?.lastName || 'Admin'}</h1>
          <div className="profile-email">
            <FiMail />
            {displayUser?.email || 'admin@example.com'}
          </div>
        </div>
      </div>

      <div className="admin-profile-section">
        <h2 className="admin-profile-section-title">Personal Information</h2>
        <div>
          <div className="profile-info-item">
            <span className="profile-info-label">Name</span>
            <div className="profile-info-value">
              <FiUser />
              {displayUser?.firstName} {displayUser?.lastName || 'Admin'}
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <div className="profile-info-value">
              <FiMail />
              {displayUser?.email || 'admin@example.com'}
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-label">Role</span>
            <div className="profile-info-value">
              <FiShield />
              {displayUser?.role || 'admin'}
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-label">Phone</span>
            <div className="profile-info-value">
              <FiPhone />
              {displayUser?.phone || '0300-123-4567'}
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-label">Last Login</span>
            <div className="profile-info-value">
              <FiCalendar />
              {formatDate(displayUser?.lastLogin) || formatDate(new Date())}
            </div>
          </div>

          <div className="admin-profile-actions">
            <button className="admin-profile-btn admin-profile-btn-primary" onClick={handleEditProfile}>
              <FiEdit />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile; 