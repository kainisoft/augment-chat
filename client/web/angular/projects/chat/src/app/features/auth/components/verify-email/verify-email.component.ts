import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {
  constructor(private router: Router) {}
  
  onResendEmail(): void {
    console.log('Resend email clicked');
    alert('Verification email sent!');
  }
  
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
