import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';

import MetricCard from '../components/dashboard/MetricCard';
import FaultVehicleTable from '../components/dashboard/FaultVehicleTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { AdminDashboard, VehicleWithFault } from '../interfaces/Dashboard';

const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [faults, setFaults] = useState<VehicleWithFault[]>([]);

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

  const loading = dashboardLoading || faultsLoading;
  const errors = dashboardErrors || faultsErrors;

  if (loading && !dashboard) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard Administrador
      </Typography>

      {errors && <ErrorAlert message={errors} />}

      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard title="Total Vehículos" value={dashboard.totalVehicles} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard title="Sucursales Activas" value={dashboard.totalBranches} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard title="Total Usuarios" value={dashboard.totalUsers} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard title="Vehículos con Fallas" value={dashboard.vehiclesWithFaults} />
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Vehículos con Fallas Activas
      </Typography>
      <FaultVehicleTable vehicles={faults} />
    </Box>
  );
};

export default AdminDashboardPage;
