import { ApiProperty } from '@nestjs/swagger';

export class StatusEventDto {
  @ApiProperty({ example: '1HGCM82633A123456' })
  vin: string;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  eventTimestamp: string;

  @ApiProperty({ example: 85.5 })
  batteryLevel: number;

  @ApiProperty({ example: true })
  engineStatus: boolean;

  @ApiProperty({ example: 'P0301' })
  faultCodes: string;

  @ApiProperty({ example: 15234.7 })
  odometer: number;
}
