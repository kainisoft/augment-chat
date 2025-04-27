import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ChatServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 4003, '0.0.0.0');
  console.log(`Chat Service is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => console.error('Error starting Chat Service:', err));
