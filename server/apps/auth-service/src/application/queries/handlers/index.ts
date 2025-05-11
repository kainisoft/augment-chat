import { ValidateTokenHandler } from './validate-token.handler';
import { GetUserAuthInfoHandler } from './get-user-auth-info.handler';

export const QueryHandlers = [ValidateTokenHandler, GetUserAuthInfoHandler];

export * from './validate-token.handler';
export * from './get-user-auth-info.handler';
