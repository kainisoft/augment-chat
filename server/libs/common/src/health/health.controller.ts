import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import * as os from 'os';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  system: {
    memory: {
      total: number;
      free: number;
      used: number;
      usedPercentage: number;
    };
    cpu: {
      loadAvg: number[];
      cores: number;
    };
    hostname: string;
    platform: string;
  };
  components: Record<
    string,
    {
      status: 'ok' | 'error';
      details?: any;
    }
  >;
}

@Controller('health')
export class BaseHealthController {
  private readonly startTime: number;
  private readonly version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '1.0.0';
  }

  @Get()
  async check(): Promise<HealthCheckResult> {
    const components = await this.checkComponents();
    const hasErrors = Object.values(components).some(
      (component) => component.status === 'error',
    );

    if (hasErrors) {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: this.getServiceName(),
        version: this.version,
        uptime: this.getUptime(),
        system: this.getSystemInfo(),
        components,
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.getServiceName(),
      version: this.version,
      uptime: this.getUptime(),
      system: this.getSystemInfo(),
      components,
    };
  }

  @Get('liveness')
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.getServiceName(),
    };
  }

  @Get('readiness')
  async readiness() {
    const components = await this.checkComponents();
    const hasErrors = Object.values(components).some(
      (component) => component.status === 'error',
    );

    if (hasErrors) {
      throw new ServiceUnavailableException({
        status: 'error',
        components,
      });
    }

    return {
      status: 'ok',
      components,
    };
  }

  protected getServiceName(): string {
    return 'service';
  }

  protected getUptime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  protected getSystemInfo() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      memory: {
        total: Math.round(totalMemory / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024),
        used: Math.round(usedMemory / 1024 / 1024),
        usedPercentage: Math.round((usedMemory / totalMemory) * 100),
      },
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length,
      },
      hostname: os.hostname(),
      platform: os.platform(),
    };
  }

  protected checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    // Base implementation - to be overridden by services
    return Promise.resolve({
      system: {
        status: 'ok',
      },
    });
  }
}
