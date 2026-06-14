import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DataSource } from 'typeorm';

import { VehicleOwner } from '../../entities/vehicle-owner.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { DemoVehicleService } from '../../services/demo-vehicle.service';
import { ClaimVehicleCommand } from '../claim-vehicle.command';

@CommandHandler(ClaimVehicleCommand)
export class ClaimVehicleHandler implements ICommandHandler<ClaimVehicleCommand> {
  constructor(
    private readonly _dataSource: DataSource,
    private readonly _demoVehicleService: DemoVehicleService,
  ) {}

  async execute(
    command: ClaimVehicleCommand,
  ): Promise<{ message: string; vin: string }> {
    const { vin, userId } = command;

    return await this._dataSource.transaction(async (manager) => {
      const existingOwner = await manager
        .getRepository(VehicleOwner)
        .createQueryBuilder('vo')
        .innerJoin(Vehicle, 'v', 'vo.vehicleId = v.id')
        .where('v.vin = :vin', { vin })
        .getOne();

      if (existingOwner) {
        throw new BadRequestException(
          'Vehicle is already assigned to an owner',
        );
      }

      let vehicle = await manager
        .getRepository(Vehicle)
        .findOne({ where: { vin } });

      if (!vehicle) {
        vehicle = await this._demoVehicleService.generateVehicle(vin, manager);
      }

      const vehicleOwner = manager.getRepository(VehicleOwner).create({
        userId,
        vehicleId: vehicle.id,
      });

      await manager.getRepository(VehicleOwner).save(vehicleOwner);

      return {
        message: 'Vehicle claimed successfully',
        vin,
      };
    });
  }
}
