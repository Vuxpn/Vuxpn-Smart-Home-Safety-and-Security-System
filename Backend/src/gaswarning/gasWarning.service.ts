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
import { WarningFanDto } from './dto/warningFan.dto';
import { GasWarningGateway } from './gasWarning.gateway';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class GasWarningService {
  private readonly logger = new Logger(GasWarningService.name);

  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly deviceService: DevicesService,
    private readonly gasWarningGateway: GasWarningGateway,
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
      const topic = `${MQTT_TOPICS.GASWARNING_CONTROL}/${data.deviceId}`;
      const message = { deviceId: data.deviceId, state: data.state };
      console.log(`Emitting message to topic ${topic}:`, message);
      const result = await lastValueFrom(this.client.emit(topic, message));
      console.log('Emit result:', result);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to control warning: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  //Điều khiển mức độ cảnh báo
  changeWarningLevel(data: WarningValueDto) {
    const topic = `${MQTT_TOPICS.GASWARNING_CHANGE_VALUE}/${data.deviceId}`;
    const message = { ...data };
    return this.client.emit(topic, message);
  }

  changeWarningFan(data: WarningFanDto) {
    const topic = `${MQTT_TOPICS.GASWARNING_CONTROL_FAN}/${data.deviceId}`;
    const message = { ...data };
    return this.client.emit(topic, message);
  }

  async getTemperature(deviceId: string, payload: any) {
    this.logger.log(
      `Received temperature data for device ${deviceId}:`,
      payload,
    );

    let value: number;

    // Xử lý khi payload là object với format { temperature: 21.4 }
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'temperature' in payload
    ) {
      value = Number(payload.temperature);
    }
    // Xử lý khi payload là số trực tiếp
    else if (typeof payload === 'number' || typeof payload === 'string') {
      value = Number(payload);
    }

    // Kiểm tra giá trị hợp lệ trước khi gửi
    if (!isNaN(value)) {
      this.gasWarningGateway.broadcastSensorData(deviceId, {
        type: 'temperature',
        value: value,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getHumidity(deviceId: string, payload: any) {
    this.logger.log(`Received humidity data for device ${deviceId}:`, payload);

    let value: number;

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'humidity' in payload
    ) {
      value = Number(payload.humidity);
    } else if (typeof payload === 'number' || typeof payload === 'string') {
      value = Number(payload);
    }

    if (!isNaN(value)) {
      this.gasWarningGateway.broadcastSensorData(deviceId, {
        type: 'humidity',
        value: value,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getGasLevel(deviceId: string, payload: any) {
    this.logger.log(`Received gas level data for device ${deviceId}:`, payload);

    let value: number;

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'gaslevel' in payload
    ) {
      value = Number(payload.gaslevel);
    } else if (typeof payload === 'number' || typeof payload === 'string') {
      value = Number(payload);
    }

    if (!isNaN(value)) {
      this.gasWarningGateway.broadcastSensorData(deviceId, {
        type: 'gasLevel',
        value: value,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
