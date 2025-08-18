# Fuse-Inspired Theming System

This document describes the advanced theming system implemented in the Angular V2 workspace, inspired by the Fuse framework architecture.

## Overview

The theming system provides:
- **Dynamic theme switching** with smooth transitions
- **Multiple predefined themes** (Default, Indigo, Teal, Purple, Amber, Rose, Green)
- **Light and dark mode variants** for each theme
- **CSS custom properties** for runtime theme changes
- **Accessibility-first design** with WCAG compliance
- **Signal-based state management** for reactive theme updates
- **Palette generation utilities** using chroma.js

## Quick Start

### 1. Import the ThemeService

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from 'shared-lib';

@Component({
  selector: 'app-example',
  template: `
    <div class="fuse-card">
      <h1 class="text-text-default">Current theme: {{ themeService.themeDisplayName() }}</h1>
      <button (click)="toggleDarkMode()" class="fuse-button-primary">
        Toggle Dark Mode
      </button>
    </div>
  `
})
export class ExampleComponent {
  protected readonly themeService = inject(ThemeService);

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
```

### 2. Use Theme-Aware CSS Classes

The system provides pre-built CSS classes that automatically adapt to the current theme:

```html
<!-- Cards -->
<div class="fuse-card">
  <div class="fuse-card-header">
    <h2>Card Title</h2>
  </div>
  <p>Card content</p>
</div>

<!-- Buttons -->
<button class="fuse-button-primary">Primary Button</button>
<button class="fuse-button-accent">Accent Button</button>

<!-- Inputs -->
<input type="text" class="fuse-input" placeholder="Enter text...">

<!-- Navigation -->
<nav>
  <a href="#" class="fuse-nav-item">Home</a>
  <a href="#" class="fuse-nav-item active">Current Page</a>
</nav>
```

### 3. Use Tailwind Color Classes

All theme colors are available as Tailwind utilities:

```html
<!-- Primary colors -->
<div class="bg-primary text-white">Primary background</div>
<div class="bg-primary-100 text-primary-900">Light primary</div>

<!-- Accent colors -->
<div class="bg-accent text-white">Accent background</div>

<!-- Semantic colors -->
<div class="bg-bg-card text-text-default border border-border">
  Theme-aware card
</div>
```

## Available Themes

### Predefined Themes

1. **Default Blue** - Professional blue theme
2. **Indigo** - Rich indigo with pink accents
3. **Teal** - Calming teal with amber accents
4. **Purple** - Creative purple with green accents
5. **Amber** - Warm amber with brown accents
6. **Rose** - Elegant rose with cyan accents
7. **Green** - Natural green with orange accents

Each theme has both light and dark variants.

### Theme Structure

```typescript
interface ThemeConfig {
  name: string;
  displayName: string;
  primary: ColorPalette;    // 50-900 shades + contrast colors
  accent: ColorPalette;     // 50-900 shades + contrast colors
  warn: ColorPalette;       // 50-900 shades + contrast colors
  background: BackgroundPalette;
  foreground: ForegroundPalette;
  isDark: boolean;
}
```

## ThemeService API

### Properties (Signals)

```typescript
// Current theme configuration
readonly currentTheme: Signal<ThemeConfig>

// Available themes
readonly availableThemes: Signal<Record<string, ThemeConfig>>

// User preferences
readonly preferences: Signal<ThemePreferences>

// Computed properties
readonly isDarkMode: Signal<boolean>
readonly themeName: Signal<string>
readonly themeDisplayName: Signal<string>
```

### Methods

```typescript
// Set theme by name or configuration
setTheme(themeNameOrConfig: string | ThemeConfig): void

// Toggle between light and dark mode
toggleDarkMode(): void

// Set theme mode (light/dark/auto/system/time/manual)
setThemeMode(mode: ThemeMode): void

// Add custom theme
addCustomTheme(theme: ThemeConfig): void

// Remove custom theme
removeCustomTheme(themeName: string): void

// Validate theme configuration
validateTheme(theme: ThemeConfig): ThemeValidationResult

// Reset to default theme
resetToDefault(): void
```

## Custom Theme Creation

### Using Palette Generation

```typescript
import { generatePalette, ThemeConfig } from 'shared-lib';

const customTheme: ThemeConfig = {
  name: 'custom-theme',
  displayName: 'My Custom Theme',
  primary: generatePalette('#FF6B35'),
  accent: generatePalette('#4ECDC4'),
  warn: generatePalette('#FF5722'),
  background: {
    'bg-app-bar': '#ffffff',
    'bg-card': '#ffffff',
    'bg-default': '#f8fafc',
    'bg-dialog': '#ffffff',
    'bg-hover': '#f1f5f9',
    'bg-status-bar': '#e2e8f0',
  },
  foreground: {
    'text-default': '#1e293b',
    'text-secondary': '#64748b',
    'text-hint': '#94a3b8',
    'text-disabled': '#cbd5e1',
    border: '#e2e8f0',
    divider: '#f1f5f9',
    icon: '#64748b',
    'mat-icon': '#64748b',
  },
  isDark: false,
};

// Add to theme service
themeService.addCustomTheme(customTheme);
```

### Advanced Palette Options

```typescript
import { generatePalette, PaletteGenerationOptions } from 'shared-lib';

const options: PaletteGenerationOptions = {
  mode: 'lch',              // Color space: 'lch' | 'hsl' | 'lab'
  correctLightness: true,   // Perceptual lightness correction
  bezier: false,           // Use bezier curves for smoother transitions
  padding: 0.15,           // Padding for color scale
  samples: 9,              // Number of color samples
  gamma: 1                 // Gamma correction
};

const palette = generatePalette('#3B82F6', options);
```

## CSS Custom Properties

The theming system uses CSS custom properties for dynamic theme switching:

```css
:root {
  /* Primary colors */
  --fuse-primary-50: 239 246 255;
  --fuse-primary-500: 59 130 246;
  --fuse-primary-900: 30 58 138;
  
  /* Background colors */
  --fuse-bg-default: 248 250 252;
  --fuse-bg-card: 255 255 255;
  
  /* Text colors */
  --fuse-text-default: 30 41 59;
  --fuse-text-secondary: 100 116 139;
}
```

### Using CSS Custom Properties

```css
.my-component {
  background-color: rgb(var(--fuse-bg-card));
  color: rgb(var(--fuse-text-default));
  border: 1px solid rgb(var(--fuse-border));
}

/* With alpha values */
.my-overlay {
  background-color: rgb(var(--fuse-primary-500) / 0.1);
}
```

## Accessibility Features

### WCAG Compliance

- All color combinations meet WCAG AA standards (4.5:1 contrast ratio)
- Automatic contrast color calculation for text on colored backgrounds
- High contrast mode support

### Color Blindness Support

```typescript
import { adjustForColorBlindness } from 'shared-lib';

// Adjust colors for different types of color blindness
const protanopiaColor = adjustForColorBlindness('#FF0000', 'protanopia');
const deuteranopiaColor = adjustForColorBlindness('#00FF00', 'deuteranopia');
const tritanopiaColor = adjustForColorBlindness('#0000FF', 'tritanopia');
```

### Reduced Motion

```css
/* Automatically applied when user prefers reduced motion */
.reduce-motion {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

## Theme Transitions

Smooth transitions are automatically applied when switching themes:

```css
.fuse-theme-transitions * {
  transition: background-color, border-color, color, fill, stroke 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Best Practices

### 1. Use Semantic Color Names

```html
<!-- Good -->
<div class="bg-bg-card text-text-default">Content</div>

<!-- Avoid -->
<div class="bg-white text-black">Content</div>
```

### 2. Leverage Theme-Aware Components

```html
<!-- Use pre-built components -->
<div class="fuse-card">
  <button class="fuse-button-primary">Action</button>
</div>
```

### 3. Test with Multiple Themes

Always test your components with different themes and both light/dark modes.

### 4. Consider Accessibility

- Use sufficient color contrast
- Don't rely solely on color to convey information
- Test with color blindness simulators

## Integration with Angular Material

The theming system is designed to work alongside Angular Material:

```typescript
// You can extract theme colors for Material components
const currentTheme = themeService.currentTheme();
const primaryColor = currentTheme.primary[500];
```

## Performance Considerations

- CSS custom properties are updated efficiently using `DocumentElement.style.setProperty()`
- Theme transitions can be disabled during rapid theme switching to prevent performance issues
- Palette generation is cached to avoid recalculation

## Browser Support

- Modern browsers with CSS custom properties support
- Graceful fallback for older browsers
- Tested on Chrome, Firefox, Safari, and Edge

## Examples

Check out the `ThemeDemoComponent` for a complete example of theme integration:

```typescript
import { ThemeDemoComponent } from 'shared-lib';
```

This component demonstrates:
- Theme selection
- Dark mode toggling
- Color palette display
- Theme-aware components
- Form controls with theming