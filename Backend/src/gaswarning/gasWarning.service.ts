import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { WarningControlDto } from './dto/warningControl.dto';
import { DevicesService } from 'src/devices/devices.service';

@Injectable()
export class GasWarningService {
  private readonly logger = new Logger(GasWarningService.name);

  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly deviceService: DevicesService,
  ) {}
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      this.logger.error('Connection failed:', error);
      return false;
    }
  }
  //Kết nối đến MQTT broker
  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to MQTT broker');
    } catch (error) {
      this.logger.error('Failed to connect to MQTT broker:', error);
      throw error;
    }
  }

  //Gửi yêu cầu xác minh device
  async verifyDevice(deviceId: string) {
    await this.client.emit(MQTT_TOPICS.DEVICE, deviceId);
    const device = await this.deviceService.getDeviceById(deviceId);
    if (device) {
      this.client.emit(MQTT_TOPICS.DEVICE, deviceId);
    }
  }

  //Điều khiển cảnh báo
  async warningControl(data: WarningControlDto) {
    //await this.deviceService.getDeviceById(data.deviceIddeviceId);
    await this.client.emit(MQTT_TOPICS.WARNING_CONTROL, data);
  }

  //Nhận dữ liệu nhiệt độ
  async getTemperature(data: number[]) {
    console.log('Received data:', data);
  }

  //Nhận dữ liệu độ ẩm
  async getHumidity(data: number[]) {
    console.log('Received data:', data);
  }

  //Nhận dữ liệu gas
  async getGasLevel(data: number[]) {
    console.log('Received data:', data);
  }
}
