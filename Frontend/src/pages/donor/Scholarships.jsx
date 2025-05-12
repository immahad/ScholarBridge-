import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import { FiPlusCircle, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const DonorScholarships = () => {
  const { token } = useAuth();
  const [scholarships, setScholarships] = useState({
    pending: [],
    active: [],
    rejected: [],
    closed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonorScholarships = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('/api/scholarships/donor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setScholarships(response.data.scholarships);
          console.log("Fetched scholarships:", response.data.scholarships);
        } else {
          setError('Failed to fetch scholarships');
        }
      } catch (err) {
        console.error('Error fetching scholarships:', err);
        setError(err.response?.data?.message || 'Error loading scholarships');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonorScholarships();
  }, [token]);

  // Combine all scholarships for display
  const allScholarships = [
    ...scholarships.active.map(s => ({ ...s, statusLabel: 'Active' })),
    ...scholarships.pending.map(s => ({ ...s, statusLabel: 'Pending Approval' })),
    ...scholarships.rejected.map(s => ({ ...s, statusLabel: 'Rejected' })),
    ...scholarships.closed.map(s => ({ ...s, statusLabel: 'Closed' }))
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Scholarships</h1>
        <Link to="/donor/scholarships/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
          <FiPlusCircle className="mr-2" /> Create New Scholarship
        </Link>
      </div>
      
      {loading ? (
        <div>Loading scholarships...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>{error}</p>
        </div>
      ) : allScholarships.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <p>You haven't created any scholarships yet.</p>
          <Link to="/donor/scholarships/create" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block">
            Create Your First Scholarship
          </Link>
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
              {allScholarships.map((scholarship) => (
                <tr key={scholarship._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{scholarship.title}</td>
                  <td className="py-3 px-6 text-left">${scholarship.amount.toLocaleString()}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(scholarship.deadlineDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-left">{scholarship.applicantCount || 0}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      scholarship.statusLabel === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : scholarship.statusLabel === 'Pending Approval'
                        ? 'bg-yellow-100 text-yellow-800'
                        : scholarship.statusLabel === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {scholarship.statusLabel}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-2">
                      <Link to={`/donor/scholarships/${scholarship._id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      {scholarship.applicantCount === 0 && (
                        <button className="text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      )}
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