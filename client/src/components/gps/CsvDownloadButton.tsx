import React, { useState } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { API_URL, URLS } from '../../constants/urls';
import { getToken } from '../../utils/auth-storage.util';

interface CsvDownloadButtonProps {
  vin: string;
  startDate: string;
  endDate: string;
  disabled?: boolean;
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({
  vin,
  startDate,
  endDate,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!vin || !startDate || !endDate) return;

    setLoading(true);
    try {
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? `/api${URLS.GPS_EVENTS_DOWNLOAD}`
          : `${API_URL}${URLS.GPS_EVENTS_DOWNLOAD}`;

      const token = getToken();
      const response = await axios.get(baseUrl, {
        params: {
          vin,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `${vin}_gps_events.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\s]+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      disabled={disabled || loading || !vin || !startDate || !endDate}
      sx={{ height: 40 }}
    >
      {loading ? 'Downloading...' : 'Download CSV'}
    </Button>
  );
};

export default CsvDownloadButton;
