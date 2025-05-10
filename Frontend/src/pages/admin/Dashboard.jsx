import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScholarships: 0,
    activeScholarships: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch admin statistics from API
    // This will be implemented when backend integration is ready
    
    // Temporary mock data
    setTimeout(() => {
      setStats({
        totalUsers: 245,
        totalScholarships: 32,
        activeScholarships: 18,
        totalApplications: 156,
        pendingApplications: 42
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div>Loading dashboard data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Scholarships</h3>
              <p className="text-2xl font-bold">{stats.totalScholarships}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Active Scholarships</h3>
              <p className="text-2xl font-bold">{stats.activeScholarships}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Applications</h3>
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Pending Applications</h3>
              <p className="text-2xl font-bold">{stats.pendingApplications}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Scholarships</h2>
              {/* Placeholder for recent scholarships list */}
              <ul className="divide-y">
                <li className="py-2">Computer Science Merit Scholarship</li>
                <li className="py-2">Engineering Excellence Award</li>
                <li className="py-2">Business Leadership Grant</li>
                <li className="py-2">Arts and Humanities Scholarship</li>
                <li className="py-2">Medical Studies Fellowship</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent User Registrations</h2>
              {/* Placeholder for recent users list */}
              <ul className="divide-y">
                <li className="py-2">Sarah Johnson (Student)</li>
                <li className="py-2">Michael Chang (Student)</li>
                <li className="py-2">ABC Foundation (Donor)</li>
                <li className="py-2">Emily Wilson (Student)</li>
                <li className="py-2">XYZ Corporation (Donor)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Manage Scholarships
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Manage Users
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Review Applications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 