import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { StyleFallbackDirective } from './style-fallback.directive';
import { StyleFallbackService } from '../services/style-fallback.service';

// Mock StyleFallbackService
class MockStyleFallbackService {
  private _needsFallback = signal(false);
  private _isReady = signal(true);
  private _isStylesLoaded = signal(true);

  needsFallback = this._needsFallback.asReadonly();
  isReady = this._isReady.asReadonly();
  isStylesLoaded = this._isStylesLoaded.asReadonly();

  state = signal({
    isInitialized: true,
    detectionResult: {
      tailwindLoaded: true,
      animationsSupported: true,
      customPropertiesSupported: true,
      fallbackRequired: false
    },
    fallbacksActive: false,
    lastDetectionTime: Date.now()
  });

  forceDetection = jasmine.createSpy('forceDetection');

  // Test helpers
  setNeedsFallback(value: boolean) {
    this._needsFallback.set(value);
  }

  setStylesLoaded(value: boolean) {
    this._isStylesLoaded.set(value);
  }

  setReady(value: boolean) {
    this._isReady.set(value);
  }
}

// Test component
@Component({
  template: `
    <div 
      [libStyleFallback]="fallbackStyles"
      [fallbackClasses]="fallbackClasses"
      [criticalStyles]="criticalStyles"
      [forceApply]="forceApply">
      Test Content
    </div>
  `,
  standalone: true,
  imports: [StyleFallbackDirective]
})
class TestComponent {
  fallbackStyles: any = {};
  fallbackClasses: string[] = [];
  criticalStyles = false;
  forceApply = false;
}

describe('StyleFallbackDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockStyleFallbackService: MockStyleFallbackService;
  let directiveElement: HTMLElement;

  beforeEach(async () => {
    mockStyleFallbackService = new MockStyleFallbackService();

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: StyleFallbackService, useValue: mockStyleFallbackService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.nativeElement.querySelector('div');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(directiveElement).toBeTruthy();
  });

  describe('Fallback application', () => {
    it('should not apply fallbacks when not needed', () => {
      mockStyleFallbackService.setNeedsFallback(false);
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeFalsy();
    });

    it('should apply fallbacks when needed', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = { 'color': 'red', 'font-size': '16px' };
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
      expect(directiveElement.getAttribute('data-lib-fallback')).toBe('active');
    });

    it('should force apply fallbacks when forceApply is true', () => {
      mockStyleFallbackService.setNeedsFallback(false);
      component.forceApply = true;
      component.fallbackStyles = { 'color': 'blue' };
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
    });

    it('should apply critical styles when styles not loaded', () => {
      mockStyleFallbackService.setStylesLoaded(false);
      component.criticalStyles = true;
      component.fallbackStyles = { 'display': 'block' };
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
    });
  });

  describe('Style parsing', () => {
    it('should parse string styles correctly', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = 'color: red; font-size: 16px; margin: 10px';
      fixture.detectChanges();
      
      expect(directiveElement.style.color).toBe('red');
      expect(directiveElement.style.fontSize).toBe('16px');
      expect(directiveElement.style.margin).toBe('10px');
    });

    it('should parse object styles correctly', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = {
        'color': 'blue',
        'font-weight': 'bold',
        'text-align': 'center'
      };
      fixture.detectChanges();
      
      expect(directiveElement.style.color).toBe('blue');
      expect(directiveElement.style.fontWeight).toBe('bold');
      expect(directiveElement.style.textAlign).toBe('center');
    });

    it('should handle CSS custom properties', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = {
        '--primary-color': '#3b82f6',
        '--secondary-color': '#e5e7eb'
      };
      fixture.detectChanges();
      
      expect(directiveElement.style.getPropertyValue('--primary-color')).toBe('#3b82f6');
      expect(directiveElement.style.getPropertyValue('--secondary-color')).toBe('#e5e7eb');
    });
  });

  describe('CSS classes', () => {
    it('should apply fallback classes', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackClasses = ['lib-flex', 'lib-items-center'];
      fixture.detectChanges();
      
      expect(directiveElement.classList.contains('lib-flex')).toBeTruthy();
      expect(directiveElement.classList.contains('lib-items-center')).toBeTruthy();
    });

    it('should not duplicate existing classes', () => {
      directiveElement.classList.add('lib-flex');
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackClasses = ['lib-flex', 'lib-items-center'];
      fixture.detectChanges();
      
      const flexClasses = Array.from(directiveElement.classList).filter(c => c === 'lib-flex');
      expect(flexClasses.length).toBe(1);
    });

    it('should remove fallback classes when fallbacks are disabled', () => {
      // First apply fallbacks
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackClasses = ['lib-flex', 'lib-items-center'];
      fixture.detectChanges();
      
      expect(directiveElement.classList.contains('lib-flex')).toBeTruthy();
      
      // Then disable fallbacks
      mockStyleFallbackService.setNeedsFallback(false);
      fixture.detectChanges();
      
      expect(directiveElement.classList.contains('lib-flex')).toBeFalsy();
      expect(directiveElement.classList.contains('lib-items-center')).toBeFalsy();
    });
  });

  describe('Style removal', () => {
    it('should remove inline styles when fallbacks are disabled', () => {
      // Apply fallbacks
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = { 'color': 'red', 'font-size': '16px' };
      fixture.detectChanges();
      
      expect(directiveElement.style.color).toBe('red');
      
      // Disable fallbacks
      mockStyleFallbackService.setNeedsFallback(false);
      fixture.detectChanges();
      
      expect(directiveElement.style.color).toBe('');
      expect(directiveElement.style.fontSize).toBe('');
    });

    it('should remove custom properties when fallbacks are disabled', () => {
      // Apply fallbacks
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = { '--primary-color': '#3b82f6' };
      fixture.detectChanges();
      
      expect(directiveElement.style.getPropertyValue('--primary-color')).toBe('#3b82f6');
      
      // Disable fallbacks
      mockStyleFallbackService.setNeedsFallback(false);
      fixture.detectChanges();
      
      expect(directiveElement.style.getPropertyValue('--primary-color')).toBe('');
    });

    it('should remove data attribute when fallbacks are disabled', () => {
      // Apply fallbacks
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = { 'color': 'red' };
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
      
      // Disable fallbacks
      mockStyleFallbackService.setNeedsFallback(false);
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeFalsy();
    });
  });

  describe('Service integration', () => {
    it('should force detection when service is not ready', () => {
      mockStyleFallbackService.setReady(false);
      fixture.detectChanges();
      
      expect(mockStyleFallbackService.forceDetection).toHaveBeenCalled();
    });

    it('should not force detection when service is ready', () => {
      mockStyleFallbackService.setReady(true);
      mockStyleFallbackService.forceDetection.calls.reset();
      fixture.detectChanges();
      
      expect(mockStyleFallbackService.forceDetection).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty fallback styles', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = {};
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
    });

    it('should handle empty fallback classes', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackClasses = [];
      fixture.detectChanges();
      
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
    });

    it('should handle malformed style strings', () => {
      mockStyleFallbackService.setNeedsFallback(true);
      component.fallbackStyles = 'color:; font-size; invalid-property: value';
      fixture.detectChanges();
      
      // Should not throw errors and should apply valid styles
      expect(directiveElement.hasAttribute('data-lib-fallback')).toBeTruthy();
    });
  });
});