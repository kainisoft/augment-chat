import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-chat-groups',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './chat-groups.component.html'
})
export class ChatGroupsComponent {
  constructor(private router: Router) {}
  
  createGroup(): void {
    this.router.navigate(['/chats/groups/new']);
  }
  
  openGroup(groupId: string): void {
    this.router.navigate(['/chat', groupId]);
  }
}
