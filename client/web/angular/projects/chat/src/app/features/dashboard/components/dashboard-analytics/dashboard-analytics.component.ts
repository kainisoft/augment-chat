import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './dashboard-analytics.component.html'
})
export class DashboardAnalyticsComponent {}
