import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import {
  ValidationError,
  InvalidCredentialsError,
  InvalidTokenError,
  AccountInactiveError,
} from '@app/common/errors';
import { createErrorMetadata } from '../utils/logging.utils';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { UserRepository } from '../domain/repositories/user.repository.interface';
import { User } from '../domain/models/user.entity';
import { Email } from '../domain/models/value-objects/email.value-object';
import { Password } from '../domain/models/value-objects/password.value-object';
import { UserId } from '../domain/models/value-objects/user-id.value-object';
import { TokenType } from '../token/enums/token-type.enum';
import { UserNotFoundError, UserAlreadyExistsError } from '../domain/errors';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from './dto';

/**
 * Auth Service
 *
 * Handles authentication-related business logic
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(AuthService.name);
  }

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @param ip - Client IP address
   * @param userAgent - Client user agent
   * @returns Authentication response with tokens
   */
  async register(
    registerDto: RegisterDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    try {
      const email = new Email(registerDto.email);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsError();
      }

      // Create password object and hash it
      const password = new Password(registerDto.password);
      const hashedPassword = await password.hash();

      // Create and save new user
      const user = new User({
        email,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // Generate tokens and create session
      return this.generateAuthResponse(user, ip, userAgent);
    } catch (error: any) {
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }

      this.loggingService.error(
        `Registration failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'register',
        createErrorMetadata(error),
      );

      throw new ValidationError(error.message || 'Failed to register user');
    }
  }

  /**
   * Login a user
   * @param loginDto - Login data
   * @param ip - Client IP address
   * @param userAgent - Client user agent
   * @returns Authentication response with tokens
   */
  async login(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    try {
      const email = new Email(loginDto.email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Verify password
      const isPasswordValid = await user
        .getPassword()
        .compare(loginDto.password);
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      // Check if user is active
      if (!user.getIsActive()) {
        throw new AccountInactiveError();
      }

      // Update last login time
      user.updateLastLoginTime();
      await this.userRepository.save(user);

      // Generate tokens and create session
      return this.generateAuthResponse(user, ip, userAgent);
    } catch (error: any) {
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof AccountInactiveError
      ) {
        throw error;
      }

      this.loggingService.error(
        `Login failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'login',
        createErrorMetadata(error),
      );

      throw new InvalidCredentialsError();
    }
  }

  /**
   * Logout a user
   * @param userId - User ID
   * @param sessionId - Session ID
   * @param token - Access token
   * @returns True if logout successful
   */
  async logout(
    userId: string,
    sessionId: string,
    token: string,
  ): Promise<boolean> {
    try {
      // Revoke the token
      await this.tokenService.revokeToken(token);

      // Delete the session
      await this.sessionService.deleteSession(sessionId);

      this.loggingService.debug(`User logged out successfully`, 'logout', {
        userId,
        sessionId,
      });

      return true;
    } catch (error: any) {
      this.loggingService.error(
        `Logout failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'logout',
        createErrorMetadata(error, { userId, sessionId }),
      );

      return false;
    }
  }

  /**
   * Refresh access token
   * @param refreshTokenDto - Refresh token data
   * @returns New authentication response with tokens
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      // Validate refresh token
      const payload = await this.tokenService.validateToken(
        refreshTokenDto.refreshToken,
        TokenType.REFRESH,
      );

      // Get user by ID
      const userId = payload.sub;
      const user = await this.userRepository.findById(new UserId(userId));

      if (!user) {
        throw new InvalidTokenError();
      }

      // Check if user is active
      if (!user.getIsActive()) {
        throw new AccountInactiveError();
      }

      // Revoke the old refresh token
      await this.tokenService.revokeToken(refreshTokenDto.refreshToken);

      // Generate new tokens
      const accessToken = await this.tokenService.generateAccessToken(
        user.getId().toString(),
      );

      const refreshToken = await this.tokenService.generateRefreshToken(
        user.getId().toString(),
      );

      // Get session ID from payload
      const sessionId = payload.sessionId;

      // Update session with new tokens
      await this.sessionService.updateSession(sessionId, {
        lastAccessedAt: Date.now(),
      });

      return {
        accessToken,
        refreshToken,
        userId: user.getId().toString(),
        email: user.getEmail().toString(),
        sessionId,
        expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRY', 900),
      };
    } catch (error: any) {
      if (
        error instanceof InvalidTokenError ||
        error instanceof AccountInactiveError
      ) {
        throw error;
      }

      this.loggingService.error(
        `Token refresh failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'refreshToken',
        createErrorMetadata(error),
      );

      throw new InvalidTokenError('Invalid or expired refresh token');
    }
  }

  /**
   * Initiate password reset
   * @param forgotPasswordDto - Forgot password data
   * @returns True if password reset initiated
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    try {
      const email = new Email(forgotPasswordDto.email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist
        return true;
      }

      // Generate password reset token
      await this.tokenService.generateAccessToken(user.getId().toString(), {
        purpose: 'password-reset',
      });

      // TODO: Store the token or send it via email

      // TODO: Send password reset email with token
      // This would typically involve an email service

      this.loggingService.debug(
        `Password reset initiated for user`,
        'forgotPassword',
        { userId: user.getId().toString() },
      );

      return true;
    } catch (error: any) {
      this.loggingService.error(
        `Password reset initiation failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'forgotPassword',
        createErrorMetadata(error),
      );

      // Don't reveal errors to the client
      return true;
    }
  }

  /**
   * Reset password
   * @param resetPasswordDto - Reset password data
   * @returns True if password reset successful
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    try {
      // Validate reset token
      const payload = await this.tokenService.validateToken(
        resetPasswordDto.token,
        TokenType.ACCESS,
      );

      // Check if token was issued for password reset
      if (payload.purpose !== 'password-reset') {
        throw new InvalidTokenError('Invalid reset token');
      }

      // Get user by ID
      const userId = payload.sub;
      const user = await this.userRepository.findById(new UserId(userId));

      if (!user) {
        throw new UserNotFoundError();
      }

      // Update password
      const newPassword = new Password(resetPasswordDto.password);
      const hashedPassword = await newPassword.hash();

      user.updatePassword(hashedPassword);
      await this.userRepository.save(user);

      // Revoke all user tokens
      await this.tokenService.revokeAllUserTokens(userId);

      // Delete all user sessions
      await this.sessionService.deleteUserSessions(userId);

      this.loggingService.debug(
        `Password reset completed for user`,
        'resetPassword',
        { userId },
      );

      return true;
    } catch (error: any) {
      if (
        error instanceof InvalidTokenError ||
        error instanceof UserNotFoundError
      ) {
        throw error;
      }

      this.loggingService.error(
        `Password reset failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'resetPassword',
        createErrorMetadata(error),
      );

      throw new InvalidTokenError('Invalid or expired reset token');
    }
  }

  /**
   * Generate authentication response
   * @param user - User entity
   * @param ip - Client IP address
   * @param userAgent - Client user agent
   * @returns Authentication response with tokens
   */
  private async generateAuthResponse(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const userId = user.getId().toString();

    // Create a new session
    const sessionId = await this.sessionService.createSession(
      userId,
      {
        email: user.getEmail().toString(),
        isVerified: user.getIsVerified(),
      },
      ip,
      userAgent,
    );

    // Generate tokens with session ID in payload
    const accessToken = await this.tokenService.generateAccessToken(userId, {
      sessionId,
    });

    const refreshToken = await this.tokenService.generateRefreshToken(userId, {
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      userId,
      email: user.getEmail().toString(),
      sessionId,
      expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRY', 900),
    };
  }
}
