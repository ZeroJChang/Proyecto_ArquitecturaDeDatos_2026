import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Box,
  TextField,
  Paper,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { Branch } from '../interfaces/Branch';

interface BranchAdmin extends Branch {
  vehicleCount: number;
  ownerCount: number;
}

interface BranchesResponse {
  data: BranchAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'country',
    headerName: 'Country',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'region',
    headerName: 'Region',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'isActive',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value ? 'Active' : 'Inactive'}
        color={params.value ? 'success' : 'default'}
        size='small'
      />
    ),
  },
  {
    field: 'vehicleCount',
    headerName: 'Vehicle Count',
    width: 130,
  },
  {
    field: 'ownerCount',
    headerName: 'Owner Count',
    width: 130,
  },
];

const BranchesAdminPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { doRequest, errors, loading } = useRequest<BranchesResponse>({
    url: URLS.BRANCHES,
    method: 'get',
  });

  const fetchBranches = useCallback(async () => {
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
      setBranches(response.data);
      setTotal(response.meta.total);
    }
  }, [paginationModel, sortModel, debouncedSearch, doRequest]);

  useEffect(() => {
    fetchBranches();
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
        Branches Administration
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label='Search by name'
          variant='outlined'
          size='small'
          value={search}
          onChange={handleSearchChange}
          placeholder='Enter branch name to search...'
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
              onClick={fetchBranches}>
              Retry
            </Button>
          }>
          {errors}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={branches}
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

export default BranchesAdminPage;
