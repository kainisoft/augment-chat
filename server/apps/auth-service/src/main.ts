import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AuthServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 4001, '0.0.0.0');
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => console.error('Error starting Auth Service:', err));
