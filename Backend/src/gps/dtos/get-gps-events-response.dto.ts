import { ApiProperty } from '@nestjs/swagger';

export class GpsEventDto {
  @ApiProperty({ example: '1HGCM82633A123456' })
  vin: string;

  @ApiProperty({ example: '2025-01-15T14:30:00.000Z' })
  eventTimestamp: string;

  @ApiProperty({ example: 14.634915 })
  latitude: number;

  @ApiProperty({ example: -90.506882 })
  longitude: number;
}
