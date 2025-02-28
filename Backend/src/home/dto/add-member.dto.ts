import { IsNotEmpty, IsEmail } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
