import { ApiProperty } from '@nestjs/swagger';

export class LogInDto {
  @ApiProperty({
    type: String,
  })
  email: string;

  @ApiProperty({
    type: String,
  })
  password: string;
}

export default LogInDto;
