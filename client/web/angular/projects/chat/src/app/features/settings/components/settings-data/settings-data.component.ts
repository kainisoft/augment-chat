import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-data',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-data.component.html'
})
export class SettingsDataComponent {}
