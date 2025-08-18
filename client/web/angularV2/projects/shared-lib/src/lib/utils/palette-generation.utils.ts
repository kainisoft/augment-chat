/**
 * Palette generation utilities using chroma.js for the Fuse-inspired theming system
 */

import chroma from 'chroma-js';
import { ColorPalette, ContrastPalette, PaletteGenerationOptions, ColorShade } from '../models/theme.model';

/**
 * Generate a complete color palette from a base color
 */
export function generatePalette(
  baseColor: string,
  options: PaletteGenerationOptions = {}
): ColorPalette {
  const {
    mode = 'lch',
    correctLightness = true,
    bezier = false,
    padding = 0.15,
    samples = 9,
    gamma = 1
  } = options;

  try {
    const base = chroma(baseColor);
    
    // Generate color scale using chroma.js
    const colors = bezier 
      ? generateBezierScale(base, samples, mode)
      : generateLinearScale(base, samples, mode, correctLightness, padding, gamma);

    // Map to Material Design palette structure
    const palette: Omit<ColorPalette, 'contrast'> = {
      50: colors[0],
      100: colors[1],
      200: colors[2],
      300: colors[3],
      400: colors[4],
      500: colors[5], // Base color
      600: colors[6],
      700: colors[7],
      800: colors[8],
      900: colors[9] || colors[8], // Fallback to 800 if not enough colors
      DEFAULT: colors[5],
    };

    // Generate contrast colors for each shade
    const contrast = generateContrastPalette(palette);

    return {
      ...palette,
      contrast,
    };
  } catch (error) {
    console.error('Error generating palette:', error);
    // Return a fallback palette
    return generateFallbackPalette(baseColor);
  }
}

/**
 * Generate a linear color scale
 */
function generateLinearScale(
  baseColor: chroma.Color,
  samples: number,
  mode: string,
  correctLightness: boolean,
  padding: number,
  gamma: number
): string[] {
  const lightness = baseColor.get('hsl.l');
  
  // Calculate range based on base color lightness
  const minLightness = Math.max(0.05, lightness - 0.4);
  const maxLightness = Math.min(0.95, lightness + 0.4);
  
  // Create scale from light to dark
  const scale = chroma.scale([
    baseColor.set('hsl.l', maxLightness),
    baseColor,
    baseColor.set('hsl.l', minLightness)
  ])
  .mode(mode as any)
  .correctLightness(correctLightness)
  .padding(padding)
  .gamma(gamma)
  .colors(samples + 1); // +1 to account for the base color

  return scale.map(color => chroma(color).hex());
}

/**
 * Generate a bezier-based color scale for more natural color transitions
 */
function generateBezierScale(
  baseColor: chroma.Color,
  samples: number,
  mode: string
): string[] {
  const hue = baseColor.get('hsl.h');
  const saturation = baseColor.get('hsl.s');
  
  // Create bezier curve with complementary colors
  const colors = [
    chroma.hsl(hue, saturation * 0.1, 0.95).hex(), // Very light
    chroma.hsl(hue, saturation * 0.3, 0.85).hex(), // Light
    chroma.hsl(hue, saturation * 0.6, 0.7).hex(),  // Medium light
    baseColor.hex(),                                // Base
    chroma.hsl(hue, saturation * 1.1, 0.4).hex(),  // Medium dark
    chroma.hsl(hue, saturation * 1.2, 0.2).hex(),  // Dark
    chroma.hsl(hue, saturation * 0.8, 0.1).hex(),  // Very dark
  ];

  const scale = chroma.scale(colors)
    .mode(mode as any)
    .colors(samples + 1);

  return scale.map((color: any) => chroma(color).hex());
}

/**
 * Generate contrast colors for accessibility
 */
function generateContrastPalette(palette: Omit<ColorPalette, 'contrast'>): ContrastPalette {
  const contrastColors: Partial<ContrastPalette> = {};
  
  Object.entries(palette).forEach(([shade, color]) => {
    if (shade === 'DEFAULT') {
      contrastColors.DEFAULT = getContrastColor(color);
    } else {
      contrastColors[shade as keyof ContrastPalette] = getContrastColor(color);
    }
  });

  return contrastColors as ContrastPalette;
}

