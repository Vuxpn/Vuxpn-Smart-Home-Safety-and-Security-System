import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttController } from './mqtt.controller';
import { GasWarningService } from 'src/gaswarning/gasWarning.service';
import { GasWarningModule } from 'src/gaswarning/gasWarning.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [
    ConfigModule.forRoot(), //quản lý biến môi trường
    ClientsModule.registerAsync([
      {
        name: 'MQTT_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: `mqtts://${configService.get<string>('MQTT_URL')}`,
            port: parseInt(configService.get<string>('MQTT_PORT')),
            username: configService.get<string>('MQTT_USERNAME'),
            password: configService.get<string>('MQTT_PASSWORD'),
            protocol: 'mqtts',
            rejectUnauthorized: false,
            connectTimeout: 5000, // Add connection timeout
            reconnectPeriod: 1000, // Add reconnection period
          },
        }),

        inject: [ConfigService],
      },
    ]),
    DevicesModule,
  ],
  controllers: [MqttController],
  providers: [GasWarningService],
  exports: [ClientsModule],
})
export class MqttModule {}
