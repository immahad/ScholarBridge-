import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import { FiSave, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const AdminProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'System Administrator',
    phone: '',
    lastLogin: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Fetch admin profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Profile API response:', response.data);
        
        // Handle different response structures
        let profileData;
        if (response.data.success) {
          // Check various possible response structures
          profileData = response.data.profile || response.data.admin || response.data;
          
          // Create a standardized profile object
          const normalizedProfile = {
            name: profileData.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : profileData.name || 'Admin User',
            email: profileData.email || '',
            role: profileData.role || 'System Administrator',
            phone: profileData.phoneNumber || profileData.phone || '',
            lastLogin: profileData.lastLogin || profileData.lastLoginAt || new Date()
          };
          
          console.log('Normalized profile:', normalizedProfile);
          
          setProfile(normalizedProfile);
          setFormData(normalizedProfile);
        } else {
          setError('Failed to load profile data. Please try again later.');
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        // Fallback to default profile if API fails
        const defaultProfile = {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'System Administrator',
          phone: '',
          lastLogin: new Date()
        };
        setProfile(defaultProfile);
        setFormData(defaultProfile);
        setError('Could not connect to server. Showing default profile.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
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
    setError(null);
    setSuccess('');
    
    try {
      // Transform form data to match backend API expectations
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const dataToSubmit = {
        firstName,
        lastName,
        email: formData.email,
        phoneNumber: formData.phone
      };
      
      console.log('Submitting profile update:', dataToSubmit);
      
      const response = await axios.put('/api/admin/profile', dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProfile(formData);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating profile.');
      console.error("Error updating admin profile:", err);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading profile data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FiAlertTriangle className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <FiCheckCircle className="mr-2" />
          {success}
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              readOnly // Email should not be editable
            />
            <small className="text-gray-500">Email cannot be changed</small>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <FiSave className="mr-2" />
              Save Changes
            </button>
            <button 
              type="button" 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Name</h2>
            <p className="font-medium">{profile.name}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Email</h2>
            <p className="font-medium">{profile.email}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Role</h2>
            <p className="font-medium">{profile.role}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Phone</h2>
            <p className="font-medium">{profile.phone || 'Not provided'}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-gray-500 text-sm">Last Login</h2>
            <p className="font-medium">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
              Change Password
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Enable two-factor authentication for enhanced security</p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="toggle" className="sr-only" />
              <label htmlFor="toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive email notifications for important system events</p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="toggle2" className="sr-only" defaultChecked />
              <label htmlFor="toggle2" className="block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 