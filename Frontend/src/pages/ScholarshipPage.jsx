import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ScholarshipPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/scholarships'); // Fetch public scholarships
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
      <h1>Scholarships</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {scholarships.length > 0 ? (
        <ul>
          {scholarships.map((scholarship) => (
            <li key={scholarship._id}>
              <Link to={`/scholarships/${scholarship._id}`}>
                <h3>{scholarship.title}</h3>
              </Link>
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

export default ScholarshipPage;
