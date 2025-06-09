import { Query, Resolver } from '@nestjs/graphql';
import { LoggingService } from '@app/logging';
import { Auth, AuthType } from '@app/security';

/**
 * Hello Resolver
 *
 * Provides a simple hello world query for testing GraphQL functionality.
 */
@Resolver()
@Auth(AuthType.NONE)
export class HelloResolver {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(HelloResolver.name);
  }

  /**
   * Simple hello world query for testing GraphQL endpoint
   *
   * @returns Promise<string> - Hello message from Chat Service
   */
  @Query(() => String, {
    name: 'hello',
    description: 'A simple hello world query for Chat Service',
  })
  hello(): Promise<string> {
    this.loggingService.debug('Executing hello query', 'hello');
    return Promise.resolve('Hello from Chat Service GraphQL!');
  }

  /**
   * Chat service status query
   *
   * @returns Promise<string> - Status message from Chat Service
   */
  @Query(() => String, {
    name: 'chatServiceStatus',
    description: 'Get the current status of the Chat Service',
  })
  chatServiceStatus(): Promise<string> {
    this.loggingService.debug(
      'Executing chatServiceStatus query',
      'chatServiceStatus',
    );
    return Promise.resolve('Chat Service is running and ready for messaging!');
  }
}
