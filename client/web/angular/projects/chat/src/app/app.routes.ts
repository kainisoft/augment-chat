import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        redirectTo: '/chats',
        pathMatch: 'full'
      },
      {
        path: 'chats',
        loadComponent: () => import('./layout/chat-area/chat-area.component').then(m => m.ChatAreaComponent)
      },
      {
        path: 'chat/:id',
        loadComponent: () => import('./layout/chat-area/chat-area.component').then(m => m.ChatAreaComponent)
      },
      {
        path: 'contacts',
        loadComponent: () => import('./layout/chat-area/chat-area.component').then(m => m.ChatAreaComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./layout/chat-area/chat-area.component').then(m => m.ChatAreaComponent)
      }
    ]
  }
];
