import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetAdminDashboardQuery {
  constructor(public readonly user: JwtPayload) {}
}
