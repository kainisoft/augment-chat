import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationService } from '@core/services';

/**
 * Breadcrumb Component
 * 
 * Displays navigation breadcrumbs based on current route
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);

  // Expose breadcrumbs from navigation service
  protected readonly breadcrumbs = this.navigationService.breadcrumbs;

  /**
   * Navigate to a specific route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
