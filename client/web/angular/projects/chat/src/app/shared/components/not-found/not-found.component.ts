import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Not Found Component
 * 
 * Displays a 404 error page when users navigate to non-existent routes
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  /**
   * Navigate to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Contact support (placeholder)
   */
  contactSupport(): void {
    // TODO: Implement support contact functionality
    console.log('Contact support clicked');
    // Could open a modal, navigate to support page, or open email client
  }
}
