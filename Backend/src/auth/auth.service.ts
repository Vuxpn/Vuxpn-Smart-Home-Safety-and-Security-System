import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { StringExpressionOperator } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      if (error?.code === 11000) {
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

  async login(email: string, password: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.verifyPassword(password, user.password);
      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d' },
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(access_token: string, refresh_token: string) {
    try {
      const [decodedAccess, decodedRefresh] = await Promise.all([
        this.jwtService.verifyAsync(access_token),
        this.jwtService.verifyAsync(refresh_token),
      ]);

      const now = Math.floor(Date.now() / 1000);
      await Promise.all([
        this.cacheManager.set(
          `bl_${access_token}`,
          'true',
          (decodedAccess.exp - now) * 1000,
        ),
        this.cacheManager.set(
          `bl_${refresh_token}`,
          'true',
          (decodedRefresh.exp - now) * 1000,
        ),
      ]);

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new HttpException(
        'Error during logout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyToken(token: string) {
    {
      try {
        const isBlacklisted = await this.cacheManager.get(`bl_${token}`);
        if (isBlacklisted) {
          throw new UnauthorizedException('Token has been revoked');
        }
        const payload = await this.jwtService.verifyAsync(token);
        return payload;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.verifyToken(refreshToken);
      // Kiểm tra xem token có phải là token refresh không
      if (payload.type !== 'refresh') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      const user = await this.userService.getUserByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const newPayload = {
        email: payload.email,
        sub: payload.sub,
        type: 'access',
      };
      const newAccessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });
      return { access_token: newAccessToken };
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
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

  async getProfile(userId: string) {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return {
        id: user._id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      throw error;
    }
  }
}
