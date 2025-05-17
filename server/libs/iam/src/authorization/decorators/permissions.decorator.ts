import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../../constants/iam.constants';

/**
 * Specify required permissions for a route
 * @param permissions Required permissions
 * @returns Decorator
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
