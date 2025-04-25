import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LockDoorDto {
  @ApiProperty({ description: 'Device ID', type: String })
  @IsString()
  @IsNotEmpty()
  deviceID: string;
  @ApiProperty({ description: 'State', type: String })
  @IsString()
  @IsNotEmpty()
  state: string;
}
