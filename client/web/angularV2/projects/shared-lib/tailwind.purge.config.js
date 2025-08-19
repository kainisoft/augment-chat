/**
 * Tailwind CSS purging configuration for library builds
 * This configuration is used to create highly optimized builds with minimal CSS
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/**/*.scss',
    './src/**/*.css'
  ],
  
  // Aggressive purging for production library builds
  safelist: [
    // Always include these classes even if not detected
    'loading',
    'loading__spinner',
    'loading__spinner-circle',
    'loading__skeleton',
    'loading__skeleton-avatar',
    'loading__skeleton-content',
    'loading__skeleton-line',
    'loading__dots',
    'loading__dot',
    'loading__pulse',
    'loading__message',
    
    // Dynamic classes that might not be detected
    {
      pattern: /^loading__(spinner|skeleton|dots|pulse|message)/,
      variants: ['hover', 'focus', 'active']
    },
    
    // Data attribute selectors
    {
      pattern: /^loading\[data-(size|type)="(sm|md|lg|spinner|skeleton|dots|pulse)"\]/
    },
    
    // Dark mode variants
    {
      pattern: /^dark:/,
      variants: ['dark']
    },
    
    // Animation classes
    'animate-spin',
    'animate-pulse',
    'animate-bounce',
    
    // Essential utility classes that might be used dynamically
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'relative',
    'absolute',
    'w-full',
    'h-full',
    'rounded',
    'rounded-full',
    'border',
    'bg-gray-200',
    'text-gray-600'
  ],
  
  // Minimal theme for purged builds
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      gray: {
        200: '#e5e7eb',
        400: '#9ca3af',
        600: '#4b5563',
        700: '#374151'
      },
      blue: {
        500: '#3b82f6'
      }
    },
    
    spacing: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem'
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    
    animation: {
      spin: 'spin 1s linear infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite'
    },
    
    keyframes: {
      spin: {
        to: { transform: 'rotate(360deg)' }
      },
      pulse: {
        '50%': { opacity: '0.5' }
      },
      bounce: {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
        },
        '50%': {
          transform: 'none',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
        }
      }
    }
  },
  
  plugins: [],
  
  // Highly restrictive core plugins for minimal builds
  corePlugins: {
    preflight: false,
    container: false,
    accessibility: false,
    
    // Only the most essential utilities
    display: true,
    position: true,
    flexDirection: true,
    flexWrap: true,
    alignItems: true,
    justifyContent: true,
    gap: true,
    padding: true,
    margin: true,
    width: true,
    height: true,
    backgroundColor: true,
    textColor: true,
    fontSize: true,
    fontWeight: true,
    borderRadius: true,
    borderWidth: true,
    borderColor: true,
    opacity: true,
    animation: true,
    transform: true
  }
}