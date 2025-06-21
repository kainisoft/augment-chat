/**
 * Chat Feature Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all chat feature components.
 * Use named imports to maintain optimal bundle size.
 */

// Chat Components
export { ChatListComponent } from './components/chat-list/chat-list.component';
export { ChatConversationComponent } from './components/chat-conversation/chat-conversation.component';
export { NewChatComponent } from './components/new-chat/new-chat.component';
export { ChatArchivedComponent } from './components/chat-archived/chat-archived.component';
export { ChatGroupsComponent } from './components/chat-groups/chat-groups.component';
export { CreateGroupComponent } from './components/create-group/create-group.component';
export { GroupSettingsComponent } from './components/group-settings/group-settings.component';

// Chat Routes
export { chatRoutes } from './chat.routes';
