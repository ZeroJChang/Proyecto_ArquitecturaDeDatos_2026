import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export const vehiclesSeed: Partial<Vehicle>[] = [
  {
    vin: 'ACME1000000000001',
    idVehiculo: 'VH-001',
    model: 'ACME EV-100',
    year: 2024,
    branchId: 1,
  },
  {
    vin: 'ACME1000000000002',
    idVehiculo: 'VH-002',
    model: 'ACME EV-100',
    year: 2024,
    branchId: 1,
  },
  {
    vin: 'ACME1000000000003',
    idVehiculo: 'VH-003',
    model: 'ACME EV-200',
    year: 2024,
    branchId: 1,
  },
  {
    vin: 'ACME2000000000001',
    idVehiculo: 'VH-004',
    model: 'ACME EV-200',
    year: 2023,
    branchId: 2,
  },
  {
    vin: 'ACME2000000000002',
    idVehiculo: 'VH-005',
    model: 'ACME EV-200',
    year: 2023,
    branchId: 2,
  },
  {
    vin: 'ACME2000000000003',
    idVehiculo: 'VH-006',
    model: 'ACME EV-300',
    year: 2024,
    branchId: 2,
  },
  {
    vin: 'ACME3000000000001',
    idVehiculo: 'VH-007',
    model: 'ACME EV-300',
    year: 2023,
    branchId: 3,
  },
  {
    vin: 'ACME3000000000002',
    idVehiculo: 'VH-008',
    model: 'ACME EV-300',
    year: 2024,
    branchId: 3,
  },
  {
    vin: 'ACME3000000000003',
    idVehiculo: 'VH-009',
    model: 'ACME EV-100',
    year: 2023,
    branchId: 3,
  },
  {
    vin: 'ACME3000000000004',
    idVehiculo: 'VH-010',
    model: 'ACME EV-200',
    year: 2024,
    branchId: 3,
  },
];
