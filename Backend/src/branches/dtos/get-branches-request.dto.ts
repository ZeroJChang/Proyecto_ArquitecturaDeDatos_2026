import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { PaginationParamsDto } from '../../common/dtos/pagination.params.dto';

export class GetBranchesRequestDto extends PaginationParamsDto {
  @ApiProperty({
    required: false,
    description: 'Search by branch name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiProperty({ required: false, description: 'Column to sort by' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sortBy?: string;

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
