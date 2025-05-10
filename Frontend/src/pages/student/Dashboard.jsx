import React from 'react';
import { useAuth } from '../../context/AuthUtils';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      <p>Welcome back, {user?.firstName || 'Student'}!</p>
      <div className="dashboard-content">
        <p>This is a placeholder for the student dashboard.</p>
      </div>
    </div>
  );
};

export default StudentDashboard; 