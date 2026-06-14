import { ApiProperty } from '@nestjs/swagger';

export class VehicleWithFaultDto {
  @ApiProperty({ example: '1HGCM82633A123456' })
  vin: string;

  @ApiProperty({ example: 'P0301' })
  faultCode: string;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  lastReportedAt: string;
}
