import { Injectable } from '@nestjs/common';

/**
 * Cache prefix configuration
 */
export interface CachePrefixConfig {
  /**
   * Application name
   * @default 'app'
   */
  appName?: string;

  /**
   * Service name
   * @default ''
   */
  serviceName?: string;

  /**
   * Environment name
   * @default 'development'
   */
  environment?: string;

  /**
   * Separator for prefix parts
   * @default ':'
   */
  separator?: string;
}

/**
 * Default cache prefix configuration
 */
const defaultConfig: CachePrefixConfig = {
  appName: 'app',
  serviceName: '',
  environment: 'development',
  separator: ':',
};

/**
 * Cache Prefix Service
 *
 * This service provides methods for generating and managing cache prefixes.
 */
@Injectable()
export class CachePrefixService {
  private readonly config: CachePrefixConfig;

  constructor(config: Partial<CachePrefixConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get the base prefix for the application
   * @returns Base prefix
   */
  getBasePrefix(): string {
    const { appName, environment, separator } = this.config;
    return `${appName}${separator}${environment}`;
  }

  /**
   * Get the service prefix
   * @returns Service prefix
   */
  getServicePrefix(): string {
    const { serviceName, separator } = this.config;

    if (!serviceName) {
      return this.getBasePrefix();
    }

    return `${this.getBasePrefix()}${separator}${serviceName}`;
  }

  /**
   * Get a prefix for a specific entity type
   * @param entityType Entity type
   * @returns Entity prefix
   */
  getEntityPrefix(entityType: string): string {
    const { separator } = this.config;
    return `${this.getServicePrefix()}${separator}${entityType}`;
  }

  /**
   * Get a prefix for a specific feature
   * @param feature Feature name
   * @returns Feature prefix
   */
  getFeaturePrefix(feature: string): string {
    const { separator } = this.config;
    return `${this.getServicePrefix()}${separator}${feature}`;
  }

  /**
   * Create a custom prefix
   * @param parts Prefix parts
   * @returns Custom prefix
   */
  createPrefix(...parts: string[]): string {
    const { separator } = this.config;
    return [this.getServicePrefix(), ...parts].join(separator);
  }
}
