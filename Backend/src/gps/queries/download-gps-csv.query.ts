import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DownloadCsvRequestDto } from '../dtos/download-csv-request.dto';

export class DownloadGpsCsvQuery {
  constructor(
    public readonly params: DownloadCsvRequestDto,
    public readonly user: JwtPayload,
  ) {}
}
