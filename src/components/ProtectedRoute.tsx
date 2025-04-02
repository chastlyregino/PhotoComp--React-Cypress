import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * A wrapper component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC = () => {
  const authContext = useContext(AuthContext);
  
  // Check if user is authenticated
  if (!authContext?.user || !authContext?.token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;