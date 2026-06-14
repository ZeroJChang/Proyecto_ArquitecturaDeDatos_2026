import { ApiProperty } from '@nestjs/swagger';

export class BranchVehicleDto {
  @ApiProperty({ example: '1HGBH41JXMN109186' })
  vin: string;

  @ApiProperty({ example: 'EV-001' })
  idVehiculo: string;

  @ApiProperty({ example: 'Model S' })
  model: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({
    description: 'Código de problema activo (vacío si no tiene falla)',
    example: 'P0300',
  })
  codigoProblema: string;
}

export class BranchDashboardResponseDto {
  @ApiProperty({
    description: 'Lista de vehículos de la sucursal con estado de fallas',
    type: [BranchVehicleDto],
  })
  vehicles: BranchVehicleDto[];

  @ApiProperty({
    description: 'Total de vehículos en la sucursal',
    example: 20,
  })
  totalVehicles: number;

  @ApiProperty({
    description: 'Total de vehículos con fallas activas',
    example: 3,
  })
  vehiclesWithFaults: number;
}
