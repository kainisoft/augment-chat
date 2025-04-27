import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    NotificationServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 4004, '0.0.0.0');
  console.log(`Notification Service is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => console.error('Error starting Notification Service:', err));
