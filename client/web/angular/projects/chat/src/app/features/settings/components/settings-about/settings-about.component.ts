import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-about',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-about.component.html'
})
export class SettingsAboutComponent {}
