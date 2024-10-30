import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
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
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { WarningControlDto } from 'src/gaswarning/dto/warningControl.dto';
import { DeviceGuard } from 'src/devices/device.guard';
import { DevicesService } from 'src/devices/devices.service';
import { warn } from 'console';
import { WarningValueDto } from './dto/warningValue.dto';

@Controller('home')
export class GasWarningController {
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly gasWarningService: GasWarningService,
    private readonly deviceService: DevicesService,
  ) {}

  //Điều khiển cảnh báo
  @Post(':deviceId/warning')
  @UseGuards(DeviceGuard)
  controlWarning(
    @Body() warningControlDto: WarningControlDto,
    @Req() request, //lấy device từ guard
  ) {
    this.gasWarningService.warningControl(warningControlDto);
  }

  //Điều khiển mức độ cảnh báo
  @Post(':deviceId/warningLevel')
  @UseGuards(DeviceGuard)
  controlWarningLevel(
    @Body() warningValueDto: WarningValueDto,
    @Req() request, //lấy device từ guard
  ) {
    this.gasWarningService.changeWarningLevel(warningValueDto);
  }

  //Nhận dữ liệu nhiệt độ
  @MessagePattern(MQTT_TOPICS.TEMPERATURE)
  getNotificationsTemperature(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    return this.gasWarningService.getTemperature(data);
  }

  //Nhận dữ liệu độ ẩm
  @MessagePattern(MQTT_TOPICS.HUMIDITY)
  getNotificationsHumidity(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    return this.gasWarningService.getHumidity(data);
  }

  //Nhận dữ liệu gas
  @MessagePattern(MQTT_TOPICS.GASLEVEL)
  async getNotificationsGas(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    return this.gasWarningService.getGasLevel(data);
  }

  @MessagePattern(MQTT_TOPICS.WARNING_CONTROL)
  getNotificationsWarning(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    console.log('Received data:', data);
  }
}
