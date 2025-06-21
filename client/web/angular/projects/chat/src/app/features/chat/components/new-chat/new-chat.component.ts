import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

/**
 * New Chat Component
 * 
 * Component for starting a new chat conversation
 */
@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.css']
})
export class NewChatComponent {
  constructor(private router: Router) {}

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigate(['/chats']);
  }

  /**
   * Search contacts
   */
  onSearch(query: string): void {
    console.log('Searching contacts:', query);
    // TODO: Implement contact search
  }

  /**
   * Start a chat with a contact
   */
  startChat(contactId: string): void {
    console.log('Starting chat with contact:', contactId);
    this.router.navigate(['/chat', contactId]);
  }

  /**
   * Create a new group
   */
  createGroup(): void {
    console.log('Creating new group');
    this.router.navigate(['/chats/groups/new']);
  }

  /**
   * Add a new contact
   */
  addContact(): void {
    console.log('Adding new contact');
    this.router.navigate(['/contacts/add']);
  }
}
