import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  constructor(private router: Router) {}
  
  onResetPassword(): void {
    console.log('Reset password clicked');
    alert('Password reset successfully!');
    this.router.navigate(['/auth/login']);
  }
}
