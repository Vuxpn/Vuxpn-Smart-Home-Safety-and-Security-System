import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DoorLogDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty({ description: 'Status' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
