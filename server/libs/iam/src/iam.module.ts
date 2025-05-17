import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { IamService } from './iam.service';
import { IamConfigService } from './config/iam-config.service';
import { IAM_OPTIONS } from './constants/iam.constants';
import { IamOptions } from './interfaces/iam-options.interface';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './authorization/guards/roles.guard';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';

@Module({})
export class IamModule {
  /**
   * Register IAM module with options
   * @param options IAM configuration options
   * @returns Dynamic module
   */
  static register(options: IamOptions): DynamicModule {
    const iamOptionsProvider: Provider = {
      provide: IAM_OPTIONS,
      useValue: options,
    };

    const jwtGuardProvider: Provider = {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    };

    const rolesGuardProvider: Provider = {
      provide: APP_GUARD,
      useClass: RolesGuard,
    };

    return {
      module: IamModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: {
            expiresIn: options.jwtExpiresIn || '15m',
          },
        }),
      ],
      providers: [
        iamOptionsProvider,
        IamService,
        IamConfigService,
        JwtStrategy,
        ...(options.globalGuards?.jwt ? [jwtGuardProvider] : []),
        ...(options.globalGuards?.roles ? [rolesGuardProvider] : []),
      ],
      exports: [IamService, IamConfigService, JwtModule],
      global: options.isGlobal,
    };
  }
}
