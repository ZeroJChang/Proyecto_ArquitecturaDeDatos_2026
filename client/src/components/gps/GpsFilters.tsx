import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface GpsFiltersProps {
  vin: string;
  startDate: string;
  endDate: string;
  onVinChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const GpsFilters: React.FC<GpsFiltersProps> = ({
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
        placeholder="17-character VIN"
        slotProps={{ htmlInput: { maxLength: 17 } }}
        sx={{ minWidth: 220 }}
        size="small"
      />
      <TextField
        label="Start Date"
        type="datetime-local"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 200 }}
        size="small"
      />
      <TextField
        label="End Date"
        type="datetime-local"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: 200 }}
        size="small"
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<SearchIcon />}
        disabled={loading || !vin || !startDate || !endDate}
        sx={{ height: 40 }}
      >
        Search
      </Button>
    </Box>
  );
};

export default GpsFilters;
