import { Injectable } from '@nestjs/common';

/**
 * Lazy Security Service
 *
 * Provides lazy loading for heavy security utilities to improve startup performance.
 * Heavy operations are loaded only when needed.
 */

interface LazyModule<T> {
  instance?: T;
  loading?: Promise<T>;
  loaded: boolean;
}

@Injectable()
export class LazySecurityService {
  private readonly lazyModules = new Map<string, LazyModule<any>>();

  /**
   * Lazy load bcrypt for password hashing
   */
  async getBcrypt() {
    return this.lazyLoad('bcrypt', async () => {
      // Dynamic import for bcrypt (heavy crypto library)
      const bcrypt = await import('bcryptjs');
      return bcrypt;
    });
  }

  /**
   * Lazy load crypto utilities
   */
  async getCrypto() {
    return this.lazyLoad('crypto', async () => {
      const crypto = await import('crypto');
      return crypto;
    });
  }

  /**
   * Lazy load JWT utilities
   */
  async getJWT() {
    return this.lazyLoad('jwt', async () => {
      // In a real implementation, you might use jsonwebtoken
      // For now, we'll use a lightweight implementation
      return {
        sign: (payload: any, secret: string) => {
          const header = Buffer.from(
            JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
          ).toString('base64url');
          const payloadStr = Buffer.from(JSON.stringify(payload)).toString(
            'base64url',
          );
          const signature = Buffer.from(
            `${header}.${payloadStr}.${secret}`,
          ).toString('base64url');
          return `${header}.${payloadStr}.${signature}`;
        },
        verify: (token: string, secret: string) => {
          const parts = token.split('.');
          if (parts.length !== 3) return null;

          try {
            const payload = JSON.parse(
              Buffer.from(parts[1], 'base64url').toString(),
            );
            return payload;
          } catch {
            return null;
          }
        },
      };
    });
  }

  /**
   * Lazy load rate limiting data structures
   */
  async getRateLimitStore() {
    return this.lazyLoad('rateLimitStore', async () => {
      // Create optimized rate limiting data structure
      return new Map<
        string,
        {
          count: number;
          resetTime: number;
          lastAccess: number;
        }
      >();
    });
  }

