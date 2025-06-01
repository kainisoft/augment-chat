import { JwtModuleOptions } from '@nestjs/jwt';

export interface AuthGuardOptions {
  /**
   * Whether to register the guard globally
   * @default false
   */
  isGlobal?: boolean;

  jwtModuleOptions: JwtModuleOptions;
}
