import { ApiProperty } from '@nestjs/swagger';

export class GetUserAdminResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Admin User' })
  name: string;

  @ApiProperty({ example: 'admin@acme-ev.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'BRANCH_USER', 'OWNER'] })
  role: string;

  @ApiProperty({ example: 'Guatemala City', nullable: true })
  branchName: string | null;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  createdAt: Date;
}
