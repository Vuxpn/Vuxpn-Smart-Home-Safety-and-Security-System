import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class AddMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
