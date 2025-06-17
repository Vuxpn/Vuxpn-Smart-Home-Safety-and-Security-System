import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UnlockDoorDto } from './dto/unlockDoor.dto';
import { SmartLockService } from './smartLock.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';

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

  @Get(':deviceID/status')
  async getLockStatus(@Param('deviceID') deviceId: string) {
    return this.smartLockService.getLockStatus(deviceId);
  }

  @Get(':deviceID/logs')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDoorLogs(
    @Param('deviceID') deviceId: string,
    @Query('limit') limit: number,
  ) {
    return this.smartLockService.getDoorLogs(deviceId, limit || 10);
  }

  // Xử lý thông tin trạng thái từ thiết bị
  @MessagePattern(MQTT_TOPICS.LOCK_STATUS)
  async handleLockStatus(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];
    return this.smartLockService.processLockStatus(deviceId, data);
  }

  // Xử lý thông tin log mở cửa từ thiết bị
  @MessagePattern(MQTT_TOPICS.DOOR_LOG)
  async handleDoorLog(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];
    return this.smartLockService.processDoorLog(deviceId, data);
  }

  // Xử lý phản hồi từ lệnh mở cửa
  @MessagePattern(MQTT_TOPICS.UNLOCK_DOOR_STATUS)
  async handleUnlockDoorStatus(
    @Payload() data: any,
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];
    return this.smartLockService.processUnlockDoorStatus(deviceId, data);
  }

  // Xử lý phản hồi từ lệnh khóa cửa
  @MessagePattern(MQTT_TOPICS.LOCK_DOOR_STATUS)
  async handleLockDoorStatus(
    @Payload() data: any,
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];
    return this.smartLockService.processLockDoorStatus(deviceId, data);
  }

  // Xử lý phản hồi từ lệnh đổi mật khẩu
  @MessagePattern(MQTT_TOPICS.CHANGE_PASS_STATUS)
  async handleChangePasswordStatus(
    @Payload() data: any,
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];
    return this.smartLockService.processChangePasswordStatus(deviceId, data);
  }
}
