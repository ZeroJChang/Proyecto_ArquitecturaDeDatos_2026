import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@acme-ev.com' })
  email: string;

  @ApiProperty({ example: 'Admin User' })
  name: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'BRANCH_USER', 'OWNER'] })
  role: string;

  @ApiProperty({ example: 1, nullable: true })
  branchId: number | null;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  createdAt: Date;
}
