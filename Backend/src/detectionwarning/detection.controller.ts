import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectionWarningService } from './detection.service';
import { Image } from '../schema/image.schema';
import { DeviceGuard } from 'src/devices/device.guard';
import { ChangeTimeDto } from './dto/detectionTime.dto';

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

  @Post('changetime/:deviceId')
  @UseGuards(DeviceGuard)
  controlTimeOut(@Body() changeTimeDto: ChangeTimeDto, @Req() request) {
    this.detecitionWarningService.changeTime(changeTimeDto);
  }
}
