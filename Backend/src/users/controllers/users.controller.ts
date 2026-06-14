import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationResponse } from '../../common/dtos/pagination-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetUserAdminResponseDto } from '../dtos/get-user-admin-response.dto';
import { GetUsersRequestDto } from '../dtos/get-users-request.dto';
import { GetUsersQuery } from '../queries/get-users.query';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Retorna usuarios paginados con búsqueda, filtro por rol y ordenamiento (solo ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuarios',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getUsers(
    @Query() params: GetUsersRequestDto,
  ): Promise<PaginationResponse<GetUserAdminResponseDto>> {
    return this._queryBus.execute(new GetUsersQuery(params));
  }
}
