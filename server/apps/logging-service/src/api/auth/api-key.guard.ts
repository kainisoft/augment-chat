import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for API key authentication
 */
@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  /**
   * Check if the request should be authenticated
   * @param context The execution context
   * @returns Whether the request should be authenticated
   */
  canActivate(context: ExecutionContext) {
    // Check if API key authentication is enabled
    const isApiKeyEnabled = this.configService.get<boolean>(
      'API_KEY_ENABLED',
      false,
    );

    // If API key authentication is disabled, allow all requests
    if (!isApiKeyEnabled) {
      return true;
    }

    // Otherwise, use the AuthGuard to validate the API key
    return super.canActivate(context);
  }
}
