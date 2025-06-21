import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-privacy',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './profile-privacy.component.html'
})
export class ProfilePrivacyComponent {}
