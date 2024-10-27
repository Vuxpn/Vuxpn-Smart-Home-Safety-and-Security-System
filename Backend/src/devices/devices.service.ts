import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/createDevice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../schema/device.schema';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';

@Injectable()
export class DevicesService {
  private readonly verificationTimeouts: Map<string, NodeJS.Timeout> =
    new Map();
  private readonly verificationCallbacks: Map<
    string,
    (verified: boolean) => void
  > = new Map();
  readonly clientId = 'vuphan';
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    @InjectModel(Device.name, 'device') private deviceModel: Model<Device>,
  ) {}

  async getAllDevices() {
    const device = await this.deviceModel.find().exec();
    return device;
  }

  async getDeviceById(deviceId: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ deviceId });
    if (!device) {
      throw new HttpException('Không tìm thấy thiết bị', HttpStatus.NOT_FOUND);
    }
    return device;
  }

  async updateState(updateDto: UpdateDeviceDto) {
    const device = await this.deviceModel.findOneAndUpdate(
      { deviceId: updateDto.deviceID },
      { state: updateDto.state },
      { new: true },
    );
    if (!device) {
      throw new HttpException('Không tìm thấy thiết bị', HttpStatus.NOT_FOUND);
    }
    return device;
  }

  async createDevice(device: CreateDeviceDto) {
    const newDevice = { ...device };
    await this.deviceModel.create(newDevice);
    return newDevice;
  }

  async updateLastConnected(deviceId: string): Promise<void> {
    await this.deviceModel.updateOne(
      { deviceId },
      { lastConnected: new Date() },
    );
  }

  async verifyDevice(
    createDeviceDto: CreateDeviceDto,
  ): Promise<{ message: string }> {
    const { deviceId } = createDeviceDto;

    //Tạo 30s timeout để nhận response
    return new Promise((resolve, reject) => {
      // Đặt timeout cho xác thực
      const timeout = setTimeout(() => {
        this.cleanupVerification(deviceId);
        reject(new Error('Verification timeout'));
      }, 30000);
      // Lưu timeout reference để có thể clear sau này
      this.verificationTimeouts.set(deviceId, timeout);
      // Lưu callback function sẽ được gọi khi nhận được response từ ESP32
      this.verificationCallbacks.set(deviceId, async (verified: boolean) => {
        if (verified) {
          try {
            // Nếu verify thành công, tạo device trong DB
            await this.createDevice(createDeviceDto);
            resolve({ message: 'Device verified and created successfully' });
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Device verification failed'));
        }
      });
    });
  }

  publishVerifyDevice(deviceId: string) {
    const topic = `${MQTT_TOPICS.CREATEDEVICE}/${deviceId}`;
    const message = { deviceId, action: 'verify' };
    return this.client.emit(topic, message);
  }

  // Được gọi khi nhận được response từ ESP32
  handleVerificationResponse(deviceId: string, verified: boolean) {
    // Lấy callback function đã lưu trước đó
    const callback = this.verificationCallbacks.get(deviceId);
    if (callback) {
      callback(verified);
      this.cleanupVerification(deviceId);
    }
  }

  async connectDevice(deviceId: string) {
    this.client.emit(`${MQTT_TOPICS.CONNECTDEVICE}/${deviceId}`, {
      connect: 'true',
    });
  }
  private cleanupVerification(deviceId: string) {
    const timeout = this.verificationTimeouts.get(deviceId);
    if (timeout) clearTimeout(timeout);
    this.verificationTimeouts.delete(deviceId);
    this.verificationCallbacks.delete(deviceId);
  }
}
