/**
 * Auth Feature Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all auth feature components.
 * Use named imports to maintain optimal bundle size.
 */

// Auth Components
export { LoginComponent } from './components/login/login.component';
export { RegisterComponent } from './components/register/register.component';
export { LogoutComponent } from './components/logout/logout.component';
export { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
export { ResetPasswordComponent } from './components/reset-password/reset-password.component';
export { VerifyEmailComponent } from './components/verify-email/verify-email.component';

// Auth Routes
export { authRoutes } from './auth.routes';
