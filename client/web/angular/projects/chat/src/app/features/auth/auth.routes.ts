import { Routes } from '@angular/router';
import { NoAuthGuard } from '@core/guards';

/**
 * Authentication Routes
 * 
 * Routes for user authentication (login, register, password reset, etc.)
 * These routes are only accessible to unauthenticated users.
 */
export const authRoutes: Routes = [
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        data: {
          title: 'Sign In',
          description: 'Sign in to your account'
        }
      },
      {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
        data: {
          title: 'Sign Up',
          description: 'Create a new account'
        }
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        data: {
          title: 'Forgot Password',
          description: 'Reset your password'
        }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        data: {
          title: 'Reset Password',
          description: 'Set your new password'
        }
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        data: {
          title: 'Verify Email',
          description: 'Verify your email address'
        }
      }
    ]
  },
  
  // Logout route (accessible to authenticated users)
  {
    path: 'logout',
    loadComponent: () => import('./components/logout/logout.component').then(m => m.LogoutComponent),
    data: {
      title: 'Signing Out',
      description: 'Signing you out...'
    }
  }
];
