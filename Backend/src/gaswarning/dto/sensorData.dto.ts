import { ApiProperty } from '@nestjs/swagger';

export class SensorDataDto {
  @ApiProperty({
    type: Number,
  })
  value: number;

  @ApiProperty({
    type: Date,
  })
  timestamp: Date;

  @ApiProperty({
    type: String,
  })
  deviceId: string;
}
