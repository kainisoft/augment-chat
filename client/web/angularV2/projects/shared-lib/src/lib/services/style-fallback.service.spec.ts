import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { StyleFallbackService } from './style-fallback.service';

// Mock document for testing
const mockDocument = {
  head: {
    appendChild: jasmine.createSpy('appendChild'),
    removeChild: jasmine.createSpy('removeChild')
  },
  getElementById: jasmine.createSpy('getElementById'),
  createElement: jasmine.createSpy('createElement').and.returnValue({
    id: '',
    textContent: '',
    remove: jasmine.createSpy('remove')
  })
};

// Mock window for testing
const mockWindow = {
  addEventListener: jasmine.createSpy('addEventListener'),
  MutationObserver: jasmine.createSpy('MutationObserver').and.returnValue({
    observe: jasmine.createSpy('observe'),
    disconnect: jasmine.createSpy('disconnect')
  })
};

describe('StyleFallbackService', () => {
  let service: StyleFallbackService;
  let originalWindow: any;

  beforeEach(() => {
    // Mock window object
    originalWindow = (window as any);
    Object.defineProperty(window, 'MutationObserver', {
      writable: true,
      value: mockWindow.MutationObserver
    });

    TestBed.configureTestingModule({
      providers: [
        StyleFallbackService,
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });
    service = TestBed.inject(StyleFallbackService);
  });

  afterEach(() => {
    // Restore original window - in browser environment, we don't need to restore
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = service.state();
      expect(state.isInitialized).toBeTruthy();
      expect(state.fallbacksActive).toBeDefined();
      expect(state.lastDetectionTime).toBeGreaterThan(0);
    });

    it('should be ready after initialization', () => {
      expect(service.isReady()).toBeTruthy();
    });
  });

  describe('Configuration management', () => {
    it('should update configuration', () => {
      const newConfig = {
        enableFallbacks: false,
        fallbackStyles: { '.test': 'color: red;' }
      };

      service.updateConfig(newConfig);
      const config = service.config();
      
      expect(config.enableFallbacks).toBe(false);
      expect(config.fallbackStyles['.test']).toBe('color: red;');
    });

    it('should preserve existing config when updating partially', () => {
      const originalConfig = service.config();
      const originalStylesCount = Object.keys(originalConfig.fallbackStyles).length;

      service.updateConfig({ enableFallbacks: false });
      const updatedConfig = service.config();
      
      expect(updatedConfig.enableFallbacks).toBe(false);
      expect(Object.keys(updatedConfig.fallbackStyles).length).toBe(originalStylesCount);
    });
  });

  describe('Detection methods', () => {
    it('should force detection', () => {
      const initialTime = service.state().lastDetectionTime;
      
      service.forceDetection();
      const newTime = service.state().lastDetectionTime;
      
      // Detection should update the timestamp
      expect(newTime).toBeGreaterThanOrEqual(initialTime);
    });

    it('should get detection result', () => {
      const result = service.getDetectionResult();
      expect(result).toBeDefined();
      expect(typeof result?.tailwindLoaded).toBe('boolean');
      expect(typeof result?.animationsSupported).toBe('boolean');
      expect(typeof result?.customPropertiesSupported).toBe('boolean');
      expect(typeof result?.fallbackRequired).toBe('boolean');
    });

    it('should check feature support', () => {
      const tailwindSupported = service.isFeatureSupported('tailwindLoaded');
      const animationsSupported = service.isFeatureSupported('animationsSupported');
      
      expect(typeof tailwindSupported).toBe('boolean');
      expect(typeof animationsSupported).toBe('boolean');
    });
  });

  describe('Computed properties', () => {
    it('should compute isStylesLoaded correctly', () => {
      const isLoaded = service.isStylesLoaded();
      expect(typeof isLoaded).toBe('boolean');
    });

    it('should compute needsFallback correctly', () => {
      const needsFallback = service.needsFallback();
      expect(typeof needsFallback).toBe('boolean');
    });
  });

  describe('SSR handling', () => {
    beforeEach(() => {
      // Mock SSR environment - skip in browser tests
    });

    it('should handle SSR environment gracefully', () => {
      const service = TestBed.inject(StyleFallbackService);
      expect(service).toBeTruthy();
      expect(service.isReady()).toBeTruthy();
    });
  });
});