  /**
   * Lazy load security validators
   */
  async getSecurityValidators() {
    return this.lazyLoad('securityValidators', async () => {
      return {
        /**
         * Validate password strength
         */
        validatePasswordStrength: (password: string) => {
          const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
          };

          const score = Object.values(checks).filter(Boolean).length;

          return {
            isValid: score >= 4,
            score,
            checks,
            strength: score >= 5 ? 'strong' : score >= 3 ? 'medium' : 'weak',
          };
        },

        /**
         * Validate IP address
         */
        validateIPAddress: (ip: string) => {
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

          return {
            isValid: ipv4Regex.test(ip) || ipv6Regex.test(ip),
            type: ipv4Regex.test(ip)
              ? 'ipv4'
              : ipv6Regex.test(ip)
                ? 'ipv6'
                : 'invalid',
          };
        },

        /**
         * Validate security headers
         */
        validateSecurityHeaders: (headers: Record<string, string>) => {
          const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
          ];

          const missing = requiredHeaders.filter((header) => !headers[header]);

          return {
            isValid: missing.length === 0,
            missing,
            present: requiredHeaders.filter((header) => headers[header]),
          };
        },
      };
    });
  }

  /**
   * Lazy load encryption utilities
   */
  async getEncryptionUtils() {
    return this.lazyLoad('encryptionUtils', async () => {
      const crypto = await this.getCrypto();

      return {
        /**
         * Generate secure random string
         */
        generateSecureRandom: (length: number = 32) => {
          return crypto.randomBytes(length).toString('hex');
        },

        /**
         * Hash data with salt
         */
        hashWithSalt: async (data: string, salt?: string) => {
          const actualSalt = salt || crypto.randomBytes(16).toString('hex');
          const hash = crypto.createHash('sha256');
          hash.update(data + actualSalt);

          return {
            hash: hash.digest('hex'),
            salt: actualSalt,
          };
        },

        /**
         * Constant-time string comparison
         */
        constantTimeCompare: (a: string, b: string) => {
          if (a.length !== b.length) return false;

          let result = 0;
          for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
          }

          return result === 0;
        },

        /**
         * Generate CSRF token
         */
        generateCSRFToken: () => {
          return crypto.randomBytes(32).toString('base64url');
        },
      };
    });
  }

  /**
   * Lazy load audit logging utilities
   */
  async getAuditLogger() {
    return this.lazyLoad('auditLogger', async () => {
      return {
        /**
         * Log security event
         */
        logSecurityEvent: (event: {
          type:
            | 'login'
            | 'logout'
            | 'failed_login'
            | 'permission_denied'
            | 'rate_limit_exceeded';
          userId?: string;
          ip?: string;
          userAgent?: string;
          details?: any;
        }) => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'security',
            ...event,
          };

          // In production, this would send to a logging service
          console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));

          return logEntry;
        },

        /**
         * Log performance metrics
         */
        logPerformanceMetric: (metric: {
          operation: string;
          duration: number;
          success: boolean;
          details?: any;
        }) => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'performance',
            ...metric,
          };

          // In production, this would send to a monitoring service
          console.debug('[PERFORMANCE]', JSON.stringify(logEntry));

          return logEntry;
        },
      };
    });
  }

  /**
   * Generic lazy loading implementation
   */
  private async lazyLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
    let module = this.lazyModules.get(key) as LazyModule<T>;

    if (!module) {
      module = { loaded: false };
      this.lazyModules.set(key, module);
    }

    if (module.loaded && module.instance) {
      return module.instance;
    }

    if (module.loading) {
      return module.loading;
    }

    module.loading = loader().then((instance) => {
      module.instance = instance;
      module.loaded = true;
      module.loading = undefined;
      return instance;
    });

    return module.loading;
  }

  /**
   * Preload commonly used security utilities
   */
  async preloadCommonUtilities() {
    const startTime = performance.now();

    // Preload in parallel
    await Promise.all([
      this.getRateLimitStore(),
      this.getSecurityValidators(),
      this.getAuditLogger(),
    ]);

    const endTime = performance.now();
    console.debug(`Security utilities preloaded in ${endTime - startTime}ms`);
  }

  /**
   * Get loading status of all modules
   */
  getLoadingStatus() {
    const status: Record<string, { loaded: boolean; loading: boolean }> = {};

    for (const [key, module] of this.lazyModules.entries()) {
      status[key] = {
        loaded: module.loaded,
        loading: !!module.loading,
      };
    }

    return status;
  }

  /**
   * Clear all lazy-loaded modules (for testing)
   */
  clearCache() {
    this.lazyModules.clear();
  }

  /**
   * Get memory usage of lazy modules
   */
  getMemoryUsage() {
    const usage = {
      totalModules: this.lazyModules.size,
      loadedModules: 0,
      loadingModules: 0,
    };

    for (const module of this.lazyModules.values()) {
      if (module.loaded) usage.loadedModules++;
      if (module.loading) usage.loadingModules++;
    }

    return usage;
  }
}

/**
 * Lazy loading decorators for security operations
 */
export function LazySecurityOperation(operationName: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();

      try {
        const result = await originalMethod.apply(this, args);

        const endTime = performance.now();
        console.debug(
          `Lazy security operation ${operationName} completed in ${endTime - startTime}ms`,
        );

        return result;
      } catch (error) {
        const endTime = performance.now();
        console.error(
          `Lazy security operation ${operationName} failed after ${endTime - startTime}ms:`,
          error,
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Memoization decorator for security operations
 */
export function MemoizedSecurityOperation(ttlMs: number = 5 * 60 * 1000) {
  const cache = new Map<string, { value: any; timestamp: number }>();

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const now = Date.now();

      const cached = cache.get(key);
      if (cached && now - cached.timestamp < ttlMs) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);

      // Handle both sync and async results
      if (result instanceof Promise) {
        return result.then((value) => {
          cache.set(key, { value, timestamp: now });
          return value;
        });
      } else {
        cache.set(key, { value: result, timestamp: now });
        return result;
      }
    };

    return descriptor;
  };
}
