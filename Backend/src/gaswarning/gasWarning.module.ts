import { Module, forwardRef } from '@nestjs/common';
//import { GasWarningService } from './gasWarning.service';
import { ClientsModule } from '@nestjs/microservices';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class GasWarningModule {}
