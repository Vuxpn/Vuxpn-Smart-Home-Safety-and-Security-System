import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { GasWarningService } from './gasWarning.service';
import { MQTT_TOPICS } from '../mqtt/mqtt.constants';
import { WarningControlDto } from './dto/warningControl.dto';
import { DeviceGuard } from '../devices/device.guard';
import { DevicesService } from '../devices/devices.service';
import { WarningValueDto } from './dto/warningValue.dto';

@Controller('device')
export class GasWarningController {
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly gasWarningService: GasWarningService,
    private readonly deviceService: DevicesService,
  ) {}

  @Post(':deviceId/onwarning')
  async turnOnWarning(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.warningControl({
        deviceId,
        state: 'On',
      });
      console.log('Turn on warning result:', result);
      return result;
    } catch (error) {
      console.error('Error turning on warning:', error);
      throw error;
    }
  }

  @Post(':deviceId/offwarning')
  async turnOffWarning(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.warningControl({
        deviceId,
        state: 'Off',
      });
      console.log('Turn off warning result:', result);
      return result;
    } catch (error) {
      console.error('Error turning off warning:', error);
      throw error;
    }
  }

  @Post(':deviceId/warningLevel')
  controlWarningLevel(
    @Body() warningValueDto: WarningValueDto,
    @Param('deviceId') deviceId: string,
  ) {
    return this.gasWarningService.changeWarningLevel({
      ...warningValueDto,
      deviceId,
    });
  }

  @MessagePattern(MQTT_TOPICS.TEMPERATURE + '/+')
  async getNotificationsTemperature(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = this.extractDeviceId(topic, MQTT_TOPICS.TEMPERATURE);
    return this.gasWarningService.getTemperature(deviceId, data);
  }

  @MessagePattern(MQTT_TOPICS.HUMIDITY + '/+')
  async getNotificationsHumidity(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = this.extractDeviceId(topic, MQTT_TOPICS.HUMIDITY);
    return this.gasWarningService.getHumidity(deviceId, data);
  }

  @MessagePattern(MQTT_TOPICS.GASLEVEL + '/+')
  async getNotificationsGas(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = this.extractDeviceId(topic, MQTT_TOPICS.GASLEVEL);
    return this.gasWarningService.getGasLevel(deviceId, data);
  }

  @MessagePattern(MQTT_TOPICS.GASWARNING_CONTROL + '/+')
  getNotificationsWarning(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const deviceId = this.extractDeviceId(
      topic,
      MQTT_TOPICS.GASWARNING_CONTROL,
    );
    console.log(`Warning notification for device ${deviceId}:`, data);
  }

  private extractDeviceId(topic: string, baseTopic: string): string {
    const deviceId = topic.replace(`${baseTopic}/`, '');
    if (!deviceId) {
      throw new Error(`Could not extract deviceId from topic: ${topic}`);
    }
    return deviceId;
  }
}
