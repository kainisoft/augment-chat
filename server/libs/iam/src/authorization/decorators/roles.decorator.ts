import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../constants/iam.constants';

/**
 * Specify required roles for a route
 * @param roles Required roles
 * @returns Decorator
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
