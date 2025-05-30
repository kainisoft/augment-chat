import { Controller, Get } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { AuthServiceService } from '../services/auth-service.service';
import { RedisService } from '@app/redis';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';

@Controller()
export class AuthServiceController {
  constructor(
    private readonly authServiceService: AuthServiceService,
    private readonly loggingService: LoggingService,
    private readonly redisService: RedisService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(AuthServiceController.name);
  }

  @Get()
  getHello(): string {
    this.loggingService.log('Processing getHello request', 'getHello', {
      service: 'auth-service',
    });
    return this.authServiceService.getHello();
  }
}
