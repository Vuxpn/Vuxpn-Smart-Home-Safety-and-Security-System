import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UnlockDoorDto {
  @ApiProperty({ description: 'Device ID', type: String })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'State', type: String })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Password', type: String })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  password: string;
}
