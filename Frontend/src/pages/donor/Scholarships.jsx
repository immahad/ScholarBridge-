import React, { useState, useEffect } from 'react';

const DonorScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch scholarships created by this donor from API
    // This will be implemented when backend integration is ready
    
    // Temporary mock data
    setTimeout(() => {
      setScholarships([
        {
          id: 1,
          name: 'Engineering Excellence Scholarship',
          amount: 5000,
          deadline: '2023-12-31',
          applicants: 12,
          status: 'Active'
        },
        {
          id: 2,
          name: 'Future Leaders in Business',
          amount: 3500,
          deadline: '2023-11-15',
          applicants: 8,
          status: 'Active'
        },
        {
          id: 3,
          name: 'Creative Arts Grant',
          amount: 2500,
          deadline: '2023-10-30',
          applicants: 5,
          status: 'Active'
        },
        {
          id: 4,
          name: 'Medical Studies Scholarship',
          amount: 7500,
          deadline: '2023-09-15',
          applicants: 15,
          status: 'Closed'
        },
        {
          id: 5,
          name: 'Community Service Award',
          amount: 1500,
          deadline: '2023-08-01',
          applicants: 6,
          status: 'Closed'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Scholarships</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Scholarship
        </button>
      </div>
      
      {loading ? (
        <div>Loading scholarships...</div>
      ) : scholarships.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <p>You haven't created any scholarships yet.</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Your First Scholarship
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Scholarship Name</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Deadline</th>
                <th className="py-3 px-6 text-left">Applicants</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {scholarships.map((scholarship) => (
                <tr key={scholarship.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{scholarship.name}</td>
                  <td className="py-3 px-6 text-left">${scholarship.amount.toLocaleString()}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-left">{scholarship.applicants}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      scholarship.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {scholarship.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        View
                      </button>
                      <button className="text-yellow-500 hover:text-yellow-700">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonorScholarships; 