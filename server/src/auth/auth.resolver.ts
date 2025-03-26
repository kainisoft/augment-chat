import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from './dto/auth-response';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { RegisterInput } from './dto/register.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshTokens(@Args('input') refreshTokenInput: RefreshTokenInput) {
    return this.authService.refreshTokens(refreshTokenInput.refreshToken);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async register(@Args('input') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }
}
