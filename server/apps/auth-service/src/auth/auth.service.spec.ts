import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { LoggingService } from '@app/logging';
import { User } from '../domain/models/user.entity';
import { Email, UserId } from '@app/domain';
import { Password } from '../domain/models/value-objects/password.value-object';
import { TokenType } from '@app/iam';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@app/dtos';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let tokenService: any;
  let sessionService: any;

  const mockUser = new User({
    id: new UserId('user-id'),
    email: new Email('test@example.com'),
    password: new Password('hashedPassword', true),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepository',
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('access-token'),
            generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
            validateToken: jest.fn(),
            revokeToken: jest.fn().mockResolvedValue(true),
            revokeAllUserTokens: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn().mockResolvedValue('session-id'),
            getSession: jest.fn(),
            updateSession: jest.fn().mockResolvedValue(true),
            deleteSession: jest.fn().mockResolvedValue(true),
            deleteUserSessions: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(900),
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
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get('UserRepository');
    tokenService = module.get<TokenService>(TokenService);
    sessionService = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(userRepository.findByEmail).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(tokenService.generateAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(mockUser.getPassword(), 'compare')
        .mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(userRepository.findByEmail).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(tokenService.generateAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(mockUser.getPassword(), 'compare')
        .mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const result = await service.logout('user-id', 'session-id', 'token');

      expect(result).toBe(true);
      expect(tokenService.revokeToken).toHaveBeenCalledWith('token');
      expect(sessionService.deleteSession).toHaveBeenCalledWith('session-id');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      tokenService.validateToken.mockResolvedValue({
        sub: 'user-id',
        sessionId: 'session-id',
      });
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(tokenService.validateToken).toHaveBeenCalledWith(
        'refresh-token',
        TokenType.REFRESH,
      );
      expect(tokenService.revokeToken).toHaveBeenCalledWith('refresh-token');
      expect(sessionService.updateSession).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      tokenService.validateToken.mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
