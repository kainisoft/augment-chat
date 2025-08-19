/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/**/*.scss',
    './src/**/*.css'
  ],
  // Optimize for library builds - minimal but complete configuration
  theme: {
    // Use a curated set of design tokens optimized for library components
    colors: {
      // Transparent and current for utility
      transparent: 'transparent',
      current: 'currentColor',
      
      // Essential grayscale palette
      white: '#ffffff',
      black: '#000000',
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
      },
      
      // Primary color palette for library components
      primary: {
        50: '#eff6ff',
        100: '#dbeafe', 
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        DEFAULT: '#3b82f6'
      },
      
      // Success, warning, and error colors for UI states
      green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        DEFAULT: '#22c55e'
      },
      yellow: {
        50: '#fefce8',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        DEFAULT: '#f59e0b'
      },
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        DEFAULT: '#ef4444'
      }
    },
    
    // Essential spacing scale
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    },
    
    // Essential font sizes
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
    },
    
    // Essential border radius values
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    },
    
    // Essential shadows
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      none: 'none'
    },
    
    // Essential animations for library components
    animation: {
      none: 'none',
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite'
    },
    
    // Essential keyframes
    keyframes: {
      spin: {
        to: { transform: 'rotate(360deg)' }
      },
      ping: {
        '75%, 100%': { transform: 'scale(2)', opacity: '0' }
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
    },
    
    extend: {
      // Additional library-specific extensions can be added here
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100'
      }
    }
  },
  
  // No plugins for minimal library build
  plugins: [],
  
  // Highly optimized core plugins for library builds
  corePlugins: {
    // Disable base styles and resets
    preflight: false,
    
    // Disable layout utilities not needed for components
    container: false,
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
    boxDecorationBreak: false,
    
    // Disable accessibility utilities (handled by components)
    accessibility: false,
    
    // Enable essential layout utilities
    display: true,
    position: true,
    inset: true,
    isolation: false,
    zIndex: true,
    order: false,
    gridColumn: false,
    gridColumnStart: false,
    gridColumnEnd: false,
    gridRow: false,
    gridRowStart: false,
    gridRowEnd: false,
    
    // Enable flexbox utilities
    flexDirection: true,
    flexWrap: true,
    flex: true,
    flexGrow: true,
    flexShrink: true,
    
    // Enable grid utilities (minimal)
    gridAutoColumns: false,
    gridAutoFlow: false,
    gridAutoRows: false,
    gridTemplateColumns: false,
    gridTemplateRows: false,
    
    // Enable essential spacing
    gap: true,
    space: true,
    padding: true,
    margin: true,
    
    // Enable sizing utilities
    width: true,
    minWidth: true,
    maxWidth: true,
    height: true,
    minHeight: true,
    maxHeight: true,
    
    // Enable typography utilities
    fontFamily: false, // Let consuming apps handle fonts
    fontSize: true,
    fontWeight: true,
    fontVariantNumeric: false,
    letterSpacing: false,
    lineHeight: true,
    listStyleImage: false,
    listStylePosition: false,
    listStyleType: false,
    textAlign: true,
    textColor: true,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textUnderlineOffset: false,
    textTransform: false,
    textOverflow: true,
    textIndent: false,
    verticalAlign: true,
    whitespace: true,
    wordBreak: false,
    hyphens: false,
    content: false,
    
    // Enable background utilities
    backgroundAttachment: false,
    backgroundClip: false,
    backgroundColor: true,
    backgroundOrigin: false,
    backgroundPosition: false,
    backgroundRepeat: false,
    backgroundSize: false,
    backgroundImage: false,
    
    // Enable border utilities
    borderRadius: true,
    borderWidth: true,
    borderColor: true,
    borderStyle: true,
    divideWidth: false,
    divideColor: false,
    divideStyle: false,
    borderSpacing: false,
    
    // Enable effects
    boxShadow: true,
    boxShadowColor: false,
    opacity: true,
    mixBlendMode: false,
    backgroundBlendMode: false,
    
    // Disable filters (not commonly needed in library components)
    blur: false,
    brightness: false,
    contrast: false,
    dropShadow: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    
    // Disable tables (not needed for library components)
    borderCollapse: false,
    borderSpacing: false,
    tableLayout: false,
    captionSide: false,
    
    // Enable essential transforms and transitions
    transform: true,
    transformOrigin: true,
    scale: true,
    rotate: true,
    translate: true,
    skew: false,
    
    // Enable transitions and animations
    transitionProperty: true,
    transitionDelay: true,
    transitionDuration: true,
    transitionTimingFunction: true,
    animation: true,
    
    // Enable interactivity
    appearance: false,
    cursor: true,
    outline: true,
    outlineColor: false,
    outlineOffset: false,
    outlineStyle: false,
    outlineWidth: false,
    pointerEvents: true,
    resize: false,
    scrollBehavior: false,
    scrollMargin: false,
    scrollPadding: false,
    scrollSnapAlign: false,
    scrollSnapStop: false,
    scrollSnapType: false,
    touchAction: false,
    userSelect: false,
    willChange: false,
    
    // Enable SVG utilities
    fill: true,
    stroke: true,
    strokeWidth: true,
    
    // Disable print utilities
    screenReaders: false
  }
}