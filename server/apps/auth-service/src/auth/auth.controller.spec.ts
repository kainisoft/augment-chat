import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimitGuard } from '@app/security';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@app/dtos';
import { ControllerTestBuilder, MockFactoryService, TestSetupService } from '@app/testing';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockRequest: any;
  let mockAuthResponse: any;
  let testData: any;

  beforeEach(async () => {
    const mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const controllerTestBuilder = new ControllerTestBuilder(testSetup, mockFactory);

    const setup = await controllerTestBuilder.createAuthControllerTestSetup(
      AuthController,
      {
        guards: [
          {
            guard: RateLimitGuard,
            mockValue: { canActivate: () => true },
          },
        ],
      },
    );

    controller = setup.controller;
    authService = setup.authService;
    mockRequest = setup.mockRequest;
    testData = setup.testData;
    mockAuthResponse = testData.authResponse;
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
