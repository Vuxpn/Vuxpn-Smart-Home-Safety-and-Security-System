import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  devices?: string;
}
