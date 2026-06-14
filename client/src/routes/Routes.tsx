import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import BranchDashboardPage from '../pages/BranchDashboardPage';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import GpsEventsPage from '../pages/GpsEventsPage';
import StatusEventsPage from '../pages/StatusEventsPage';
import NotFoundPage from '../pages/NotFoundPage';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRedirect from '../components/auth/RoleRedirect';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RoleRedirect />,
      },
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/branch',
        element: (
          <ProtectedRoute allowedRoles={['BRANCH_USER']}>
            <BranchDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/owner',
        element: (
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gps',
        element: (
          <ProtectedRoute allowedRoles={['OWNER']}>
            <GpsEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'status',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'BRANCH_USER']}>
            <StatusEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
