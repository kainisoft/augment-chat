import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-notifications',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './profile-notifications.component.html'
})
export class ProfileNotificationsComponent {}
