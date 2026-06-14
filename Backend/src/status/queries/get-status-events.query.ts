import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GetStatusEventsAdminRequestDto } from '../dtos/get-status-events-admin-request.dto';

export class GetStatusEventsQuery {
  constructor(
    public readonly params: GetStatusEventsAdminRequestDto,
    public readonly user: JwtPayload,
  ) {}
}
