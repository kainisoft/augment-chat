import { Component, OnInit, ViewEncapsulation, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { ThemeConfigService } from '@core/services/theme-config.service';
import { ColorMode, ColorTheme, LayoutVariant, ThemeOption } from '@core/services';
import { closeDrawer } from '@store/ui';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSidenavModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly themeConfigService = inject(ThemeConfigService);

  @ViewChild('settingsDrawer') settingsDrawer!: MatSidenav;

  // Use signals directly from the service
  readonly config = this.themeConfigService.config;
  opened = false;

  ngOnInit(): void {
    // No need to subscribe - signals are reactive
  }

  /**
   * Open the settings drawer
   */
  open(): void {
    this.opened = true;
  }

  /**
   * Close the settings drawer
   */
  close(): void {
    this.opened = false;
    this.store.dispatch(closeDrawer());
  }

  /**
   * Toggle the settings drawer
   */
  toggle(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Set the color mode
   */
  setColorMode(colorMode: ColorMode): void {
    this.themeConfigService.setColorMode(colorMode);
  }

  /**
   * Set the color theme
   */
  setColorTheme(colorTheme: ColorTheme): void {
    this.themeConfigService.setColorTheme(colorTheme);
  }

  /**
   * Set the layout
   */
  setLayout(layout: LayoutVariant): void {
    this.themeConfigService.setLayout(layout);
  }

  /**
   * Toggle compact mode
   */
  toggleCompact(): void {
    this.themeConfigService.toggleCompact();
  }

  /**
   * Toggle animations
   */
  toggleAnimations(): void {
    this.themeConfigService.toggleAnimations();
  }

  /**
   * Toggle high contrast
   */
  toggleHighContrast(): void {
    this.themeConfigService.toggleHighContrast();
  }

  /**
   * Toggle reduced motion
   */
  toggleReducedMotion(): void {
    this.themeConfigService.toggleReducedMotion();
  }

  /**
   * Set font size
   */
  setFontSize(size: 'small' | 'medium' | 'large' | 'extra-large'): void {
    this.themeConfigService.setFontSize(size);
  }

  /**
   * Reset all settings
   */
  resetSettings(): void {
    this.themeConfigService.resetConfig();
  }

  /**
   * Get theme option by id
   */
  getThemeOption(themeId: ColorTheme): ThemeOption | undefined {
    return this.config().themes.find((theme: ThemeOption) => theme.id === themeId);
  }

  // Backward compatibility methods for template
  setScheme(scheme: ColorMode): void {
    this.setColorMode(scheme);
  }

  setTheme(theme: ColorTheme): void {
    this.setColorTheme(theme);
  }
}
