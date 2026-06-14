import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GetVehicleByVinQuery {
  constructor(
    public readonly vin: string,
    public readonly user: JwtPayload,
  ) {}
}
