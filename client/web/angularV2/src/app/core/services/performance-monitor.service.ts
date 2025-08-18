import { Injectable } from '@angular/core';

export interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metrics: PerformanceMetrics = {
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
  };

  constructor() {
    this.initializePerformanceObserver();
    this.measureNavigationTiming();
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Observe paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe cumulative layout shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private measureNavigationTiming(): void {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.navigationStart = timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logMetrics(): void {
    console.group('🚀 Performance Metrics');
    console.log('Navigation Start:', this.metrics.navigationStart);
    console.log('DOM Content Loaded:', `${this.metrics.domContentLoaded}ms`);
    console.log('Load Complete:', `${this.metrics.loadComplete}ms`);
    
    if (this.metrics.firstContentfulPaint) {
      console.log('First Contentful Paint:', `${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
    }
    
    if (this.metrics.largestContentfulPaint) {
      console.log('Largest Contentful Paint:', `${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
    }
    
    if (this.metrics.firstInputDelay) {
      console.log('First Input Delay:', `${this.metrics.firstInputDelay.toFixed(2)}ms`);
    }
    
    if (this.metrics.cumulativeLayoutShift) {
      console.log('Cumulative Layout Shift:', this.metrics.cumulativeLayoutShift.toFixed(4));
    }
    
    console.groupEnd();
  }

  reportToAnalytics(endpoint?: string): void {
    const metrics = this.getMetrics();
    
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance-metrics',
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          metrics,
        }),
      }).catch(error => {
        console.warn('Failed to report performance metrics:', error);
      });
    }
  }

  measureComponentRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log(`🎨 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 16) { // 60fps threshold
        console.warn(`⚠️ ${componentName} render time exceeds 16ms (60fps threshold)`);
      }
    };
  }
}