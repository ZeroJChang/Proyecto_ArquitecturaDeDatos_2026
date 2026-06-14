import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Card, CardContent, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';

import VehicleList from '../components/dashboard/VehicleList';
import FaultVehicleTable from '../components/dashboard/FaultVehicleTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import useRequest from '../hooks/use-request.hook';
import { API_URL, URLS } from '../constants/urls';
import { BranchDashboard, VehicleWithFault } from '../interfaces/Dashboard';
import { StatusEvent } from '../interfaces/StatusEvent';
import { getToken } from '../utils/auth-storage.util';

const BranchDashboardPage: React.FC = () => {
  const [selectedVin, setSelectedVin] = useState<string | null>(null);
  const [latestStatus, setLatestStatus] = useState<StatusEvent | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<BranchDashboard | null>(null);

  const { doRequest: fetchDashboard, errors: dashboardErrors, loading: dashboardLoading } =
    useRequest<BranchDashboard>({
      url: URLS.DASHBOARD_BRANCH,
      method: 'get',
    });

  useEffect(() => {
    const loadDashboard = async () => {
      const result = await fetchDashboard();
      if (result) {
        setDashboardData(result);
      }
    };
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVehicleSelect = useCallback(async (vin: string) => {
    setSelectedVin(vin);
    setLatestStatus(null);
    setStatusError(null);
    setStatusLoading(true);

    try {
      const url = URLS.STATUS_LATEST(vin);
      const fullUrl = process.env.NODE_ENV === 'production' ? `/api${url}` : `${API_URL}${url}`;
      const token = getToken();

      const response = await axios.get<StatusEvent>(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setLatestStatus(response.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setStatusError('Estado desconocido');
      } else {
        setStatusError(err?.response?.data?.message || 'Error al obtener el estado del vehículo');
      }
    } finally {
      setStatusLoading(false);
    }
  }, []);

  if (dashboardLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  if (dashboardErrors) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorAlert message={dashboardErrors} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard de Sucursal
      </Typography>

      <Grid container spacing={3}>
        {/* Vehicle List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Vehículos
          </Typography>
          {dashboardData && (
            <VehicleList
              vehicles={dashboardData.vehicles}
              selectedVin={selectedVin}
              onSelect={handleVehicleSelect}
            />
          )}
        </Grid>

        {/* Vehicle Latest Status */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Estado del Vehículo
          </Typography>

          {!selectedVin && (
            <Typography variant="body2" color="text.secondary">
              Seleccione un vehículo para ver su estado más reciente.
            </Typography>
          )}

          {selectedVin && statusLoading && <LoadingSpinner />}

          {selectedVin && statusError && <ErrorAlert message={statusError} />}

          {selectedVin && latestStatus && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  VIN: {latestStatus.vin}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Chip
                    label={`Batería: ${latestStatus.batteryLevel}%`}
                    color={latestStatus.batteryLevel > 20 ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Chip
                    label={`Motor: ${latestStatus.engineStatus ? 'Encendido' : 'Apagado'}`}
                    color={latestStatus.engineStatus ? 'primary' : 'default'}
                    variant="outlined"
                  />
                  <Chip
                    label={`Odómetro: ${latestStatus.odometer.toLocaleString()} km`}
                    variant="outlined"
                  />
                </Box>

                {latestStatus.faultCodes && latestStatus.faultCodes.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Códigos de Falla:
                    </Typography>
                    <Typography variant="body2">
                      {latestStatus.faultCodes}
                    </Typography>
                  </Box>
                )}

                {(!latestStatus.faultCodes || latestStatus.faultCodes.length === 0) && (
                  <Typography variant="body2" color="success.main">
                    Sin fallas reportadas.
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Última actualización: {new Date(latestStatus.eventTimestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Faults Table */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
            Vehículos con Fallas
          </Typography>
          {dashboardData && (
            <FaultVehicleTable
              vehicles={dashboardData.vehicles
                .filter((v) => v.codigoProblema !== '')
                .map((v): VehicleWithFault => ({
                  vin: v.vin,
                  faultCode: v.codigoProblema,
                  lastReportedAt: new Date().toISOString(),
                }))}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchDashboardPage;
