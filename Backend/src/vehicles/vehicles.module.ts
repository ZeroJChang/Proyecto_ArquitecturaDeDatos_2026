import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehiclesController } from './controllers/vehicles.controller';
import { VehicleOwner } from './entities/vehicle-owner.entity';
import { Vehicle } from './entities/vehicle.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleOwner]), CqrsModule],
  controllers: [VehiclesController],
  providers: [...QueryHandlers],
  exports: [TypeOrmModule],
})
export class VehiclesModule {}
