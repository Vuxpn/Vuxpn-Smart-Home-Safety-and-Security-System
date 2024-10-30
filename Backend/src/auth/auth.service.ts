import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createUser = await this.userService.createUser({
        ...registrationData,
        password: hashedPassword,
      });
      createUser.password = undefined;
      return createUser;
    } catch (error) {
      if (error?.code === 23505) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(
    email: string,
    plainTextPassword: string,
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.userService.getUserByEmail(email);
      console.log(user);
      if (!user || !user.password) {
        throw new HttpException(
          'User not found or password is missing',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.verifyPassword(plainTextPassword, user.password);
      const payload = { email: user.email, sub: user._id };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async changePassword(email: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Verify old password
      await this.verifyPassword(changePasswordDto.oldPassword, user.password);

      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new HttpException(
          'New password must be different from old password',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );

      // Update password in database
      await this.userService.updateUserPassword(email, hashedNewPassword);

      return {
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to change password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    // Kiểm tra giá trị của hashedPassword
    console.log('plainTextPassword:', plainTextPassword);
    console.log('hashedPassword:', hashedPassword);
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
