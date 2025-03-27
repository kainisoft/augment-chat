import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from './dto/auth-response';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async signIn(@Args('input') singInInput: SignInInput) {
    return this.authService.signIn(singInInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshTokens(@Args('input') refreshTokenInput: RefreshTokenInput) {
    return this.authService.refreshTokens(refreshTokenInput.refreshToken);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async signUp(@Args('input') signUpInput: SignUpInput) {
    return this.authService.register(signUpInput);
  }
}
