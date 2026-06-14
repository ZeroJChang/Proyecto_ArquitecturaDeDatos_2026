import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetBranchResponseDto } from '../dtos/get-branch-response.dto';
import { GetBranchesQuery } from '../queries/get-branches.query';

@ApiTags('branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BranchesController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Listar sucursales activas',
    description: 'Retorna todas las sucursales activas del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sucursales',
    type: [GetBranchResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getBranches(): Promise<GetBranchResponseDto[]> {
    return this._queryBus.execute(new GetBranchesQuery());
  }
}
