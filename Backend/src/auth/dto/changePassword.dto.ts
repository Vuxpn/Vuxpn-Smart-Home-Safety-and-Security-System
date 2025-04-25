import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  newPassword: string;
}
