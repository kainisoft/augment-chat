import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;

  // The user object is attached to the request by the AuthGuard
  const user = request.user;

  if (!user) {
    throw new Error('User not found in request');
  }

  // If data is specified, return that specific field from the user object
  if (data) {
    return user[data as keyof typeof user];
  }

  // By default, return the user ID
  return user.id;
});
