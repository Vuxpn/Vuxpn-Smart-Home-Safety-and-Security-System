import { Module } from '@nestjs/common';
import { DetectionWarningController } from './detection.controller';
import { DetectionWarningService } from './detection.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from 'src/schema/device.schema';
import { Image, imageSchema } from 'src/schema/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Image.name, schema: imageSchema },
    ]),
  ],
  controllers: [DetectionWarningController],
  providers: [DetectionWarningService],
})
export class DetectionWarningModule {}
