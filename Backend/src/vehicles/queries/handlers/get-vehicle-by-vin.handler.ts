import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Role } from '../../../common/constants/roles.constant';
import { GetVehicleResponseDto } from '../../dtos/get-vehicle-response.dto';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleMapper } from '../../mappers/vehicle.mapper';
import { GetVehicleByVinQuery } from '../get-vehicle-by-vin.query';

@QueryHandler(GetVehicleByVinQuery)
export class GetVehicleByVinHandler implements IQueryHandler<GetVehicleByVinQuery> {
  constructor(
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
  ) {}

  async execute(query: GetVehicleByVinQuery): Promise<GetVehicleResponseDto> {
    const { vin, user } = query;

    const vehicle = await this._vehicleRepository.findOne({ where: { vin } });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    if (user.role === Role.BRANCH_USER && vehicle.branchId !== user.branchId) {
      throw new ForbiddenException('El vehículo no pertenece a tu sucursal');
    }

    return VehicleMapper.toDto(vehicle);
  }
}
