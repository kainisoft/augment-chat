import { Query, Resolver } from '@nestjs/graphql';
import { LoggingService } from '@app/logging';

@Resolver()
export class HelloResolver {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(HelloResolver.name);
  }

  @Query(() => String, {
    name: 'hello',
    description: 'A simple hello world query',
  })
  async getHello(): Promise<string> {
    this.loggingService.debug('Executing hello query', 'getHello');
    return 'Hello from GraphQL!';
  }
}
