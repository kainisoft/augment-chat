import { Injectable } from '@angular/core';

/**
 * Performance monitoring service
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitoringService {
  private observer: PerformanceObserver | null = null;
  private measurements = new Map<string, number>();
  
  constructor() {
    this.initializeObserver();
  }
  
  /**
   * Initialize performance observer
   */
  private initializeObserver(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }
    
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });
    
    try {
      this.observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'measure'] 
      });
    } catch (error) {
      console.warn('Failed to initialize performance observer:', error);
    }
  }
  
  /**
   * Process performance entry
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming);
        break;
      case 'largest-contentful-paint':
        this.handleLCPEntry(entry as PerformanceEntry);
        break;
      case 'measure':
        this.handleMeasureEntry(entry);
        break;
    }
  }
  
  /**
   * Handle navigation timing entry
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
    };
    
    console.log('Navigation metrics:', metrics);
    this.reportMetrics('navigation', metrics);
  }
  
  /**
   * Handle paint timing entry
   */
  private handlePaintEntry(entry: PerformancePaintTiming): void {
    console.log(`${entry.name}: ${entry.startTime}ms`);
    this.measurements.set(entry.name, entry.startTime);
  }
  
  /**
   * Handle Largest Contentful Paint entry
   */
  private handleLCPEntry(entry: PerformanceEntry): void {
    console.log(`LCP: ${entry.startTime}ms`);
    this.measurements.set('largest-contentful-paint', entry.startTime);
  }
  
  /**
   * Handle custom measure entry
   */
  private handleMeasureEntry(entry: PerformanceEntry): void {
    console.log(`Custom measure ${entry.name}: ${entry.duration}ms`);
    this.measurements.set(entry.name, entry.duration || 0);
  }
  
  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string): () => void {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;
    
    performance.mark(startMark);
    
    return () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    };
  }
  
  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Function ${name} took ${duration}ms`);
    this.measurements.set(name, duration);
    
    return result;
  }
  
  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Async function ${name} took ${duration}ms`);
    this.measurements.set(name, duration);
    
    return result;
  }
  
  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Record<string, number> {
    return {
      'first-contentful-paint': this.measurements.get('first-contentful-paint') || 0,
      'largest-contentful-paint': this.measurements.get('largest-contentful-paint') || 0,
      // CLS and FID would need additional implementation
    };
  }
  
  /**
   * Get all measurements
   */
  getAllMeasurements(): Map<string, number> {
    return new Map(this.measurements);
  }
  
  /**
   * Clear measurements
   */
  clearMeasurements(): void {
    this.measurements.clear();
  }
  
  /**
   * Report metrics to external service
   */
  private reportMetrics(type: string, metrics: Record<string, number>): void {
    // In a real application, you would send these metrics to an analytics service
    // For now, we'll just log them
    console.log(`Performance metrics (${type}):`, metrics);
  }
  
  /**
   * Monitor memory usage
   */
  getMemoryUsage(): Record<string, number> | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }
  
  /**
   * Start monitoring frame rate
   */
  startFPSMonitoring(): () => void {
    let frames = 0;
    let startTime = performance.now();
    let animationId: number;
    
    const countFrame = () => {
      frames++;
      animationId = requestAnimationFrame(countFrame);
    };
    
    animationId = requestAnimationFrame(countFrame);
    
    const intervalId = setInterval(() => {
      const currentTime = performance.now();
      const fps = Math.round((frames * 1000) / (currentTime - startTime));
      console.log(`FPS: ${fps}`);
      
      frames = 0;
      startTime = currentTime;
    }, 1000);
    
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    };
  }
}