import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as UiActions from '../../store/ui/ui.actions';
import { selectThemeConfig, selectIsDarkMode } from '../../store/ui/ui.selectors';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly store = inject(Store<AppState>);

  // Theme signals
  private readonly _theme = signal<Theme>('auto');
  private readonly _isDark = signal<boolean>(false);
  private readonly _primaryColor = signal<string>('#1976d2');
  private readonly _accentColor = signal<string>('#ff4081');

  // Public readonly signals
  readonly theme = this._theme.asReadonly();
  readonly isDark = this._isDark.asReadonly();
  readonly primaryColor = this._primaryColor.asReadonly();
  readonly accentColor = this._accentColor.asReadonly();

  // Storage key for theme preference (kept for backward compatibility)
  private readonly THEME_STORAGE_KEY = 'chat-theme-preference';

  constructor() {
    // Initialize theme from storage or system preference
    this.initializeTheme();

    // Subscribe to store theme changes
    this.store.select(selectThemeConfig).subscribe(themeConfig => {
      this._theme.set(themeConfig.mode);
      this._primaryColor.set(themeConfig.primaryColor);
      this._accentColor.set(themeConfig.accentColor);
      this.updateEffectiveTheme();
    });

    // Subscribe to computed dark mode from store
    this.store.select(selectIsDarkMode).subscribe(isDark => {
      this._isDark.set(isDark);
    });

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
    // Dispatch action to store
    this.store.dispatch(UiActions.setThemeMode({ mode: theme }));
    this.saveThemePreference(theme);
  }

  /**
   * Set primary color
   */
  setPrimaryColor(color: string): void {
    this.store.dispatch(UiActions.setThemeColors({
      primaryColor: color,
      accentColor: this._accentColor()
    }));
  }

  /**
   * Set accent color
   */
  setAccentColor(color: string): void {
    this.store.dispatch(UiActions.setThemeColors({
      primaryColor: this._primaryColor(),
      accentColor: color
    }));
  }

  /**
   * Set both primary and accent colors
   */
  setColors(primaryColor: string, accentColor: string): void {
    this.store.dispatch(UiActions.setThemeColors({ primaryColor, accentColor }));
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
