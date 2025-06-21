import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes (authentication)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    data: { preload: true }
  },

  // Protected routes (main application)
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.AuthGuard)],
    canActivateChild: [() => import('./core/guards/auth.guard').then(m => m.AuthGuard)],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
        data: {
          preload: true,
          breadcrumb: 'Dashboard',
          title: 'Dashboard'
        }
      },
      {
        path: 'chats',
        loadChildren: () => import('./features/chat/chat.routes').then(m => m.chatRoutes),
        data: {
          preload: true,
          breadcrumb: 'Chats',
          title: 'Chat Conversations'
        }
      },
      {
        path: 'chat',
        children: [
          {
            path: 'new',
            loadComponent: () => import('./features/chat/components/new-chat/new-chat.component').then(m => m.NewChatComponent),
            data: {
              breadcrumb: 'New Chat',
              title: 'Start New Conversation'
            }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/chat/components/chat-conversation/chat-conversation.component').then(m => m.ChatConversationComponent),
            data: {
              breadcrumb: 'Conversation',
              title: 'Chat Conversation'
            }
          }
        ]
      },
      {
        path: 'contacts',
        loadChildren: () => import('./features/contacts/contacts.routes').then(m => m.contactsRoutes),
        data: {
          preload: true,
          breadcrumb: 'Contacts',
          title: 'Contact Management'
        }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
        data: {
          breadcrumb: 'Profile',
          title: 'User Profile'
        }
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.settingsRoutes),
        data: {
          breadcrumb: 'Settings',
          title: 'Application Settings'
        }
      }
    ]
  },

  // Fallback routes
  {
    path: 'not-found',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Page Not Found' }
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
