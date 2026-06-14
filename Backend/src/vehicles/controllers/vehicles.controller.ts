import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ClaimVehicleCommand } from '../commands/claim-vehicle.command';
import { ClaimVehicleRequestDto } from '../dtos/claim-vehicle-request.dto';
import { ClaimVehicleResponseDto } from '../dtos/claim-vehicle-response.dto';
import { GetVehicleResponseDto } from '../dtos/get-vehicle-response.dto';
import { GetVehiclesRequestDto } from '../dtos/get-vehicles-request.dto';
import { GetOwnerVehiclesQuery } from '../queries/get-owner-vehicles.query';
import { GetVehicleByVinQuery } from '../queries/get-vehicle-by-vin.query';
import { GetVehiclesQuery } from '../queries/get-vehicles.query';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(
    private readonly _queryBus: QueryBus,
    private readonly _commandBus: CommandBus,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Listar vehículos',
    description:
      'Retorna vehículos paginados. ADMIN ve todos, BRANCH_USER solo los de su sucursal.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de vehículos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getVehicles(
    @Query() params: GetVehiclesRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this._queryBus.execute(new GetVehiclesQuery(params, user));
  }

  @Get('owner')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Listar vehículos del propietario',
    description: 'Retorna los vehículos asociados al propietario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos del propietario',
    type: [GetVehicleResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getOwnerVehicles(@CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetOwnerVehiclesQuery(user));
  }

  @Post('claim')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Reclamar vehículo por VIN',
    description:
      'Permite a un propietario reclamar un vehículo por su VIN. Si el VIN no existe, se genera un vehículo demo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo reclamado exitosamente',
    type: ClaimVehicleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'VIN inválido o ya asignado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  claimVehicle(
    @Body() dto: ClaimVehicleRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimVehicleResponseDto> {
    return this._commandBus.execute(new ClaimVehicleCommand(dto.vin, user.sub));
  }

  @Get(':vin')
  @Roles(Role.ADMIN, Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Obtener vehículo por VIN',
    description:
      'Retorna un vehículo por su VIN. BRANCH_USER solo si pertenece a su sucursal.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículo encontrado',
    type: GetVehicleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  getVehicleByVin(@Param('vin') vin: string, @CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetVehicleByVinQuery(vin, user));
  }
}
