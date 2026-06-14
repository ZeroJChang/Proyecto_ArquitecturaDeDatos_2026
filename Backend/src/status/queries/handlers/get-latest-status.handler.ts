import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';

import { Model } from 'mongoose';
import { Repository } from 'typeorm';

import { Role } from '../../../common/constants/roles.constant';
import { Vehicle } from '../../../vehicles/entities/vehicle.entity';
import { StatusEventDto } from '../../dtos/get-status-events-response.dto';
import { StatusEventMapper } from '../../mappers/status-event.mapper';
import { StatusEvent } from '../../schemas/status-event.schema';
import { GetLatestStatusQuery } from '../get-latest-status.query';

@QueryHandler(GetLatestStatusQuery)
export class GetLatestStatusHandler implements IQueryHandler<GetLatestStatusQuery> {
  constructor(
    @InjectModel(StatusEvent.name)
    private readonly _statusEventModel: Model<StatusEvent>,
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
  ) {}

  async execute(query: GetLatestStatusQuery): Promise<StatusEventDto> {
    const { vin, user } = query;

    // Validate branch scoping for BRANCH_USER
    if (user.role === Role.BRANCH_USER) {
      const vehicle = await this._vehicleRepository.findOne({
        where: { vin },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehículo no encontrado');
      }

      if (vehicle.branchId !== user.branchId) {
        throw new ForbiddenException('El vehículo no pertenece a tu sucursal');
      }
    }

    const latestEvent = await this._statusEventModel
      .findOne({ vin })
      .sort({ event_timestamp: -1 })
      .exec();

    if (!latestEvent) {
      throw new NotFoundException(
        'No se encontraron eventos de estado para este vehículo',
      );
    }

    return StatusEventMapper.toDto(latestEvent);
  }
}
