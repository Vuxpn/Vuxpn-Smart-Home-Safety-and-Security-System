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
import { connected } from 'process';

@Injectable()
export class DevicesService {
  //Map lưu timeout khi yêu cầu verified device
  private readonly verificationTimeouts: Map<string, NodeJS.Timeout> =
    new Map();

  //Map lưu callback xác thực từ device
  private readonly verificationCallbacks: Map<
    string,
    (verified: boolean) => void
  > = new Map();

  //Map lưu callback kết nối từ device
  private readonly connectionCallbacks: Map<
    string,
    (connected: boolean) => void
  > = new Map();

  //Map lưu callback ngắt kết nối từ device
  private readonly disconnectionCallbacks: Map<
    string,
    (disconnected: boolean) => void
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

  async createDevice(device: CreateDeviceDto) {
    const newDevice = { ...device };
    await this.deviceModel.create(newDevice);
    return newDevice;
  }

  async updateConnectState(deviceId: string): Promise<void> {
    await this.deviceModel.updateOne({ deviceId }, { state: 'ACTIVE' });
  }

  async updateDisconnectState(deviceId: string): Promise<void> {
    await this.deviceModel.updateOne({ deviceId }, { state: 'INACTIVE' });
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

  async connectDevice(deviceId: string): Promise<{ message: string }> {
    this.getDeviceById(deviceId);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connectionCallbacks.delete(deviceId);
        reject(new Error('Connection timeout'));
      }, 30000);
      this.verificationTimeouts.set(deviceId, timeout);
      this.connectionCallbacks.set(deviceId, async (connected: boolean) => {
        if (connected) {
          await this.updateConnectState(deviceId);
          resolve({ message: 'Device connected successfully' });
        } else {
          reject(new Error('Device connection failed'));
        }
        this.connectionCallbacks.delete(deviceId);
      });
    });
  }

  async disconnectDevice(deviceId: string): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.disconnectionCallbacks.delete(deviceId);
        reject(new Error('Connection timeout'));
      }, 30000);
      this.verificationTimeouts.set(deviceId, timeout);
      this.disconnectionCallbacks.set(
        deviceId,
        async (disconnected: boolean) => {
          if (disconnected) {
            await this.updateDisconnectState(deviceId);
            resolve({ message: 'Device disconnected successfully' });
          } else {
            reject(new Error('Device disconnection failed'));
          }
          this.disconnectionCallbacks.delete(deviceId);
        },
      );
    });
  }

  publishVerifyDevice(deviceId: string) {
    const topic = `${MQTT_TOPICS.CREATEDEVICE}/${deviceId}`;
    const message = { deviceId, action: 'verify' };
    return this.client.emit(topic, message);
  }

  publishConnectDevice(deviceId: string) {
    const topic = `${MQTT_TOPICS.CONNECTDEVICE}/${deviceId}`;
    const message = { deviceId, action: 'connect' };
    return this.client.emit(topic, message);
  }

  publishDisconnectDevice(deviceId: string) {
    const topic = `${MQTT_TOPICS.DISCONNECTDEVICE}/${deviceId}`;
    const message = { deviceId, action: 'disconnect' };
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

  handleConnectResponse(deviceId: string, connected: boolean) {
    // Lấy callback function đã lưu trước đó
    const callback = this.connectionCallbacks.get(deviceId);
    if (callback) {
      callback(connected);
      this.cleanupVerification(deviceId);
    }
  }

  handleDisconnectResponse(deviceId: string, disconnected: boolean) {
    // Lấy callback function đã lưu trước đó
    const callback = this.disconnectionCallbacks.get(deviceId);
    if (callback) {
      callback(disconnected);
      this.cleanupVerification(deviceId);
    }
  }

  private cleanupVerification(deviceId: string) {
    const timeout = this.verificationTimeouts.get(deviceId);
    if (timeout) clearTimeout(timeout);
    this.verificationTimeouts.delete(deviceId);
    this.verificationCallbacks.delete(deviceId);
  }
}
