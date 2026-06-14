import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { GetBranchResponseDto } from '../../dtos/get-branch-response.dto';
import { Branch } from '../../entities/branch.entity';
import { BranchMapper } from '../../mappers/branch.mapper';
import { GetBranchesQuery } from '../get-branches.query';

@QueryHandler(GetBranchesQuery)
export class GetBranchesHandler implements IQueryHandler<GetBranchesQuery> {
  constructor(
    @InjectRepository(Branch)
    private readonly _branchRepository: Repository<Branch>,
  ) {}

  async execute(_query: GetBranchesQuery): Promise<GetBranchResponseDto[]> {
    const branches = await this._branchRepository.find({
      where: { isActive: true },
    });

    return branches.map(BranchMapper.toDto);
  }
}
