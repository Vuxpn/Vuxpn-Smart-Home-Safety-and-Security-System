import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
  async verifyDevice(deviceId: string): Promise<void> {
    try {
      const data = { deviceId };
      this.client.emit(MQTT_TOPICS.CONNECTDEVICE, { data });
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to connect device');
    }
  }

  //Điều khiển cảnh báo
  async warningControl(data: WarningControlDto): Promise<void> {
    try {
      await this.client
        .emit(MQTT_TOPICS.WARNING_CONTROL, {
          deviceId: data.deviceId,
          state: data.state,
        })
        .toPromise();
    } catch (error) {
      this.logger.error(
        `Failed to control warning: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to send warning control command',
      );
    }
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
