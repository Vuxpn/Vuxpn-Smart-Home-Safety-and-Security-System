import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { GasWarningService } from 'src/gaswarning/gasWarning.service';
import { MQTT_TOPICS } from './mqtt.constants';
import { WarningControlDto } from 'src/gaswarning/dto/warningControl.dto';

@Controller('home')
export class MqttController {
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly gasWarningService: GasWarningService,
  ) {}

  //kết nối device
  @Post('gas')
  async getDevice(@Body() deviceId: string) {
    this.gasWarningService.verifyDevice(deviceId);
  }

  //Nhận phản hồi từ device
  @EventPattern(MQTT_TOPICS.DEVICE)
  getDeviceNotifications(@Payload() data: string, @Ctx() context: MqttContext) {
    console.log('Received data:', data);
  }

  //Điều khiển cảnh báo
  @Post('gas/warning')
  async publishMessage(@Body() data: WarningControlDto) {
    this.gasWarningService.warningControl(data);
  }

  //Nhận dữ liệu nhiệt độ
  @MessagePattern(MQTT_TOPICS.TEMPERATURE)
  getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
    this.gasWarningService.getTemperature(data);
  }

  //Nhận dữ liệu độ ẩm
  @MessagePattern(MQTT_TOPICS.HUMIDITY)
  getNotificationsLed(@Payload() data: number[], @Ctx() context: MqttContext) {
    this.gasWarningService.getHumidity(data);
  }

  //Nhận dữ liệu gas
  @MessagePattern(MQTT_TOPICS.GASLEVEL)
  getNotificationsGas(@Payload() data: number[], @Ctx() context: MqttContext) {
    this.gasWarningService.getGasLevel(data);
  }
}
