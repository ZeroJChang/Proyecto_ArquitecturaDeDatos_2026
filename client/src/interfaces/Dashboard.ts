export interface AdminDashboard {
  totalVehicles: number;
  totalBranches: number;
  totalUsers: number;
  vehiclesWithFaults: number;
}

export interface VehicleWithFault {
  vin: string;
  faultCode: string;
  lastReportedAt: string;
}

export interface BranchVehicle {
  vin: string;
  idVehiculo: string;
  model: string;
  year: number;
  codigoProblema: string;
}

export interface BranchDashboard {
  vehicles: BranchVehicle[];
  totalVehicles: number;
  vehiclesWithFaults: number;
}
