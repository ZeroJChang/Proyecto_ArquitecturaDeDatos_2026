import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

import LoginForm from '../components/auth/LoginForm';
import useAuth from '../hooks/use-auth.hook';
import { Role } from '../interfaces/Auth';

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

const LoginPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultDashboard(user.role)} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}
        >
          ACME EV
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
          Fleet Management Platform
        </Typography>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;
