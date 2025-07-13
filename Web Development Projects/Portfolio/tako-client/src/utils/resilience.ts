// 🚀 PHASE 4: PRODUCTION RESILIENCE & ERROR RECOVERY

// Global process declaration for TypeScript
declare global {
  var process:
    | {
        env?: {
          NODE_ENV?: string;
        };
      }
    | undefined;
}

interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

// 🔄 Advanced Retry Logic with Exponential Backoff
export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'exponential',
      onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        const waitTime =
          backoff === 'exponential'
            ? delay * Math.pow(2, attempt - 1)
            : delay * attempt;

        onRetry?.(attempt, lastError);

        await this.sleep(waitTime);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ⚡ Circuit Breaker Pattern for API Calls
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error(
          'Circuit breaker is OPEN - service temporarily unavailable'
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

// 📊 Error Analytics & Monitoring
export class ErrorAnalytics {
  private static errors: Array<{
    id: string;
    message: string;
    stack?: string;
    url: string;
    timestamp: number;
    userAgent: string;
    userId?: string;
    component?: string;
    level: 'error' | 'warning' | 'critical';
  }> = [];

  static logError(
    error: Error | string,
    context: {
      component?: string;
      level?: 'error' | 'warning' | 'critical';
      userId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): string {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const errorData = {
      id: errorId,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? '' : error.stack || '',
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      level: context.level || ('error' as 'error' | 'warning' | 'critical'),
      ...context,
    };

    this.errors.push(errorData);

    // Send to monitoring service in production
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'production'
    ) {
      this.sendToMonitoringService(errorData);
    }

    // Store in localStorage for offline scenarios
    this.storeOffline(errorData);

    return errorId;
  }

  private static sendToMonitoringService(errorData: any): void {
    // Integration with monitoring services like Sentry, LogRocket, etc.
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Fallback: store for retry
        this.storeForRetry(errorData);
      });
    } catch {
      this.storeForRetry(errorData);
    }
  }

  private static storeOffline(errorData: any): void {
    try {
      const stored = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      stored.push(errorData);

      // Keep only last 50 errors to prevent storage bloat
      if (stored.length > 50) {
        stored.splice(0, stored.length - 50);
      }

      localStorage.setItem('errorLogs', JSON.stringify(stored));
    } catch {
      // localStorage full or unavailable
    }
  }

  private static storeForRetry(errorData: any): void {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
      pending.push(errorData);
      localStorage.setItem('pendingErrors', JSON.stringify(pending));
    } catch {
      // localStorage unavailable
    }
  }

  static retryPendingErrors(): void {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
      if (pending.length === 0) return;

      pending.forEach((errorData: any) => {
        this.sendToMonitoringService(errorData);
      });

      localStorage.removeItem('pendingErrors');
    } catch {
      // Handle error silently
    }
  }

  static getErrorSummary(): {
    total: number;
    byLevel: Record<string, number>;
    recent: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recent = this.errors.filter((e) => e.timestamp >= oneHourAgo).length;
    const byLevel = this.errors.reduce(
      (acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: this.errors.length,
      byLevel,
      recent,
    };
  }
}

// 🌐 Network Resilience
export class NetworkResilience {
  private static isOnline = navigator.onLine;
  private static listeners: Array<(online: boolean) => void> = [];

  static init(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      ErrorAnalytics.retryPendingErrors();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  static onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach((cb) => cb(online));
  }

  static isOnlineNow(): boolean {
    return this.isOnline;
  }

  static async waitForOnline(timeout = 30000): Promise<boolean> {
    if (this.isOnline) return true;

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeout);

      const unsubscribe = this.onStatusChange((online) => {
        if (online) {
          clearTimeout(timer);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

// 💾 Data Resilience & Recovery
export class DataResilience {
  private static readonly STORAGE_KEY = 'app_resilience_data';

  static saveState<T>(key: string, data: T): void {
    try {
      const stored = this.getStoredData();
      stored[key] = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      ErrorAnalytics.logError(error as Error, {
        component: 'DataResilience',
        level: 'warning',
      });
    }
  }

  static loadState<T>(key: string, maxAge = 24 * 60 * 60 * 1000): T | null {
    try {
      const stored = this.getStoredData();
      const entry = stored[key];

      if (!entry) return null;

      if (Date.now() - entry.timestamp > maxAge) {
        delete stored[key];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
        return null;
      }

      return entry.data;
    } catch (error) {
      ErrorAnalytics.logError(error as Error, {
        component: 'DataResilience',
        level: 'warning',
      });
      return null;
    }
  }

  private static getStoredData(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  static clearExpiredData(): void {
    try {
      const stored = this.getStoredData();
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      Object.keys(stored).forEach((key) => {
        if (now - stored[key].timestamp > maxAge) {
          delete stored[key];
        }
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      ErrorAnalytics.logError(error as Error, {
        component: 'DataResilience',
        level: 'warning',
      });
    }
  }
}

// Initialize network monitoring
NetworkResilience.init();

// Setup periodic cleanup
setInterval(
  () => {
    DataResilience.clearExpiredData();
  },
  60 * 60 * 1000
); // Every hour
