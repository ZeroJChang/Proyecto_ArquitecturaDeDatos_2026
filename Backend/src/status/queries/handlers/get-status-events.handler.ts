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
      if (!params.vin) {
        // BRANCH_USER without VIN: return events for all vehicles in their branch
        const branchVehicles = await this._vehicleRepository.find({
          where: { branchId: user.branchId ?? undefined } as any,
          select: { vin: true },
        });

        const branchVins = branchVehicles.map((v) => v.vin);

        if (branchVins.length === 0) {
          return {
            data: [],
            meta: {
              total: 0,
              page: params.page,
              limit: params.limit,
              totalPages: 0,
            },
          };
        }

        const filter = this._buildFilter(
          branchVins,
          params.startDate,
          params.endDate,
        );
        return this._executeQuery(filter, params.page, params.limit);
      }

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

    // Build filter based on provided params
    const filter = this._buildFilter(
      params.vin ? [params.vin] : undefined,
      params.startDate,
      params.endDate,
    );

    return this._executeQuery(filter, params.page, params.limit);
  }

  private _buildFilter(
    vins?: string[],
    startDate?: string,
    endDate?: string,
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // VIN filter
    if (vins && vins.length === 1) {
      filter.vin = vins[0];
    } else if (vins && vins.length > 1) {
      filter.vin = { $in: vins };
    }

    // Date range filter
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};

      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }

      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }

      // Validate date range if both are provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
          throw new BadRequestException(
            'La fecha de inicio no puede ser mayor a la fecha de fin',
          );
        }
      }

      filter.event_timestamp = dateFilter;
    }

    return filter;
  }

  private async _executeQuery(
    filter: Record<string, any>,
    page: number,
    limit: number,
  ): Promise<PaginationResponse<StatusEventDto>> {
    const total = await this._statusEventModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    const data = await this._statusEventModel
      .find(filter)
      .sort({ event_timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: data.map(StatusEventMapper.toDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
