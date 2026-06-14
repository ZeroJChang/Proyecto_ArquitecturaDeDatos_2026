import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../common/constants/roles.constant';

class LoginUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@acme-ev.com' })
  email: string;

  @ApiProperty({ example: 'Admin ACME' })
  name: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: string;

  @ApiProperty({ example: null, nullable: true })
  branchId: number | null;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  accessToken: string;

  @ApiProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
