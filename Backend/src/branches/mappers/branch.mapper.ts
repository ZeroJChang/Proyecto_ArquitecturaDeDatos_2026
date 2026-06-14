import { GetBranchAdminResponseDto } from '../dtos/get-branch-admin-response.dto';
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

  static toAdminDto(
    raw: Branch & { vehicleCount: number; ownerCount: number },
  ): GetBranchAdminResponseDto {
    return {
      id: raw.id,
      name: raw.name,
      country: raw.country,
      region: raw.region,
      isActive: raw.isActive,
      vehicleCount: Number(raw.vehicleCount) || 0,
      ownerCount: Number(raw.ownerCount) || 0,
      createdAt: raw.createdAt,
    };
  }
}
