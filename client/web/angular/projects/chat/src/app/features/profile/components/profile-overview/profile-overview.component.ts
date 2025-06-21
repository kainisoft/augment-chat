import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './profile-overview.component.html'
})
export class ProfileOverviewComponent {
  constructor(private router: Router) {}

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  goToSecurity(): void {
    this.router.navigate(['/profile/security']);
  }

  goToPrivacy(): void {
    this.router.navigate(['/profile/privacy']);
  }

  goToNotifications(): void {
    this.router.navigate(['/profile/notifications']);
  }
}
