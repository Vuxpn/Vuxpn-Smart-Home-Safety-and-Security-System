import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import LogInDto from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Post('login')
  async login(@Body() loginData: LogInDto) {
    return await this.authService.signIn(loginData.email, loginData.password);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  async getprofile(@Request() req) {
    return req.user;
  }

  @Patch('change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.email, changePasswordDto);
  }
}
