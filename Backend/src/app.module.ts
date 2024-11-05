import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MqttModule } from './mqtt/mqtt.module';
import { DevicesModule } from './devices/devices.module';
import { HomesModule } from './home/homes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot('mongodb://localhost:27017/iot'),
    MongooseModule.forRoot('mongodb://localhost:27017/smarthome', {
      connectionName: 'device',
    }),
    HomesModule,
    UsersModule,
    AuthModule,
    MqttModule,
    DevicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
