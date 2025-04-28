import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { AuthSeedService } from './services/auth-seed.service';
import { UserSeedService } from './services/user-seed.service';
import { ChatSeedService } from './services/chat-seed.service';
import { NotificationSeedService } from './services/notification-seed.service';

/**
 * Clear script to remove seeded test data
 * Usage: npm run seed:clear [service]
 * Example: npm run seed:clear auth
 */
async function bootstrap() {
  const logger = new Logger('Clear');
  const args = process.argv.slice(2);
  const service = args[0];

  try {
    const app = await NestFactory.create(SeedModule);
    
    if (!service || service === 'all') {
      logger.log('Clearing all services...');
      
      const authSeedService = app.get(AuthSeedService);
      await authSeedService.clear();
      logger.log('Auth service cleared successfully');
      
      const userSeedService = app.get(UserSeedService);
      await userSeedService.clear();
      logger.log('User service cleared successfully');
      
      const chatSeedService = app.get(ChatSeedService);
      await chatSeedService.clear();
      logger.log('Chat service cleared successfully');
      
      const notificationSeedService = app.get(NotificationSeedService);
      await notificationSeedService.clear();
      logger.log('Notification service cleared successfully');
    } else {
      switch (service) {
        case 'auth':
          const authSeedService = app.get(AuthSeedService);
          await authSeedService.clear();
          logger.log('Auth service cleared successfully');
          break;
        case 'user':
          const userSeedService = app.get(UserSeedService);
          await userSeedService.clear();
          logger.log('User service cleared successfully');
          break;
        case 'chat':
          const chatSeedService = app.get(ChatSeedService);
          await chatSeedService.clear();
          logger.log('Chat service cleared successfully');
          break;
        case 'notification':
          const notificationSeedService = app.get(NotificationSeedService);
          await notificationSeedService.clear();
          logger.log('Notification service cleared successfully');
          break;
        default:
          logger.error(`Unknown service: ${service}`);
          process.exit(1);
      }
    }
    
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
