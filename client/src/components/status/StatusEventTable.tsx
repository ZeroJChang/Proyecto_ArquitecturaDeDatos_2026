import React from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { StatusEvent } from '../../interfaces/StatusEvent';

interface StatusEventTableProps {
  rows: StatusEvent[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
}

const getBatteryColor = (level: number): string => {
  if (level >= 60) return '#66bb6a';
  if (level >= 30) return '#ff9800';
  return '#f44336';
};

const columns: GridColDef[] = [
  {
    field: 'vin',
    headerName: 'VIN',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'eventTimestamp',
    headerName: 'Fecha/Hora',
    flex: 1,
    minWidth: 180,
    valueFormatter: (value: string) => {
      if (!value) return '';
      return new Date(value).toLocaleString('es-GT');
    },
  },
  {
    field: 'batteryLevel',
    headerName: 'Batería (%)',
    width: 130,
    renderCell: (params) => {
      const level = params.value as number;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: getBatteryColor(level),
            }}
          />
          {level?.toFixed(1)}%
        </Box>
      );
    },
  },
  {
    field: 'engineStatus',
    headerName: 'Motor',
    width: 120,
    renderCell: (params) => {
      const isOn = params.value as boolean;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={isOn ? 'Encendido' : 'Apagado'}
            size="small"
            sx={{
              backgroundColor: isOn ? 'rgba(102, 187, 106, 0.2)' : 'rgba(244, 67, 54, 0.2)',
              color: isOn ? '#66bb6a' : '#f44336',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
  },
  {
    field: 'faultCodes',
    headerName: 'Códigos de Falla',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const codes = params.value as string;
      if (!codes || codes === '') return '—';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={codes}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: '#ff9800',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
  },
  {
    field: 'odometer',
    headerName: 'Odómetro (km)',
    width: 140,
    valueFormatter: (value: number) => {
      if (value == null) return '';
      return `${value.toLocaleString('es-GT', { minimumFractionDigits: 1 })} km`;
    },
  },
];

const StatusEventTable: React.FC<StatusEventTableProps> = ({
  rows,
  total,
  page,
  pageSize,
  loading,
  onPaginationChange,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[10, 25, 50]}
        getRowId={(row) => `${row.vin}-${row.eventTimestamp}`}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </Box>
  );
};

export default StatusEventTable;
