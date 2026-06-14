import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationResponse } from '../../common/dtos/pagination-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetBranchAdminResponseDto } from '../dtos/get-branch-admin-response.dto';
import { GetBranchesRequestDto } from '../dtos/get-branches-request.dto';
import { GetBranchesQuery } from '../queries/get-branches.query';

@ApiTags('branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BranchesController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Listar sucursales con paginación, búsqueda y ordenamiento',
    description:
      'Retorna sucursales con conteo de vehículos y propietarios por sucursal',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de sucursales',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getBranches(
    @Query() params: GetBranchesRequestDto,
  ): Promise<PaginationResponse<GetBranchAdminResponseDto>> {
    return this._queryBus.execute(new GetBranchesQuery(params));
  }
}
