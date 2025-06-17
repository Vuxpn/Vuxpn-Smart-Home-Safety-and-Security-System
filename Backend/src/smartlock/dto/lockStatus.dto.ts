import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LockStatusDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Lock status' })
  @IsBoolean()
  @IsNotEmpty()
  locked: boolean;

  @ApiProperty({ description: 'Failed attempts' })
  @IsOptional()
  failedAttempts?: number;
}
