import { Routes } from '@angular/router';

/**
 * Chat Routes
 * 
 * Routes for chat-related functionality
 */
export const chatRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/chat-list/chat-list.component').then(m => m.ChatListComponent),
    data: {
      title: 'Chats',
      description: 'Your chat conversations'
    }
  },
  {
    path: 'archived',
    loadComponent: () => import('./components/chat-archived/chat-archived.component').then(m => m.ChatArchivedComponent),
    data: {
      title: 'Archived Chats',
      description: 'Your archived conversations'
    }
  },
  {
    path: 'groups',
    loadComponent: () => import('./components/chat-groups/chat-groups.component').then(m => m.ChatGroupsComponent),
    data: {
      title: 'Group Chats',
      description: 'Your group conversations'
    }
  },
  {
    path: 'groups/new',
    loadComponent: () => import('./components/create-group/create-group.component').then(m => m.CreateGroupComponent),
    data: {
      title: 'Create Group',
      description: 'Create a new group chat'
    }
  },
  {
    path: 'groups/:id/settings',
    loadComponent: () => import('./components/group-settings/group-settings.component').then(m => m.GroupSettingsComponent),
    data: {
      title: 'Group Settings',
      description: 'Manage group settings'
    }
  }
];
