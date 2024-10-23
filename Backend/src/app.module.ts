import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MqttModule } from './mqtt/mqtt.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(`mongodb://localhost:27017/post`, {
      connectionName: 'post',
    }),
    MongooseModule.forRoot(`mongodb://localhost:27017/user`, {
      connectionName: 'user',
    }),
    MongooseModule.forRoot(`mongodb://localhost:27017/device`, {
      connectionName: 'device',
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    MqttModule,
    DevicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
