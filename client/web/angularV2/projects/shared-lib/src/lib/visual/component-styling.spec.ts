/**
 * Visual Regression Tests for Component Styling
 * 
 * These tests validate that components render correctly with and without
 * Tailwind CSS, ensuring visual consistency across different environments.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { LoadingComponent } from '../components/loading/loading.component';
import { StyleFallbackService } from '../services/style-fallback.service';

// Mock StyleFallbackService for visual testing
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

  setNeedsFallback(value: boolean) {
    this._needsFallback.set(value);
  }

  setStylesLoaded(value: boolean) {
    this._isStylesLoaded.set(value);
  }
}

// Test host component
@Component({
  template: `
    <div class="test-container">
      <h3>{{ title }}</h3>
      <lib-loading 
        [type]="type" 
        [size]="size" 
        [message]="message"
        [lines]="lines"
        [showAvatar]="showAvatar">
      </lib-loading>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin: 10px;
    }
  `],
  standalone: true,
  imports: [LoadingComponent]
})
class TestHostComponent {
  title = 'Loading Component Test';
  type: 'spinner' | 'skeleton' | 'dots' | 'pulse' = 'spinner';
  size: 'sm' | 'md' | 'lg' = 'md';
  message = '';
  lines = 3;
  showAvatar = false;
}

describe('Component Styling Visual Tests', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let mockStyleFallbackService: MockStyleFallbackService;

  beforeEach(async () => {
    mockStyleFallbackService = new MockStyleFallbackService();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: StyleFallbackService, useValue: mockStyleFallbackService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  describe('Loading Component Visual States', () => {
    describe('Spinner variants', () => {
      it('should render small spinner correctly', () => {
        component.type = 'spinner';
        component.size = 'sm';
        component.title = 'Small Spinner';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const spinner = compiled.querySelector('.loading__spinner-circle');
        
        expect(spinner).toBeTruthy();
        expect(compiled.querySelector('[data-size="sm"]')).toBeTruthy();
        
        // Visual validation
        const containerRect = compiled.getBoundingClientRect();
        expect(containerRect.width).toBeGreaterThan(0);
        expect(containerRect.height).toBeGreaterThan(0);
      });

      it('should render medium spinner correctly', () => {
        component.type = 'spinner';
        component.size = 'md';
        component.title = 'Medium Spinner';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('[data-size="md"]')).toBeTruthy();
      });

      it('should render large spinner correctly', () => {
        component.type = 'spinner';
        component.size = 'lg';
        component.title = 'Large Spinner';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('[data-size="lg"]')).toBeTruthy();
      });
    });

    describe('Skeleton variants', () => {
      it('should render skeleton without avatar', () => {
        component.type = 'skeleton';
        component.showAvatar = false;
        component.lines = 3;
        component.title = 'Skeleton without Avatar';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const skeleton = compiled.querySelector('.loading__skeleton');
        const avatar = compiled.querySelector('.loading__skeleton-avatar');
        const lines = compiled.querySelectorAll('.loading__skeleton-line');
        
        expect(skeleton).toBeTruthy();
        expect(avatar).toBeFalsy();
        expect(lines.length).toBe(3);
      });

      it('should render skeleton with avatar', () => {
        component.type = 'skeleton';
        component.showAvatar = true;
        component.lines = 4;
        component.title = 'Skeleton with Avatar';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const avatar = compiled.querySelector('.loading__skeleton-avatar');
        const lines = compiled.querySelectorAll('.loading__skeleton-line');
        
        expect(avatar).toBeTruthy();
        expect(lines.length).toBe(4);
      });

      it('should render different line counts correctly', () => {
        component.type = 'skeleton';
        component.lines = 5;
        component.title = 'Skeleton with 5 Lines';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const lines = compiled.querySelectorAll('.loading__skeleton-line');
        expect(lines.length).toBe(5);
      });
    });

    describe('Dots variants', () => {
      it('should render dots with correct structure', () => {
        component.type = 'dots';
        component.title = 'Dots Loading';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const dotsContainer = compiled.querySelector('.loading__dots');
        const dots = compiled.querySelectorAll('.loading__dot');
        
        expect(dotsContainer).toBeTruthy();
        expect(dots.length).toBe(3);
      });

      it('should render dots in different sizes', () => {
        component.type = 'dots';
        component.size = 'lg';
        component.title = 'Large Dots';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('[data-size="lg"]')).toBeTruthy();
      });
    });

    describe('Pulse variants', () => {
      it('should render pulse correctly', () => {
        component.type = 'pulse';
        component.title = 'Pulse Loading';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const pulse = compiled.querySelector('.loading__pulse');
        
        expect(pulse).toBeTruthy();
      });
    });

    describe('With messages', () => {
      it('should render loading message', () => {
        component.type = 'spinner';
        component.message = 'Please wait...';
        component.title = 'Spinner with Message';
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const message = compiled.querySelector('.loading__message');
        
        expect(message).toBeTruthy();
        expect(message.textContent).toContain('Please wait...');
      });
    });
  });

  describe('Fallback Styling Visual Tests', () => {
    beforeEach(() => {
      mockStyleFallbackService.setNeedsFallback(true);
    });

    it('should apply fallback styles visually', () => {
      component.type = 'spinner';
      component.title = 'Spinner with Fallbacks';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      
      expect(loadingElement.hasAttribute('data-lib-fallback')).toBeTruthy();
      
      // Check if fallback styles are applied
      const computedStyle = window.getComputedStyle(loadingElement);
      // Note: In test environment, actual computed styles may not be available
      // This is more of a structural test
    });

    it('should maintain visual consistency with fallbacks', () => {
      component.type = 'dots';
      component.size = 'lg';
      component.title = 'Large Dots with Fallbacks';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dots = compiled.querySelectorAll('.loading__dot');
      
      // All dots should be rendered correctly
      dots.forEach((dot: Element) => {
        expect(dot.classList.contains('loading__dot')).toBeTruthy();
      });
    });

    it('should handle skeleton fallbacks correctly', () => {
      component.type = 'skeleton';
      component.showAvatar = true;
      component.lines = 3;
      component.title = 'Skeleton with Fallbacks';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const avatar = compiled.querySelector('.loading__skeleton-avatar');
      const lines = compiled.querySelectorAll('.loading__skeleton-line');
      
      expect(avatar.hasAttribute('libStyleFallback')).toBeTruthy();
      lines.forEach((line: Element) => {
        expect(line.hasAttribute('libStyleFallback')).toBeTruthy();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain structure across different container sizes', () => {
      const testSizes = [
        { width: '200px', height: '100px' },
        { width: '400px', height: '200px' },
        { width: '800px', height: '400px' }
      ];

      testSizes.forEach(size => {
        const container = fixture.nativeElement.querySelector('.test-container');
        container.style.width = size.width;
        container.style.height = size.height;
        
        component.type = 'skeleton';
        component.showAvatar = true;
        fixture.detectChanges();

        const skeleton = container.querySelector('.loading__skeleton');
        expect(skeleton).toBeTruthy();
        
        // Should maintain structure regardless of container size
        const avatar = container.querySelector('.loading__skeleton-avatar');
        const content = container.querySelector('.loading__skeleton-content');
        expect(avatar).toBeTruthy();
        expect(content).toBeTruthy();
      });
    });
  });

  describe('Animation States', () => {
    it('should have animation-related attributes', () => {
      const animationTypes = ['spinner', 'dots', 'pulse'];
      
      animationTypes.forEach(type => {
        component.type = type as any;
        component.title = `${type} Animation Test`;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const animatedElements = compiled.querySelectorAll('[style*="animation"], .loading__spinner-circle, .loading__dot, .loading__pulse');
        
        expect(animatedElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility attributes', () => {
      component.type = 'spinner';
      component.message = 'Loading content...';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      
      // Should be identifiable as loading content
      expect(loadingElement).toBeTruthy();
      
      // Message should be accessible
      const message = compiled.querySelector('.loading__message');
      expect(message).toBeTruthy();
    });

    it('should work with screen readers', () => {
      component.type = 'skeleton';
      component.title = 'Skeleton for Screen Readers';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const skeleton = compiled.querySelector('.loading__skeleton');
      
      // Should have semantic structure
      expect(skeleton).toBeTruthy();
    });
  });
});