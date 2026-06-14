import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface StatusFiltersProps {
  vin: string;
  startDate: string;
  endDate: string;
  onVinChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const StatusFilters: React.FC<StatusFiltersProps> = ({
  vin,
  startDate,
  endDate,
  onVinChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  loading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        mb: 3,
      }}
    >
      <TextField
        label="VIN"
        value={vin}
        onChange={(e) => onVinChange(e.target.value)}
        placeholder="Ej: 1HGCM82633A123456"
        size="small"
        slotProps={{ htmlInput: { maxLength: 17 } }}
        sx={{ minWidth: 200 }}
      />
      <TextField
        label="Fecha inicio"
        type="datetime-local"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 200 }}
      />
      <TextField
        label="Fecha fin"
        type="datetime-local"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 200 }}
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<SearchIcon />}
        disabled={loading || !vin || !startDate || !endDate}
        sx={{ height: 40 }}
      >
        Buscar
      </Button>
    </Box>
  );
};

export default StatusFilters;
