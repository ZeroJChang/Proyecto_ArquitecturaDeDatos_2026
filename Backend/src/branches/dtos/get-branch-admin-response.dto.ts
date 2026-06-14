import { ApiProperty } from '@nestjs/swagger';

export class GetBranchAdminResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Guatemala City' })
  name: string;

  @ApiProperty({ example: 'Guatemala' })
  country: string;

  @ApiProperty({ example: 'Central' })
  region: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 12 })
  vehicleCount: number;

  @ApiProperty({ example: 5 })
  ownerCount: number;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  createdAt: Date;
}
