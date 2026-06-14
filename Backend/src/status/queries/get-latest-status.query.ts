import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetLatestStatusQuery {
  constructor(
    public readonly vin: string,
    public readonly user: JwtPayload,
  ) {}
}
