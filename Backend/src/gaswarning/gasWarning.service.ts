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
import { WarningValueDto } from './dto/warningValue.dto';

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

  //Điều khiển cảnh báo
  async warningControl(data: WarningControlDto) {
    try {
      const topic = `${MQTT_TOPICS.WARNING_CONTROL}/${data.deviceId}`;
      const message = { ...data };
      console.log(topic, message);
      return this.client.emit(topic, message);
    } catch (error) {
      this.logger.error(
        `Failed to control warning: ${error.message}`,
        error.stack,
      );
    }
  }

  //Điều khiển mức độ cảnh báo
  changeWarningLevel(data: WarningValueDto) {
    const topic = `${MQTT_TOPICS.WARNING_CHANGE_VALUE}/${data.deviceId}`;
    const message = { ...data };
    return this.client.emit(topic, message);
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
