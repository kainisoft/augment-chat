import { NestFactory } from '@nestjs/core';
import { LoggingServiceModule } from './logging-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoggingServiceModule);
  const port = process.env.PORT ?? 4005;

  console.log(`Logging service starting on port ${port}`);
  await app.listen(port);
  console.log(`Logging service running on port ${port}`);
}
bootstrap().catch(err => {
  console.error('Error starting logging service:', err);
  process.exit(1);
});
