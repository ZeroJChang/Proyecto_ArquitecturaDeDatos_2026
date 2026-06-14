import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GetGpsEventsRequestDto } from '../dtos/get-gps-events-request.dto';

export class GetGpsEventsQuery {
  constructor(
    public readonly params: GetGpsEventsRequestDto,
    public readonly user: JwtPayload,
  ) {}
}
