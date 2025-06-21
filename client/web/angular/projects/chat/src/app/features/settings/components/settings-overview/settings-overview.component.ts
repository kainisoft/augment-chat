import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatListModule],
  templateUrl: './settings-overview.component.html'
})
export class SettingsOverviewComponent {
  constructor(private router: Router) {}

  goTo(section: string): void {
    this.router.navigate(['/settings', section]);
  }
}
