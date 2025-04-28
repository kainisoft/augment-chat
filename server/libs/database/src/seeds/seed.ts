import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { AuthSeedService } from './services/auth-seed.service';
import { UserSeedService } from './services/user-seed.service';
import { ChatSeedService } from './services/chat-seed.service';
import { NotificationSeedService } from './services/notification-seed.service';

/**
 * Seed script to populate databases with test data
 * Usage: npm run seed:run [service]
 * Example: npm run seed:run auth
 */
async function bootstrap() {
  const logger = new Logger('Seed');
  const args = process.argv.slice(2);
  const service = args[0];

  try {
    const app = await NestFactory.create(SeedModule);
    
    if (!service || service === 'all') {
      logger.log('Seeding all services...');
      
      const authSeedService = app.get(AuthSeedService);
      await authSeedService.seed();
      logger.log('Auth service seeded successfully');
      
      const userSeedService = app.get(UserSeedService);
      await userSeedService.seed();
      logger.log('User service seeded successfully');
      
      const chatSeedService = app.get(ChatSeedService);
      await chatSeedService.seed();
      logger.log('Chat service seeded successfully');
      
      const notificationSeedService = app.get(NotificationSeedService);
      await notificationSeedService.seed();
      logger.log('Notification service seeded successfully');
    } else {
      switch (service) {
        case 'auth':
          const authSeedService = app.get(AuthSeedService);
          await authSeedService.seed();
          logger.log('Auth service seeded successfully');
          break;
        case 'user':
          const userSeedService = app.get(UserSeedService);
          await userSeedService.seed();
          logger.log('User service seeded successfully');
          break;
        case 'chat':
          const chatSeedService = app.get(ChatSeedService);
          await chatSeedService.seed();
          logger.log('Chat service seeded successfully');
          break;
        case 'notification':
          const notificationSeedService = app.get(NotificationSeedService);
          await notificationSeedService.seed();
          logger.log('Notification service seeded successfully');
          break;
        default:
          logger.error(`Unknown service: ${service}`);
          process.exit(1);
      }
    }
    
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
