import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Branch } from '../branches/entities/branch.entity';

import { CommandHandlers } from './commands/handlers';
import { VehiclesController } from './controllers/vehicles.controller';
import { VehicleOwner } from './entities/vehicle-owner.entity';
import { Vehicle } from './entities/vehicle.entity';
import { QueryHandlers } from './queries/handlers';
import { DemoVehicleService } from './services/demo-vehicle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, VehicleOwner, Branch]),
    CqrsModule,
  ],
  controllers: [VehiclesController],
  providers: [...QueryHandlers, ...CommandHandlers, DemoVehicleService],
  exports: [TypeOrmModule],
})
export class VehiclesModule {}
