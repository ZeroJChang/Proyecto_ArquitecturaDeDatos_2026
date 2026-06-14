import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Alert } from '@mui/material';

import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';

interface ClaimResponse {
  message: string;
}

const VIN_LENGTH = 17;
const VIN_REGEX = /^[A-Z0-9]*$/;

const RegisterVehiclePage: React.FC = () => {
  const [vin, setVin] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const { doRequest, errors, loading } = useRequest<ClaimResponse>({
    url: URLS.VEHICLES_CLAIM,
    method: 'post',
    body: { vin },
    onSuccess: (data) => {
      setSuccess(data?.message || 'Vehículo asociado exitosamente');
      setVin('');
    },
  });

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= VIN_LENGTH) {
      setVin(value);
      setSuccess(null);
    }
  };

  const isVinValid = vin.length === VIN_LENGTH && VIN_REGEX.test(vin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVinValid || loading) return;
    setSuccess(null);
    await doRequest();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Registrar Vehículo
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ maxWidth: 480 }}
      >
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {errors && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors}
          </Alert>
        )}

        <TextField
          label="VIN"
          placeholder="Ingrese el VIN de 17 caracteres"
          fullWidth
          value={vin}
          onChange={handleVinChange}
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: VIN_LENGTH } }}
          helperText={`${vin.length}/${VIN_LENGTH} caracteres`}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!isVinValid || loading}
        >
          {loading ? 'Registrando...' : 'Claim'}
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterVehiclePage;
