import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Response } from 'express';

import { Role } from '../../common/constants/roles.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DownloadCsvRequestDto } from '../dtos/download-csv-request.dto';
import { GetGpsEventsRequestDto } from '../dtos/get-gps-events-request.dto';
import { DownloadGpsCsvQuery } from '../queries/download-gps-csv.query';
import { GetGpsEventsQuery } from '../queries/get-gps-events.query';
import { CsvDownloadResult } from '../queries/handlers/download-gps-csv.handler';

@ApiTags('gps')
@Controller('gps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GpsController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get('events')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Consultar eventos GPS',
    description:
      'Retorna eventos GPS paginados para un vehículo del propietario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de eventos GPS',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado o vehículo no propio',
  })
  getGpsEvents(
    @Query() params: GetGpsEventsRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this._queryBus.execute(new GetGpsEventsQuery(params, user));
  }

  @Get('events/download')
  @Roles(Role.OWNER)
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Descargar eventos GPS como CSV',
    description:
      'Descarga todos los eventos GPS de un vehículo en el rango de fechas como archivo CSV.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV descargado',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado o vehículo no propio',
  })
  @ApiResponse({ status: 404, description: 'No hay datos GPS para el rango' })
  async downloadCsv(
    @Query() params: DownloadCsvRequestDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const result: CsvDownloadResult = await this._queryBus.execute(
      new DownloadGpsCsvQuery(params, user),
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.csv);
  }
}
