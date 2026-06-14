import { GetBranchResponseDto } from '../dtos/get-branch-response.dto';
import { Branch } from '../entities/branch.entity';

export class BranchMapper {
  static toDto(entity: Branch): GetBranchResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      country: entity.country,
      region: entity.region,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }
}
