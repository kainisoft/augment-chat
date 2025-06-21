import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

/**
 * Chat List Component
 * 
 * Displays list of chat conversations
 */
@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent {
  constructor(private router: Router) {}

  /**
   * Handle tab change
   */
  onTabChange(event: any): void {
    console.log('Tab changed to:', event.index);
    // TODO: Filter chats based on selected tab
  }

  /**
   * Start a new chat
   */
  startNewChat(): void {
    this.router.navigate(['/chat/new']);
  }

  /**
   * Open a specific chat
   */
  openChat(chatId: string): void {
    this.router.navigate(['/chat', chatId]);
  }
}
