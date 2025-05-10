import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';

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
    return <div className="container mx-auto p-4 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Donor Profile</h1>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Organization</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="4"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contact Phone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={submitLoading}
            >
              {submitLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Name</h2>
            <p className="font-medium">{`${profile.firstName || ''} ${profile.lastName || ''}`.trim()}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Email</h2>
            <p className="font-medium">{profile.email || 'N/A'}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Organization</h2>
            <p className="font-medium">{profile.organizationName || 'N/A'}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Bio</h2>
            <p className="font-medium">{profile.bio}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Contact Phone</h2>
            <p className="font-medium">{profile.phoneNumber || 'N/A'}</p>
          </div>
          
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default DonorProfile; 