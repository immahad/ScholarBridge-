import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StudentContext } from "../api/studentContext";

export const AdminRoute = ({ children }) => {
  const { roleValue } = useContext(StudentContext);

  return roleValue === "admin" ? children : <Navigate to="/signin" />;
};

export const StudentRoute = ({ children }) => {
  const { roleValue } = useContext(StudentContext);

  return roleValue === "student" ? children : <Navigate to="/signin" />;
};

export const DonorRoute = ({ children }) => {
  const { roleValue } = useContext(StudentContext);

  return roleValue === "donor" ? children : <Navigate to="/signin" />;
};
