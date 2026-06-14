import React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { GpsEvent } from '../../interfaces/GpsEvent';

interface GpsEventTableProps {
  rows: GpsEvent[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPaginationChange: (model: GridPaginationModel) => void;
}

const columns: GridColDef[] = [
  {
    field: 'vin',
    headerName: 'VIN',
    width: 200,
    sortable: false,
  },
  {
    field: 'eventTimestamp',
    headerName: 'Timestamp',
    width: 220,
    sortable: false,
    valueFormatter: (value: string) => {
      if (!value) return '';
      return new Date(value).toLocaleString();
    },
  },
  {
    field: 'latitude',
    headerName: 'Latitude',
    width: 150,
    sortable: false,
    valueFormatter: (value: number) => {
      if (value == null) return '';
      return value.toFixed(6);
    },
  },
  {
    field: 'longitude',
    headerName: 'Longitude',
    width: 150,
    sortable: false,
    valueFormatter: (value: number) => {
      if (value == null) return '';
      return value.toFixed(6);
    },
  },
];

const GpsEventTable: React.FC<GpsEventTableProps> = ({
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
        rowCount={total}
        loading={loading}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(model) =>
          onPaginationChange({ page: model.page + 1, pageSize: model.pageSize })
        }
        pageSizeOptions={[25, 50, 100]}
        getRowId={(row) => `${row.vin}-${row.eventTimestamp}-${row.latitude}-${row.longitude}`}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        autoHeight
        sx={{
          border: 1,
          borderColor: 'divider',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.paper',
          },
        }}
      />
    </Box>
  );
};

export default GpsEventTable;
