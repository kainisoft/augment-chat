import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PUBLIC_ROUTE_KEY,
} from '../../constants/iam.constants';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/**
 * Permission-based access control guard
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Check if the request can activate the route
   * @param context Execution context
   * @returns True if the request can activate the route
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public using the @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    // Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // If no user or no permissions, deny access
    if (
      !user ||
      !user.permissions ||
      !Array.isArray(user.permissions) ||
      user.permissions.length === 0
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every((permission) =>
      user.permissions!.includes(permission),
    );

    if (!hasPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
