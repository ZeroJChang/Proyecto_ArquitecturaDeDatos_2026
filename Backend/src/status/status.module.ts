import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Vehicle } from '../vehicles/entities/vehicle.entity';

import { StatusController } from './controllers/status.controller';
import { QueryHandlers } from './queries/handlers';
import { StatusEvent, StatusEventSchema } from './schemas/status-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StatusEvent.name, schema: StatusEventSchema },
    ]),
    TypeOrmModule.forFeature([Vehicle]),
    CqrsModule,
  ],
  controllers: [StatusController],
  providers: [...QueryHandlers],
  exports: [MongooseModule],
})
export class StatusModule {}
