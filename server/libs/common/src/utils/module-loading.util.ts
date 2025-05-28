/**
 * Module Loading Utilities
 *
 * Optimized module loading patterns to improve startup performance
 * and reduce memory footprint across shared modules.
 */

/**
 * Lazy loading utilities for dynamic imports
 */
export class LazyLoader {
  private static cache = new Map<string, Promise<any>>();

  /**
   * Lazy load a module with caching
   * @param moduleId - Unique identifier for the module
   * @param loader - Function that returns the module import promise
   * @returns Promise that resolves to the loaded module
   */
  static async load<T>(moduleId: string, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(moduleId)) {
      return this.cache.get(moduleId);
    }

    const modulePromise = loader();
    this.cache.set(moduleId, modulePromise);

    try {
      return await modulePromise;
    } catch (error) {
      // Remove failed load from cache to allow retry
      this.cache.delete(moduleId);
      throw error;
    }
  }

  /**
   * Preload a module without waiting for it
   * @param moduleId - Unique identifier for the module
   * @param loader - Function that returns the module import promise
   */
  static preload(moduleId: string, loader: () => Promise<any>): void {
    if (!this.cache.has(moduleId)) {
      const modulePromise = loader();
      this.cache.set(moduleId, modulePromise);

      // Handle errors silently for preloading
      modulePromise.catch(() => {
        this.cache.delete(moduleId);
      });
    }
  }

  /**
   * Clear the module cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      modules: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Conditional loading utilities
 */
export class ConditionalLoader {
  /**
   * Load module only in development environment
   * @param loader - Function that returns the module import promise
   * @returns Promise that resolves to the loaded module or null
   */
  static async loadInDevelopment<T>(
    loader: () => Promise<T>,
  ): Promise<T | null> {
    if (process.env.NODE_ENV === 'development') {
      return await loader();
    }
    return null;
  }

  /**
   * Load module only in production environment
   * @param loader - Function that returns the module import promise
   * @returns Promise that resolves to the loaded module or null
   */
  static async loadInProduction<T>(
    loader: () => Promise<T>,
  ): Promise<T | null> {
    if (process.env.NODE_ENV === 'production') {
      return await loader();
    }
    return null;
  }

  /**
   * Load module only in test environment
   * @param loader - Function that returns the module import promise
   * @returns Promise that resolves to the loaded module or null
   */
  static async loadInTest<T>(loader: () => Promise<T>): Promise<T | null> {
    if (process.env.NODE_ENV === 'test') {
      return await loader();
    }
    return null;
  }

  /**
   * Load module based on feature flag
   * @param featureFlag - Feature flag value
   * @param loader - Function that returns the module import promise
   * @returns Promise that resolves to the loaded module or null
   */
  static async loadWithFeatureFlag<T>(
    featureFlag: boolean | string,
    loader: () => Promise<T>,
  ): Promise<T | null> {
    const isEnabled =
      typeof featureFlag === 'string'
        ? featureFlag.toLowerCase() === 'true' || featureFlag === '1'
        : featureFlag;

    if (isEnabled) {
      return await loader();
    }
    return null;
  }
}

/**
 * Module bundling utilities for optimized loading
 */
export class ModuleBundler {
  /**
   * Load multiple modules in parallel
   * @param loaders - Array of module loader functions
   * @returns Promise that resolves to array of loaded modules
   */
  static async loadParallel<T extends readonly unknown[]>(
    ...loaders: { [K in keyof T]: () => Promise<T[K]> }
  ): Promise<T> {
    const promises = loaders.map((loader) => loader());
    return Promise.all(promises) as any;
  }

  /**
   * Load modules with fallback
   * @param primaryLoader - Primary module loader
   * @param fallbackLoader - Fallback module loader
   * @returns Promise that resolves to the loaded module
   */
  static async loadWithFallback<T>(
    primaryLoader: () => Promise<T>,
    fallbackLoader: () => Promise<T>,
  ): Promise<T> {
    try {
      return await primaryLoader();
    } catch (error) {
      console.warn('Primary module load failed, using fallback:', error);
      return await fallbackLoader();
    }
  }

  /**
   * Load module with timeout
   * @param loader - Module loader function
   * @param timeoutMs - Timeout in milliseconds
   * @returns Promise that resolves to the loaded module
   */
  static async loadWithTimeout<T>(
    loader: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Module load timeout after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    return Promise.race([loader(), timeoutPromise]);
  }
}

/**
 * Performance monitoring for module loading
 */
