import { Module } from '@nestjs/common';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SmartLockController } from './smartLock.controller';
import { SmartLockService } from './smartLock.service';

@Module({
  imports: [MqttModule],
  controllers: [SmartLockController],
  providers: [SmartLockService],
  exports: [],
})
export class SmartLockModule {}
