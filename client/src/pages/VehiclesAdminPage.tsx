import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Box,
  TextField,
  Paper,
  Alert,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { Vehicle } from '../interfaces/Vehicle';

interface VehiclesResponse {
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const columns: GridColDef[] = [
  {
    field: 'vin',
    headerName: 'VIN',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'idVehiculo',
    headerName: 'Vehicle ID',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'model',
    headerName: 'Model',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'year',
    headerName: 'Year',
    width: 100,
  },
  {
    field: 'branchId',
    headerName: 'Branch',
    width: 100,
  },
  {
    field: 'createdAt',
    headerName: 'Created Date',
    flex: 1,
    minWidth: 180,
    valueFormatter: (value: string) => {
      if (!value) return '';
      return new Date(value).toLocaleString('es-GT');
    },
  },
];

const VehiclesAdminPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { doRequest, errors, loading } = useRequest<VehiclesResponse>({
    url: URLS.VEHICLES,
    method: 'get',
  });

  const fetchVehicles = useCallback(async () => {
    const params: Record<string, any> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    };

    if (debouncedSearch.length >= 1) {
      params.search = debouncedSearch;
    }

    if (sortModel.length > 0) {
      params.sortBy = sortModel[0].field;
      params.sortOrder = sortModel[0].sort?.toUpperCase();
    }

    const response = await doRequest({ params });

    if (response) {
      setVehicles(response.data);
      setTotal(response.meta.total);
    }
  }, [paginationModel, sortModel, debouncedSearch, doRequest]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleSortChange = (model: GridSortModel) => {
    setSortModel(model);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant='h4'
        sx={{ mb: 3 }}>
        Vehicles Administration
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label='Search by VIN'
          variant='outlined'
          size='small'
          value={search}
          onChange={handleSearchChange}
          placeholder='Enter VIN to search...'
          sx={{ minWidth: 300 }}
        />
      </Paper>

      {errors && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={fetchVehicles}>
              Retry
            </Button>
          }>
          {errors}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={vehicles}
          columns={columns}
          loading={loading}
          rowCount={total}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          sortingMode='server'
          sortModel={sortModel}
          onSortModelChange={handleSortChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          localeText={{
            noRowsLabel: 'No results found',
          }}
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
      </Paper>
    </Box>
  );
};

export default VehiclesAdminPage;
