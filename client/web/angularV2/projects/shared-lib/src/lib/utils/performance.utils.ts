/**
 * Performance utility functions
 */

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T & { cancel: () => void } {
  let timeout: number | null = null;
  let result: ReturnType<T>;

  const debounced = function(this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        result = func.apply(this, args);
      }
    }, wait);
    
    if (callNow) {
      result = func.apply(this, args);
    }
    
    return result;
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastResult: ReturnType<T>;
  let timeout: number | null = null;

  const throttled = function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      timeout = setTimeout(() => {
        inThrottle = false;
        timeout = null;
      }, limit);
    }
    return lastResult;
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    inThrottle = false;
  };

  return throttled;
}

/**
 * Measure function execution time
 */
export function measureTime<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

/**
 * Create a performance timer
 */
export function createTimer(name: string): { stop: () => number } {
  const start = performance.now();
  
  return {
    stop: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`Timer ${name}: ${duration} milliseconds`);
      return duration;
    }
  };
}

/**
 * Batch function calls to reduce overhead
 */
export function batchCalls<T>(
  fn: (items: T[]) => void,
  delay: number = 0
): (item: T) => void {
  let batch: T[] = [];
  let timeout: number | null = null;

  return (item: T) => {
    batch.push(item);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn([...batch]);
      batch = [];
      timeout = null;
    }, delay);
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>>; clear: () => void } {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = function(...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T & { cache: Map<string, ReturnType<T>>; clear: () => void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

/**
 * Create a limited cache with LRU eviction
 */
export function createLRUCache<K, V>(maxSize: number): Map<K, V> & { 
  clear: () => void;
  delete: (key: K) => boolean;
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => Map<K, V>;
} {
  const cache = new Map<K, V>();
  const accessOrder = new Map<K, number>();
  let accessCounter = 0;

  const evictLRU = () => {
    if (cache.size >= maxSize) {
      const lruKey = [...accessOrder.entries()]
        .sort(([, a], [, b]) => a - b)[0][0];
      cache.delete(lruKey);
      accessOrder.delete(lruKey);
    }
  };

  const originalGet = cache.get.bind(cache);
  const originalSet = cache.set.bind(cache);
  const originalDelete = cache.delete.bind(cache);
  const originalClear = cache.clear.bind(cache);

  (cache as any).get = (key: K) => {
    const value = originalGet(key);
    if (value !== undefined) {
      accessOrder.set(key, ++accessCounter);
    }
    return value;
  };

  (cache as any).set = (key: K, value: V) => {
    evictLRU();
    accessOrder.set(key, ++accessCounter);
    return originalSet(key, value);
  };

  (cache as any).delete = (key: K) => {
    accessOrder.delete(key);
    return originalDelete(key);
  };

  (cache as any).clear = () => {
    accessOrder.clear();
    return originalClear();
  };

  return cache as any;
}

/**
 * Lazy load a function
 */
export function lazy<T>(factory: () => T): () => T {
  let instance: T;
  let initialized = false;

  return () => {
    if (!initialized) {
      instance = factory();
      initialized = true;
    }
    return instance;
  };
}

/**
 * Create a singleton factory
 */
export function singleton<T>(factory: () => T): () => T {
  return lazy(factory);
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Create a queue for sequential execution
 */
export function createQueue<T>(): {
  add: (fn: () => Promise<T>) => Promise<T>;
  size: () => number;
  clear: () => void;
} {
  const queue: Array<() => Promise<any>> = [];
  let processing = false;

  const processQueue = async () => {
    if (processing || queue.length === 0) {
      return;
    }

    processing = true;

    while (queue.length > 0) {
      const fn = queue.shift()!;
      try {
        await fn();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }

    processing = false;
  };

  return {
    add: (fn: () => Promise<T>) => {
      return new Promise<T>((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        processQueue();
      });
    },
    size: () => queue.length,
    clear: () => {
      queue.length = 0;
    }
  };
}

/**
 * Check if code is running in development mode
 */
export function isDevelopment(): boolean {
  return !!(typeof window !== 'undefined' && (window as any).ng?.probe);
}

/**
 * Check if code is running in production mode
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Get browser performance information
 */
export function getBrowserPerformance(): Record<string, any> | null {
  if (typeof performance === 'undefined') {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    navigation: navigation ? {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
    } : null,
    paint: paint.reduce((acc, entry) => {
      acc[entry.name] = entry.startTime;
      return acc;
    }, {} as Record<string, number>),
    memory: (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : null
  };
}