import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './contacts-list.component.html'
})
export class ContactsListComponent {
  constructor(private router: Router) {}
  
  addContact(): void {
    this.router.navigate(['/contacts/add']);
  }
  
  viewContact(contactId: string): void {
    this.router.navigate(['/contacts', contactId]);
  }
}
