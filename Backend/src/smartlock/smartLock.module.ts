import { Module } from '@nestjs/common';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SmartLockController } from './smartLock.controller';
import { SmartLockService } from './smartLock.service';
import { DoorLogSchema } from 'src/schema/doorLog.schema';
import { LockStatusSchema } from 'src/schema/lockStatus.schema';
import { LockStatus } from 'src/schema/lockStatus.schema';
import { DoorLog } from 'src/schema/doorLog.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MqttModule,
    MongooseModule.forFeature([
      { name: DoorLog.name, schema: DoorLogSchema },
      { name: LockStatus.name, schema: LockStatusSchema },
    ]),
  ],
  controllers: [SmartLockController],
  providers: [SmartLockService],
  exports: [],
})
export class SmartLockModule {}
