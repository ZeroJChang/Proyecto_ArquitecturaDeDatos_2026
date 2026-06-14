export interface StatusEvent {
  vin: string;
  eventTimestamp: string;
  batteryLevel: number;
  engineStatus: boolean;
  faultCodes: string;
  odometer: number;
}
