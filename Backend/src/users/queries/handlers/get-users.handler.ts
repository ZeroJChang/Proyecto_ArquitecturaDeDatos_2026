import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { GetUserResponseDto } from '../../dtos/get-user-response.dto';
import { User } from '../../entities/user.entity';
import { UserMapper } from '../../mappers/user.mapper';
import { GetUsersQuery } from '../get-users.query';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async execute(_query: GetUsersQuery): Promise<GetUserResponseDto[]> {
    const users = await this._userRepository.find();
    return users.map(UserMapper.toDto);
  }
}
