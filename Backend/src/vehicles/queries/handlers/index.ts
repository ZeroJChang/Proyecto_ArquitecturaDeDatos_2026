import { GetOwnerVehiclesHandler } from './get-owner-vehicles.handler';
import { GetVehicleByVinHandler } from './get-vehicle-by-vin.handler';
import { GetVehiclesHandler } from './get-vehicles.handler';

export const QueryHandlers = [
  GetVehiclesHandler,
  GetVehicleByVinHandler,
  GetOwnerVehiclesHandler,
];
