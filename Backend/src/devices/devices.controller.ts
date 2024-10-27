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

  @Patch('state')
  @UseGuards(DeviceGuard)
  async updateStatus(@Body() updateDto: UpdateDeviceDto) {
    return this.devicesService.updateState(updateDto);
  }

  @Post(':deviceId/connect')
  async connectDevice(@Param('deviceId') deviceId: string) {
    try {
      await this.devicesService.connectDevice(deviceId);
      return { message: 'Device connected successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to connect device');
    }
  }
}
