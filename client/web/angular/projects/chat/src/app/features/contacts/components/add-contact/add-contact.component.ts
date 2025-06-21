import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add-contact.component.html'
})
export class AddContactComponent {
  constructor(private router: Router) {}
  
  onAddContact(): void {
    console.log('Add contact clicked');
    alert('Contact request sent!');
    this.router.navigate(['/contacts']);
  }
  
  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
