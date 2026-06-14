import { StatusEventDto } from '../dtos/get-status-events-response.dto';
import { VehicleWithFaultDto } from '../dtos/get-vehicles-with-faults-response.dto';
import { StatusEvent } from '../schemas/status-event.schema';

export class StatusEventMapper {
  static toDto(doc: StatusEvent): StatusEventDto {
    return {
      vin: doc.vin,
      eventTimestamp: doc.event_timestamp.toISOString(),
      batteryLevel: doc.bateria,
      engineStatus: doc.encendido,
      faultCodes: doc.codigo_problema || '',
      odometer: doc.kilometraje,
    };
  }

  static toFaultDto(doc: StatusEvent): VehicleWithFaultDto {
    return {
      vin: doc.vin,
      faultCode: doc.codigo_problema,
      lastReportedAt: doc.event_timestamp.toISOString(),
    };
  }
}
