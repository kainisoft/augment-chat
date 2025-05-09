import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { RedisEventPublisher } from './redis-event.publisher';
import { RedisEventSubscriber } from './redis-event.subscriber';
import {
  EventPublisherOptions,
  EventSubscriberOptions,
  defaultEventPublisherOptions,
  defaultEventSubscriberOptions,
} from './event.interfaces';
import {
  PUBSUB_PUBLISHER_OPTIONS,
  PUBSUB_SUBSCRIBER_OPTIONS,
} from './pubsub.constants';

/**
 * PubSub module options
 */
export interface PubSubModuleOptions {
  /**
   * Publisher options
   */
  publisher?: EventPublisherOptions;

  /**
   * Subscriber options
   */
  subscriber?: EventSubscriberOptions;

  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;
}

/**
 * PubSub Module
 *
 * This module provides publish/subscribe functionality using Redis.
 */
@Module({})
export class PubSubModule {
  /**
   * Register the PubSub module
   * @param options PubSub module options
   * @returns Dynamic module
   */
  static register(options: PubSubModuleOptions = {}): DynamicModule {
    const publisherOptionsProvider: Provider = {
      provide: PUBSUB_PUBLISHER_OPTIONS,
      useValue: { ...defaultEventPublisherOptions, ...options.publisher },
    };

    const subscriberOptionsProvider: Provider = {
      provide: PUBSUB_SUBSCRIBER_OPTIONS,
      useValue: { ...defaultEventSubscriberOptions, ...options.subscriber },
    };

    return {
      module: PubSubModule,
      providers: [
        publisherOptionsProvider,
        subscriberOptionsProvider,
        {
          provide: RedisEventPublisher,
          useFactory: (
            redisService: RedisService,
            options: EventPublisherOptions,
          ) => {
            return new RedisEventPublisher(redisService, options);
          },
          inject: [RedisService, PUBSUB_PUBLISHER_OPTIONS],
        },
        {
          provide: RedisEventSubscriber,
          useFactory: (
            redisService: RedisService,
            options: EventSubscriberOptions,
          ) => {
            return new RedisEventSubscriber(redisService, options);
          },
          inject: [RedisService, PUBSUB_SUBSCRIBER_OPTIONS],
        },
      ],
      exports: [RedisEventPublisher, RedisEventSubscriber],
      global: options.isGlobal,
    };
  }
}
