import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ChatServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
}
bootstrap();
