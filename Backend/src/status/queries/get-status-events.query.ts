import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GetStatusEventsRequestDto } from '../dtos/get-status-events-request.dto';

export class GetStatusEventsQuery {
  constructor(
    public readonly params: GetStatusEventsRequestDto,
    public readonly user: JwtPayload,
  ) {}
}
