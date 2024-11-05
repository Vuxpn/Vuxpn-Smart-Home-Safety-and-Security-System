import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateHomeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  devices?: string;
}
