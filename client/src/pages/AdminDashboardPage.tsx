import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardActionArea, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';

import FaultVehicleTable from '../components/dashboard/FaultVehicleTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { AdminDashboard, VehicleWithFault } from '../interfaces/Dashboard';

interface NavigationCardConfig {
  title: string;
  icon: React.ReactNode;
  countKey: keyof AdminDashboard;
  path: string;
}

const navigationCards: NavigationCardConfig[] = [
  {
    title: 'Vehicles',
    icon: <DirectionsCarIcon sx={{ fontSize: 40 }} />,
    countKey: 'totalVehicles',
    path: '/admin/vehicles',
  },
  {
    title: 'Users',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    countKey: 'totalUsers',
    path: '/admin/users',
  },
  {
    title: 'Branches',
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    countKey: 'totalBranches',
    path: '/admin/branches',
  },
  {
    title: 'Status Events',
    icon: <WarningIcon sx={{ fontSize: 40 }} />,
    countKey: 'vehiclesWithFaults',
    path: '/admin/status-events',
  },
];

const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [faults, setFaults] = useState<VehicleWithFault[]>([]);
  const navigate = useNavigate();

  const { doRequest: fetchDashboard, errors: dashboardErrors, loading: dashboardLoading } =
    useRequest<AdminDashboard>({
      url: URLS.DASHBOARD_ADMIN,
      method: 'get',
    });

  const { doRequest: fetchFaults, errors: faultsErrors, loading: faultsLoading } =
    useRequest<{ data: VehicleWithFault[] }>({
      url: URLS.STATUS_FAULTS,
      method: 'get',
    });

  useEffect(() => {
    const loadData = async () => {
      const dashboardResult = await fetchDashboard();
      if (dashboardResult) {
        setDashboard(dashboardResult);
      }

      const faultsResult = await fetchFaults();
      if (faultsResult) {
        setFaults(faultsResult.data);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dashboardLoading && !dashboard) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard Administrador
      </Typography>

      {dashboardErrors && <ErrorAlert message={dashboardErrors} />}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {navigationCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(card.path)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboard ? dashboard[card.countKey] : '—'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {faultsErrors && <ErrorAlert message={faultsErrors} />}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Vehículos con Fallas Activas
      </Typography>
      <FaultVehicleTable vehicles={faults} />
    </Box>
  );
};

export default AdminDashboardPage;
