import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as cloudinary from 'cloudinary';
import {
  ChangeModeDto,
  ChangeTimeDto,
  ChangeWarningDto,
} from './dto/detection.dto';
import { Image } from 'src/schema/image.schema';
import { Device } from 'src/schema/device.schema';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class DetectionWarningService {
  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    @InjectModel(Image.name) private readonly imageModel: Model<Image>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
  ) {
    // Move cloudinary config to module initialization or use ConfigService
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private calculateMD5(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  async uploadFile(
    file: Express.Multer.File,
    deviceId: string,
  ): Promise<CloudinaryResponse> {
    try {
      // Validate input
      if (!file || !deviceId) {
        throw new HttpException(
          'File and deviceId are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Find device
      const device = await this.deviceModel.findOne({ deviceId: deviceId });
      if (!device) {
        throw new HttpException(
          `Device with ID ${deviceId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check for duplicate image using hash
      const fileHash = this.calculateMD5(file.buffer);
      const existingImage = await this.imageModel.findOne({ hash: fileHash });
      if (existingImage) {
        return this.formatResponse(existingImage, device);
      }

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(file);

      // Save image record
      const newImage = await this.saveImageRecord(
        uploadResult,
        device,
        fileHash,
      );

      // Publish MQTT confirmation
      await this.publishUploadConfirmation(deviceId, newImage);

      return this.formatResponse(newImage, device, uploadResult);
    } catch (error) {
      throw new HttpException(
        `Upload failed: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async uploadToCloudinary(file: Express.Multer.File) {
    try {
      return await cloudinary.v2.uploader.upload(
        `data:image/jpeg;base64,${file.buffer.toString('base64')}`,
        {
          folder: 'esp32-cam-photos',
          resource_type: 'image',
          unique_filename: true,
          overwrite: false,
        },
      );
    } catch (error) {
      throw new HttpException(
        'Cloudinary upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async saveImageRecord(
    uploadResult: any,
    device: Device,
    fileHash: string,
  ) {
    const newImage = new this.imageModel({
      url: uploadResult.secure_url,
      deviceId: device.deviceId,
      hash: fileHash,
      timestamp: Date.now(),
    });

    try {
      return await newImage.save();
    } catch (error) {
      throw new HttpException(
        'Failed to save image record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async publishUploadConfirmation(deviceId: string, image: Image) {
    try {
      await this.client
        .emit(MQTT_TOPICS.UPLOAD_CONFIRMATION, {
          deviceId,
          imageId: image._id,
          timestamp: image.timestamp,
        })
        .toPromise();
    } catch (error) {
      // Log error but don't fail the upload
      console.error('Failed to publish MQTT confirmation:', error);
    }
  }

  private formatResponse(
    image: Image,
    device: Device,
    cloudinaryResult?: any,
  ): CloudinaryResponse {
    return {
      _id: image._id.toString(), // Convert ObjectId to string
      url: image.url,
      device: {
        deviceId: device.deviceId,
        name: device.name,
      },
      timestamp: image.timestamp,
      cloudinary: cloudinaryResult
        ? {
            secure_url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
          }
        : null,
    };
  }
  // Phương thức để lấy hình ảnh với thông tin device
  async getImagesWithDevice() {
    return await this.imageModel
      .find()
      .populate('deviceId') // Populate sẽ lấy toàn bộ thông tin của device
      .exec();
  }

  // Phương thức để lấy hình ảnh theo deviceId string
  async getImagesByDeviceId(deviceIdentifier: string, date?: string) {
    const device = await this.deviceModel.findOne({
      deviceId: deviceIdentifier,
    });

    if (!device) {
      throw new Error(`Device with ID ${deviceIdentifier} not found`);
    }

    const query: any = { deviceId: device._id };

    // Thêm điều kiện lọc theo ngày
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    return await this.imageModel
      .find(query)
      .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo thời gian
      .populate('deviceId')
      .exec();
  }

  //Chỉnh thời gian sáng đèn
  async changeTimeLed(data: ChangeTimeDto) {
    try {
      const topic = `${MQTT_TOPICS.CHANGE_TIME_LED}/${data.deviceId}`;
      const message = { ...data };
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'LED time changed successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async changeTimeBuzzer(data: ChangeTimeDto) {
    try {
      const topic = `${MQTT_TOPICS.CHANGE_TIME_BUZZER}/${data.deviceId}`;
      const message = { ...data };
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Buzzer time changed successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  //Chỉnh chế độ
  async changeMode(data: ChangeModeDto) {
    try {
      const topic = `${MQTT_TOPICS.CHANGE_MODE}/${data.deviceId}`;
      const message = { deviceId: data.deviceId, mode: data.mode };
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: `Changed to ${data.mode} mode successfully`,
      };
    } catch (error) {
      console.error(`[Mode Change Error] ${error.message}`);
      throw new HttpException(
        error.response?.message || 'Mode change failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeWarning(data: ChangeWarningDto) {
    try {
      const topic = `${MQTT_TOPICS.WARNING_DETECT}/${data.deviceId}`;
      const message = { deviceId: data.deviceId, state: data.state };
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: `Warning state changed to ${data.state} for device ${data.deviceId}`,
      };
    } catch (error) {
      console.error('Failed to change warning:', error);
      throw new HttpException(
        'Error changing warning',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
