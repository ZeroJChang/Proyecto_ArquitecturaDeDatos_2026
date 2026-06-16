import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/use-auth.hook';
import { Role } from '../../interfaces/Auth';

interface NavItem {
  title: string;
  path: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard/admin', roles: ['ADMIN'] },
  { title: 'Dashboard', path: '/dashboard/branch', roles: ['BRANCH_USER'] },
  { title: 'Dashboard', path: '/dashboard/owner', roles: ['OWNER'] },
  { title: 'GPS', path: '/gps', roles: ['ADMIN', 'OWNER'] },
  { title: 'Estado', path: '/status', roles: ['ADMIN', 'BRANCH_USER'] },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Typography
            variant='h6'
            noWrap
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', fontWeight: 700, mr: 4 }}>
            ACME EV
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {visibleItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                color='inherit'>
                {item.title}
              </Button>
            ))}
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary' }}>
                {user.name}
              </Typography>
              <Button
                color='inherit'
                onClick={logout}
                size='small'>
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
