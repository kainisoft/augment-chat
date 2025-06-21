import { Routes } from '@angular/router';

/**
 * Settings Routes
 * 
 * Routes for application settings and preferences
 */
export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/settings-overview/settings-overview.component').then(m => m.SettingsOverviewComponent),
    data: {
      title: 'Settings',
      description: 'Application settings and preferences'
    }
  },
  {
    path: 'appearance',
    loadComponent: () => import('./components/settings-appearance/settings-appearance.component').then(m => m.SettingsAppearanceComponent),
    data: {
      title: 'Appearance',
      description: 'Customize the app appearance'
    }
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/settings-chat/settings-chat.component').then(m => m.SettingsChatComponent),
    data: {
      title: 'Chat Settings',
      description: 'Configure chat preferences'
    }
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/settings-notifications/settings-notifications.component').then(m => m.SettingsNotificationsComponent),
    data: {
      title: 'Notifications',
      description: 'Manage notification settings'
    }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/settings-privacy/settings-privacy.component').then(m => m.SettingsPrivacyComponent),
    data: {
      title: 'Privacy & Security',
      description: 'Privacy and security settings'
    }
  },
  {
    path: 'data',
    loadComponent: () => import('./components/settings-data/settings-data.component').then(m => m.SettingsDataComponent),
    data: {
      title: 'Data Management',
      description: 'Manage your data and storage'
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./components/settings-about/settings-about.component').then(m => m.SettingsAboutComponent),
    data: {
      title: 'About',
      description: 'App information and support'
    }
  }
];
