import React from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects from /admin/manage-users to /admin/users
const ManageUsersRedirect = () => {
  return <Navigate to="/admin/users" replace />;
};

export default ManageUsersRedirect;