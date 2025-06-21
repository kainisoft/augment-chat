import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './create-group.component.html'
})
export class CreateGroupComponent {
  constructor(private router: Router) {}
  
  onCreate(): void {
    console.log('Create group clicked');
    alert('Group created successfully!');
    this.router.navigate(['/chats/groups']);
  }
  
  goBack(): void {
    this.router.navigate(['/chats/groups']);
  }
}
