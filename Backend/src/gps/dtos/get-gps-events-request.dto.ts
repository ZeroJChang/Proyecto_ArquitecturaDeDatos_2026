import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsInt,
  IsISO8601,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator';

import { DEFAULT_PAGINATION } from '../../common/constants/pagination.constant';

export class GetGpsEventsRequestDto {
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

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGINATION.MIN_PAGE)
  page: number = DEFAULT_PAGINATION.DEFAULT_PAGE;

  @ApiProperty({ example: 100, required: false, default: 100, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGINATION.MIN_LIMIT)
  @Max(DEFAULT_PAGINATION.MAX_LIMIT)
  limit: number = DEFAULT_PAGINATION.MAX_LIMIT;
}
