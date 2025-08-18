import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Memory optimization service
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryOptimizationService {
  private componentCache = new Map<string, WeakRef<any>>();
  private subscriptionTracker = new Set<Subscription>();
  private cleanupTasks = new Set<() => void>();
  
  /**
   * Track component for memory management
   */
  trackComponent(id: string, component: any): void {
    this.componentCache.set(id, new WeakRef(component));
  }
  
  /**
   * Track subscription for automatic cleanup
   */
  trackSubscription(subscription: Subscription): void {
    this.subscriptionTracker.add(subscription);
  }
  
  /**
   * Add cleanup task
   */
  addCleanupTask(task: () => void): void {
    this.cleanupTasks.add(task);
  }
  
  /**
   * Remove cleanup task
   */
  removeCleanupTask(task: () => void): void {
    this.cleanupTasks.delete(task);
  }
  
  /**
   * Clean up weak references
   */
  cleanupWeakReferences(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, ref] of this.componentCache) {
      if (!ref.deref()) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.componentCache.delete(key);
    });
    
    console.log(`Cleaned up ${keysToDelete.length} weak references`);
  }
  
  /**
   * Unsubscribe from all tracked subscriptions
   */
  cleanupSubscriptions(): void {
    let count = 0;
    
    this.subscriptionTracker.forEach(subscription => {
      if (!subscription.closed) {
        subscription.unsubscribe();
        count++;
      }
    });
    
    this.subscriptionTracker.clear();
    console.log(`Unsubscribed from ${count} subscriptions`);
  }
  
  /**
   * Run all cleanup tasks
   */
  runCleanupTasks(): void {
    let count = 0;
    
    this.cleanupTasks.forEach(task => {
      try {
        task();
        count++;
      } catch (error) {
        console.error('Error running cleanup task:', error);
      }
    });
    
    console.log(`Executed ${count} cleanup tasks`);
  }
  
  /**
   * Full cleanup - run all cleanup operations
   */
  cleanup(): void {
    this.cleanupWeakReferences();
    this.cleanupSubscriptions();
    this.runCleanupTasks();
  }
  
  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    componentCacheSize: number;
    subscriptionCount: number;
    cleanupTaskCount: number;
    memoryUsage?: Record<string, number>;
  } {
    const stats = {
      componentCacheSize: this.componentCache.size,
      subscriptionCount: this.subscriptionTracker.size,
      cleanupTaskCount: this.cleanupTasks.size,
    };
    
    // Add browser memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      (stats as any).memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    
    return stats;
  }
  
  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      console.log('Forced garbage collection');
    } else {
      console.warn('Garbage collection not available');
    }
  }
  
  /**
   * Monitor memory usage and trigger cleanup when needed
   */
  startMemoryMonitoring(thresholdMB: number = 100): () => void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > thresholdMB) {
          console.warn(`Memory usage high: ${usedMB.toFixed(2)}MB`);
          this.cleanup();
        }
      }
    };
    
    const intervalId = setInterval(checkMemory, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }
  
  /**
   * Create a memory-efficient cache with size limit
   */
  createLimitedCache<K, V>(maxSize: number): Map<K, V> & { cleanup: () => void } {
    const cache = new Map<K, V>();
    const accessOrder = new Map<K, number>();
    let accessCounter = 0;
    
    const originalSet = cache.set.bind(cache);
    const originalGet = cache.get.bind(cache);
    
    cache.set = (key: K, value: V) => {
      // Remove oldest entries if cache is full
      if (cache.size >= maxSize) {
        const oldestKey = [...accessOrder.entries()]
          .sort(([, a], [, b]) => a - b)[0][0];
        cache.delete(oldestKey);
        accessOrder.delete(oldestKey);
      }
      
      accessOrder.set(key, ++accessCounter);
      return originalSet(key, value);
    };
    
    cache.get = (key: K) => {
      const value = originalGet(key);
      if (value !== undefined) {
        accessOrder.set(key, ++accessCounter);
      }
      return value;
    };
    
    (cache as any).cleanup = () => {
      cache.clear();
      accessOrder.clear();
    };
    
    return cache as Map<K, V> & { cleanup: () => void };
  }
  
  /**
   * Debounce function to reduce memory pressure from frequent calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T & { cancel: () => void } {
    let timeout: number | null = null;
    
    const debounced = ((...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    }) as T & { cancel: () => void };
    
    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    
    return debounced;
  }
  
  /**
   * Throttle function to limit execution frequency
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T & { cancel: () => void } {
    let inThrottle = false;
    let timeout: number | null = null;
    
    const throttled = ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        timeout = setTimeout(() => {
          inThrottle = false;
          timeout = null;
        }, limit);
      }
    }) as T & { cancel: () => void };
    
    throttled.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      inThrottle = false;
    };
    
    return throttled;
  }
}