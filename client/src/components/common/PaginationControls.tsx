import { Box, Pagination } from '@mui/material';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const PaginationControls = ({ page, totalPages, onChange }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_event, value) => onChange(value)}
        color="primary"
      />
    </Box>
  );
};

export default PaginationControls;
