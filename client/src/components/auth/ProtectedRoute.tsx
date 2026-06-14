import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAuth from '../../hooks/use-auth.hook';
import { Role } from '../../interfaces/Auth';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

const getDefaultDashboard = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'BRANCH_USER':
      return '/dashboard/branch';
    case 'OWNER':
      return '/dashboard/owner';
    default:
      return '/login';
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultDashboard(user.role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
