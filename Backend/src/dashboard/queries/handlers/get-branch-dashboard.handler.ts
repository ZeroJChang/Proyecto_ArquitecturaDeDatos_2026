import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';

import { Model } from 'mongoose';
import { Repository } from 'typeorm';

import { StatusEvent } from '../../../status/schemas/status-event.schema';
import { Vehicle } from '../../../vehicles/entities/vehicle.entity';
import {
  BranchDashboardResponseDto,
  BranchVehicleDto,
} from '../../dtos/branch-dashboard-response.dto';
import { GetBranchDashboardQuery } from '../get-branch-dashboard.query';

@QueryHandler(GetBranchDashboardQuery)
export class GetBranchDashboardHandler implements IQueryHandler<GetBranchDashboardQuery> {
  constructor(
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
    @InjectModel(StatusEvent.name)
    private readonly _statusEventModel: Model<StatusEvent>,
  ) {}

  async execute(
    query: GetBranchDashboardQuery,
  ): Promise<BranchDashboardResponseDto> {
    const { user } = query;

    if (!user.branchId) {
      return { vehicles: [], totalVehicles: 0, vehiclesWithFaults: 0 };
    }

    // Get vehicles from the user's branch
    const branchVehicles = await this._vehicleRepository.find({
      where: { branchId: user.branchId },
    });

    const branchVins = branchVehicles.map((v) => v.vin);

    if (branchVins.length === 0) {
      return { vehicles: [], totalVehicles: 0, vehiclesWithFaults: 0 };
    }

    // Get latest event per VIN to check for active faults
    const latestEvents = await this._statusEventModel.aggregate([
      { $match: { vin: { $in: branchVins } } },
      { $sort: { event_timestamp: -1 } },
      {
        $group: {
          _id: '$vin',
          vin: { $first: '$vin' },
          codigo_problema: { $first: '$codigo_problema' },
        },
      },
    ]);

    // Create a map of VIN -> codigoProblema
    const faultsMap = new Map<string, string>();
    for (const event of latestEvents) {
      faultsMap.set(event.vin, event.codigo_problema || '');
    }

    // Build vehicle list with fault info
    const vehicles: BranchVehicleDto[] = branchVehicles.map((v) => ({
      vin: v.vin,
      idVehiculo: v.idVehiculo,
      model: v.model,
      year: v.year,
      codigoProblema: faultsMap.get(v.vin) || '',
    }));

    const vehiclesWithFaults = vehicles.filter(
      (v) => v.codigoProblema !== '',
    ).length;

    return {
      vehicles,
      totalVehicles: branchVehicles.length,
      vehiclesWithFaults,
    };
  }
}
