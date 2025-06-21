import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointService, IconService, ThemeService } from '@core/services';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Inputs
  @Input() sidenavOpened = false;

  // Outputs
  @Output() menuToggle = new EventEmitter<void>();

  // Inject services
  private readonly themeService = inject(ThemeService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly iconService = inject(IconService);

  // Expose services to template
  protected readonly theme = this.themeService.theme;
  protected readonly isDark = this.themeService.isDark;
  protected readonly isMobile = this.breakpointService.isMobile;
  protected readonly isTablet = this.breakpointService.isTablet;
  protected readonly currentBreakpoint = this.breakpointService.currentBreakpoint;

  protected onMenuToggle(): void {
    this.menuToggle.emit();
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.themeService.setTheme(theme);
  }

  protected getThemeIcon(): string {
    return this.iconService.getThemeIcon(this.themeService.getEffectiveTheme());
  }

  protected getMenuIcon(): string {
    return this.sidenavOpened ? 'menu_open' : 'menu';
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    
    if (query) {
      console.log('Search query:', query);
      // TODO: Implement search functionality
    }
  }

  protected onUserMenuAction(action: string): void {
    console.log('User menu action:', action);
    // TODO: Implement user menu actions
    switch (action) {
      case 'profile':
        // Navigate to profile
        break;
      case 'settings':
        // Navigate to settings
        break;
      case 'logout':
        // Perform logout
        break;
    }
  }
}
