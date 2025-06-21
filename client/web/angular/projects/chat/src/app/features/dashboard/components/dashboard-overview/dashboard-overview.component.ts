import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

/**
 * Dashboard Overview Component
 * 
 * Main dashboard page showing overview of chat activity
 */
@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent {
  constructor(private router: Router) {}

  /**
   * Start a new chat
   */
  startNewChat(): void {
    this.router.navigate(['/chat/new']);
  }

  /**
   * Create a new group
   */
  createGroup(): void {
    this.router.navigate(['/chats/groups/new']);
  }

  /**
   * Add a new contact
   */
  addContact(): void {
    this.router.navigate(['/contacts/add']);
  }

  /**
   * View all activity
   */
  viewAllActivity(): void {
    this.router.navigate(['/dashboard/activity']);
  }
}
