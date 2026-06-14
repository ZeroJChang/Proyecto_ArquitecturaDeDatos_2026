import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PaginationResponse } from '../../../common/dtos/pagination-response.dto';
import { GetBranchAdminResponseDto } from '../../dtos/get-branch-admin-response.dto';
import { Branch } from '../../entities/branch.entity';
import { BranchMapper } from '../../mappers/branch.mapper';
import { GetBranchesQuery } from '../get-branches.query';

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  name: 'branch.name',
  country: 'branch.country',
  region: 'branch.region',
  isActive: 'branch.isActive',
  createdAt: 'branch.createdAt',
  vehicleCount: '"vehicleCount"',
  ownerCount: '"ownerCount"',
  id: 'branch.id',
};

@QueryHandler(GetBranchesQuery)
export class GetBranchesHandler implements IQueryHandler<GetBranchesQuery> {
  constructor(
    @InjectRepository(Branch)
    private readonly _branchRepository: Repository<Branch>,
  ) {}

  async execute(
    query: GetBranchesQuery,
  ): Promise<PaginationResponse<GetBranchAdminResponseDto>> {
    const { params } = query;
    const { page, limit, search, sortBy, sortOrder } = params;

    const qb = this._branchRepository
      .createQueryBuilder('branch')
      .addSelect(
        `(SELECT COUNT(*) FROM vehicles v WHERE v.branch_id = branch.id)`,
        'vehicleCount',
      )
      .addSelect(
        `(SELECT COUNT(DISTINCT vo.user_id) FROM vehicle_owners vo INNER JOIN vehicles v ON v.id = vo.vehicle_id WHERE v.branch_id = branch.id)`,
        'ownerCount',
      );

    if (search) {
      qb.where('branch.name ILIKE :search', { search: `%${search}%` });
    }

    const sortColumn = sortBy && ALLOWED_SORT_COLUMNS[sortBy];
    const order: 'ASC' | 'DESC' = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    if (sortColumn) {
      qb.orderBy(sortColumn, order);
    } else {
      qb.orderBy('branch.id', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [rawResults, total] = await Promise.all([
      qb.getRawAndEntities(),
      qb.getCount(),
    ]);

    const data = rawResults.entities.map((entity, index) => {
      const raw = rawResults.raw[index];
      return BranchMapper.toAdminDto({
        ...entity,
        vehicleCount: raw.vehicleCount,
        ownerCount: raw.ownerCount,
      });
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
