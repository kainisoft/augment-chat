import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    NotificationServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3004, '0.0.0.0');
}
bootstrap();
