import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'admin@acme-ev.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
