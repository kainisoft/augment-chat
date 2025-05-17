import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PUBLIC_ROUTE_KEY } from '../../constants/iam.constants';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes via @Public() decorator', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        PUBLIC_ROUTE_KEY,
        [expect.any(Function), expect.any(Function)],
      );
    });

    it('should call super.canActivate for non-public routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Mock the AuthGuard's canActivate method
      const superCanActivate = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate');
      superCanActivate.mockImplementation(() => true);

      expect(guard.canActivate(context)).toBe(true);
      expect(superCanActivate).toHaveBeenCalledWith(context);
    });
  });

  describe('handleRequest', () => {
    it('should return the user when no error', () => {
      const user = { id: '1', username: 'test' };
      expect(guard.handleRequest(null, user, null)).toBe(user);
    });

    it('should throw UnauthorizedException when error', () => {
      expect(() => guard.handleRequest(new Error('Test error'), null, null)).toThrow(
        Error,
      );
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });
  });
});

function createMockExecutionContext(): ExecutionContext {
  const mockRequest = {
    path: '/test',
    method: 'GET',
  };

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}
