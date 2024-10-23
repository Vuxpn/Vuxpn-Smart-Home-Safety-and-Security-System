import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './device.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name, 'device') private deviceModel: Model<Device>,
  ) {}

  async getAllDevices() {
    const device = await this.deviceModel.find().exec();
    return device;
  }

  async getDeviceById(deviceId: string) {
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
}
