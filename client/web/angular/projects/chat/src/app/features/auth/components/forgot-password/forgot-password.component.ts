import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Forgot Password Component
 * 
 * Placeholder component for password reset request
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  constructor(private router: Router) {}

  /**
   * Send password reset link
   */
  onSendResetLink(): void {
    console.log('Send reset link clicked');
    // TODO: Implement actual password reset logic
    alert('Password reset link sent to your email!');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
