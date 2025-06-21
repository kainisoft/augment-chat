import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings-chat',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './settings-chat.component.html'
})
export class SettingsChatComponent {}
