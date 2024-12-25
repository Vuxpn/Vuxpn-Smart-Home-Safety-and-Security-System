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
import { ChangeModeDto, ChangeTimeDto } from './dto/detection.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('detectionwarning')
export class DetectionWarningController {
  constructor(
    private readonly detectionWarningService: DetectionWarningService,
  ) {}
  @Public()
  @Post('upload/:deviceId')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('deviceId') deviceId: string,
  ) {
    return await this.detectionWarningService.uploadFile(file, deviceId);
  }
  @Get('images/:deviceId')
  async getImages(@Param('deviceId') deviceId: string): Promise<Image[]> {
    return await this.detectionWarningService.getImagesByDeviceId(deviceId);
  }

  @Post('changetime/:deviceId')
  @UseGuards(DeviceGuard)
  controlTimeOut(@Body() changeTimeDto: ChangeTimeDto, @Req() request) {
    this.detectionWarningService.changeTime(changeTimeDto);
  }

  @Post('changemode/:deviceId')
  @UseGuards(DeviceGuard)
  controlchangeMode(@Body() changeModeDto: ChangeModeDto, @Req() request) {
    this.detectionWarningService.changeMode(changeModeDto);
  }
}
