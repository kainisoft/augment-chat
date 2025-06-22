import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface IconConfig {
  name: string;
  svgIcon?: string;
  fontIcon?: string;
  fontSet?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  // Chat-specific icons mapping
  private readonly chatIcons: IconConfig[] = [
    // Message icons
    { name: 'send', fontIcon: 'send', fontSet: 'material-icons' },
    { name: 'attach', fontIcon: 'attach_file', fontSet: 'material-icons' },
    { name: 'emoji', fontIcon: 'emoji_emotions', fontSet: 'material-icons' },
    { name: 'mic', fontIcon: 'mic', fontSet: 'material-icons' },
    { name: 'image', fontIcon: 'image', fontSet: 'material-icons' },

    // Navigation icons
    { name: 'menu', fontIcon: 'menu', fontSet: 'material-icons' },
    { name: 'back', fontIcon: 'arrow_back', fontSet: 'material-icons' },
    { name: 'close', fontIcon: 'close', fontSet: 'material-icons' },
    { name: 'search', fontIcon: 'search', fontSet: 'material-icons' },
    { name: 'more', fontIcon: 'more_vert', fontSet: 'material-icons' },

    // User icons
    { name: 'person', fontIcon: 'person', fontSet: 'material-icons' },
    { name: 'group', fontIcon: 'group', fontSet: 'material-icons' },
    { name: 'account', fontIcon: 'account_circle', fontSet: 'material-icons' },

    // Status icons
    { name: 'online', fontIcon: 'circle', fontSet: 'material-icons' },
    { name: 'offline', fontIcon: 'radio_button_unchecked', fontSet: 'material-icons' },
    { name: 'typing', fontIcon: 'more_horiz', fontSet: 'material-icons' },
    { name: 'delivered', fontIcon: 'done', fontSet: 'material-icons' },
    { name: 'read', fontIcon: 'done_all', fontSet: 'material-icons' },

    // Settings icons
    { name: 'settings', fontIcon: 'settings', fontSet: 'material-icons' },
    { name: 'theme', fontIcon: 'palette', fontSet: 'material-icons' },
    { name: 'notifications', fontIcon: 'notifications', fontSet: 'material-icons' },
    { name: 'logout', fontIcon: 'logout', fontSet: 'material-icons' },

    // Chat room icons
    { name: 'chat', fontIcon: 'chat', fontSet: 'material-icons' },
    { name: 'video-call', fontIcon: 'videocam', fontSet: 'material-icons' },
    { name: 'voice-call', fontIcon: 'call', fontSet: 'material-icons' },
    { name: 'info', fontIcon: 'info', fontSet: 'material-icons' },

    // File icons
    { name: 'file', fontIcon: 'description', fontSet: 'material-icons' },
    { name: 'download', fontIcon: 'download', fontSet: 'material-icons' },
    { name: 'upload', fontIcon: 'upload', fontSet: 'material-icons' },

    // Theme icons
    { name: 'light-mode', fontIcon: 'light_mode', fontSet: 'material-icons' },
    { name: 'dark-mode', fontIcon: 'dark_mode', fontSet: 'material-icons' },
    { name: 'auto-mode', fontIcon: 'brightness_auto', fontSet: 'material-icons' },
  ];

  constructor() {
    this.registerChatIcons();
    this.registerMaterialIconsFont();
  }

  /**
   * Register all chat-specific icons
   */
  private registerChatIcons(): void {
    this.chatIcons.forEach(icon => {
      if (icon.svgIcon) {
        this.iconRegistry.addSvgIcon(
          icon.name,
          this.sanitizer.bypassSecurityTrustResourceUrl(icon.svgIcon)
        );
      }
    });
  }

  /**
   * Register Material Icons font set
   */
  private registerMaterialIconsFont(): void {
    // Set the default font set to Material Icons
    this.iconRegistry.setDefaultFontSetClass('material-icons');

    // Register Material Icons as the default font set
    this.iconRegistry.registerFontClassAlias('material-icons', 'material-icons');
  }

  /**
   * Get icon configuration by name
   */
  getIconConfig(name: string): IconConfig | undefined {
    return this.chatIcons.find(icon => icon.name === name);
  }

  /**
   * Check if an icon exists
   */
  hasIcon(name: string): boolean {
    return this.chatIcons.some(icon => icon.name === name);
  }

  /**
   * Get all available icon names
   */
  getAvailableIcons(): string[] {
    return this.chatIcons.map(icon => icon.name);
  }

  /**
   * Register a custom icon
   */
  registerIcon(config: IconConfig): void {
    if (config.svgIcon) {
      this.iconRegistry.addSvgIcon(
        config.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(config.svgIcon)
      );
    }

    // Add to our internal registry
    const existingIndex = this.chatIcons.findIndex(icon => icon.name === config.name);
    if (existingIndex >= 0) {
      this.chatIcons[existingIndex] = config;
    } else {
      this.chatIcons.push(config);
    }
  }

  /**
   * Register multiple icons at once
   */
  registerIcons(configs: IconConfig[]): void {
    configs.forEach(config => this.registerIcon(config));
  }

  /**
   * Get Material Icon font class
   */
  getMaterialIconClass(iconName: string): string {
    const config = this.getIconConfig(iconName);
    return config?.fontIcon || iconName;
  }

  /**
   * Get theme-specific icon name
   */
  getThemeIcon(theme: 'light' | 'dark' | 'auto'): string {
    switch (theme) {
      case 'light':
        return 'light-mode';
      case 'dark':
        return 'dark-mode';
      case 'auto':
        return 'auto-mode';
      default:
        return 'auto-mode';
    }
  }

  /**
   * Get status icon based on user status
   */
  getStatusIcon(status: 'online' | 'offline' | 'away' | 'busy'): string {
    switch (status) {
      case 'online':
        return 'online';
      case 'offline':
        return 'offline';
      case 'away':
        return 'offline';
      case 'busy':
        return 'offline';
      default:
        return 'offline';
    }
  }

  /**
   * Get message status icon
   */
  getMessageStatusIcon(status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'): string {
    switch (status) {
      case 'sending':
        return 'more_horiz';
      case 'sent':
        return 'done';
      case 'delivered':
        return 'done';
      case 'read':
        return 'done_all';
      case 'failed':
        return 'error';
      default:
        return 'done';
    }
  }
}
