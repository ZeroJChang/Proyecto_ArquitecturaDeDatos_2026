import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import BranchDashboardPage from '../pages/BranchDashboardPage';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import GpsEventsPage from '../pages/GpsEventsPage';
import StatusEventsPage from '../pages/StatusEventsPage';
import VehiclesAdminPage from '../pages/VehiclesAdminPage';
import UsersAdminPage from '../pages/UsersAdminPage';
import BranchesAdminPage from '../pages/BranchesAdminPage';
import StatusEventsAdminPage from '../pages/StatusEventsAdminPage';
import RegisterVehiclePage from '../pages/RegisterVehiclePage';
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
        path: 'admin/vehicles',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <VehiclesAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/branches',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BranchesAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/status-events',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <StatusEventsAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register-vehicle',
        element: (
          <ProtectedRoute allowedRoles={['OWNER']}>
            <RegisterVehiclePage />
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
