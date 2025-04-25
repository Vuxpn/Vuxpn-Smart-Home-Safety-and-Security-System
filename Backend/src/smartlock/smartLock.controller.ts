import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UnlockDoorDto } from './dto/unlockDoor.dto';
import { SmartLockService } from './smartLock.service';
import { ChangePasswordDto } from 'src/auth/dto/changePassword.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
@ApiTags('SmartLock')
@Controller('smartlock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SmartLockController {
  constructor(private readonly smartLockService: SmartLockService) {}

  @Post(':deviceID/unlock')
  async unlockDoor(
    @Param('deviceID') deviceId: string,
    @Body() unlockDoorDto: UnlockDoorDto,
  ) {
    return this.smartLockService.unlockDoor({
      deviceId: deviceId,
      state: 'On',
      password: unlockDoorDto.password,
    });
  }

  @Post(':deviceID/lock')
  async lockDoor(@Param('deviceID') deviceId: string) {
    return this.smartLockService.lockDoor({
      deviceID: deviceId,
      state: 'Off',
    });
  }

  @Post(':deviceID/changepassword')
  async changePassword(
    @Param('deviceID') deviceId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.smartLockService.changePassword({
      deviceID: deviceId,
      oldPassword: changePasswordDto.oldPassword,
      newPassword: changePasswordDto.newPassword,
    });
  }
}
