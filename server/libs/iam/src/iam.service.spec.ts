import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { IamService } from './iam.service';
import { IamConfigService } from './config/iam-config.service';
import { IAM_OPTIONS } from './constants/iam.constants';
import { TokenType } from './auth/interfaces/jwt-payload.interface';

describe('IamService', () => {
  let service: IamService;
  let jwtService: JwtService;
  let configService: IamConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: IamConfigService,
          useValue: {
            jwtSecret: 'test-secret',
            jwtExpiresIn: '15m',
            refreshTokenExpiresIn: '7d',
          },
        },
        {
          provide: IAM_OPTIONS,
          useValue: {
            jwtSecret: 'test-secret',
          },
        },
      ],
    }).compile();

    service = module.get<IamService>(IamService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<IamConfigService>(IamConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const userId = 'user-123';
      const additionalData = { roles: ['user'] };

      const token = await service.generateAccessToken(userId, additionalData);

      expect(token).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        type: TokenType.ACCESS,
        iat: expect.any(Number),
        roles: ['user'],
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      const userId = 'user-123';
      const additionalData = { roles: ['user'] };

      const token = await service.generateRefreshToken(userId, additionalData);

      expect(token).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          type: TokenType.REFRESH,
          iat: expect.any(Number),
          roles: ['user'],
        },
        {
          expiresIn: '7d',
        },
      );
    });
  });

  describe('validateToken', () => {
    it('should validate a token', async () => {
      const token = 'valid-token';
      const payload = {
        sub: 'user-123',
        type: TokenType.ACCESS,
        iat: Math.floor(Date.now() / 1000),
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(service, 'isTokenBlacklisted').mockResolvedValue(false);

      const result = await service.validateToken(token, TokenType.ACCESS);

      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(service.isTokenBlacklisted).toHaveBeenCalledWith(
        payload.sub,
        undefined,
      );
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      const token = 'valid-token';
      const payload = {
        sub: 'user-123',
        type: TokenType.REFRESH,
        iat: Math.floor(Date.now() / 1000),
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      await expect(service.validateToken(token, TokenType.ACCESS)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for blacklisted token', async () => {
      const token = 'blacklisted-token';
      const payload = {
        sub: 'user-123',
        type: TokenType.ACCESS,
        iat: Math.floor(Date.now() / 1000),
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(service, 'isTokenBlacklisted').mockResolvedValue(true);

      await expect(service.validateToken(token, TokenType.ACCESS)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token', async () => {
      const userId = 'user-123';
      const sessionId = 'session-456';

      const result = await service.revokeToken(userId, sessionId);

      expect(result).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      const user = { sub: 'user-123', roles: ['admin', 'user'] };
      expect(service.hasRole(user, 'admin')).toBe(true);
    });

    it('should return false when user does not have role', () => {
      const user = { sub: 'user-123', roles: ['user'] };
      expect(service.hasRole(user, 'admin')).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const user = { sub: 'user-123' };
      expect(service.hasRole(user, 'admin')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      const user = { sub: 'user-123', permissions: ['read', 'write'] };
      expect(service.hasPermission(user, 'read')).toBe(true);
    });

    it('should return false when user does not have permission', () => {
      const user = { sub: 'user-123', permissions: ['read'] };
      expect(service.hasPermission(user, 'write')).toBe(false);
    });

    it('should return false when user has no permissions', () => {
      const user = { sub: 'user-123' };
      expect(service.hasPermission(user, 'read')).toBe(false);
    });
  });
});
