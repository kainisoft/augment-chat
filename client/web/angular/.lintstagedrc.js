module.exports = {
  // TypeScript files
  '**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit', // Type check all files
  ],
  
  // HTML template files
  '**/*.html': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Style files
  '**/*.{css,scss,sass}': [
    'prettier --write',
  ],
  
  // JSON files
  '**/*.json': [
    'prettier --write',
  ],
  
  // Markdown files
  '**/*.md': [
    'prettier --write',
  ],
  
  // Angular specific files
  'projects/**/*.{ts,html}': [
    'ng lint --fix',
  ],
};
