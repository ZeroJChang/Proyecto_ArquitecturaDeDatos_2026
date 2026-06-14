import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardResponseDto {
  @ApiProperty({ description: 'Total de vehículos registrados', example: 150 })
  totalVehicles: number;

  @ApiProperty({ description: 'Total de sucursales activas', example: 5 })
  totalBranches: number;

  @ApiProperty({ description: 'Total de usuarios registrados', example: 30 })
  totalUsers: number;

  @ApiProperty({
    description: 'Total de vehículos con fallas activas',
    example: 12,
  })
  vehiclesWithFaults: number;
}
