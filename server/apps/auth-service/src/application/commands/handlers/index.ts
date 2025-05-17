import { RegisterUserHandler } from './register-user.handler';
import { LoginUserHandler } from './login-user.handler';
import { LogoutUserHandler } from './logout-user.handler';
import { GetUserSessionsHandler } from './get-user-sessions.handler';
import { TerminateSessionHandler } from './terminate-session.handler';
import { TerminateAllSessionsHandler } from './terminate-all-sessions.handler';

export const CommandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  LogoutUserHandler,
  GetUserSessionsHandler,
  TerminateSessionHandler,
  TerminateAllSessionsHandler,
];

export * from './register-user.handler';
export * from './login-user.handler';
export * from './logout-user.handler';
export * from './get-user-sessions.handler';
export * from './terminate-session.handler';
export * from './terminate-all-sessions.handler';
