import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

/**
 * Strategy for API key authentication
 */
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly configService: ConfigService) {
    super(
      { header: 'X-API-KEY', prefix: '' },
      true,
      async (
        apiKey: string,
        done: (error: Error | null, data: boolean) => void,
      ) => {
        return this.validate(apiKey, done);
      },
    );
  }

  /**
   * Validate the API key
   * @param apiKey The API key to validate
   * @param done Callback function
   */
  validate(apiKey: string, done: (error: Error | null, data: boolean) => void) {
    const isApiKeyEnabled = this.configService.get<boolean>(
      'API_KEY_ENABLED',
      false,
    );

    // If API key authentication is disabled, allow all requests
    if (!isApiKeyEnabled) {
      done(null, true);
      return;
    }

    const expectedApiKey = this.configService.get<string>('API_KEY');

    // Validate the API key
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      done(new UnauthorizedException('Invalid API key'), false);
      return;
    }

    done(null, true);
  }
}
