import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  homeId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsEnum(['Light', 'Atmosphere Sensor', 'Security Camera', 'Other'])
  @IsNotEmpty()
  type: string;
}

export class UpdateDeviceDto {
  @IsEnum(['ACTIVE', 'INACTIVE'])
  state: string;

  @IsString()
  @IsNotEmpty()
  deviceID: string;
}
