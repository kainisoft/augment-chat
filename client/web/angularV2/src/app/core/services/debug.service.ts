import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface DebugInfo {
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  stack?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private debugLogs: DebugInfo[] = [];
  private maxLogs = 1000;
  private isEnabled = !environment.production;

  constructor() {
    if (this.isEnabled) {
      this.setupGlobalErrorHandler();
      this.setupConsoleOverrides();
    }
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  private setupConsoleOverrides(): void {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    console.log = (...args) => {
      this.log('Console Log', args);
      originalConsole.log(...args);
    };

    console.warn = (...args) => {
      this.warn('Console Warning', args);
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.error('Console Error', args);
      originalConsole.error(...args);
    };

    console.debug = (...args) => {
      this.debug('Console Debug', args);
      originalConsole.debug(...args);
    };
  }

  log(message: string, data?: any): void {
    if (!this.isEnabled) return;
    
    this.addLog({
      timestamp: Date.now(),
      level: 'log',
      message,
      data
    });
  }

  warn(message: string, data?: any): void {
    if (!this.isEnabled) return;
    
    this.addLog({
      timestamp: Date.now(),
      level: 'warn',
      message,
      data
    });
  }

  error(message: string, data?: any): void {
    if (!this.isEnabled) return;
    
    this.addLog({
      timestamp: Date.now(),
      level: 'error',
      message,
      data,
      stack: new Error().stack
    });
  }

  debug(message: string, data?: any): void {
    if (!this.isEnabled) return;
    
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      message,
      data
    });
  }

  private addLog(logInfo: DebugInfo): void {
    this.debugLogs.push(logInfo);
    
    // Keep only the most recent logs
    if (this.debugLogs.length > this.maxLogs) {
      this.debugLogs = this.debugLogs.slice(-this.maxLogs);
    }
  }

  getLogs(level?: 'log' | 'warn' | 'error' | 'debug'): DebugInfo[] {
    if (level) {
      return this.debugLogs.filter(log => log.level === level);
    }
    return [...this.debugLogs];
  }

  clearLogs(): void {
    this.debugLogs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.debugLogs, null, 2);
  }

  downloadLogs(): void {
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  measurePerformance<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn();
    
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.debug(`Performance: ${name}`, {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      startTime,
      endTime
    });
    
    return result;
  }

  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();
    
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.debug(`Async Performance: ${name}`, {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      startTime,
      endTime
    });
    
    return result;
  }

  getSystemInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      location: {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname
      },
      timestamp: new Date().toISOString()
    };
  }
}