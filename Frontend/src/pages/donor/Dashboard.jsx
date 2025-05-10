import React, { useState, useEffect } from 'react';

const DonorDashboard = () => {
  const [stats, setStats] = useState({
    totalDonated: 0,
    scholarshipsCreated: 0,
    activeScholarships: 0,
    studentsSupported: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch donor statistics from API
    // This will be implemented when backend integration is ready
    
    // Temporary mock data
    setTimeout(() => {
      setStats({
        totalDonated: 150000,
        scholarshipsCreated: 5,
        activeScholarships: 3,
        studentsSupported: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Donor Dashboard</h1>
      
      {loading ? (
        <div>Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Donated</h3>
              <p className="text-2xl font-bold">${stats.totalDonated.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Scholarships Created</h3>
              <p className="text-2xl font-bold">{stats.scholarshipsCreated}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Active Scholarships</h3>
              <p className="text-2xl font-bold">{stats.activeScholarships}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Students Supported</h3>
              <p className="text-2xl font-bold">{stats.studentsSupported}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity to display.</p>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Create New Scholarship
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              View All Scholarships
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DonorDashboard; 