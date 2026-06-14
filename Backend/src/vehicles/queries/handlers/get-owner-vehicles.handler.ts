import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { GetVehicleResponseDto } from '../../dtos/get-vehicle-response.dto';
import { VehicleOwner } from '../../entities/vehicle-owner.entity';
import { VehicleMapper } from '../../mappers/vehicle.mapper';
import { GetOwnerVehiclesQuery } from '../get-owner-vehicles.query';

@QueryHandler(GetOwnerVehiclesQuery)
export class GetOwnerVehiclesHandler implements IQueryHandler<GetOwnerVehiclesQuery> {
  constructor(
    @InjectRepository(VehicleOwner)
    private readonly _vehicleOwnerRepository: Repository<VehicleOwner>,
  ) {}

  async execute(
    query: GetOwnerVehiclesQuery,
  ): Promise<GetVehicleResponseDto[]> {
    const { user } = query;

    const vehicleOwners = await this._vehicleOwnerRepository.find({
      where: { userId: user.sub },
      relations: { vehicle: true },
    });

    return vehicleOwners.map((vo) => VehicleMapper.toDto(vo.vehicle));
  }
}
