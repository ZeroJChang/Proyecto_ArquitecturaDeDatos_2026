import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Parser } from 'json2csv';
import { Between, Repository } from 'typeorm';

import { VehicleOwner } from '../../../vehicles/entities/vehicle-owner.entity';
import { GpsEvent } from '../../entities/gps-event.entity';
import { DownloadGpsCsvQuery } from '../download-gps-csv.query';

export interface CsvDownloadResult {
  csv: string;
  filename: string;
}

@QueryHandler(DownloadGpsCsvQuery)
export class DownloadGpsCsvHandler implements IQueryHandler<DownloadGpsCsvQuery> {
  constructor(
    @InjectRepository(GpsEvent)
    private readonly _gpsEventRepository: Repository<GpsEvent>,
    @InjectRepository(VehicleOwner)
    private readonly _vehicleOwnerRepository: Repository<VehicleOwner>,
  ) {}

  async execute(query: DownloadGpsCsvQuery): Promise<CsvDownloadResult> {
    const { params, user } = query;

    // Validate ownership
    const ownership = await this._vehicleOwnerRepository.findOne({
      where: { userId: user.sub, vehicle: { vin: params.vin } },
      relations: { vehicle: true },
    });

    if (!ownership) {
      throw new ForbiddenException('No tienes acceso a este vehículo');
    }

    // Validate date range
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin',
      );
    }

    // Query all matching events
    const events = await this._gpsEventRepository.find({
      where: {
        vin: params.vin,
        eventTimestamp: Between(startDate, endDate),
      },
      order: { eventTimestamp: 'ASC' },
    });

    if (events.length === 0) {
      throw new NotFoundException('No hay datos GPS para el rango solicitado');
    }

    // Generate CSV
    const csvData = events.map((event) => ({
      VIN: event.vin,
      datetime: event.eventTimestamp.toISOString(),
      latitude: event.latitude,
      longitude: event.longitude,
    }));

    const parser = new Parser({
      fields: ['VIN', 'datetime', 'latitude', 'longitude'],
    });
    const csv = parser.parse(csvData);

    const filename = `${params.vin}_${params.startDate}_${params.endDate}.csv`;

    return { csv, filename };
  }
}
