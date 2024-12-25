import {
  Body,
  Headers,
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
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Public()
  @Post('login')
  async login(@Body() loginData: LogInDto) {
    return this.authService.login(loginData.email, loginData.password);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Headers('authorization') auth: string,
    @Body() body: { refresh_token: string },
  ) {
    const access_token = auth.split(' ')[1];
    return this.authService.logout(access_token, body.refresh_token);
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

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
