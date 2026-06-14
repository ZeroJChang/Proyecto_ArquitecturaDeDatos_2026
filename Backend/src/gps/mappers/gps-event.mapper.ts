import { GpsEventDto } from '../dtos/get-gps-events-response.dto';
import { GpsEvent } from '../entities/gps-event.entity';

export class GpsEventMapper {
  static toDto(entity: GpsEvent): GpsEventDto {
    return {
      vin: entity.vin,
      eventTimestamp: entity.eventTimestamp.toISOString(),
      latitude: entity.latitude,
      longitude: entity.longitude,
    };
  }
}
