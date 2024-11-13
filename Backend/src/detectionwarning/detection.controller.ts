import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectionWarningService } from './detection.service';

@Controller('detectionwarning')
export class DetectionWarningController {
  constructor(
    private readonly detecitionWarningService: DetectionWarningService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.detecitionWarningService.uploadFile(file);
  }
}
