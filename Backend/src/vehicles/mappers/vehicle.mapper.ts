import { GetVehicleResponseDto } from '../dtos/get-vehicle-response.dto';
import { Vehicle } from '../entities/vehicle.entity';

export class VehicleMapper {
  static toDto(entity: Vehicle): GetVehicleResponseDto {
    return {
      id: entity.id,
      vin: entity.vin,
      idVehiculo: entity.idVehiculo,
      model: entity.model,
      year: entity.year,
      branchId: entity.branchId,
      createdAt: entity.createdAt,
    };
  }
}
