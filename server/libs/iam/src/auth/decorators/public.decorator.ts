import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from '../../constants/iam.constants';

/**
 * Mark a route as public (no authentication required)
 * @returns Decorator
 */
export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
