import { ApiProperty } from '@nestjs/swagger';

export class WarningFanDto {
  @ApiProperty({
    type: String,
  })
  deviceId: string;

  @ApiProperty({
    type: String,
  })
  state: string;
}
