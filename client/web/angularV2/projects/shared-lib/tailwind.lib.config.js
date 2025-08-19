/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/**/*.scss'
  ],
  // Use a minimal, essential configuration for library builds
  theme: {
    extend: {
      // Only include essential theme extensions for the library
      colors: {
        // Essential colors that the library components need
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Default primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          DEFAULT: '#6b7280'
        }
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite'
      }
    }
  },
  // Only include plugins that are essential for library components
  plugins: [],
  // Optimize for library builds
  corePlugins: {
    // Disable plugins that aren't needed for library components
    preflight: false, // Don't include base styles in library
    container: false,
    accessibility: false,
    // Keep essential utilities
    display: true,
    flexbox: true,
    grid: true,
    spacing: true,
    sizing: true,
    typography: true,
    backgrounds: true,
    borders: true,
    effects: true,
    filters: true,
    interactivity: true,
    layout: true,
    svg: true,
    tables: false,
    transforms: true,
    transitionProperty: true,
    transitionDelay: true,
    transitionDuration: true,
    transitionTimingFunction: true,
    animation: true
  }
}