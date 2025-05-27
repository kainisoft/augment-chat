/**
 * Memory Optimization Utilities
 *
 * Provides utilities to reduce memory allocations in hot paths
 * and improve garbage collection performance.
 */

/**
 * Object pool for reusing objects and reducing allocations
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 100,
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  acquire(): T {
    const obj = this.pool.pop();
    if (obj) {
      return obj;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      utilization: this.pool.length / this.maxSize,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool.length = 0;
  }
}

/**
 * String builder for efficient string concatenation
 */
export class StringBuilder {
  private parts: string[] = [];
  private length = 0;

  /**
   * Append a string
   */
  append(str: string): this {
    this.parts.push(str);
    this.length += str.length;
    return this;
  }

  /**
   * Append multiple strings
   */
  appendAll(...strings: string[]): this {
    for (const str of strings) {
      this.append(str);
    }
    return this;
  }

  /**
   * Append with separator
   */
  appendWithSeparator(separator: string, ...strings: string[]): this {
    for (let i = 0; i < strings.length; i++) {
      if (i > 0) {
        this.append(separator);
      }
      this.append(strings[i]);
    }
    return this;
  }

  /**
   * Get the final string
   */
  toString(): string {
    return this.parts.join('');
  }

  /**
   * Get current length
   */
  getLength(): number {
    return this.length;
  }

  /**
   * Clear the builder
   */
  clear(): this {
    this.parts.length = 0;
    this.length = 0;
    return this;
  }

  /**
   * Check if empty
   */
  isEmpty(): boolean {
    return this.parts.length === 0;
  }
}

/**
 * Buffer pool for reusing buffers
 */
export class BufferPool {
  private pools = new Map<number, Buffer[]>();
  private maxPoolSize: number;

