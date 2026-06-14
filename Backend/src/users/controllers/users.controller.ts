import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetUserResponseDto } from '../dtos/get-user-response.dto';
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
    description: 'Retorna todos los usuarios del sistema (solo ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [GetUserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  getUsers(): Promise<GetUserResponseDto[]> {
    return this._queryBus.execute(new GetUsersQuery());
  }
}
