import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Box,
  TextField,
  Paper,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { User } from '../interfaces/User';

interface UsersResponse {
  data: User[];
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
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'role',
    headerName: 'Role',
    flex: 1,
    minWidth: 130,
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

const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { doRequest, errors, loading } = useRequest<UsersResponse>({
    url: URLS.USERS,
    method: 'get',
  });

  const fetchUsers = useCallback(async () => {
    const params: Record<string, any> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    };

    if (debouncedSearch.length >= 1) {
      params.search = debouncedSearch;
    }

    if (roleFilter) {
      params.role = roleFilter;
    }

    if (sortModel.length > 0) {
      params.sortBy = sortModel[0].field;
      params.sortOrder = sortModel[0].sort?.toUpperCase();
    }

    const response = await doRequest({ params });

    if (response) {
      setUsers(response.data);
      setTotal(response.meta.total);
    }
  }, [paginationModel, sortModel, debouncedSearch, roleFilter, doRequest]);

  useEffect(() => {
    fetchUsers();
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

  const handleRoleChange = (e: SelectChangeEvent) => {
    setRoleFilter(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
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
        Users Administration
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label='Search by name or email'
          variant='outlined'
          size='small'
          value={search}
          onChange={handleSearchChange}
          placeholder='Search by name or email...'
          sx={{ minWidth: 300 }}
        />
        <FormControl size='small' sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label='Role'
            onChange={handleRoleChange}
          >
            <MenuItem value=''>All</MenuItem>
            <MenuItem value='ADMIN'>ADMIN</MenuItem>
            <MenuItem value='BRANCH_USER'>BRANCH_USER</MenuItem>
            <MenuItem value='OWNER'>OWNER</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {errors && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={fetchUsers}>
              Retry
            </Button>
          }>
          {errors}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          rowCount={total}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          sortingMode='server'
          sortModel={sortModel}
          onSortModelChange={handleSortChange}
          pageSizeOptions={[25, 50, 100]}
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

export default UsersAdminPage;
