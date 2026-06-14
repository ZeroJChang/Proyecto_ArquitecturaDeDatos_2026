import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetOwnerVehiclesQuery {
  constructor(public readonly user: JwtPayload) {}
}
