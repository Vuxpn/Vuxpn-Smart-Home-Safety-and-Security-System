import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { InjectModel } from '@nestjs/mongoose';
import { Image } from 'src/schema/image.schema';
import { Model } from 'mongoose';
import { Device } from 'src/schema/device.schema';
const streamifier = require('streamifier');
@Injectable()
export class DetectionWarningService {
  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<Image>,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    deviceId,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'esp32-cam-photos',
        },
        async (error, result) => {
          if (error) return reject(error);
          // Lưu URL và deviceId vào cơ sở dữ liệu
          const image = new this.imageModel({
            url: result.secure_url,
            createdAt: new Date(),
            deviceId: deviceId, // Lưu deviceId
          });
          await image.save();
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async getImagesByDeviceId(deviceId: string): Promise<Image[]> {
    return this.imageModel.find({ deviceId }).exec();
  }
}
