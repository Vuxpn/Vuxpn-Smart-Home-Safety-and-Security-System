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
  Delete,
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
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// Định nghĩa interface cho payload
interface DeviceData {
  macAddress: string;
  value: number[];
  timestamp: number;
}
@ApiTags('Devices')
@Controller('device')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get(':homeId')
  getAllDevices(@Param('homeId') homeId: string) {
    return this.devicesService.getAllDevices(homeId);
  }

  @Get('/detail/:id')
  getDeviceById(@Param('id') id: string) {
    console.log('Device ID:', id); // Debugging line
    return this.devicesService.getDeviceById(id);
  }

  @Public()
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
  @Public()
  @Delete('delete/:deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    return this.devicesService.deleteDevice(deviceId);
  }

  @Get('home/:homeId')
  async getDevicesByHomeId(@Param('homeId') homeId: string) {
    try {
      const devices = await this.devicesService.getDevicesByHomeId(homeId);
      return {
        success: true,
        data: devices,
        message: 'Lấy danh sách thiết bị thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy danh sách thiết bị',
        error: error.message,
      });
    }
  }
}
