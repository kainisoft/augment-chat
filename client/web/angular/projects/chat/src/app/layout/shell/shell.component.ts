import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '@core/services';
import { HeaderComponent } from '@layout/header/header.component';
import { SidebarComponent } from '@layout/sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  // Inject services
  private readonly breakpointService = inject(BreakpointService);

  // Component state
  protected readonly sidenavOpened = signal(true);

  // Expose services to template
  protected readonly isMobile = this.breakpointService.isMobile;
  protected readonly isTablet = this.breakpointService.isTablet;

  ngOnInit(): void {
    // Auto-close sidebar on mobile by default
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  protected toggleSidenav(): void {
    this.sidenavOpened.update(opened => !opened);
  }

  protected onSidenavBackdropClick(): void {
    // Close sidenav when backdrop is clicked (mobile behavior)
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  protected getSidenavMode(): 'over' | 'push' | 'side' {
    // Use 'over' mode on mobile/tablet, 'side' on desktop
    return this.isMobile() || this.isTablet() ? 'over' : 'side';
  }

  protected getSidenavClass(): string {
    const baseClass = 'app-sidenav';
    const modeClass = this.getSidenavMode();
    return `${baseClass} ${baseClass}--${modeClass}`;
  }
}
