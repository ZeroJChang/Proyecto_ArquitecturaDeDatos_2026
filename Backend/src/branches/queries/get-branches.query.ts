import { GetBranchesRequestDto } from '../dtos/get-branches-request.dto';

export class GetBranchesQuery {
  constructor(public readonly params: GetBranchesRequestDto) {}
}
