/**
 * Shared Library Main Export - Optimized for tree-shaking
 * 
 * This file serves as an alternative entry point for the shared library.
 * It re-exports everything from the main index for compatibility.
 * 
 * Note: For optimal tree-shaking, prefer importing from the main index
 * or specific barrel files (./components, ./services, ./models, ./utils)
 */

// Re-export everything from the main index
export * from './index';
