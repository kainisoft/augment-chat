/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/chat/src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        accent: 'var(--accent-color)',
        warn: 'var(--warn-color)',
        background: 'var(--background-color)',
        surface: 'var(--surface-color)',
        'surface-variant': 'var(--surface-variant-color)',
        outline: 'var(--outline-color)',
        'on-surface': 'var(--on-surface-color)',
        'on-surface-variant': 'var(--on-surface-variant-color)',
        'primary-contrast': 'var(--primary-contrast-color)',
        secondary: 'var(--text-secondary-color)',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Prevent Tailwind from conflicting with Angular Material
  corePlugins: {
    preflight: false,
  },
}

