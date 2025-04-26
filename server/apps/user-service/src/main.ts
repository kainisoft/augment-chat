import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    UserServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
