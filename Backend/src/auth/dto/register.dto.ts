import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ type: String, required: true })
  email: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  password: string;
}

export default RegisterDto;
