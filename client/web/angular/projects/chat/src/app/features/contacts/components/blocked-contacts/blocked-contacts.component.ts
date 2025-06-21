import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-blocked-contacts',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './blocked-contacts.component.html'
})
export class BlockedContactsComponent {}
