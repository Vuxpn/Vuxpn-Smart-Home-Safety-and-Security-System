import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MqttModule } from './mqtt/mqtt.module';
import { DevicesModule } from './devices/devices.module';
import { HomesModule } from './home/homes.module';
import { DetectionWarningModule } from './detectionwarning/detection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot('mongodb://localhost:27017/iot'),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: `mongodb://${configService.get('MONGO_USERNAME')}:${configService.get('MONGO_PASSWORD')}@mongo:27017/${configService.get('MONGO_DATABASE')}?authSource=admin`,
    //   }),
    //   inject: [ConfigService],
    // }),
    HomesModule,
    UsersModule,
    AuthModule,
    MqttModule,
    DevicesModule,
    DetectionWarningModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
