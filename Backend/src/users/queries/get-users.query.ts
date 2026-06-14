import { GetUsersRequestDto } from '../dtos/get-users-request.dto';

export class GetUsersQuery {
  constructor(public readonly params: GetUsersRequestDto) {}
}
