/**
 * Color utility functions for theming and design
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert hex to RGB string
 */
export function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '';
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent);

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent);

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Calculate color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG accessibility standards
 */
export function meetsWCAGStandards(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get the best contrast color (black or white) for a background
 */
export function getBestContrastColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Generate a color palette from a base color
 */
export function generatePalette(baseColor: string): Record<string, string> {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return {};

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const palette: Record<string, string> = {};
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  
  shades.forEach(shade => {
    let lightness;
    if (shade === 500) {
      lightness = hsl.l;
    } else if (shade < 500) {
      // Lighter shades
      const factor = (500 - shade) / 450; // 0 to 1
      lightness = hsl.l + (95 - hsl.l) * factor;
    } else {
      // Darker shades
      const factor = (shade - 500) / 400; // 0 to 1
      lightness = hsl.l - hsl.l * factor * 0.8;
    }
    
    const newRgb = hslToRgb(hsl.h, hsl.s, Math.max(0, Math.min(100, lightness)));
    palette[shade.toString()] = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  });
  
  // Add DEFAULT as alias for 500
  palette['DEFAULT'] = palette['500'];
  
  return palette;
}

/**
 * Mix two colors
 */
export function mixColors(color1: string, color2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
  
  return rgbToHex(r, g, b);
}

/**
 * Check if a color is considered "dark"
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Calculate perceived brightness
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128;
}

/**
 * Check if a color is considered "light"
 */
export function isLightColor(hex: string): boolean {
  return !isDarkColor(hex);
}

/**
 * Generate complementary color
 */
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Generate analogous colors
 */
export function getAnalogousColors(hex: string, count: number = 2): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  const step = 30; // degrees
  
  for (let i = 1; i <= count; i++) {
    const newHsl = { ...hsl };
    newHsl.h = (hsl.h + (step * i)) % 360;
    
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  
  return colors;
}

/**
 * Generate triadic colors
 */
export function getTriadicColors(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  
  for (let i = 1; i <= 2; i++) {
    const newHsl = { ...hsl };
    newHsl.h = (hsl.h + (120 * i)) % 360;
    
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  
  return colors;
}