import { Injectable, Inject } from '@nestjs/common';
import { IAM_OPTIONS } from '../constants/iam.constants';
import { IamOptions } from '../interfaces/iam-options.interface';

/**
 * IAM configuration service
 */
@Injectable()
export class IamConfigService {
  constructor(@Inject(IAM_OPTIONS) private readonly options: IamOptions) {}

  /**
   * Get JWT secret
   * @returns JWT secret
   */
  get jwtSecret(): string {
    return this.options.jwtSecret;
  }

  /**
   * Get JWT expiration time
   * @returns JWT expiration time
   */
  get jwtExpiresIn(): string {
    return this.options.jwtExpiresIn || '15m';
  }

  /**
   * Get refresh token expiration time
   * @returns Refresh token expiration time
   */
  get refreshTokenExpiresIn(): string {
    return this.options.refreshTokenExpiresIn || '7d';
  }

  /**
   * Get Redis configuration
   * @returns Redis configuration
   */
  get redisConfig(): IamOptions['redis'] {
    return (
      this.options.redis || {
        host: 'localhost',
        port: 6379,
        keyPrefix: 'iam:',
      }
    );
  }
}
