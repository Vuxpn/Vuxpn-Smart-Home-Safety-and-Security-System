import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDeviceDto {
  @IsEnum(['ACTIVE', 'INACTIVE'])
  state: string;

  @IsString()
  @IsNotEmpty()
  deviceID: string;
}
