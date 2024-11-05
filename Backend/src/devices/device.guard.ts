import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from '../schema/device.schema';
import { Observable } from 'rxjs';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(@InjectModel(Device.name) private deviceModel: Model<Device>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.params.deviceId || request.body.deviceId; //lấy deviceId từ param hoặc body

    //Kiểm tra deviceID có tồn tại không
    if (!deviceId) {
      throw new UnauthorizedException('Thiếu deviceID');
    }

    //Tìm device trong db
    const device = await this.deviceModel.findOne({
      deviceId,
      state: 'ACTIVE',
    });

    if (!device) {
      throw new UnauthorizedException(
        'Device không tìm thấy hoặc chưa kích hoạt',
      );
    }

    //gán device vào request object để sử dụng sau này
    request.device = device;
    return true;
  }
}
