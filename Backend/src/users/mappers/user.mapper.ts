import { GetUserAdminResponseDto } from '../dtos/get-user-admin-response.dto';
import { GetUserResponseDto } from '../dtos/get-user-response.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toDto(entity: User): GetUserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      branchId: entity.branchId,
      createdAt: entity.createdAt,
    };
  }

  static toAdminDto(entity: User): GetUserAdminResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      branchName: entity.branch ? entity.branch.name : null,
      createdAt: entity.createdAt,
    };
  }
}
