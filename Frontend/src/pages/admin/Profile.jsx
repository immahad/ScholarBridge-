import React, { useState } from 'react';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@scholarshipms.com',
    role: 'System Administrator',
    phone: '(555) 987-6543',
    lastLogin: '2023-05-15T10:30:00Z'
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
      <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>
      
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
            />
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
            <p className="font-medium">{profile.phone}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-gray-500 text-sm">Last Login</h2>
            <p className="font-medium">{new Date(profile.lastLogin).toLocaleString()}</p>
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
              <input type="checkbox" id="toggle2" className="sr-only" checked readOnly />
              <label htmlFor="toggle2" className="block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 