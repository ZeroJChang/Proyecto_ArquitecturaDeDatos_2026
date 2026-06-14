import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, CardActions, Button, CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { useNavigate } from 'react-router-dom';

import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { Vehicle } from '../interfaces/Vehicle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const { doRequest, errors, loading } = useRequest<Vehicle[]>({
    url: URLS.VEHICLES_OWNER,
    method: 'get',
    onSuccess: (data) => setVehicles(data as Vehicle[]),
  });

  useEffect(() => {
    doRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewGps = (vin: string) => {
    navigate('/gps', { state: { vin } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mis Vehículos
      </Typography>

      {loading && <LoadingSpinner />}

      {errors && <ErrorAlert message={errors} />}

      {!loading && !errors && vehicles.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No tienes vehículos asignados.
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <Card sx={{ maxWidth: 300 }}>
          <CardActionArea onClick={() => navigate('/register-vehicle')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AppRegistrationIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6" component="div">
                  Registrar Vehículo
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Asocia un vehículo a tu cuenta ingresando su VIN.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {vehicles.map((vehicle) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vehicle.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DirectionsCarIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" component="div">
                    {vehicle.model}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  VIN: {vehicle.vin}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Año: {vehicle.year}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<GpsFixedIcon />}
                  onClick={() => handleViewGps(vehicle.vin)}
                >
                  Consultar GPS
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OwnerDashboardPage;
