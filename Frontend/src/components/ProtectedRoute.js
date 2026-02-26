// src/components/ProtectedRoute.js

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, user, requiredRole }) {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return <Navigate to="/" />;

  // If requiredRole is specified, check if user has the required role
  if (requiredRole && !requiredRole.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;