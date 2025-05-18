import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';
import { Public } from '@app/iam';
import { RateLimit, RateLimitGuard } from '../../rate-limit';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from '../dtos/auth';
import {
  RegisterUserCommand,
  LoginUserCommand,
  LogoutUserCommand,
  RefreshTokenCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
} from '../../application/commands/impl';

/**
 * Auth Controller
 *
 * Handles authentication-related endpoints
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(AuthController.name);
  }

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @param req - Request object
   * @returns Authentication response with tokens
   */
  @Post('register')
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit('registration', (req) => req.ip)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: FastifyRequest,
  ): Promise<AuthResponseDto> {
    this.loggingService.debug('Processing registration request', 'register', {
      email: registerDto.email,
    });

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Create and execute the command
    const command = new RegisterUserCommand(
      registerDto.email,
      registerDto.password,
      ip,
      userAgent,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Login a user
   * @param loginDto - Login data
   * @param req - Request object
   * @returns Authentication response with tokens
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit('login', (req) => req.ip)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: FastifyRequest,
  ): Promise<AuthResponseDto> {
    this.loggingService.debug('Processing login request', 'login', {
      email: loginDto.email,
    });

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Create and execute the command
    const command = new LoginUserCommand(
      loginDto.email,
      loginDto.password,
      ip,
      userAgent,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Logout a user
   * @param authorization - Authorization header
   * @returns Success message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  async logout(
    @Headers('authorization') authorization: string,
    @Body('refreshToken') refreshToken: string,
    @Body('userId') userId: string,
  ): Promise<{ success: boolean }> {
    this.loggingService.debug('Processing logout request', 'logout', {
      userId,
    });

    // Use refresh token from body or extract from Authorization header
    const token = refreshToken || authorization?.replace('Bearer ', '');

    if (!token) {
      return { success: false };
    }

    // Create and execute the command
    const command = new LogoutUserCommand(token, userId);
    const success = await this.commandBus.execute(command);

    return { success };
  }

  /**
   * Refresh access token
   * @param refreshTokenDto - Refresh token data
   * @returns New authentication response with tokens
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: FastifyRequest,
  ): Promise<AuthResponseDto> {
    this.loggingService.debug(
      'Processing token refresh request',
      'refreshToken',
    );

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Create and execute the command
    const command = new RefreshTokenCommand(
      refreshTokenDto.refreshToken,
      ip,
      userAgent,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Initiate password reset
   * @param forgotPasswordDto - Forgot password data
   * @returns Success message
   */
  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit('password-reset', (req) => req.ip)
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset initiated',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ success: boolean }> {
    this.loggingService.debug(
      'Processing forgot password request',
      'forgotPassword',
      { email: forgotPasswordDto.email },
    );

    // Create and execute the command
    const command = new ForgotPasswordCommand(forgotPasswordDto.email);

    const success = await this.commandBus.execute(command);
    return { success };
  }

  /**
   * Reset password
   * @param resetPasswordDto - Reset password data
   * @returns Success message
   */
  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    this.loggingService.debug(
      'Processing password reset request',
      'resetPassword',
    );

    // Create and execute the command
    const command = new ResetPasswordCommand(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );

    const success = await this.commandBus.execute(command);
    return { success };
  }
}