  constructor(maxPoolSize: number = 50) {
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get a buffer of specified size
   */
  acquire(size: number): Buffer {
    const pool = this.pools.get(size);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return Buffer.allocUnsafe(size);
  }

  /**
   * Return a buffer to the pool
   */
  release(buffer: Buffer): void {
    const size = buffer.length;
    let pool = this.pools.get(size);

    if (!pool) {
      pool = [];
      this.pools.set(size, pool);
    }

    if (pool.length < this.maxPoolSize) {
      // Clear the buffer before returning to pool
      buffer.fill(0);
      pool.push(buffer);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const stats: Record<number, number> = {};
    let totalBuffers = 0;

    for (const [size, pool] of this.pools.entries()) {
      stats[size] = pool.length;
      totalBuffers += pool.length;
    }

    return {
      poolSizes: stats,
      totalBuffers,
      poolCount: this.pools.size,
    };
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.pools.clear();
  }
}

/**
 * Array pool for reusing arrays
 */
export class ArrayPool<T> {
  private pools = new Map<number, T[][]>();
  private maxPoolSize: number;

  constructor(maxPoolSize: number = 50) {
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get an array of specified capacity
   */
  acquire(capacity: number): T[] {
    const pool = this.pools.get(capacity);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return new Array(capacity);
  }

  /**
   * Return an array to the pool
   */
  release(array: T[]): void {
    const capacity = array.length;
    let pool = this.pools.get(capacity);

    if (!pool) {
      pool = [];
      this.pools.set(capacity, pool);
    }

    if (pool.length < this.maxPoolSize) {
      // Clear the array before returning to pool
      array.length = 0;
      pool.push(array);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const stats: Record<number, number> = {};
    let totalArrays = 0;

    for (const [capacity, pool] of this.pools.entries()) {
      stats[capacity] = pool.length;
      totalArrays += pool.length;
    }

    return {
      poolSizes: stats,
      totalArrays,
      poolCount: this.pools.size,
    };
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.pools.clear();
  }
}

/**
 * Memory-efficient operations
 */
export class MemoryOptimizedOps {
  private static stringBuilder = new StringBuilder();
  private static bufferPool = new BufferPool();
  private static arrayPool = new ArrayPool<any>();

  /**
   * Efficient string concatenation
   */
  static concatStrings(...strings: string[]): string {
    this.stringBuilder.clear();
    this.stringBuilder.appendAll(...strings);
    return this.stringBuilder.toString();
  }

  /**
   * Efficient string joining with separator
   */
  static joinStrings(separator: string, ...strings: string[]): string {
    this.stringBuilder.clear();
    this.stringBuilder.appendWithSeparator(separator, ...strings);
    return this.stringBuilder.toString();
  }

  /**
   * Efficient array operations without creating new arrays
   */
  static filterInPlace<T>(array: T[], predicate: (item: T) => boolean): T[] {
    let writeIndex = 0;

    for (let readIndex = 0; readIndex < array.length; readIndex++) {
      if (predicate(array[readIndex])) {
        if (writeIndex !== readIndex) {
          array[writeIndex] = array[readIndex];
        }
        writeIndex++;
      }
    }

    array.length = writeIndex;
    return array;
  }

  /**
   * Efficient array mapping without creating new arrays
   */
  static mapInPlace<T>(array: T[], mapper: (item: T) => T): T[] {
    for (let i = 0; i < array.length; i++) {
      array[i] = mapper(array[i]);
    }
    return array;
  }

  /**
   * Efficient object copying without JSON.parse/stringify
   */
  static shallowCopy<T extends Record<string, any>>(obj: T): T {
    const copy = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = obj[key];
      }
    }
    return copy;
  }

  /**
   * Efficient object merging
   */
  static mergeObjects<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    for (const source of sources) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key]!;
        }
      }
    }
    return target;
  }

  /**
   * Get buffer from pool
   */
  static getBuffer(size: number): Buffer {
    return this.bufferPool.acquire(size);
  }

  /**
   * Return buffer to pool
   */
  static releaseBuffer(buffer: Buffer): void {
    this.bufferPool.release(buffer);
  }

  /**
   * Get array from pool
   */
  static getArray<T>(capacity: number): T[] {
    return this.arrayPool.acquire(capacity);
  }

  /**
   * Return array to pool
   */
  static releaseArray<T>(array: T[]): void {
    this.arrayPool.release(array);
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats() {
    return {
      bufferPool: this.bufferPool.getStats(),
      arrayPool: this.arrayPool.getStats(),
      stringBuilderLength: this.stringBuilder.getLength(),
    };
  }

  /**
   * Clear all pools
   */
  static clearPools(): void {
    this.bufferPool.clear();
    this.arrayPool.clear();
    this.stringBuilder.clear();
  }
}

/**
 * Decorator for automatic object pooling
 */
export function useObjectPool<T>(
  createFn: () => T,
  resetFn?: (obj: T) => void,
  maxSize?: number,
) {
  const pool = new ObjectPool(createFn, resetFn, maxSize);

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const obj = pool.acquire();
      try {
        return originalMethod.call(this, obj, ...args);
      } finally {
        pool.release(obj);
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for memory-efficient operations
 */
export function memoryOptimized(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const startMemory = process.memoryUsage().heapUsed;

    try {
      return originalMethod.apply(this, args);
    } finally {
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = endMemory - startMemory;

      if (memoryDelta > 1024 * 1024) {
        // > 1MB
        console.warn(`Method ${propertyName} allocated ${memoryDelta} bytes`);
      }
    }
  };

  return descriptor;
}

/**
 * Global memory optimization utilities
 */
export const GlobalMemoryOptimizer = {
  /**
   * Force garbage collection if available
   */
  forceGC(): boolean {
    if (global.gc) {
      global.gc();
      return true;
    }
    return false;
  },

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    return process.memoryUsage();
  },

  /**
   * Monitor memory usage
   */
  startMemoryMonitoring(intervalMs: number = 30000) {
    return setInterval(() => {
      const usage = this.getMemoryUsage();
      const stats = MemoryOptimizedOps.getMemoryStats();

      console.debug('Memory Usage:', {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        poolStats: stats,
      });
    }, intervalMs);
  },

  /**
   * Cleanup memory pools
   */
  cleanup(): void {
    MemoryOptimizedOps.clearPools();

    if (this.forceGC()) {
      console.debug('Forced garbage collection completed');
    }
  },
};
