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

export interface BranchDashboard {
  vehicles: {
    id: number;
    vin: string;
    model: string;
    year: number;
  }[];
  faults: VehicleWithFault[];
}
