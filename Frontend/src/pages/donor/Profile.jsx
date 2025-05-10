import React, { useState } from 'react';

const DonorProfile = () => {
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    organization: 'Smith Family Foundation',
    bio: 'Dedicated to helping students achieve their educational goals.',
    contactPhone: '(555) 123-4567'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send updated profile to API
    setProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Donor Profile</h1>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
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
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
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
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
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
            <p className="font-medium">{profile.name}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Email</h2>
            <p className="font-medium">{profile.email}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Organization</h2>
            <p className="font-medium">{profile.organization}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Bio</h2>
            <p className="font-medium">{profile.bio}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-gray-500 text-sm">Contact Phone</h2>
            <p className="font-medium">{profile.contactPhone}</p>
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