import React from 'react';
import { Navigate } from 'react-router-dom';

import useAuth from '../../hooks/use-auth.hook';
import { Role } from '../../interfaces/Auth';

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

const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultDashboard(user.role)} replace />;
};

export default RoleRedirect;
