import { forwardRef, Module } from '@nestjs/common';
import { DetectionWarningController } from './detection.controller';
import { DetectionWarningService } from './detection.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from 'src/schema/device.schema';
import { Image, ImageSchema } from 'src/schema/image.schema';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
    forwardRef(() => MqttModule),
  ],
  controllers: [DetectionWarningController],
  providers: [DetectionWarningService],
})
export class DetectionWarningModule {}
