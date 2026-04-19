import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudioLoader from './StudioLoader';

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StudioLoader />;
  }

  // CRITICAL: Must have a user AND that user must be confirmed as admin
  if (!user || isAdmin === false) {
    return <Navigate to="/studio/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
