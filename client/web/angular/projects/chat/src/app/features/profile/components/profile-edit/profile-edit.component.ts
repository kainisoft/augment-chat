import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent {
  constructor(private router: Router) {}
  
  onSave(): void {
    console.log('Save profile clicked');
    alert('Profile updated successfully!');
    this.router.navigate(['/profile']);
  }
  
  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
