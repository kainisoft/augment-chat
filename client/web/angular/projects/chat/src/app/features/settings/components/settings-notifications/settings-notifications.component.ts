import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-notifications.component.html'
})
export class SettingsNotificationsComponent {}