export class ModuleLoadingMonitor {
  private static loadTimes = new Map<string, number>();
  private static loadCounts = new Map<string, number>();

  /**
   * Monitor module loading performance
   * @param moduleId - Module identifier
   * @param loader - Module loader function
   * @returns Promise that resolves to the loaded module
   */
  static async monitor<T>(
    moduleId: string,
    loader: () => Promise<T>,
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await loader();
      const loadTime = performance.now() - startTime;

      this.recordLoadTime(moduleId, loadTime);
      return result;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      this.recordLoadTime(moduleId, loadTime, true);
      throw error;
    }
  }

  /**
   * Record module load time
   * @param moduleId - Module identifier
   * @param loadTime - Load time in milliseconds
   * @param failed - Whether the load failed
   */
  private static recordLoadTime(
    moduleId: string,
    loadTime: number,
    failed = false,
  ): void {
    if (!failed) {
      this.loadTimes.set(moduleId, loadTime);
    }

    const currentCount = this.loadCounts.get(moduleId) || 0;
    this.loadCounts.set(moduleId, currentCount + 1);
  }

  /**
   * Get module loading statistics
   * @returns Loading statistics
   */
  static getStats() {
    const stats = Array.from(this.loadTimes.entries()).map(
      ([moduleId, loadTime]) => ({
        moduleId,
        loadTime,
        loadCount: this.loadCounts.get(moduleId) || 0,
      }),
    );

    return {
      modules: stats,
      totalModules: stats.length,
      averageLoadTime:
        stats.reduce((sum, stat) => sum + stat.loadTime, 0) / stats.length || 0,
      slowestModule: stats.reduce(
        (slowest: any, current) =>
          current.loadTime > (slowest?.loadTime || 0) ? current : slowest,
        null,
      ),
    };
  }

  /**
   * Clear monitoring data
   */
  static clearStats(): void {
    this.loadTimes.clear();
    this.loadCounts.clear();
  }
}

/**
 * Optimized module loading patterns
 */
export class OptimizedLoader {
  /**
   * Load validation utilities only when needed
   * @returns Promise that resolves to validation utilities
   */
  static async loadValidationUtils() {
    return LazyLoader.load('validation-utils', async () => {
      const { ValidationUtils } = await import('./validation.util');
      return ValidationUtils;
    });
  }

  /**
   * Load string utilities only when needed
   * @returns Promise that resolves to string utilities
   */
  static async loadStringUtils() {
    return LazyLoader.load('string-utils', async () => {
      const { StringUtils } = await import('./string.util');
      return StringUtils;
    });
  }

  /**
   * Load date utilities only when needed
   * @returns Promise that resolves to date utilities
   */
  static async loadDateUtils() {
    return LazyLoader.load('date-utils', async () => {
      const { DateUtils } = await import('./date.util');
      return DateUtils;
    });
  }

  /**
   * Load error handling utilities only when needed
   * @returns Promise that resolves to error handling utilities
   */
  static async loadErrorUtils() {
    return LazyLoader.load('error-utils', async () => {
      const { ErrorUtils } = await import('./error-handling.util');
      return ErrorUtils;
    });
  }

  /**
   * Load type safety utilities only when needed
   * @returns Promise that resolves to type safety utilities
   */
  static async loadTypeSafetyUtils() {
    return LazyLoader.load('type-safety-utils', async () => {
      const { TypeSafetyUtils } = await import('./type-safety.util');
      return TypeSafetyUtils;
    });
  }

  /**
   * Preload commonly used utilities
   */
  static preloadCommonUtils(): void {
    LazyLoader.preload('string-utils', () => import('./string.util'));
    LazyLoader.preload('validation-utils', () => import('./validation.util'));
    LazyLoader.preload('error-utils', () => import('./error-handling.util'));
  }

  /**
   * Load all utilities in parallel for immediate use
   * @returns Promise that resolves to all utilities
   */
  static async loadAllUtils() {
    return ModuleBundler.loadParallel(
      () => this.loadStringUtils(),
      () => this.loadDateUtils(),
      () => this.loadValidationUtils(),
      () => this.loadErrorUtils(),
      () => this.loadTypeSafetyUtils(),
    );
  }
}

/**
 * Export all module loading utilities
 */
export const ModuleLoadingUtils = {
  LazyLoader,
  ConditionalLoader,
  ModuleBundler,
  Monitor: ModuleLoadingMonitor,
  OptimizedLoader,
} as const;
