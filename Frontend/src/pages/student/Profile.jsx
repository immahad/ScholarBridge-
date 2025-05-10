import React from 'react';
import { useAuth } from '../../context/AuthUtils';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Student Profile</h1>
      <div className="profile-content">
        <p>This is a placeholder for the student profile page.</p>
      </div>
    </div>
  );
};

export default StudentProfile; 