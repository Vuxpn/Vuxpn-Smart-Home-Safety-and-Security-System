import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectionWarningService } from './detection.service';
import { Image } from '../schema/image.schema';

@Controller('detectionwarning')
export class DetectionWarningController {
  constructor(
    private readonly detecitionWarningService: DetectionWarningService,
  ) {}

  @Post('upload/:deviceId')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('deviceId') deviceId: string,
  ) {
    return await this.detecitionWarningService.uploadFile(file, deviceId);
  }
  @Get('images/:deviceId')
  async getImages(@Param('deviceId') deviceId: string): Promise<Image[]> {
    return await this.detecitionWarningService.getImagesByDeviceId(deviceId);
  }
}
