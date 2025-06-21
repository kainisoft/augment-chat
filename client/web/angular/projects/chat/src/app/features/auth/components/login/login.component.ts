import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Login Component
 * 
 * Placeholder component for user authentication
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  /**
   * Handle login
   */
  onLogin(): void {
    console.log('Login clicked');
    // TODO: Implement actual login logic
    // For now, just navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate to register page
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navigate to forgot password page
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
