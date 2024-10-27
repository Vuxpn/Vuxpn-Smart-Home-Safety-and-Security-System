import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  InternalServerErrorException,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/createDevice.dto';
import { DeviceGuard } from './device.guard';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { privateDecrypt } from 'crypto';

// Định nghĩa interface cho payload
interface DeviceData {
  macAddress: string;
  value: number[];
  timestamp: number;
}

@Controller('device')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Get(':deviceId')
  @UseGuards(DeviceGuard)
  getDeviceById(@Param('deviceId') deviceId: string) {
    return this.devicesService.getDeviceById(deviceId);
  }

  @Post('create')
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    //Khởi tạo xác thực device
    const verify = this.devicesService.verifyDevice(createDeviceDto);

    // Gửi yêu cầu xác minh thiết bị trước khi tạo
    this.devicesService.publishVerifyDevice(createDeviceDto.deviceId);
    // Đợi kết quả xác thực
    return verify;
  }

  @MessagePattern(MQTT_TOPICS.RESPONSEDEVICE)
  async handleDeviceResponse(
    @Payload() data: { verified: boolean; deviceId: string },
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];

    this.devicesService.handleVerificationResponse(deviceId, data.verified);
  }

  @Post(':deviceId/connect')
  async connectDevice(@Param('deviceId') deviceId: string) {
    //Khởi tạo quá trình kết nối
    const connect = this.devicesService.connectDevice(deviceId);
    //Gửi yêu cầu kết nối
    this.devicesService.publishConnectDevice(deviceId);
    return connect;
  }

  @MessagePattern(MQTT_TOPICS.RESPONSECONNECTDEVICE)
  async handleDeviceConnect(
    @Payload() data: { connected: boolean; deviceId: string },
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];

    this.devicesService.handleConnectResponse(deviceId, data.connected);
  }

  @Post(':deviceId/disconnect')
  @UseGuards(DeviceGuard)
  async disconnectDevice(@Param('deviceId') deviceId: string) {
    //Khởi tạo quá trình ngắt kết nối
    const disconnect = this.devicesService.disconnectDevice(deviceId);
    //Gửi yêu cầu ngắt kết nối
    this.devicesService.publishDisconnectDevice(deviceId);
    return disconnect;
  }

  @MessagePattern(MQTT_TOPICS.RESPONSEDISCONNECTDEVICE)
  async handleDeviceDisconnect(
    @Payload() data: { disconnected: boolean; deviceId: string },
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();
    const deviceId = topic.split('/')[2];

    this.devicesService.handleDisconnectResponse(deviceId, data.disconnected);
  }
}
