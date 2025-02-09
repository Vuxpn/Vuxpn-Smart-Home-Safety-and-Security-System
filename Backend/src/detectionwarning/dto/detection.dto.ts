// src/detection/dto/detection.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export enum SystemMode {
  NORMAL = 'normal',
  SAFE = 'safe',
}

export class ChangeModeDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsEnum(SystemMode)
  mode: SystemMode;
}

export class ChangeTimeDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsInt()
  @IsNotEmpty()
  timeout: number;
}

export class ChangeWarningDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