/**
 * Get the best contrast color (black or white) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  try {
    const color = chroma(backgroundColor);
    const luminance = color.luminance();
    
    // Use WCAG contrast ratio guidelines
    // If luminance > 0.5, use dark text, otherwise use light text
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch (error) {
    console.error('Error calculating contrast color:', error);
    return '#000000'; // Default to black
  }
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  try {
    return chroma.contrast(color1, color2);
  } catch (error) {
    console.error('Error calculating contrast ratio:', error);
    return 1; // Minimum contrast ratio
  }
}

/**
 * Check if color combination meets WCAG accessibility standards
 */
export function meetsWCAGStandards(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= minRatio;
}

/**
 * Generate a fallback palette when color generation fails
 */
function generateFallbackPalette(baseColor: string): ColorPalette {
  const fallbackColors = {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: baseColor || '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    DEFAULT: baseColor || '#64748b',
  };

  return {
    ...fallbackColors,
    contrast: generateContrastPalette(fallbackColors),
  };
}

/**
 * Convert hex color to RGB values for CSS custom properties
 */
export function hexToRgb(hex: string): string {
  try {
    const rgb = chroma(hex).rgb();
    return `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
  } catch (error) {
    console.error('Error converting hex to RGB:', error);
    return '0 0 0';
  }
}

/**
 * Generate color variations for hover, active, and disabled states
 */
export function generateColorVariations(baseColor: string): {
  hover: string;
  active: string;
  disabled: string;
  focus: string;
} {
  try {
    const base = chroma(baseColor);
    
    return {
      hover: base.brighten(0.1).hex(),
      active: base.darken(0.1).hex(),
      disabled: base.alpha(0.5).css(),
      focus: base.alpha(0.8).css(),
    };
  } catch (error) {
    console.error('Error generating color variations:', error);
    return {
      hover: baseColor,
      active: baseColor,
      disabled: baseColor,
      focus: baseColor,
    };
  }
}

/**
 * Adjust color for color blindness accessibility
 */
export function adjustForColorBlindness(
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): string {
  try {
    const baseColor = chroma(color);
    const [h, s, l] = baseColor.hsl();
    
    switch (type) {
      case 'protanopia':
        // Adjust red-green color blindness
        return chroma.hsl(h > 180 ? h : h + 30, s * 0.8, l).hex();
      case 'deuteranopia':
        // Adjust green-red color blindness
        return chroma.hsl(h < 180 ? h : h - 30, s * 0.8, l).hex();
      case 'tritanopia':
        // Adjust blue-yellow color blindness
        return chroma.hsl(h > 90 && h < 270 ? h + 45 : h, s, l).hex();
      default:
        return color;
    }
  } catch (error) {
    console.error('Error adjusting color for color blindness:', error);
    return color;
  }
}

/**
 * Generate a harmonious color scheme based on color theory
 */
export function generateColorScheme(
  baseColor: string,
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
): string[] {
  try {
    const base = chroma(baseColor);
    const hue = base.get('hsl.h');
    const saturation = base.get('hsl.s');
    const lightness = base.get('hsl.l');
    
    switch (type) {
      case 'monochromatic':
        return [
          chroma.hsl(hue, saturation, lightness * 1.2).hex(),
          baseColor,
          chroma.hsl(hue, saturation, lightness * 0.8).hex(),
        ];
      
      case 'analogous':
        return [
          chroma.hsl(hue - 30, saturation, lightness).hex(),
          baseColor,
          chroma.hsl(hue + 30, saturation, lightness).hex(),
        ];
      
      case 'complementary':
        return [
          baseColor,
          chroma.hsl(hue + 180, saturation, lightness).hex(),
        ];
      
      case 'triadic':
        return [
          baseColor,
          chroma.hsl(hue + 120, saturation, lightness).hex(),
          chroma.hsl(hue + 240, saturation, lightness).hex(),
        ];
      
      case 'tetradic':
        return [
          baseColor,
          chroma.hsl(hue + 90, saturation, lightness).hex(),
          chroma.hsl(hue + 180, saturation, lightness).hex(),
          chroma.hsl(hue + 270, saturation, lightness).hex(),
        ];
      
      default:
        return [baseColor];
    }
  } catch (error) {
    console.error('Error generating color scheme:', error);
    return [baseColor];
  }
}