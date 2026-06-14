import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { VehicleWithFault } from '../../interfaces/Dashboard';

interface FaultVehicleTableProps {
  vehicles: VehicleWithFault[];
}

const FaultVehicleTable = ({ vehicles = [] }: FaultVehicleTableProps) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay vehículos con fallas activas.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>VIN</TableCell>
            <TableCell>Código de Falla</TableCell>
            <TableCell>Último Reporte</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((fault, index) => (
            <TableRow key={`${fault.vin}-${fault.faultCode}-${index}`}>
              <TableCell>{fault.vin}</TableCell>
              <TableCell>{fault.faultCode}</TableCell>
              <TableCell>
                {new Date(fault.lastReportedAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FaultVehicleTable;
