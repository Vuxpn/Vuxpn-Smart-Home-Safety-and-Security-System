import { forwardRef, Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../schema/device.schema';
import { DeviceGuard } from './device.guard';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { Home, HomeSchema } from 'src/schema/home.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Home.name, schema: HomeSchema },
    ]),
    forwardRef(() => MqttModule),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, DeviceGuard],
  exports: [
    DevicesService,
    DevicesModule,
    DeviceGuard,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
})
export class DevicesModule {}
