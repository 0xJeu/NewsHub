# Production Logging Guide

## Overview

The application uses a structured logging system designed for production environments with support for log aggregation services (Datadog, LogRocket, Sentry, etc.).

## Logger Features

- **Structured Logging**: JSON format in production, human-readable in development
- **Log Levels**: `debug`, `info`, `warn`, `error`
- **Context Tags**: Categorize logs by component (`API`, `PIPELINE`, `PERF`, etc.)
- **Metadata**: Attach structured data to every log entry
- **Environment Aware**: Different output formats for dev vs production
- **Performance Tracking**: Built-in performance and pipeline metrics

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Info level
logger.info('User action completed', { userId: 123, action: 'login' });

// Warning level
logger.warn('Rate limit approaching', { current: 450, limit: 500 });

// Error level
logger.error('Failed to fetch data', error, { endpoint: '/api/data' });

// Debug level (development only)
logger.debug('Cache hit', { key: 'articles:homepage' });
```

### Contextual Logging

Add context tags to organize logs by component:

```typescript
logger.info('Request processed', { duration: 250 }, 'API');
logger.warn('Memory usage high', { used: '85%' }, 'SYSTEM');
logger.error('Database connection failed', error, {}, 'DATABASE');
```

### API Operations

Special method for tracking API calls:

```typescript
logger.api('Fetch articles', {
  status: 'success',
  duration: 150,
  statusCode: 200,
  endpoint: '/api/articles',
  metadata: { count: 50 }
});

// Status options: 'start' | 'success' | 'error' | 'rate_limited'
```

### Performance Tracking

Log performance metrics:

```typescript
const startTime = Date.now();
// ... do work ...
const duration = Date.now() - startTime;

logger.perf('Article processing', duration, {
  articlesProcessed: 100,
  cacheHits: 75
});
```

### Pipeline Operations

Track data transformation pipelines:

```typescript
logger.pipeline('Deduplication', {
  input: 100,
  output: 85,
  metadata: { duplicatesRemoved: 15 }
});
```

## Log Levels

### Production (NODE_ENV=production)

Default level: `info`

- `error`: Always logged
- `warn`: Always logged
- `info`: Always logged
- `debug`: Never logged

### Development (NODE_ENV=development)

Default level: `debug`

- All levels logged with human-readable formatting

## Configuration

### Environment Variables

```bash
# Set minimum log level (default: 'info')
LOG_LEVEL=debug

# Production vs development mode
NODE_ENV=production
```

## Output Formats

### Production (JSON)

```json
{
  "timestamp": "2026-02-13T01:33:49.441Z",
  "level": "INFO",
  "message": "🔄 Pipeline [Deduplication]: 100 → 85",
  "context": "PIPELINE",
  "stage": "Deduplication",
  "inputCount": 100,
  "outputCount": 85,
  "duplicatesRemoved": 15
}
```

### Development (Human-readable)

```
2026-02-13T01:33:49.441Z [INFO] [PIPELINE] 🔄 Pipeline [Deduplication]: 100 → 85
{
  "stage": "Deduplication",
  "inputCount": 100,
  "outputCount": 85,
  "duplicatesRemoved": 15
}
```

## Integration with Log Aggregators

The JSON output format is designed to be easily parsed by log aggregation services:

### Datadog

Logs automatically include:
- `timestamp`: ISO 8601 format
- `level`: Log severity
- `context`: Service/component name
- All metadata fields as searchable attributes

### Sentry

Error logs can be automatically sent to Sentry (uncomment in `logger.ts`):

```typescript
if (!this.isDevelopment && typeof window !== 'undefined') {
  Sentry.captureException(new Error(message), { extra: metadata });
}
```

### LogRocket

Session replay can be tagged with log events:

```typescript
import LogRocket from 'logrocket';

logger.error('Payment failed', error, { 
  userId, 
  amount,
  sessionId: LogRocket.sessionURL 
});
```

## Best Practices

### 1. Use Appropriate Log Levels

- `debug`: Detailed diagnostic information
- `info`: General informational messages
- `warn`: Warning messages for potentially harmful situations
- `error`: Error events that might still allow the application to continue

### 2. Include Context

Always add context to help with debugging:

```typescript
// Bad
logger.error('Failed');

// Good
logger.error('Failed to process payment', error, {
  userId: '123',
  amount: 99.99,
  paymentMethod: 'credit_card'
}, 'PAYMENT');
```

### 3. Use Emojis for Quick Scanning

Emojis help with visual scanning in logs (kept from original implementation):

- 🔍 Fetching/searching
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 📊 Metrics/stats
- 🔄 Processing/transformation
- 🎭 Mock/test data

### 4. Track Performance

Always track duration for operations:

```typescript
const start = Date.now();
await expensiveOperation();
logger.perf('Expensive operation', Date.now() - start);
```

### 5. Don't Log Sensitive Data

Never log:
- Passwords
- API keys
- Credit card numbers
- Personal identification numbers
- Session tokens

## Monitoring Queries

### Common Datadog Queries

```
# Error rate
status:error

# API performance
context:API @metadata.duration:>1000

# Pipeline issues
context:PIPELINE @duplicatesRemoved:>50

# Rate limit warnings
context:API_TRACKER @remaining:<50
```

## Migration from console.log

Old code:
```typescript
console.log('Fetched articles:', articles.length);
console.error('Failed:', error);
```

New code:
```typescript
import { logger } from '@/lib/logger';

logger.info('Articles fetched', { count: articles.length }, 'API');
logger.error('Operation failed', error, {}, 'API');
```
