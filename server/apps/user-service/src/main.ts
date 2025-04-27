import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    UserServiceModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 4002, '0.0.0.0');
  console.log(`User service is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => console.error('Error starting user service:', err));
