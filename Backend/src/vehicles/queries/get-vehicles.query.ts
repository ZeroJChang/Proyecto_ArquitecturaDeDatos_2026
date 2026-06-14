import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GetVehiclesRequestDto } from '../dtos/get-vehicles-request.dto';

export class GetVehiclesQuery {
  constructor(
    public readonly params: GetVehiclesRequestDto,
    public readonly user: JwtPayload,
  ) {}
}
