import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-dashboard-activity',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatListModule],
  templateUrl: './dashboard-activity.component.html'
})
export class DashboardActivityComponent {}
