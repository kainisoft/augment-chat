import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Current User Decorator
 *
 * Extracts the current authenticated user from the request context.
 * Works with both HTTP requests and GraphQL contexts.
 *
 * @param data - Optional property to extract from the user object
 * @param ctx - Execution context
 * @returns User object or specific user property
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   @Get('me')
 *   getMe(@CurrentUser() user: JwtPayload) {
 *     return { id: user.sub, roles: user.roles };
 *   }
 *
 *   @Get('id')
 *   getUserId(@CurrentUser('sub') userId: string) {
 *     return { id: userId };
 *   }
 * }
 * ```
 *
 * @example GraphQL Usage
 * ```typescript
 * @Resolver()
 * export class UserResolver {
 *   @Query(() => User)
 *   me(@CurrentUser() user: JwtPayload) {
 *     return this.userService.findById(user.sub);
 *   }
 *
 *   @Mutation(() => Boolean)
 *   updateProfile(
 *     @CurrentUser('sub') userId: string,
 *     @Args('input') input: UpdateProfileInput
 *   ) {
 *     return this.userService.updateProfile(userId, input);
 *   }
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    let user: JwtPayload | undefined;

    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);
    if (gqlContext.getType() === 'graphql') {
      // GraphQL context - get user from GraphQL context
      const context = gqlContext.getContext();
      user = context.user || context.req?.user;
    } else {
      // HTTP context - get user from request
      const request = ctx.switchToHttp().getRequest();
      user = request.user;
    }

    // Return specific property if requested, otherwise return full user object
    return data ? user?.[data] : user;
  },
);

/**
 * Current User ID Decorator
 *
 * Convenience decorator to extract just the user ID from the current user.
 *
 * @example
 * ```typescript
 * @Controller('posts')
 * export class PostsController {
 *   @Post()
 *   createPost(
 *     @CurrentUserId() userId: string,
 *     @Body() createPostDto: CreatePostDto
 *   ) {
 *     return this.postsService.create(userId, createPostDto);
 *   }
 * }
 * ```
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    let user: JwtPayload | undefined;

    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);
    if (gqlContext.getType() === 'graphql') {
      // GraphQL context - get user from GraphQL context
      const context = gqlContext.getContext();
      user = context.user || context.req?.user;
    } else {
      // HTTP context - get user from request
      const request = ctx.switchToHttp().getRequest();
      user = request.user;
    }

    return user?.sub || '';
  },
);

/**
 * Current User Roles Decorator
 *
 * Convenience decorator to extract user roles from the current user.
 *
 * @example
 * ```typescript
 * @Controller('admin')
 * export class AdminController {
 *   @Get('dashboard')
 *   getDashboard(@CurrentUserRoles() roles: string[]) {
 *     if (!roles.includes('admin')) {
 *       throw new ForbiddenException('Admin access required');
 *     }
 *     return this.adminService.getDashboard();
 *   }
 * }
 * ```
 */
export const CurrentUserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    let user: JwtPayload | undefined;

    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);
    if (gqlContext.getType() === 'graphql') {
      // GraphQL context - get user from GraphQL context
      const context = gqlContext.getContext();
      user = context.user || context.req?.user;
    } else {
      // HTTP context - get user from request
      const request = ctx.switchToHttp().getRequest();
      user = request.user;
    }

    return user?.roles || [];
  },
);

/**
 * Current User Permissions Decorator
 *
 * Convenience decorator to extract user permissions from the current user.
 *
 * @example
 * ```typescript
 * @Controller('resources')
 * export class ResourcesController {
 *   @Delete(':id')
 *   deleteResource(
 *     @Param('id') id: string,
 *     @CurrentUserPermissions() permissions: string[]
 *   ) {
 *     if (!permissions.includes('delete:resources')) {
 *       throw new ForbiddenException('Delete permission required');
 *     }
 *     return this.resourcesService.delete(id);
 *   }
 * }
 * ```
 */
export const CurrentUserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    let user: JwtPayload | undefined;

    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);
    if (gqlContext.getType() === 'graphql') {
      // GraphQL context - get user from GraphQL context
      const context = gqlContext.getContext();
      user = context.user || context.req?.user;
    } else {
      // HTTP context - get user from request
      const request = ctx.switchToHttp().getRequest();
      user = request.user;
    }

    return user?.permissions || [];
  },
);
