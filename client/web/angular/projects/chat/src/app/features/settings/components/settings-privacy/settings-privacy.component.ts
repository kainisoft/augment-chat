import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-privacy',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-privacy.component.html'
})
export class SettingsPrivacyComponent {}
