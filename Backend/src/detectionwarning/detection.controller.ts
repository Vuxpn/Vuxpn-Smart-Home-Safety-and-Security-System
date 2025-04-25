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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectionWarningService } from './detection.service';
import { Image } from '../schema/image.schema';
import { DeviceGuard } from 'src/devices/device.guard';
import { ChangeModeDto, ChangeTimeDto } from './dto/detection.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { SystemMode } from './dto/detection.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Detectionwarning')
@Controller('detectionwarning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
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

  @Post('changetimeled/:deviceId')
  changeTimeLed(
    @Body() changeTimeDto: ChangeTimeDto,
    @Param('deviceId') deviceId: string,
  ) {
    return this.detectionWarningService.changeTimeLed({
      ...changeTimeDto,
      deviceId,
    });
  }

  @Post('changetimebuzzer/:deviceId')
  changeTimeBuzzer(
    @Body() changeTimeDto: ChangeTimeDto,
    @Param('deviceId') deviceId: string,
  ) {
    return this.detectionWarningService.changeTimeBuzzer({
      ...changeTimeDto,
      deviceId,
    });
  }

  @Post('safemode/:deviceId')
  async safeMode(@Param('deviceId') deviceId: string) {
    return this.detectionWarningService.changeMode({
      deviceId,
      mode: SystemMode.SAFE,
    });
  }

  @Post('normalmode/:deviceId')
  async normalMode(@Param('deviceId') deviceId: string) {
    return this.detectionWarningService.changeMode({
      deviceId,
      mode: SystemMode.NORMAL,
    });
  }

  @Post(':deviceId/ondetectwarning')
  async turnOnWarningBuzzer(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.detectionWarningService.changeWarning({
        deviceId,
        state: 'on',
      });
      console.log('Turn on warning detect:', result);
    } catch (error) {
      console.error('Error turning on warning:', error);
      throw error;
    }
  }
  @Post(':deviceId/offdetectwarning')
  async turnOffWarningBuzzer(@Param('deviceId') deviceId: string) {
    try {
      const result = await this.detectionWarningService.changeWarning({
        deviceId,
        state: 'off',
      });
      console.log('Turn off warning detect:', result);
    } catch (error) {
      console.error('Error turning off warning:', error);
      throw error;
    }
  }
}
