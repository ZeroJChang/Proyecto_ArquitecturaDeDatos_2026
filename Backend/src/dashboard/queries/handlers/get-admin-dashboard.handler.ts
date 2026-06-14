import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';

import { Model } from 'mongoose';
import { Repository } from 'typeorm';

import { Branch } from '../../../branches/entities/branch.entity';
import { StatusEvent } from '../../../status/schemas/status-event.schema';
import { User } from '../../../users/entities/user.entity';
import { Vehicle } from '../../../vehicles/entities/vehicle.entity';
import { AdminDashboardResponseDto } from '../../dtos/admin-dashboard-response.dto';
import { GetAdminDashboardQuery } from '../get-admin-dashboard.query';

@QueryHandler(GetAdminDashboardQuery)
export class GetAdminDashboardHandler implements IQueryHandler<GetAdminDashboardQuery> {
  constructor(
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Branch)
    private readonly _branchRepository: Repository<Branch>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectModel(StatusEvent.name)
    private readonly _statusEventModel: Model<StatusEvent>,
  ) {}

  async execute(
    _query: GetAdminDashboardQuery,
  ): Promise<AdminDashboardResponseDto> {
    const [totalVehicles, totalBranches, totalUsers] = await Promise.all([
      this._vehicleRepository.count(),
      this._branchRepository.count({ where: { isActive: true } }),
      this._userRepository.count(),
    ]);

    // Get all vehicle VINs
    const allVehicles = await this._vehicleRepository.find({
      select: { vin: true },
    });
    const allVins = allVehicles.map((v) => v.vin);

    let vehiclesWithFaults = 0;

    if (allVins.length > 0) {
      // Aggregate to find vehicles with active faults (non-empty codigo_problema in latest event)
      const faultsResult = await this._statusEventModel.aggregate([
        { $match: { vin: { $in: allVins } } },
        { $sort: { event_timestamp: -1 } },
        {
          $group: {
            _id: '$vin',
            codigo_problema: { $first: '$codigo_problema' },
          },
        },
        {
          $match: {
            codigo_problema: { $nin: [null, ''] },
          },
        },
        { $count: 'total' },
      ]);

      vehiclesWithFaults = faultsResult.length > 0 ? faultsResult[0].total : 0;
    }

    return {
      totalVehicles,
      totalBranches,
      totalUsers,
      vehiclesWithFaults,
    };
  }
}
