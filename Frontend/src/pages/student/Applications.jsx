import React, { useState, useEffect } from 'react';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch student applications from the API
    // This will be implemented when backend integration is ready
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>
      
      {loading ? (
        <div>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <p>You haven't applied to any scholarships yet.</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Browse Scholarships
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <div key={application.id} className="border rounded-md p-4">
              <h2 className="text-lg font-semibold">{application.scholarshipName}</h2>
              <p className="text-gray-600">Applied on: {new Date(application.applyDate).toLocaleDateString()}</p>
              <p className="mt-2">Status: <span className="font-medium">{application.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications; 