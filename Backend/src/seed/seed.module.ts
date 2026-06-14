import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Branch } from '../branches/entities/branch.entity';
import { configuration, SchemaConfig } from '../config';
import { User } from '../users/entities/user.entity';
import { VehicleOwner } from '../vehicles/entities/vehicle-owner.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: SchemaConfig,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URI'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([Branch, User, Vehicle, VehicleOwner]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
