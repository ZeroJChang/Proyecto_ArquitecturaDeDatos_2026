import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length, Matches } from 'class-validator';

export class ClaimVehicleRequestDto {
  @ApiProperty({
    example: 'WVWZZZ3CZWE123456',
    description:
      'Vehicle Identification Number (17 uppercase alphanumeric characters)',
  })
  @IsString()
  @Length(17, 17)
  @Matches(/^[A-Z0-9]{17}$/, {
    message: 'VIN must be exactly 17 uppercase alphanumeric characters',
  })
  vin: string;
}
