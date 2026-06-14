import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetVehiclesWithFaultsQuery {
  constructor(public readonly user: JwtPayload) {}
}
