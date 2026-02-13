/**
 * Production-ready Logger
 * 
 * Provides structured logging with levels, metadata, and environment-aware output.
 * Supports integration with log aggregators (Datadog, LogRocket, Sentry, etc.)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // Set minimum log level from env or default to 'info'
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, metadata, context } = entry;
    
    // Structured JSON logging for production (easily parseable by log aggregators)
    if (!this.isDevelopment) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        context,
        ...metadata,
      });
    }

    // Human-readable format for development
    const contextStr = context ? `[${context}] ` : '';
    const metadataStr = metadata && Object.keys(metadata).length > 0 
      ? `\n${JSON.stringify(metadata, null, 2)}` 
      : '';
    
    return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}${metadataStr}`;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      context,
    };

    const formattedEntry = this.formatEntry(entry);

    // Output to appropriate console method
    switch (level) {
      case 'error':
        console.error(formattedEntry);
        // In production, send to error tracking service
        if (!this.isDevelopment && typeof window !== 'undefined') {
          // Example: Sentry.captureException(new Error(message), { extra: metadata });
        }
        break;
      case 'warn':
        console.warn(formattedEntry);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedEntry);
        }
        break;
      default:
        console.log(formattedEntry);
    }
  }

  /**
   * Debug level - detailed information for diagnosing problems
   */
  debug(message: string, metadata?: LogMetadata, context?: string): void {
    this.log('debug', message, metadata, context);
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, metadata?: LogMetadata, context?: string): void {
    this.log('info', message, metadata, context);
  }

  /**
   * Warn level - warning messages for potentially harmful situations
   */
  warn(message: string, metadata?: LogMetadata, context?: string): void {
    this.log('warn', message, metadata, context);
  }

  /**
   * Error level - error events that might still allow the application to continue
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata, context?: string): void {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
    this.log('error', message, errorMetadata, context);
  }

  /**
   * API-specific logging with request tracking
   */
  api(operation: string, details: {
    status?: 'start' | 'success' | 'error' | 'rate_limited';
    duration?: number;
    statusCode?: number;
    endpoint?: string;
    metadata?: LogMetadata;
  }): void {
    const level: LogLevel = details.status === 'error' ? 'error' : 
                           details.status === 'rate_limited' ? 'warn' : 'info';
    
    const emoji = details.status === 'success' ? '✅' : 
                  details.status === 'error' ? '❌' : 
                  details.status === 'rate_limited' ? '⚠️' : '🔍';
    
    this.log(
      level,
      `${emoji} API ${operation}`,
      {
        operation,
        status: details.status,
        duration: details.duration,
        statusCode: details.statusCode,
        endpoint: details.endpoint,
        ...details.metadata,
      },
      'API'
    );
  }

  /**
   * Performance tracking
   */
  perf(operation: string, duration: number, metadata?: LogMetadata): void {
    this.log(
      'info',
      `📊 Performance: ${operation} completed in ${duration}ms`,
      { operation, duration, ...metadata },
      'PERF'
    );
  }

  /**
   * Data processing pipeline logging
   */
  pipeline(stage: string, details: {
    input: number;
    output: number;
    metadata?: LogMetadata;
  }): void {
    this.log(
      'info',
      `🔄 Pipeline [${stage}]: ${details.input} → ${details.output}`,
      {
        stage,
        inputCount: details.input,
        outputCount: details.output,
        ...details.metadata,
      },
      'PIPELINE'
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export default logger;
