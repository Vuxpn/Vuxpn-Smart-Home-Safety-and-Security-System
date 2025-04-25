import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateDeviceDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  homeId: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsEnum(['Light', 'Atmosphere Sensor', 'Security Camera', 'Other'])
  @IsNotEmpty()
  type: string;
}

export class UpdateDeviceDto {
  @ApiProperty({
    type: String,
  })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  state: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deviceID: string;
}
