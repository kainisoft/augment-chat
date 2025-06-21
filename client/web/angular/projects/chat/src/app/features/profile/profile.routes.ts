import { Routes } from '@angular/router';

/**
 * Profile Routes
 * 
 * Routes for user profile management
 */
export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/profile-overview/profile-overview.component').then(m => m.ProfileOverviewComponent),
    data: {
      title: 'Profile',
      description: 'Your profile information'
    }
  },
  {
    path: 'edit',
    loadComponent: () => import('./components/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
    data: {
      title: 'Edit Profile',
      description: 'Update your profile information'
    }
  },
  {
    path: 'security',
    loadComponent: () => import('./components/profile-security/profile-security.component').then(m => m.ProfileSecurityComponent),
    data: {
      title: 'Security Settings',
      description: 'Manage your account security'
    }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/profile-privacy/profile-privacy.component').then(m => m.ProfilePrivacyComponent),
    data: {
      title: 'Privacy Settings',
      description: 'Manage your privacy preferences'
    }
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/profile-notifications/profile-notifications.component').then(m => m.ProfileNotificationsComponent),
    data: {
      title: 'Notification Settings',
      description: 'Manage your notification preferences'
    }
  }
];
