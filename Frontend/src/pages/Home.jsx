import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/scholarships'); // Fetch public scholarships
        console.log('Fetched scholarships:', response.data.scholarships); // Debugging
        setScholarships(response.data.scholarships);
      } catch (err) {
        console.error('Error fetching scholarships:', err);
        setError('Failed to load scholarships.');
      }
    };

    fetchScholarships();
  }, []);

  return (
    <div>
      <h1>Find Scholarships</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
        <p>No scholarships available.</p>
      )}
    </div>
  );
};

export default Home;
