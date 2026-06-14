import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';

import { Model } from 'mongoose';
import { Repository } from 'typeorm';

import { Vehicle } from '../../../vehicles/entities/vehicle.entity';
import { VehicleWithFaultDto } from '../../dtos/get-vehicles-with-faults-response.dto';
import { StatusEventMapper } from '../../mappers/status-event.mapper';
import { StatusEvent } from '../../schemas/status-event.schema';
import { GetVehiclesWithFaultsQuery } from '../get-vehicles-with-faults.query';

@QueryHandler(GetVehiclesWithFaultsQuery)
export class GetVehiclesWithFaultsHandler implements IQueryHandler<GetVehiclesWithFaultsQuery> {
  constructor(
    @InjectModel(StatusEvent.name)
    private readonly _statusEventModel: Model<StatusEvent>,
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
  ) {}

  async execute(
    query: GetVehiclesWithFaultsQuery,
  ): Promise<{ data: VehicleWithFaultDto[] }> {
    const { user } = query;

    if (!user.branchId) {
      return { data: [] };
    }

    // Get vehicles from the user's branch
    const branchVehicles = await this._vehicleRepository.find({
      where: { branchId: user.branchId },
    });

    const branchVins = branchVehicles.map((v) => v.vin);

    if (branchVins.length === 0) {
      return { data: [] };
    }

    // Aggregate to get the latest event per VIN with non-empty codigo_problema
    const latestEventsWithFaults = await this._statusEventModel.aggregate([
      { $match: { vin: { $in: branchVins } } },
      { $sort: { event_timestamp: -1 } },
      {
        $group: {
          _id: '$vin',
          vin: { $first: '$vin' },
          event_timestamp: { $first: '$event_timestamp' },
          codigo_problema: { $first: '$codigo_problema' },
        },
      },
      {
        $match: {
          codigo_problema: { $nin: [null, ''] },
        },
      },
    ]);

    const data: VehicleWithFaultDto[] = latestEventsWithFaults.map((doc) =>
      StatusEventMapper.toFaultDto(doc as unknown as StatusEvent),
    );

    return { data };
  }
}
