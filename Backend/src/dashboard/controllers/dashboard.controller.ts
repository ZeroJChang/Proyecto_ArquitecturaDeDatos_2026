import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AdminDashboardResponseDto } from '../dtos/admin-dashboard-response.dto';
import { BranchDashboardResponseDto } from '../dtos/branch-dashboard-response.dto';
import { GetAdminDashboardQuery } from '../queries/get-admin-dashboard.query';
import { GetBranchDashboardQuery } from '../queries/get-branch-dashboard.query';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener métricas del dashboard de administrador',
    description:
      'Retorna el total de vehículos, sucursales activas, usuarios y vehículos con fallas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas del dashboard de administrador',
    type: AdminDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getAdminDashboard(@CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetAdminDashboardQuery(user));
  }

  @Get('branch')
  @Roles(Role.BRANCH_USER)
  @ApiOperation({
    summary: 'Obtener dashboard de sucursal',
    description:
      'Retorna la lista de vehículos de la sucursal del usuario con su estado de fallas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard de sucursal',
    type: BranchDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getBranchDashboard(@CurrentUser() user: JwtPayload) {
    return this._queryBus.execute(new GetBranchDashboardQuery(user));
  }
}
