import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GetStatusEventsRequestDto } from '../dtos/get-status-events-request.dto';
import { GetLatestStatusQuery } from '../queries/get-latest-status.query';
import { GetStatusEventsQuery } from '../queries/get-status-events.query';
import { GetVehiclesWithFaultsQuery } from '../queries/get-vehicles-with-faults.query';

@ApiTags('status')
@Controller('status')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatusController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get('events')
  @Roles(Role.ADMIN, Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Consultar eventos de estado operacional',
    description:
      'Retorna eventos de estado paginados para un vehículo por VIN y rango de fechas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de eventos de estado',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado o vehículo no pertenece a tu sucursal',
  })
  getStatusEvents(
    @Query() params: GetStatusEventsRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this._queryBus.execute(new GetStatusEventsQuery(params, user));
  }

  @Get('latest/:vin')
  @Roles(Role.ADMIN, Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Obtener último estado de un vehículo',
    description:
      'Retorna el evento de estado más reciente para un vehículo por VIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Último evento de estado del vehículo',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado o vehículo no pertenece a tu sucursal',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado o sin eventos de estado',
  })
  getLatestStatus(@Param('vin') vin: string, @CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetLatestStatusQuery(vin, user));
  }

  @Get('faults')
  @Roles(Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Obtener vehículos con fallas activas',
    description:
      'Retorna los vehículos de la sucursal del usuario que tienen códigos de falla activos en su último evento de estado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos con fallas activas',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getVehiclesWithFaults(@CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetVehiclesWithFaultsQuery(user));
  }
}
