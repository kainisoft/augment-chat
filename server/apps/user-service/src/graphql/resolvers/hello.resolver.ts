import { Query, Resolver } from '@nestjs/graphql';
import { LoggingService } from '@app/logging';
import { QueryResolvers } from '../generated/graphql';

@Resolver()
export class HelloResolver implements Pick<QueryResolvers, 'hello'> {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(HelloResolver.name);
  }

  @Query(() => String, {
    name: 'hello',
    description: 'A simple hello world query',
  })
  hello(): Promise<string> {
    this.loggingService.debug('Executing hello query', 'hello');
    return Promise.resolve('Hello from GraphQL!');
  }
}
