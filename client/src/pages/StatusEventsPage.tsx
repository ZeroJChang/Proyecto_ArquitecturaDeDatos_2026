import React, { useState, useCallback } from 'react';
import { Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import StatusFilters from '../components/status/StatusFilters';
import StatusEventTable from '../components/status/StatusEventTable';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { StatusEvent } from '../interfaces/StatusEvent';

interface StatusEventsResponse {
  data: StatusEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const StatusEventsPage: React.FC = () => {
  const [vin, setVin] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [hasSearched, setHasSearched] = useState(false);

  const { doRequest, errors, loading } = useRequest<StatusEventsResponse>({
    url: URLS.STATUS_EVENTS,
    method: 'get',
  });

  const fetchEvents = useCallback(
    async (currentPage: number, currentPageSize: number) => {
      if (!vin || !startDate || !endDate) return;

      const params = {
        params: {
          vin,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          page: currentPage + 1,
          limit: currentPageSize,
        },
      };

      const response = await doRequest(params);

      if (response) {
        setEvents(response.data);
        setTotal(response.meta.total);
      }
    },
    [vin, startDate, endDate, doRequest]
  );

  const handleSearch = () => {
    setPage(0);
    setHasSearched(true);
    fetchEvents(0, pageSize);
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    const newPageSize = Math.min(model.pageSize, 50);
    setPage(model.page);
    setPageSize(newPageSize);
    fetchEvents(model.page, newPageSize);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Eventos de Estado
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <StatusFilters
          vin={vin}
          startDate={startDate}
          endDate={endDate}
          onVinChange={setVin}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearch={handleSearch}
          loading={loading}
        />
      </Paper>

      {errors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors}
        </Alert>
      )}

      {loading && !hasSearched && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {hasSearched && (
        <Paper sx={{ p: 2 }}>
          <StatusEventTable
            rows={events}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            onPaginationChange={handlePaginationChange}
          />
        </Paper>
      )}
    </Box>
  );
};

export default StatusEventsPage;
