import { ApiProperty } from '@nestjs/swagger';

import { IsAlphanumeric, IsISO8601, Length } from 'class-validator';

export class DownloadCsvRequestDto {
  @ApiProperty({
    example: '1HGCM82633A123456',
    description: 'VIN del vehículo (17 caracteres alfanuméricos)',
  })
  @Length(17, 17)
  @IsAlphanumeric()
  vin: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Fecha de inicio (ISO 8601)',
  })
  @IsISO8601()
  startDate: string;

  @ApiProperty({
    example: '2025-01-31T23:59:59.000Z',
    description: 'Fecha de fin (ISO 8601)',
  })
  @IsISO8601()
  endDate: string;
}
