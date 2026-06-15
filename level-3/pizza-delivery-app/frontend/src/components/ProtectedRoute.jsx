import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect unauthenticated user to login screen
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect non-admin user trying to access admin screens
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
