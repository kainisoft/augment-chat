const path = require('path');

// Determine which Tailwind config to use based on environment
const isProduction = process.env.NODE_ENV === 'production';
const isPurgeMode = process.env.TAILWIND_MODE === 'purge';

let tailwindConfig = './tailwind.lib.config.js';
if (isPurgeMode) {
  tailwindConfig = './tailwind.purge.config.js';
}

module.exports = {
  plugins: {
    'postcss-import': {
      // Allow imports from the workspace root and library src
      path: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '../../src')
      ]
    },
    'tailwindcss': {
      config: path.resolve(__dirname, tailwindConfig)
    },
    'postcss-nested': {},
    'autoprefixer': {
      // Optimize for modern browsers in library builds
      overrideBrowserslist: [
        'last 2 versions',
        'not dead',
        'not < 2%'
      ]
    },
    // Add cssnano for production builds
    ...(isProduction && {
      'cssnano': {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifySelectors: true
        }]
      }
    })
  }
}