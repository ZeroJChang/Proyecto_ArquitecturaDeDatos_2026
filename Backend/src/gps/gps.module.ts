import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehicleOwner } from '../vehicles/entities/vehicle-owner.entity';

import { GpsController } from './controllers/gps.controller';
import { GpsEvent } from './entities/gps-event.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([GpsEvent, VehicleOwner]), CqrsModule],
  controllers: [GpsController],
  providers: [...QueryHandlers],
  exports: [TypeOrmModule],
})
export class GpsModule {}
