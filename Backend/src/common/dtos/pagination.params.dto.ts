import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { DEFAULT_PAGINATION } from '../constants';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGINATION.MIN_PAGE)
  page: number = DEFAULT_PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DEFAULT_PAGINATION.MIN_LIMIT)
  @Max(DEFAULT_PAGINATION.MAX_LIMIT)
  limit: number = DEFAULT_PAGINATION.DEFAULT_LIMIT;
}
