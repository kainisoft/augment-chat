import {
  detectTailwindLoading,
  detectAnimationSupport,
  detectCustomPropertiesSupport,
  detectStyleCapabilities,
  createFallbackStyles,
  applyFallbackStyles,
  removeFallbackStyles,
  DEFAULT_FALLBACK_STYLES
} from './style-detection.utils';

describe('Style Detection Utilities', () => {

  describe('detectTailwindLoading', () => {
    it('should be a function', () => {
      expect(typeof detectTailwindLoading).toBe('function');
    });

    it('should return a boolean', () => {
      const result = detectTailwindLoading();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('detectAnimationSupport', () => {
    it('should be a function', () => {
      expect(typeof detectAnimationSupport).toBe('function');
    });

    it('should return a boolean', () => {
      const result = detectAnimationSupport();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('detectCustomPropertiesSupport', () => {
    it('should be a function', () => {
      expect(typeof detectCustomPropertiesSupport).toBe('function');
    });

    it('should return a boolean', () => {
      const result = detectCustomPropertiesSupport();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('detectStyleCapabilities', () => {
    it('should return comprehensive detection results', () => {
      const result = detectStyleCapabilities();
      
      expect(result).toBeDefined();
      expect(typeof result.tailwindLoaded).toBe('boolean');
      expect(typeof result.animationsSupported).toBe('boolean');
      expect(typeof result.customPropertiesSupported).toBe('boolean');
      expect(typeof result.fallbackRequired).toBe('boolean');
    });
  });

  describe('createFallbackStyles', () => {
    it('should return empty string when fallbacks disabled', () => {
      const config = { enableFallbacks: false, fallbackStyles: {}, criticalClasses: [] };
      const result = createFallbackStyles(config);
      
      expect(result).toBe('');
    });

    it('should create CSS from fallback styles', () => {
      const config = {
        enableFallbacks: true,
        fallbackStyles: {
          '.test': 'color: red;',
          '.another': 'font-size: 16px;'
        },
        criticalClasses: []
      };
      
      const result = createFallbackStyles(config);
      
      expect(result).toContain('.test { color: red; }');
      expect(result).toContain('.another { font-size: 16px; }');
    });
  });

  describe('applyFallbackStyles', () => {
    it('should be a function', () => {
      expect(typeof applyFallbackStyles).toBe('function');
    });

    it('should not throw error when called', () => {
      expect(() => applyFallbackStyles('test css')).not.toThrow();
    });
  });

  describe('removeFallbackStyles', () => {
    it('should be a function', () => {
      expect(typeof removeFallbackStyles).toBe('function');
    });

    it('should not throw error when called', () => {
      expect(() => removeFallbackStyles('test-id')).not.toThrow();
    });
  });

  describe('DEFAULT_FALLBACK_STYLES', () => {
    it('should have correct structure', () => {
      expect(DEFAULT_FALLBACK_STYLES.enableFallbacks).toBe(true);
      expect(typeof DEFAULT_FALLBACK_STYLES.fallbackStyles).toBe('object');
      expect(Array.isArray(DEFAULT_FALLBACK_STYLES.criticalClasses)).toBe(true);
    });

    it('should include essential CSS classes', () => {
      const styles = DEFAULT_FALLBACK_STYLES.fallbackStyles;
      
      expect(styles['.lib-flex']).toBe('display: flex;');
      expect(styles['.lib-items-center']).toBe('align-items: center;');
      expect(styles['.lib-justify-center']).toBe('justify-content: center;');
    });

    it('should include animation classes', () => {
      const styles = DEFAULT_FALLBACK_STYLES.fallbackStyles;
      
      expect(styles['.lib-animate-spin']).toContain('animation');
      expect(styles['.lib-animate-pulse']).toContain('animation');
      expect(styles['.lib-animate-bounce']).toContain('animation');
    });

    it('should include critical classes in the list', () => {
      const criticalClasses = DEFAULT_FALLBACK_STYLES.criticalClasses;
      
      expect(criticalClasses).toContain('lib-flex');
      expect(criticalClasses).toContain('lib-items-center');
      expect(criticalClasses).toContain('lib-animate-spin');
    });
  });
});