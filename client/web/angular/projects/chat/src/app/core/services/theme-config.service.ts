import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { 
  ChatConfig, 
  DEFAULT_CONFIG, 
  ColorMode, 
  ColorTheme, 
  LayoutVariant, 
  FontSize,
  SidebarMode,
  AccessibilityConfig,
  ThemeOption 
} from './config.types';

/**
 * Unified Theme and Configuration Service
 * 
 * Consolidates all theme and configuration management into a single service:
 * - User preferences and persistence (localStorage)
 * - DOM theme application and CSS manipulation
 * - System theme detection and auto-switching
 * - Reactive state management with Angular signals
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly overlayContainer = inject(OverlayContainer);

  // Storage keys
  private readonly CONFIG_STORAGE_KEY = 'chat-config';
  private readonly THEME_STORAGE_KEY = 'chat-theme-mode';

  // Private reactive state
  private readonly _config = signal<ChatConfig>(this.loadConfig());

  // Public readonly signals - single source of truth
  readonly config = this._config.asReadonly();
  readonly colorMode = computed(() => this._config().colorMode);
  readonly colorTheme = computed(() => this._config().colorTheme);
  readonly layout = computed(() => this._config().layout);
  readonly sidebarMode = computed(() => this._config().sidebarMode);
  readonly compactMode = computed(() => this._config().compactMode);
  readonly animations = computed(() => this._config().animations);
  readonly accessibility = computed(() => this._config().accessibility);
  readonly themes = computed(() => this._config().themes);

  // Computed derived state
  readonly effectiveTheme = computed(() => this.getEffectiveTheme());
  readonly isDark = computed(() => this.effectiveTheme() === 'dark');
  readonly currentThemeOption = computed(() => 
    this.themes().find(t => t.id === this.colorTheme())
  );
  readonly primaryColor = computed(() => this.currentThemeOption()?.primaryColor || '#1976d2');
  readonly accentColor = computed(() => this.currentThemeOption()?.accentColor || '#ff4081');

  constructor() {
    // Initialize theme application
    this.initializeTheme();

    // Effect to apply theme changes to DOM
    effect(() => {
      this.applyTheme();
    });

    // Listen for system theme changes
    if (isPlatformBrowser(this.platformId)) {
      this.listenForSystemThemeChanges();
    }
  }

  /**
   * Configuration Management Methods
   */

  /**
   * Set color mode (light/dark/auto)
   */
  setColorMode(colorMode: ColorMode): void {
    this.updateConfig({ colorMode });
  }

  /**
   * Set color theme (default/blue/teal/etc)
   */
  setColorTheme(colorTheme: ColorTheme): void {
    this.updateConfig({ colorTheme });
  }

  /**
   * Set layout variant
   */
  setLayout(layout: LayoutVariant): void {
    this.updateConfig({ layout });
  }

  /**
   * Set sidebar mode
   */
  setSidebarMode(sidebarMode: SidebarMode): void {
    this.updateConfig({ sidebarMode });
  }

  /**
   * Toggle compact mode
   */
  toggleCompact(): void {
    const compactMode = !this._config().compactMode;
    this.updateConfig({ compactMode });
  }

  /**
   * Toggle animations
   */
  toggleAnimations(): void {
    const animations = !this._config().animations;
    this.updateConfig({ animations });
  }

  /**
   * Update accessibility settings
   */
  setAccessibility(accessibility: Partial<AccessibilityConfig>): void {
    const current = this._config().accessibility;
    const updated = { ...current, ...accessibility };
    this.updateConfig({ accessibility: updated });
  }

  /**
   * Set font size
   */
  setFontSize(fontSize: FontSize): void {
    this.setAccessibility({ fontSize });
  }

  /**
   * Toggle high contrast
   */
  toggleHighContrast(): void {
    const highContrast = !this._config().accessibility.highContrast;
    this.setAccessibility({ highContrast });
  }

  /**
   * Toggle reduced motion
   */
  toggleReducedMotion(): void {
    const reducedMotion = !this._config().accessibility.reducedMotion;
    this.setAccessibility({ reducedMotion });
  }

  /**
   * Theme Management Methods
   */

  /**
   * Toggle between light and dark themes
   */
  toggleColorMode(): void {
    const currentMode = this.colorMode();
    if (currentMode === 'auto') {
      // If auto, switch to opposite of current effective theme
      this.setColorMode(this.isDark() ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setColorMode(currentMode === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get effective theme (resolves 'auto' to actual theme)
   */
  private getEffectiveTheme(): 'light' | 'dark' {
    const mode = this.colorMode();
    if (mode === 'auto') {
      return this.getSystemTheme();
    }
    return mode;
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default for SSR
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    this._config.set({ ...DEFAULT_CONFIG });
    this.saveConfig(this._config());
  }

  /**
   * Initialize the service
   */
  init(): void {
    // Service is already initialized in constructor
    // This method exists for compatibility with existing code
  }

  /**
   * Private Implementation Methods
   */

  /**
   * Update configuration and persist changes
   */
  private updateConfig(partial: Partial<ChatConfig>): void {
    const current = this._config();
    const updated = { ...current, ...partial };
    this._config.set(updated);
    this.saveConfig(updated);
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): ChatConfig {
    if (!isPlatformBrowser(this.platformId)) {
      return { ...DEFAULT_CONFIG };
    }

    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new properties
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load configuration from localStorage:', error);
    }

    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(config: ChatConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(config));
      // Also save theme mode separately for quick access
      localStorage.setItem(this.THEME_STORAGE_KEY, config.colorMode);
    } catch (error) {
      console.warn('Failed to save configuration to localStorage:', error);
    }
  }

  /**
   * Initialize theme from storage or system preference
   */
  private initializeTheme(): void {
    // Configuration is already loaded in constructor
    // Apply initial theme
    this.applyTheme();
  }

  /**
   * Apply theme to DOM - centralized theme application
   */
  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const config = this._config();
    const isDark = this.isDark();
    const themeOption = this.currentThemeOption();

    // Update DOM classes for color mode
    this.updateColorModeClasses(isDark);

    // Update CSS custom properties for colors
    if (themeOption) {
      this.updateThemeColors(themeOption);
    }

    // Update layout classes
    this.updateLayoutClasses(config);

    // Update accessibility classes
    this.updateAccessibilityClasses(config.accessibility);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(isDark);
  }

  /**
   * Update color mode classes on DOM
   */
  private updateColorModeClasses(isDark: boolean): void {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const overlayContainerElement = this.overlayContainer.getContainerElement();

    // Update document and overlay classes
    if (isDark) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark-theme');
      bodyElement.classList.remove('light-theme');
      overlayContainerElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.add('light-theme');
      bodyElement.classList.remove('dark-theme');
      overlayContainerElement.classList.remove('dark');
    }
  }

  /**
   * Update theme colors as CSS custom properties
   */
  private updateThemeColors(themeOption: ThemeOption): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeOption.primaryColor);
    root.style.setProperty('--accent-color', themeOption.accentColor);
    
    // Add theme class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeOption.id}`);
  }

  /**
   * Update layout classes on DOM
   */
  private updateLayoutClasses(config: ChatConfig): void {
    const body = document.body;
    
    // Layout variant
    body.className = body.className.replace(/layout-\w+/g, '');
    body.classList.add(`layout-${config.layout}`);
    
    // Compact mode
    body.classList.toggle('compact-mode', config.compactMode);
    
    // Animations
    body.classList.toggle('no-animations', !config.animations);
  }

  /**
   * Update accessibility classes on DOM
   */
  private updateAccessibilityClasses(accessibility: AccessibilityConfig): void {
    const body = document.body;
    
    // High contrast
    body.classList.toggle('high-contrast', accessibility.highContrast);
    
    // Reduced motion
    body.classList.toggle('reduced-motion', accessibility.reducedMotion);
    
    // Font size
    body.className = body.className.replace(/font-size-\w+/g, '');
    body.classList.add(`font-size-${accessibility.fontSize}`);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(isDark: boolean): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = isDark ? '#1a1a1a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * Listen for system theme changes
   */
  private listenForSystemThemeChanges(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (this.colorMode() === 'auto') {
        // Trigger effect to re-apply theme
        this.applyTheme();
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Initial check
    handleChange();
  }
}
