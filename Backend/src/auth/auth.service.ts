import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Tokens } from './interfaces/token.interface';
import { jwtConstants } from './constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createUser = await this.usersService.createUser({
        ...registrationData,
        password: hashedPassword,
      });

      const tokens = await this.generateTokens({
        sub: createUser._id.toString(),
        email: createUser.email,
      });

      return {
        user: {
          id: createUser._id,
          email: createUser.email,
          name: createUser.name,
        },
        ...tokens,
      };
    } catch (error) {
      if (error?.code === 11000) {
        throw new HttpException('Email đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.message || 'Đăng ký thất bại',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.verifyPassword(password, user.password);

      const tokens = await this.generateTokens({
        sub: user._id.toString(),
        email: user.email,
      });

      return {
        ...tokens,
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

  async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: jwtConstants.accessTokenExpiration,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: jwtConstants.refreshTokenExpiration,
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(userId: string, refreshToken: string) {
    try {
      // Thêm cả access token và refresh token vào danh sách đen
      await this.cacheManager.set(
        `bl_${userId}`,
        'true',
        parseInt(jwtConstants.accessTokenExpiration) * 1000,
      );

      await this.cacheManager.set(
        `bl_${refreshToken}`,
        'true',
        parseInt(jwtConstants.refreshTokenExpiration) * 1000,
      );

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throw new HttpException(
        'Lỗi khi đăng xuất',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Tạo token mới
      const tokens = await this.generateTokens({
        sub: userId,
        email: user.email,
      });

      // Thêm token cũ vào danh sách đen
      await this.cacheManager.set(
        `bl_${refreshToken}`,
        'true',
        parseInt(jwtConstants.refreshTokenExpiration) * 1000,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.usersService.getUserById(userId);
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
          'Mật khẩu mới phải khác mật khẩu cũ',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );

      // Update password in database
      await this.usersService.updateUserPassword(user.email, hashedNewPassword);

      // Đánh dấu tất cả token hiện tại là không hợp lệ
      await this.cacheManager.set(
        `bl_${userId}`,
        'true',
        parseInt(jwtConstants.accessTokenExpiration) * 1000,
      );

      return {
        message: 'Thay đổi mật khẩu thành công',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Không thể thay đổi mật khẩu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Thông tin đăng nhập không chính xác',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.usersService.getUserById(userId);
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
