import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository } from 'typeorm';

import { Role } from '../../../common/constants';
import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { VehicleOwner } from '../../../vehicles/entities/vehicle-owner.entity';
import { GpsEventDto } from '../../dtos/get-gps-events-response.dto';
import { GpsEvent } from '../../entities/gps-event.entity';
import { GpsEventMapper } from '../../mappers/gps-event.mapper';
import { GetGpsEventsQuery } from '../get-gps-events.query';

@QueryHandler(GetGpsEventsQuery)
export class GetGpsEventsHandler implements IQueryHandler<GetGpsEventsQuery> {
  constructor(
    @InjectRepository(GpsEvent)
    private readonly _gpsEventRepository: Repository<GpsEvent>,
    @InjectRepository(VehicleOwner)
    private readonly _vehicleOwnerRepository: Repository<VehicleOwner>,
  ) {}

  async execute(
    query: GetGpsEventsQuery,
  ): Promise<PaginationResponse<GpsEventDto>> {
    const { params, user } = query;

    // Validate ownership
    const ownership = await this._vehicleOwnerRepository.findOne({
      where: { userId: user.sub, vehicle: { vin: params.vin } },
      relations: { vehicle: true },
    });

    if (![Role.ADMIN, Role.BRANCH_USER].includes(user.role) && !ownership) {
      throw new ForbiddenException('No tienes acceso a este vehículo');
    }

    // Validate date range
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin',
      );
    }

    // Query GPS events with pagination
    const [data, total] = await this._gpsEventRepository.findAndCount({
      where: {
        vin: params.vin,
        eventTimestamp: Between(startDate, endDate),
      },
      order: { eventTimestamp: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      data: data.map(GpsEventMapper.toDto),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
