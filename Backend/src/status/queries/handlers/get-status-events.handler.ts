import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';

import { Model } from 'mongoose';
import { Repository } from 'typeorm';

import { Role } from '../../../common/constants/roles.constant';
import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { Vehicle } from '../../../vehicles/entities/vehicle.entity';
import { StatusEventDto } from '../../dtos/get-status-events-response.dto';
import { StatusEventMapper } from '../../mappers/status-event.mapper';
import { StatusEvent } from '../../schemas/status-event.schema';
import { GetStatusEventsQuery } from '../get-status-events.query';

@QueryHandler(GetStatusEventsQuery)
export class GetStatusEventsHandler implements IQueryHandler<GetStatusEventsQuery> {
  constructor(
    @InjectModel(StatusEvent.name)
    private readonly _statusEventModel: Model<StatusEvent>,
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
  ) {}

  async execute(
    query: GetStatusEventsQuery,
  ): Promise<PaginationResponse<StatusEventDto>> {
    const { params, user } = query;

    // Validate branch scoping for BRANCH_USER
    if (user.role === Role.BRANCH_USER) {
      const vehicle = await this._vehicleRepository.findOne({
        where: { vin: params.vin },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehículo no encontrado');
      }

      if (vehicle.branchId !== user.branchId) {
        throw new ForbiddenException('El vehículo no pertenece a tu sucursal');
      }
    }

    // Validate date range
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin',
      );
    }

    // Query MongoDB with pagination
    const filter = {
      vin: params.vin,
      event_timestamp: { $gte: startDate, $lte: endDate },
    };

    const total = await this._statusEventModel.countDocuments(filter);
    const skip = (params.page - 1) * params.limit;

    const data = await this._statusEventModel
      .find(filter)
      .sort({ event_timestamp: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec();

    return {
      data: data.map(StatusEventMapper.toDto),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
