import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from './core/services/breakpoint.service';
import { IconService } from './core/services/icon.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit {
  protected title = 'chat';

  // Inject services
  private readonly themeService = inject(ThemeService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly iconService = inject(IconService);

  // Expose services to template
  protected readonly theme = this.themeService.theme;
  protected readonly isDark = this.themeService.isDark;
  protected readonly isMobile = this.breakpointService.isMobile;
  protected readonly currentBreakpoint = this.breakpointService.currentBreakpoint;

  ngOnInit(): void {
    // Services are automatically initialized through injection
    console.log('Chat app initialized');
    console.log('Current theme:', this.theme());
    console.log('Is dark mode:', this.isDark());
    console.log('Is mobile:', this.isMobile());
    console.log('Current breakpoint:', this.currentBreakpoint());
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
}
