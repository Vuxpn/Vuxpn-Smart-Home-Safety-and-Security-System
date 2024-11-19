import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { InjectModel } from '@nestjs/mongoose';
import { Image } from 'src/schema/image.schema';
import { Model } from 'mongoose';
import { Device } from 'src/schema/device.schema';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { ChangeTimeDto } from './dto/detectionTime.dto';
const streamifier = require('streamifier');
@Injectable()
export class DetectionWarningService {
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    @InjectModel(Image.name)
    private readonly imageModel: Model<Image>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    deviceId: string, // Đây là deviceId string từ ESP32 (ví dụ: 'espcam1')
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'esp32-cam-photos',
        },
        async (error, result) => {
          if (error) return reject(error);

          try {
            // Tìm device dựa trên macId string
            const device = await this.deviceModel.findOne({
              deviceId: deviceId,
            });

            if (!device) {
              throw new Error(`Device with MacID ${deviceId} not found`);
            }

            // Tạo và lưu hình ảnh với tham chiếu đến device._id
            const image = new this.imageModel({
              url: result.secure_url,
              createdAt: new Date(),
              deviceId: device._id, // Lưu ObjectId của device
            });

            await image.save();

            resolve(result);
          } catch (err) {
            reject(err);
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Phương thức để lấy hình ảnh với thông tin device
  async getImagesWithDevice() {
    return await this.imageModel
      .find()
      .populate('deviceId') // Populate sẽ lấy toàn bộ thông tin của device
      .exec();
  }

  // Phương thức để lấy hình ảnh theo deviceId string
  async getImagesByDeviceId(deviceIdentifier: string) {
    const device = await this.deviceModel.findOne({
      deviceId: deviceIdentifier,
    });

    if (!device) {
      throw new Error(`Device with ID ${deviceIdentifier} not found`);
    }

    return await this.imageModel
      .find({ deviceId: device._id })
      .populate('deviceId')
      .exec();
  }

  //Chỉnh thời gian sáng đèn
  async changeTime(data: ChangeTimeDto) {
    try {
      const topic = `${MQTT_TOPICS.DETECTION_CHANGE_TIME}/${data.deviceId}`;
      const message = { ...data };
      return this.client.emit(topic, message);
    } catch (error) {
      throw new Error(error);
    }
  }
}
