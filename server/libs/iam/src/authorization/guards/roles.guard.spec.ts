import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, PUBLIC_ROUTE_KEY } from '../../constants/iam.constants';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);

      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        PUBLIC_ROUTE_KEY,
        [expect.any(Function), expect.any(Function)],
      );
    });

    it('should return true when no roles are required', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // PUBLIC_ROUTE_KEY
        .mockReturnValueOnce(null); // ROLES_KEY

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true when user has required role', () => {
      const context = createMockExecutionContext({
        user: { roles: ['admin'] },
      });
      
      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // PUBLIC_ROUTE_KEY
        .mockReturnValueOnce(['admin']); // ROLES_KEY

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const context = createMockExecutionContext({
        user: { roles: ['user'] },
      });
      
      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // PUBLIC_ROUTE_KEY
        .mockReturnValueOnce(['admin']); // ROLES_KEY

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no roles', () => {
      const context = createMockExecutionContext({
        user: { roles: [] },
      });
      
      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // PUBLIC_ROUTE_KEY
        .mockReturnValueOnce(['admin']); // ROLES_KEY

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no roles property', () => {
      const context = createMockExecutionContext({
        user: {},
      });
      
      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false) // PUBLIC_ROUTE_KEY
        .mockReturnValueOnce(['admin']); // ROLES_KEY

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});

function createMockExecutionContext(options?: { user?: any }): ExecutionContext {
  const mockRequest = {
    user: options?.user || null,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}
