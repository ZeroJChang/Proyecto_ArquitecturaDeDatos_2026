import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FilterParamsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
