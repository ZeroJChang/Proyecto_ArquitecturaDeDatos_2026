import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Branch } from '../branches/entities/branch.entity';
import {
  StatusEvent,
  StatusEventSchema,
} from '../status/schemas/status-event.schema';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

import { DashboardController } from './controllers/dashboard.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, Branch, User]),
    MongooseModule.forFeature([
      { name: StatusEvent.name, schema: StatusEventSchema },
    ]),
    CqrsModule,
  ],
  controllers: [DashboardController],
  providers: [...QueryHandlers],
})
export class DashboardModule {}
