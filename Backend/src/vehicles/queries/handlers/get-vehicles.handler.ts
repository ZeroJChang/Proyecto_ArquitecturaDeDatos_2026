import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Role } from '../../../common/constants/roles.constant';
import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { GetVehicleResponseDto } from '../../dtos/get-vehicle-response.dto';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleMapper } from '../../mappers/vehicle.mapper';
import { GetVehiclesQuery } from '../get-vehicles.query';

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  vin: 'vehicle.vin',
  idVehiculo: 'vehicle.idVehiculo',
  model: 'vehicle.model',
  year: 'vehicle.year',
  branchId: 'vehicle.branchId',
  createdAt: 'vehicle.createdAt',
  id: 'vehicle.id',
};

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
    const { page, limit, search, sortBy, sortOrder } = params;

    const qb = this._vehicleRepository.createQueryBuilder('vehicle');

    if (user.role === Role.BRANCH_USER) {
      qb.where('vehicle.branchId = :branchId', { branchId: user.branchId });
    }

    if (search) {
      qb.andWhere('vehicle.vin ILIKE :search', { search: `%${search}%` });
    }

    const sortColumn = sortBy && ALLOWED_SORT_COLUMNS[sortBy];
    const order: 'ASC' | 'DESC' = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    if (sortColumn) {
      qb.orderBy(sortColumn, order);
    } else {
      qb.orderBy('vehicle.id', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [vehicles, total] = await qb.getManyAndCount();

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
