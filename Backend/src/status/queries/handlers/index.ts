import { GetLatestStatusHandler } from './get-latest-status.handler';
import { GetStatusEventsHandler } from './get-status-events.handler';
import { GetVehiclesWithFaultsHandler } from './get-vehicles-with-faults.handler';

export const QueryHandlers = [
  GetStatusEventsHandler,
  GetLatestStatusHandler,
  GetVehiclesWithFaultsHandler,
];
