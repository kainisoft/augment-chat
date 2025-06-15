import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly overlayContainer = inject(OverlayContainer);

  // Theme signals
  private readonly _theme = signal<Theme>('auto');
  private readonly _isDark = signal<boolean>(false);

  // Public readonly signals
  readonly theme = this._theme.asReadonly();
  readonly isDark = this._isDark.asReadonly();

  // Storage key for theme preference
  private readonly THEME_STORAGE_KEY = 'chat-theme-preference';

  constructor() {
    // Initialize theme from storage or system preference
    this.initializeTheme();

    // Effect to update DOM classes when theme changes
    effect(() => {
      this.updateDOMClasses();
    });

    // Listen for system theme changes
    if (isPlatformBrowser(this.platformId)) {
      this.listenForSystemThemeChanges();
    }
  }

  /**
   * Set the theme preference
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.saveThemePreference(theme);
    this.updateEffectiveTheme();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this._theme();
    if (currentTheme === 'auto') {
      // If auto, switch to opposite of current effective theme
      this.setTheme(this._isDark() ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get the effective theme (resolves 'auto' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this._theme();
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Load theme from localStorage
      const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        this._theme.set(savedTheme);
      }
    }
    this.updateEffectiveTheme();
  }

  private updateEffectiveTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    this._isDark.set(effectiveTheme === 'dark');
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default for SSR
  }

  private listenForSystemThemeChanges(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (this._theme() === 'auto') {
        this.updateEffectiveTheme();
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }

  private updateDOMClasses(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isDark = this._isDark();
    const htmlElement = document.documentElement;
    const overlayContainerElement = this.overlayContainer.getContainerElement();

    // Update document class
    if (isDark) {
      htmlElement.classList.add('dark');
      overlayContainerElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      overlayContainerElement.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(isDark);
  }

  private updateMetaThemeColor(isDark: boolean): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
    }
  }

  private saveThemePreference(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    }
  }
}
