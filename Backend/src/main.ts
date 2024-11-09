import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.MQTT,
      options: {
        url: `mqtts://${configService.get<string>('MQTT_URL')}:${configService.get<string>('MQTT_PORT')}`,
        username: configService.get<string>('MQTT_USERNAME'),
        password: configService.get<string>('MQTT_PASSWORD'),
        protocol: 'mqtts',
        rejectUnauthorized: false,
      },
    });

    // Bắt đầu tất cả các microservices
    await app.startAllMicroservices();
    console.log('All microservices are running.');
  } catch (error) {
    console.error('Error starting microservice:', error);
  }
  await app.listen(3001);
}
bootstrap();
