import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_CONNECTION } from './database.token';
import * as schema from './schema';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = neon(configService.getOrThrow('DATABASE_URL'));

        return drizzle({ client, schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DataBaseModule {}
