import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DonorDashboard = () => {
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/scholarships/donor', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Fetched donor scholarships:', response.data.scholarships); // Debugging
        setScholarships(response.data.scholarships);
      } catch (err) {
        console.error('Error fetching donor scholarships:', err);
        setError('Failed to load scholarships.');
      }
    };

    fetchScholarships();
  }, []);

  return (
    <div>
      <h1>Donor Dashboard</h1>
      <section>
        <h2>Your Scholarships</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={() => (window.location.href = '/create-scholarship')}>
          Create Scholarship
        </button>
        {scholarships.length > 0 ? (
          <ul>
            {scholarships.map((scholarship) => (
              <li key={scholarship._id}>
                <h3>{scholarship.title}</h3>
                <p>{scholarship.description}</p>
                <p>Amount: ${scholarship.amount}</p>
                <p>Deadline: {new Date(scholarship.deadlineDate).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No scholarships created yet.</p>
        )}
      </section>
    </div>
  );
};

export default DonorDashboard;
