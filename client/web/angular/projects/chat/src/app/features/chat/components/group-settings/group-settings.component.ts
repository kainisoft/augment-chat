import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './group-settings.component.html'
})
export class GroupSettingsComponent {
  constructor(private router: Router) {}
  
  goBack(): void {
    this.router.navigate(['/chats/groups']);
  }
}
