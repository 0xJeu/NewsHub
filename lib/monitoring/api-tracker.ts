/**
 * API Usage Monitoring
 *
 * Tracks NewsAPI requests to ensure we stay under the 500/day limit.
 * Provides warnings when approaching the limit.
 */

import { logger } from '../logger';

interface DailyUsage {
  date: string;
  count: number;
  requests: Array<{
    timestamp: string;
    endpoint: string;
    query?: string;
    strategy?: string;
  }>;
}

// In-memory tracking (resets on server restart)
// For production, consider using Redis or database
let currentUsage: DailyUsage = {
  date: new Date().toDateString(),
  count: 0,
  requests: []
};

const DAILY_LIMIT = 500;
const WARNING_THRESHOLD = 450; // Warn at 90%

/**
 * Track a new API request
 */
export function trackAPIRequest(
  endpoint: string = 'everything',
  metadata?: {
    query?: string;
    strategy?: string;
  }
): {
  count: number;
  remaining: number;
  percentage: number;
  warning: boolean;
} {
  const today = new Date().toDateString();

  // Reset if it's a new day
  if (today !== currentUsage.date) {
    currentUsage = {
      date: today,
      count: 0,
      requests: []
    };
  }

  // Increment counter
  currentUsage.count++;

  // Record request details
  currentUsage.requests.push({
    timestamp: new Date().toISOString(),
    endpoint,
    query: metadata?.query,
    strategy: metadata?.strategy
  });

  const remaining = DAILY_LIMIT - currentUsage.count;
  const percentage = (currentUsage.count / DAILY_LIMIT) * 100;
  const warning = currentUsage.count >= WARNING_THRESHOLD;

  // Log warnings
  if (warning) {
    logger.warn(
      `⚠️ API limit warning: approaching daily limit`,
      {
        current: currentUsage.count,
        limit: DAILY_LIMIT,
        remaining,
        percentage: Math.round(percentage)
      },
      'API_TRACKER'
    );
  }

  // Log every 50 requests
  if (currentUsage.count % 50 === 0) {
    logger.info(
      `📊 API Usage checkpoint`,
      {
        current: currentUsage.count,
        limit: DAILY_LIMIT,
        percentage: Math.round(percentage),
        remaining
      },
      'API_TRACKER'
    );
  }

  return {
    count: currentUsage.count,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    warning
  };
}

/**
 * Check current usage without incrementing
 */
export function getCurrentUsage(): {
  date: string;
  count: number;
  remaining: number;
  percentage: number;
  limit: number;
} {
  const today = new Date().toDateString();

  // Reset if it's a new day
  if (today !== currentUsage.date) {
    currentUsage = {
      date: today,
      count: 0,
      requests: []
    };
  }

  const remaining = DAILY_LIMIT - currentUsage.count;
  const percentage = (currentUsage.count / DAILY_LIMIT) * 100;

  return {
    date: currentUsage.date,
    count: currentUsage.count,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    limit: DAILY_LIMIT
  };
}

/**
 * Check if we can make a request (not at limit)
 */
export function canMakeRequest(): boolean {
  const usage = getCurrentUsage();
  return usage.remaining > 0;
}

/**
 * Get request history for today
 */
export function getRequestHistory(): DailyUsage['requests'] {
  const today = new Date().toDateString();

  if (today !== currentUsage.date) {
    return [];
  }

  return [...currentUsage.requests];
}

/**
 * Get usage statistics by strategy
 */
export function getUsageByStrategy(): Record<string, number> {
  const today = new Date().toDateString();

  if (today !== currentUsage.date) {
    return {};
  }

  const stats: Record<string, number> = {};

  currentUsage.requests.forEach(req => {
    const strategy = req.strategy || 'unknown';
    stats[strategy] = (stats[strategy] || 0) + 1;
  });

  return stats;
}

/**
 * Get usage statistics by hour
 */
export function getUsageByHour(): Record<number, number> {
  const today = new Date().toDateString();

  if (today !== currentUsage.date) {
    return {};
  }

  const stats: Record<number, number> = {};

  currentUsage.requests.forEach(req => {
    const hour = new Date(req.timestamp).getHours();
    stats[hour] = (stats[hour] || 0) + 1;
  });

  return stats;
}

/**
 * Estimate remaining capacity for the day
 * Returns suggested number of requests per strategy to stay under limit
 */
export function estimateRemainingCapacity(): {
  remaining: number;
  suggestions: {
    homepage: number;
    categories: number;
    search: number;
  };
} {
  const usage = getCurrentUsage();
  const remaining = usage.remaining;

  // Conservative allocation:
  // - Reserve 100 for search (user-initiated)
  // - Reserve 50 for buffer
  // - Split rest between homepage and categories

  const searchBuffer = 100;
  const safetyBuffer = 50;
  const usableRemaining = Math.max(0, remaining - searchBuffer - safetyBuffer);

  return {
    remaining,
    suggestions: {
      homepage: Math.floor(usableRemaining * 0.3),
      categories: Math.floor(usableRemaining * 0.7),
      search: searchBuffer
    }
  };
}

/**
 * Manual reset (for testing/admin purposes)
 */
export function resetUsage(): void {
  const previousCount = currentUsage.count;
  currentUsage = {
    date: new Date().toDateString(),
    count: 0,
    requests: []
  };
  logger.info('✅ API usage counter reset', { previousCount }, 'API_TRACKER');
}

/**
 * Get formatted usage report
 */
export function getUsageReport(): string {
  const usage = getCurrentUsage();
  const byStrategy = getUsageByStrategy();

  let report = `📊 API Usage Report - ${usage.date}\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `Total: ${usage.count}/${usage.limit} (${usage.percentage}%)\n`;
  report += `Remaining: ${usage.remaining}\n\n`;

  if (Object.keys(byStrategy).length > 0) {
    report += `By Strategy:\n`;
    Object.entries(byStrategy)
      .sort(([, a], [, b]) => b - a)
      .forEach(([strategy, count]) => {
        report += `  ${strategy}: ${count}\n`;
      });
  }

  return report;
}
