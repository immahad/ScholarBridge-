import React, { useState, useEffect } from 'react';

const AdminManageScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    // TODO: Fetch scholarships from API
    // This will be implemented when backend integration is ready
    
    // Temporary mock data
    setTimeout(() => {
      setScholarships([
        {
          id: 1,
          name: 'Engineering Excellence Scholarship',
          amount: 5000,
          donor: 'ABC Foundation',
          deadline: '2023-12-31',
          status: 'Active',
          applicants: 12
        },
        {
          id: 2,
          name: 'Future Leaders in Business',
          amount: 3500,
          donor: 'XYZ Corporation',
          deadline: '2023-11-15',
          status: 'Active',
          applicants: 8
        },
        {
          id: 3,
          name: 'Creative Arts Grant',
          amount: 2500,
          donor: 'Arts Association',
          deadline: '2023-10-30',
          status: 'Active',
          applicants: 5
        },
        {
          id: 4,
          name: 'Medical Studies Scholarship',
          amount: 7500,
          donor: 'Healthcare Foundation',
          deadline: '2023-09-15',
          status: 'Closed',
          applicants: 15
        },
        {
          id: 5,
          name: 'Community Service Award',
          amount: 1500,
          donor: 'Community Trust',
          deadline: '2023-08-01',
          status: 'Closed',
          applicants: 6
        },
        {
          id: 6,
          name: 'STEM Research Grant',
          amount: 10000,
          donor: 'Tech Innovations Inc.',
          deadline: '2024-01-15',
          status: 'Draft',
          applicants: 0
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter scholarships based on search term and status
  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.donor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Scholarships</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add New Scholarship
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search scholarships..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="p-2 border rounded w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div>Loading scholarships...</div>
      ) : filteredScholarships.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <p>No scholarships found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Scholarship Name</th>
                <th className="py-3 px-6 text-left">Donor</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Deadline</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Applicants</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredScholarships.map((scholarship) => (
                <tr key={scholarship.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{scholarship.name}</td>
                  <td className="py-3 px-6 text-left">{scholarship.donor}</td>
                  <td className="py-3 px-6 text-left">${scholarship.amount.toLocaleString()}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      scholarship.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : scholarship.status === 'Draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {scholarship.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">{scholarship.applicants}</td>
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

export default AdminManageScholarships; 