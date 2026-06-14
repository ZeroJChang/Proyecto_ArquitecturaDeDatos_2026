import { Card, CardContent, Typography } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: number;
}

const MetricCard = ({ title, value }: MetricCardProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
