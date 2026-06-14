import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

import Header from '../header/Header';

const AuthenticatedLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default AuthenticatedLayout;
