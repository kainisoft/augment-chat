import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSeedService } from './services/auth-seed.service';
import { UserSeedService } from './services/user-seed.service';
import { ChatSeedService } from './services/chat-seed.service';
import { NotificationSeedService } from './services/notification-seed.service';

@Module({
  imports: [
    // PostgreSQL connections
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'auth_db',
      entities: [],
      synchronize: false,
      name: 'auth',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'user_db',
      entities: [],
      synchronize: false,
      name: 'user',
    }),
    
    // MongoDB connections
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://mongo:mongo@localhost:27017/chat_db?authSource=admin',
      {
        connectionName: 'chat',
      },
    ),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://mongo:mongo@localhost:27017/notification_db?authSource=admin',
      {
        connectionName: 'notification',
      },
    ),
  ],
  providers: [
    AuthSeedService,
    UserSeedService,
    ChatSeedService,
    NotificationSeedService,
  ],
})
export class SeedModule {}
