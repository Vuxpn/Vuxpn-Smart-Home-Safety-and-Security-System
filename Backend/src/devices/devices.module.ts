import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, deviceSchema } from './device.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Device.name, schema: deviceSchema }],
      'device',
    ),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
