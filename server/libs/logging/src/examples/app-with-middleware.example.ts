import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import {
  LoggingModule,
  LoggingService,
  LoggingMiddleware,
  LoggingInterceptor,
  LoggingExceptionFilter,
  LogLevel,
} from '../index';

/**
 * Example of how to use the LoggingModule with middleware, interceptors, and filters
 */
@Module({
  imports: [
    // Import ConfigModule for configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Register LoggingModule as global
    LoggingModule.registerGlobal({
      service: 'example-service',
      level: LogLevel.INFO,
      kafka: {
        brokers: ['localhost:9092'],
        topic: 'logs',
        clientId: 'example-service',
      },
      console: true,
      redactFields: ['password', 'token', 'secret'],
    }),
  ],
  // The LoggingModule automatically registers the interceptor and filter globally
  // But you can also register them manually if needed
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: LoggingExceptionFilter,
    // },
  ],
})
export class AppModule implements NestModule {
  // The LoggingModule automatically applies the middleware to all routes
  // But you can also apply it manually if you need more control
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to specific routes
    // consumer
    //   .apply(LoggingMiddleware)
    //   .forRoutes('api');
  }
}

/**
 * Example controller that uses the LoggingService
 */
@Controller('example')
export class ExampleController {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this controller
    this.loggingService.setContext(ExampleController.name);
  }

  @Get()
  findAll(@Req() request: Request) {
    // The request ID is automatically set by the middleware
    // But you can also set it manually if needed
    // this.loggingService.setRequestId(request.headers['x-request-id']);

    // Log a message
    this.loggingService.log('Getting all items', 'findAll');

    return { items: [] };
  }

  @Post()
  create(@Body() createDto: any, @Req() request: Request) {
    // Log with metadata
    this.loggingService.log('Creating new item', 'create', {
      dto: createDto,
    });

    // Simulate an error
    if (!createDto.name) {
      // Log an error
      this.loggingService.error(
        'Name is required',
        new Error('Validation failed').stack,
        'create',
        {
          dto: createDto,
        },
      );

      throw new BadRequestException('Name is required');
    }

    return { id: 1, ...createDto };
  }
}
