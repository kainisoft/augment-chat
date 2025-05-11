import { RegisterUserHandler } from './register-user.handler';
import { LoginUserHandler } from './login-user.handler';
import { LogoutUserHandler } from './logout-user.handler';

export const CommandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  LogoutUserHandler,
];

export * from './register-user.handler';
export * from './login-user.handler';
export * from './logout-user.handler';
