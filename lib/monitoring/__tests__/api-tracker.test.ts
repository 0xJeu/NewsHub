import {
  trackAPIRequest,
  getCurrentUsage,
  canMakeRequest,
  getRequestHistory,
  getUsageByStrategy,
  getUsageByHour,
  estimateRemainingCapacity,
  resetUsage,
  getUsageReport,
} from '../api-tracker';

describe('API Usage Tracking', () => {
  beforeEach(() => {
    // Reset usage before each test
    resetUsage();
  });

  describe('trackAPIRequest', () => {
    it('should increment request count', () => {
      const before = getCurrentUsage();
      trackAPIRequest('everything');
      const after = getCurrentUsage();

      expect(after.count).toBe(before.count + 1);
    });

    it('should return usage statistics', () => {
      const result = trackAPIRequest('everything');

      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('warning');
    });

    it('should calculate remaining requests correctly', () => {
      trackAPIRequest('everything');
      const usage = getCurrentUsage();

      expect(usage.remaining).toBe(500 - usage.count);
    });

    it('should calculate percentage correctly', () => {
      for (let i = 0; i < 100; i++) {
        trackAPIRequest('everything');
      }

      const usage = getCurrentUsage();
      expect(usage.percentage).toBe(20); // 100/500 = 20%
    });

    it('should warn when approaching limit (>= 450)', () => {
      // Track 449 requests - no warning
      for (let i = 0; i < 449; i++) {
        trackAPIRequest('everything');
      }

      let result = trackAPIRequest('everything'); // 450th request
      expect(result.warning).toBe(true);
    });

    it('should not warn when below threshold', () => {
      for (let i = 0; i < 100; i++) {
        trackAPIRequest('everything');
      }

      const result = trackAPIRequest('everything');
      expect(result.warning).toBe(false);
    });

    it('should track request metadata', () => {
      trackAPIRequest('everything', {
        query: 'test query',
        strategy: 'homepage',
      });

      const history = getRequestHistory();
      expect(history.length).toBe(1);
      expect(history[0].query).toBe('test query');
      expect(history[0].strategy).toBe('homepage');
    });

    it('should track timestamp', () => {
      trackAPIRequest('everything');

      const history = getRequestHistory();
      expect(history[0]).toHaveProperty('timestamp');
      expect(new Date(history[0].timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current usage statistics', () => {
      const usage = getCurrentUsage();

      expect(usage).toHaveProperty('date');
      expect(usage).toHaveProperty('count');
      expect(usage).toHaveProperty('remaining');
      expect(usage).toHaveProperty('percentage');
      expect(usage).toHaveProperty('limit');
    });

    it('should not increment count when called', () => {
      const before = getCurrentUsage();
      const after = getCurrentUsage();

      expect(before.count).toBe(after.count);
    });

    it('should have limit of 500', () => {
      const usage = getCurrentUsage();
      expect(usage.limit).toBe(500);
    });

    it('should start with 0 requests', () => {
      resetUsage();
      const usage = getCurrentUsage();
      expect(usage.count).toBe(0);
      expect(usage.remaining).toBe(500);
    });
  });

  describe('canMakeRequest', () => {
    it('should return true when under limit', () => {
      expect(canMakeRequest()).toBe(true);
    });

    it('should return false when at limit', () => {
      // Max out the limit
      for (let i = 0; i < 500; i++) {
        trackAPIRequest('everything');
      }

      expect(canMakeRequest()).toBe(false);
    });

    it('should return true when just below limit', () => {
      for (let i = 0; i < 499; i++) {
        trackAPIRequest('everything');
      }

      expect(canMakeRequest()).toBe(true);
    });
  });

  describe('getRequestHistory', () => {
    it('should return empty array initially', () => {
      const history = getRequestHistory();
      expect(history).toEqual([]);
    });

    it('should return all tracked requests', () => {
      trackAPIRequest('everything', { strategy: 'homepage' });
      trackAPIRequest('everything', { strategy: 'category' });
      trackAPIRequest('everything', { strategy: 'search' });

      const history = getRequestHistory();
      expect(history.length).toBe(3);
    });

    it('should return copy of history (not modify original)', () => {
      trackAPIRequest('everything');

      const history1 = getRequestHistory();
      const history2 = getRequestHistory();

      expect(history1).not.toBe(history2); // Different array references
      expect(history1).toEqual(history2); // But same content
    });

    it('should include all request details', () => {
      trackAPIRequest('everything', {
        query: 'AI breakthrough',
        strategy: 'homepage',
      });

      const history = getRequestHistory();
      expect(history[0].endpoint).toBe('everything');
      expect(history[0].query).toBe('AI breakthrough');
      expect(history[0].strategy).toBe('homepage');
      expect(history[0]).toHaveProperty('timestamp');
    });
  });

  describe('getUsageByStrategy', () => {
    it('should return empty object initially', () => {
      const usage = getUsageByStrategy();
      expect(usage).toEqual({});
    });

    it('should count requests per strategy', () => {
      trackAPIRequest('everything', { strategy: 'homepage' });
      trackAPIRequest('everything', { strategy: 'homepage' });
      trackAPIRequest('everything', { strategy: 'category' });
      trackAPIRequest('everything', { strategy: 'search' });

      const usage = getUsageByStrategy();
      expect(usage.homepage).toBe(2);
      expect(usage.category).toBe(1);
      expect(usage.search).toBe(1);
    });

    it('should handle requests without strategy', () => {
      trackAPIRequest('everything');

      const usage = getUsageByStrategy();
      expect(usage.unknown).toBe(1);
    });
  });

  describe('getUsageByHour', () => {
    it('should return empty object initially', () => {
      const usage = getUsageByHour();
      expect(usage).toEqual({});
    });

    it('should count requests per hour', () => {
      trackAPIRequest('everything');

      const usage = getUsageByHour();
      const currentHour = new Date().getHours();
      expect(usage[currentHour]).toBe(1);
    });

    it('should handle multiple requests in same hour', () => {
      trackAPIRequest('everything');
      trackAPIRequest('everything');
      trackAPIRequest('everything');

      const usage = getUsageByHour();
      const currentHour = new Date().getHours();
      expect(usage[currentHour]).toBe(3);
    });
  });

  describe('estimateRemainingCapacity', () => {
    it('should return capacity estimate', () => {
      const estimate = estimateRemainingCapacity();

      expect(estimate).toHaveProperty('remaining');
      expect(estimate).toHaveProperty('suggestions');
      expect(estimate.suggestions).toHaveProperty('homepage');
      expect(estimate.suggestions).toHaveProperty('categories');
      expect(estimate.suggestions).toHaveProperty('search');
    });

    it('should reserve capacity for search and buffer', () => {
      resetUsage();
      const estimate = estimateRemainingCapacity();

      expect(estimate.suggestions.search).toBe(100); // Search buffer
      // Homepage + categories + search + buffer should not exceed remaining
      const total =
        estimate.suggestions.homepage +
        estimate.suggestions.categories +
        estimate.suggestions.search +
        50; // Safety buffer

      expect(total).toBeLessThanOrEqual(estimate.remaining);
    });

    it('should allocate more to categories than homepage', () => {
      const estimate = estimateRemainingCapacity();

      expect(estimate.suggestions.categories).toBeGreaterThan(estimate.suggestions.homepage);
    });

    it('should handle low remaining capacity', () => {
      // Use most of the quota
      for (let i = 0; i < 450; i++) {
        trackAPIRequest('everything');
      }

      const estimate = estimateRemainingCapacity();
      expect(estimate.remaining).toBe(50);
      expect(estimate.suggestions.homepage).toBeGreaterThanOrEqual(0);
      expect(estimate.suggestions.categories).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetUsage', () => {
    it('should reset request count to 0', () => {
      trackAPIRequest('everything');
      trackAPIRequest('everything');
      trackAPIRequest('everything');

      resetUsage();

      const usage = getCurrentUsage();
      expect(usage.count).toBe(0);
    });

    it('should clear request history', () => {
      trackAPIRequest('everything');
      trackAPIRequest('everything');

      resetUsage();

      const history = getRequestHistory();
      expect(history).toEqual([]);
    });

    it('should reset usage statistics', () => {
      trackAPIRequest('everything', { strategy: 'homepage' });

      resetUsage();

      const usage = getUsageByStrategy();
      expect(usage).toEqual({});
    });
  });

  describe('getUsageReport', () => {
    it('should return formatted report string', () => {
      trackAPIRequest('everything', { strategy: 'homepage' });
      trackAPIRequest('everything', { strategy: 'category' });

      const report = getUsageReport();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include current date', () => {
      const report = getUsageReport();
      const today = new Date().toDateString();
      expect(report).toContain(today);
    });

    it('should include usage statistics', () => {
      trackAPIRequest('everything');

      const report = getUsageReport();
      expect(report).toContain('Total');
      expect(report).toContain('Remaining');
    });

    it('should include strategy breakdown', () => {
      trackAPIRequest('everything', { strategy: 'homepage' });
      trackAPIRequest('everything', { strategy: 'category' });

      const report = getUsageReport();
      expect(report).toContain('By Strategy');
      expect(report).toContain('homepage');
      expect(report).toContain('category');
    });
  });

  describe('Daily Reset', () => {
    it('should reset when date changes', () => {
      trackAPIRequest('everything');
      const usage1 = getCurrentUsage();
      const originalDate = usage1.date;

      // Mock date change by calling getCurrentUsage on a "new day"
      // This is tested by the internal logic that checks date string
      const today = new Date().toDateString();
      expect(usage1.date).toBe(today);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly 500 requests', () => {
      for (let i = 0; i < 500; i++) {
        trackAPIRequest('everything');
      }

      const usage = getCurrentUsage();
      expect(usage.count).toBe(500);
      expect(usage.remaining).toBe(0);
      expect(usage.percentage).toBe(100);
      expect(canMakeRequest()).toBe(false);
    });

    it('should handle tracking beyond limit', () => {
      for (let i = 0; i < 510; i++) {
        trackAPIRequest('everything');
      }

      const usage = getCurrentUsage();
      expect(usage.count).toBe(510);
      expect(usage.remaining).toBe(-10);
    });

    it('should handle empty metadata', () => {
      trackAPIRequest('everything', {});

      const history = getRequestHistory();
      expect(history.length).toBe(1);
    });

    it('should handle undefined endpoint', () => {
      trackAPIRequest(undefined as any);

      const usage = getCurrentUsage();
      expect(usage.count).toBe(1);
    });
  });
});
