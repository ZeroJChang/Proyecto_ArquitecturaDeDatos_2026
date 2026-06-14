import { Body, Controller, Post } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginQuery } from '../queries/login.query';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _queryBus: QueryBus) {}

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuario',
    description: 'Valida credenciales y retorna un JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  login(@Body() loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    return this._queryBus.execute(
      new LoginQuery(loginRequest.email, loginRequest.password),
    );
  }
}
