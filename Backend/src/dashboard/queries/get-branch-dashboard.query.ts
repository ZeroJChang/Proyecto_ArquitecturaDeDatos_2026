import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetBranchDashboardQuery {
  constructor(public readonly user: JwtPayload) {}
}
