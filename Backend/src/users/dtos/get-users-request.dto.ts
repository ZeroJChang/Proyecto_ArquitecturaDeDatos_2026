import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { PaginationParamsDto } from '../../common/dtos/pagination.params.dto';

export class GetUsersRequestDto extends PaginationParamsDto {
  @ApiProperty({
    required: false,
    description: 'Search by name or email (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['ADMIN', 'BRANCH_USER', 'OWNER'],
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsIn(['ADMIN', 'BRANCH_USER', 'OWNER'])
  role?: string;

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
