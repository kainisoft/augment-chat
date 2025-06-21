import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-appearance',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-appearance.component.html'
})
export class SettingsAppearanceComponent {}
