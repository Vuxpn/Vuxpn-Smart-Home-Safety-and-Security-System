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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Gaswarning')
@Controller('gaswarning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
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

  @Post(':deviceId/onfanwarning')
  async turnOnFanWarning(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.FanwarningControl({
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

  @Post(':deviceId/offfanwarning')
  async turnOffFanWarning(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.FanwarningControl({
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

  @Post(':deviceId/ledBedOn')
  async turnOnBedLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledBedOn',
      });
      console.log('Turn on bed led', result);
      return result;
    } catch (error) {
      console.error('Error turn on bed led:', error);
      throw error;
    }
  }

  @Post(':deviceId/ledBedOff')
  async turnOffBedLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledBedOff',
      });
      console.log('Turn off bed led', result);
      return result;
    } catch (error) {
      console.error('Error turn off bed led:', error);
      throw error;
    }
  }

  @Post(':deviceId/ledLivOn')
  async turnOnLivLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledLivOn',
      });
      console.log('Turn on liv led', result);
      return result;
    } catch (error) {
      console.error('Error turn on liv led:', error);
      throw error;
    }
  }

  @Post(':deviceId/ledLivOff')
  async turnOffLivLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledLivOff',
      });
      console.log('Turn off liv led', result);
      return result;
    } catch (error) {
      console.error('Error turn off liv led:', error);
      throw error;
    }
  }

  @Post(':deviceId/ledKitOn')
  async turnOnKitLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledKitOn',
      });
      console.log('Turn on kit led', result);
      return result;
    } catch (error) {
      console.error('Error turn on kit led:', error);
      throw error;
    }
  }

  @Post(':deviceId/ledKitOff')
  async turnOffKitLed(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.gasWarningService.ledControl({
        deviceId,
        state: 'ledKitOff',
      });
      console.log('Turn off kit led', result);
      return result;
    } catch (error) {
      console.error('Error turn off kit led:', error);
      throw error;
    }
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
