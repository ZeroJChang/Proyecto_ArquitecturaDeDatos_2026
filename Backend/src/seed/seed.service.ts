import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Branch } from '../branches/entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { VehicleOwner } from '../vehicles/entities/vehicle-owner.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

import { branchesSeed } from './data/branches.seed';
import { usersSeed } from './data/users.seed';
import { vehicleOwnersSeed } from './data/vehicle-owners.seed';
import { vehiclesSeed } from './data/vehicles.seed';

@Injectable()
export class SeedService {
  private readonly _logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly _branchRepository: Repository<Branch>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly _vehicleRepository: Repository<Vehicle>,
    @InjectRepository(VehicleOwner)
    private readonly _vehicleOwnerRepository: Repository<VehicleOwner>,
  ) {}

  async run(): Promise<void> {
    this._logger.log('Starting seed...');

    // Truncate all tables and reset sequences in one statement
    const { dataSource } = this._branchRepository.manager;
    this._logger.log('Truncating tables...');
    await dataSource.query(
      `TRUNCATE TABLE vehicle_owners, vehicles, users, branches RESTART IDENTITY CASCADE`,
    );

    // Insert in dependency order
    this._logger.log('Inserting branches...');
    await this._branchRepository.save(branchesSeed);

    this._logger.log('Inserting users...');
    await this._userRepository.save(usersSeed);

    this._logger.log('Inserting vehicles...');
    await this._vehicleRepository.save(vehiclesSeed);

    this._logger.log('Inserting vehicle_owners...');
    await this._vehicleOwnerRepository.save(vehicleOwnersSeed);

    this._logger.log('Seed completed successfully!');
  }
}
