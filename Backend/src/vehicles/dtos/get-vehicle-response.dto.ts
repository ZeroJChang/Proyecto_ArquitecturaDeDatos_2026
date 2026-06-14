import { ApiProperty } from '@nestjs/swagger';

export class GetVehicleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '1HGCM82633A123456' })
  vin: string;

  @ApiProperty({ example: 'VH-001' })
  idVehiculo: string;

  @ApiProperty({ example: 'Model 3' })
  model: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  createdAt: Date;
}
