import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { NavigationService, NavigationItem } from '../../core/services/navigation.service';

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatBadgeModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  // Outputs
  @Output() navigationClick = new EventEmitter<void>();

  // Inject services
  private readonly router = inject(Router);
  private readonly breakpointService = inject(BreakpointService);
  private readonly navigationService = inject(NavigationService);

  // Component state
  protected readonly searchQuery = signal('');

  // Expose services to template
  protected readonly isMobile = this.breakpointService.isMobile;
  protected readonly activeSection = this.navigationService.activeSection;
  protected readonly navigationItems = this.navigationService.navigationItems;

  protected readonly recentConversations: ConversationItem[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      lastMessage: 'Hey, how are you doing?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Bob Smith',
      lastMessage: 'Thanks for the help!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Team Chat',
      lastMessage: 'Meeting at 3 PM today',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      lastMessage: 'See you tomorrow!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      unreadCount: 0,
      isOnline: false,
    },
  ];

  protected onNavigationItemClick(item: NavigationItem): void {
    this.navigationService.navigateTo(item.route);
    this.navigationClick.emit();
  }

  protected onConversationClick(conversation: ConversationItem): void {
    console.log('Opening conversation:', conversation.name);
    this.router.navigate(['/chat', conversation.id]);
    this.navigationClick.emit();
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value.trim());
  }

  protected getFilteredConversations(): ConversationItem[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.recentConversations;
    }
    
    return this.recentConversations.filter(conv =>
      conv.name.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  }

  protected formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return timestamp.toLocaleDateString();
  }

  protected onNewChat(): void {
    console.log('Starting new chat');
    this.router.navigate(['/chat/new']);
    this.navigationClick.emit();
  }

  protected onConversationMenu(event: Event, conversation: ConversationItem): void {
    event.stopPropagation();
    console.log('Conversation menu for:', conversation.name);
    // TODO: Implement conversation menu actions
  }
}
