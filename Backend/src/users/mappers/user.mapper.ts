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
}
