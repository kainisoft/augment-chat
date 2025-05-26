import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggingService } from '@app/logging';
import { RateLimitGuard } from '@app/security';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from '@app/dtos';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    userId: 'user-id',
    email: 'test@example.com',
    sessionId: 'session-id',
    expiresIn: 900,
    tokenType: 'Bearer',
  };

  const mockRequest = {
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'test-agent',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockAuthResponse),
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            logout: jest.fn().mockResolvedValue(true),
            refreshToken: jest.fn().mockResolvedValue(mockAuthResponse),
            forgotPassword: jest.fn().mockResolvedValue(true),
            resetPassword: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            setContext: jest.fn(),
            debug: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await controller.register(registerDto, mockRequest as any);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await controller.login(loginDto, mockRequest as any);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct parameters', async () => {
      const authorization = 'Bearer access-token';
      const sessionId = 'session-id';
      const userId = 'user-id';

      const result = await controller.logout(authorization, sessionId, userId);

      expect(result).toEqual({ success: true });
      expect(authService.logout).toHaveBeenCalledWith(
        userId,
        sessionId,
        'access-token',
      );
    });

    it('should return success: false if token, sessionId, or userId is missing', async () => {
      const result = await controller.logout('', '', '');

      expect(result).toEqual({ success: false });
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken with correct parameters', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      const result = await controller.refreshToken(refreshTokenDto, mockRequest as any);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct parameters', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({ success: true });
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct parameters', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        password: 'NewPassword123',
      };

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual({ success: true });
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
