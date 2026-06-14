import { ApiProperty } from '@nestjs/swagger';

export class ClaimVehicleResponseDto {
  @ApiProperty({ example: 'Vehicle claimed successfully' })
  message: string;

  @ApiProperty({ example: 'WVWZZZ3CZWE123456' })
  vin: string;
}
