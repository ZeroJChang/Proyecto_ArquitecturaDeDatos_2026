import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

interface Vehicle {
  vin: string;
  model: string;
  year: number;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVin: string | null;
  onSelect: (vin: string) => void;
}

const VehicleList = ({ vehicles, selectedVin, onSelect }: VehicleListProps) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay vehículos asignados a esta sucursal.
      </Typography>
    );
  }

  return (
    <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
      <List disablePadding>
        {vehicles.map((vehicle) => (
          <ListItemButton
            key={vehicle.vin}
            selected={selectedVin === vehicle.vin}
            onClick={() => onSelect(vehicle.vin)}
          >
            <ListItemText
              primary={`${vehicle.model} (${vehicle.year})`}
              secondary={vehicle.vin}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default VehicleList;
