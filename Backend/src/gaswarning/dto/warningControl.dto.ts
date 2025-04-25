import { ApiProperty } from '@nestjs/swagger';

export class WarningControlDto {
  @ApiProperty({
    type: String,
  })
  deviceId: string;

  @ApiProperty({
    type: String,
  })
  state: string; // true: on, false: off
}
