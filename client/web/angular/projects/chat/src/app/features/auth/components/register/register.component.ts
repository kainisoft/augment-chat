import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Register Component
 * 
 * Placeholder component for user registration
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private router: Router) {}

  /**
   * Handle registration
   */
  onRegister(): void {
    console.log('Register clicked');
    // TODO: Implement actual registration logic
    // For now, just navigate to verify email
    this.router.navigate(['/auth/verify-email']);
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
