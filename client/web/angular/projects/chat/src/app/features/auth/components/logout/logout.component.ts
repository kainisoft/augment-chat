import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatCardModule, MatIconModule],
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Simulate logout process
    setTimeout(() => {
      console.log('User logged out');
      this.router.navigate(['/auth/login']);
    }, 2000);
  }
}
