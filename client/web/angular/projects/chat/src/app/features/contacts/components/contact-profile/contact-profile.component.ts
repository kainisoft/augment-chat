import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact-profile',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './contact-profile.component.html'
})
export class ContactProfileComponent implements OnInit {
  private contactId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id');
  }

  getContactName(): string {
    return this.contactId === '1' ? 'Alice Johnson' : 'Bob Smith';
  }

  getContactInitials(): string {
    return this.contactId === '1' ? 'AJ' : 'BS';
  }

  getContactStatus(): string {
    return this.contactId === '1' ? 'Online' : 'Last seen 2h ago';
  }

  startChat(): void {
    this.router.navigate(['/chat', this.contactId]);
  }

  blockContact(): void {
    console.log('Block contact clicked');
    alert('Contact blocked');
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
