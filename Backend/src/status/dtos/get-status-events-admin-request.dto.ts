import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { DEFAULT_PAGINATION } from '../../common/constants/pagination.constant';

import { PaginationParamsDto } from '../../common/dtos/pagination.params.dto';

export class GetStatusEventsAdminRequestDto extends PaginationParamsDto {
  @ApiProperty({
    required: false,
    description: 'Filter by VIN',
    example: '1HGCM82633A123456',
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({
    required: false,
    description: 'Start date (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'End date (ISO 8601)',
    example: '2025-01-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ example: 50, required: false, default: 50, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGINATION.MIN_LIMIT)
  @Max(50)
  override limit: number = 50;
}
