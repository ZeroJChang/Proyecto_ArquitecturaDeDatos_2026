import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Role } from '../../../common/constants/roles.constant';
import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { GetVehicleResponseDto } from '../../dtos/get-vehicle-response.dto';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleMapper } from '../../mappers/vehicle.mapper';
import { GetVehiclesQuery } from '../get-vehicles.query';

@QueryHandler(GetVehiclesQuery)
export class GetVehiclesHandler implements IQueryHandler<GetVehiclesQuery> {
  constructor(
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
  ) {}

  async execute(
    query: GetVehiclesQuery,
  ): Promise<PaginationResponse<GetVehicleResponseDto>> {
    const { params, user } = query;
    const { page, limit } = params;

    const where: Record<string, unknown> = {};

    if (user.role === Role.BRANCH_USER) {
      where.branchId = user.branchId;
    }

    const [vehicles, total] = await this._vehicleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });

    return {
      data: vehicles.map(VehicleMapper.toDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
