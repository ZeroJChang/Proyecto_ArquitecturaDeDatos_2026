import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { GetUserAdminResponseDto } from '../../dtos/get-user-admin-response.dto';
import { User } from '../../entities/user.entity';
import { UserMapper } from '../../mappers/user.mapper';
import { GetUsersQuery } from '../get-users.query';

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  name: 'user.name',
  email: 'user.email',
  role: 'user.role',
  branchName: 'branch.name',
  createdAt: 'user.createdAt',
  id: 'user.id',
};

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async execute(
    query: GetUsersQuery,
  ): Promise<PaginationResponse<GetUserAdminResponseDto>> {
    const { page, limit, search, role, sortBy, sortOrder } = query.params;

    const qb = this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch');

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    const sortColumn = sortBy && ALLOWED_SORT_COLUMNS[sortBy];
    const order: 'ASC' | 'DESC' = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    if (sortColumn) {
      qb.orderBy(sortColumn, order);
    } else {
      qb.orderBy('user.id', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map(UserMapper.toAdminDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
