import React, { useState, useCallback } from 'react';
import { Typography, Box, Alert, CircularProgress } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useLocation } from 'react-router-dom';

import GpsFilters from '../components/gps/GpsFilters';
import GpsEventTable from '../components/gps/GpsEventTable';
import CsvDownloadButton from '../components/gps/CsvDownloadButton';
import useRequest from '../hooks/use-request.hook';
import { URLS } from '../constants/urls';
import { GpsEvent } from '../interfaces/GpsEvent';

interface GpsEventsResponse {
  data: GpsEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const GpsEventsPage: React.FC = () => {
  const location = useLocation();
  const stateVin = (location.state as { vin?: string })?.vin || '';

  const [vin, setVin] = useState(stateVin);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState<GpsEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [hasSearched, setHasSearched] = useState(false);

  const { doRequest, errors, loading } = useRequest<GpsEventsResponse>({
    url: URLS.GPS_EVENTS,
    method: 'get',
  });

  const fetchEvents = useCallback(
    async (currentPage: number, currentPageSize: number) => {
      if (!vin || !startDate || !endDate) return;

      const result = await doRequest({
        params: {
          vin,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          page: currentPage,
          limit: currentPageSize,
        },
      });

      if (result) {
        setEvents(result.data);
        setTotal(result.meta.total);
        setHasSearched(true);
      }
    },
    [vin, startDate, endDate, doRequest]
  );

  const handleSearch = () => {
    setPage(1);
    fetchEvents(1, pageSize);
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    const newPage = model.page as number;
    const newPageSize = model.pageSize;
    setPage(newPage);
    setPageSize(newPageSize);
    fetchEvents(newPage, newPageSize);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        GPS Events
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        <GpsFilters
          vin={vin}
          startDate={startDate}
          endDate={endDate}
          onVinChange={setVin}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearch={handleSearch}
          loading={loading}
        />
        <CsvDownloadButton vin={vin} startDate={startDate} endDate={endDate} disabled={!hasSearched} />
      </Box>

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
        <GpsEventTable
          rows={events}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </Box>
  );
};

export default GpsEventsPage;
