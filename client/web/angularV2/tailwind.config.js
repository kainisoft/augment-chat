/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./projects/**/src/**/*.{html,ts}",
    "!./projects/**/node_modules/**",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette for theming
        primary: {
          50: 'rgb(var(--fuse-primary-50) / <alpha-value>)',
          100: 'rgb(var(--fuse-primary-100) / <alpha-value>)',
          200: 'rgb(var(--fuse-primary-200) / <alpha-value>)',
          300: 'rgb(var(--fuse-primary-300) / <alpha-value>)',
          400: 'rgb(var(--fuse-primary-400) / <alpha-value>)',
          500: 'rgb(var(--fuse-primary-500) / <alpha-value>)',
          600: 'rgb(var(--fuse-primary-600) / <alpha-value>)',
          700: 'rgb(var(--fuse-primary-700) / <alpha-value>)',
          800: 'rgb(var(--fuse-primary-800) / <alpha-value>)',
          900: 'rgb(var(--fuse-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--fuse-primary-500) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--fuse-accent-50) / <alpha-value>)',
          100: 'rgb(var(--fuse-accent-100) / <alpha-value>)',
          200: 'rgb(var(--fuse-accent-200) / <alpha-value>)',
          300: 'rgb(var(--fuse-accent-300) / <alpha-value>)',
          400: 'rgb(var(--fuse-accent-400) / <alpha-value>)',
          500: 'rgb(var(--fuse-accent-500) / <alpha-value>)',
          600: 'rgb(var(--fuse-accent-600) / <alpha-value>)',
          700: 'rgb(var(--fuse-accent-700) / <alpha-value>)',
          800: 'rgb(var(--fuse-accent-800) / <alpha-value>)',
          900: 'rgb(var(--fuse-accent-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--fuse-accent-500) / <alpha-value>)',
        },
        warn: {
          50: 'rgb(var(--fuse-warn-50) / <alpha-value>)',
          100: 'rgb(var(--fuse-warn-100) / <alpha-value>)',
          200: 'rgb(var(--fuse-warn-200) / <alpha-value>)',
          300: 'rgb(var(--fuse-warn-300) / <alpha-value>)',
          400: 'rgb(var(--fuse-warn-400) / <alpha-value>)',
          500: 'rgb(var(--fuse-warn-500) / <alpha-value>)',
          600: 'rgb(var(--fuse-warn-600) / <alpha-value>)',
          700: 'rgb(var(--fuse-warn-700) / <alpha-value>)',
          800: 'rgb(var(--fuse-warn-800) / <alpha-value>)',
          900: 'rgb(var(--fuse-warn-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--fuse-warn-500) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}