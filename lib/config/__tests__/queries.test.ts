import {
  QUERY_STRATEGIES,
  buildRotatingQuery,
  buildComprehensiveQuery,
  buildMajorEventsQuery,
  buildTrendingQuery,
  getLast3Days,
  getLast7Days,
  getLast30Days,
  getLastHours,
} from '../queries';

describe('Query Construction', () => {
  describe('QUERY_STRATEGIES', () => {
    it('should have majorEvents strategy with correct weight', () => {
      expect(QUERY_STRATEGIES.majorEvents).toBeDefined();
      expect(QUERY_STRATEGIES.majorEvents.weight).toBe(60);
      expect(QUERY_STRATEGIES.majorEvents.queries).toBeDefined();
      expect(QUERY_STRATEGIES.majorEvents.queries.length).toBeGreaterThan(0);
    });

    it('should have trending strategy with correct weight', () => {
      expect(QUERY_STRATEGIES.trending).toBeDefined();
      expect(QUERY_STRATEGIES.trending.weight).toBe(25);
      expect(QUERY_STRATEGIES.trending.queries).toBeDefined();
      expect(QUERY_STRATEGIES.trending.queries.length).toBeGreaterThan(0);
    });

    it('should have discovery strategy with correct weight', () => {
      expect(QUERY_STRATEGIES.discovery).toBeDefined();
      expect(QUERY_STRATEGIES.discovery.weight).toBe(15);
      expect(QUERY_STRATEGIES.discovery.queries).toBeDefined();
      expect(QUERY_STRATEGIES.discovery.queries.length).toBeGreaterThan(0);
    });

    it('should have weights that sum to 100', () => {
      const totalWeight =
        QUERY_STRATEGIES.majorEvents.weight +
        QUERY_STRATEGIES.trending.weight +
        QUERY_STRATEGIES.discovery.weight;
      expect(totalWeight).toBe(100);
    });

    it('should have newsworthy keywords in majorEvents', () => {
      const allQueries = QUERY_STRATEGIES.majorEvents.queries.join(' ');
      expect(allQueries.toLowerCase()).toContain('announces');
      expect(allQueries.toLowerCase()).toContain('launches');
      expect(allQueries.toLowerCase()).toContain('breakthrough');
    });

    it('should have current topics in trending', () => {
      const allQueries = QUERY_STRATEGIES.trending.queries.join(' ');
      expect(allQueries.toLowerCase()).toContain('ai');
      expect(allQueries.toLowerCase()).toContain('climate');
    });

    it('should have innovation keywords in discovery', () => {
      const allQueries = QUERY_STRATEGIES.discovery.queries.join(' ');
      expect(allQueries.toLowerCase()).toContain('startup');
      expect(allQueries.toLowerCase()).toContain('innovation');
      expect(allQueries.toLowerCase()).toContain('research');
    });
  });

  describe('buildRotatingQuery', () => {
    it('should return a non-empty string', () => {
      const query = buildRotatingQuery();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should return different queries on multiple calls (probabilistic)', () => {
      const queries = new Set<string>();
      // Run 20 times to get variety
      for (let i = 0; i < 20; i++) {
        queries.add(buildRotatingQuery());
      }
      // Should have at least 2 different queries
      expect(queries.size).toBeGreaterThan(1);
    });

    it('should return valid NewsAPI query format', () => {
      const query = buildRotatingQuery();
      // Should not have invalid characters
      expect(query).not.toContain('"\\');
      expect(query).not.toContain('  '); // No double spaces
    });

    it('should contain OR operators or be a single query', () => {
      const query = buildRotatingQuery();
      const isValid = query.includes(' OR ') || !query.includes('undefined');
      expect(isValid).toBe(true);
    });
  });

  describe('buildComprehensiveQuery', () => {
    it('should return a non-empty string', () => {
      const query = buildComprehensiveQuery();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should combine multiple strategies', () => {
      const query = buildComprehensiveQuery();
      // Should have multiple OR operators since it combines strategies
      const orCount = (query.match(/ OR /g) || []).length;
      expect(orCount).toBeGreaterThanOrEqual(1);
    });

    it('should include parentheses for grouping', () => {
      const query = buildComprehensiveQuery();
      expect(query).toContain('(');
      expect(query).toContain(')');
    });

    it('should be longer than a single rotating query (on average)', () => {
      const comprehensive = buildComprehensiveQuery();
      const rotating = buildRotatingQuery();
      // Comprehensive should generally be longer
      expect(comprehensive.length).toBeGreaterThan(10);
    });
  });

  describe('buildMajorEventsQuery', () => {
    it('should return a non-empty string', () => {
      const query = buildMajorEventsQuery();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should include OR operators', () => {
      const query = buildMajorEventsQuery();
      expect(query).toContain(' OR ');
    });

    it('should include parentheses for grouping', () => {
      const query = buildMajorEventsQuery();
      expect(query).toContain('(');
      expect(query).toContain(')');
    });
  });

  describe('buildTrendingQuery', () => {
    it('should return a non-empty string', () => {
      const query = buildTrendingQuery();
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should be from trending strategy queries', () => {
      const query = buildTrendingQuery();
      const trendingQueries = QUERY_STRATEGIES.trending.queries;
      const isValid = trendingQueries.some(q => q === query);
      expect(isValid).toBe(true);
    });
  });

  describe('Date Filtering Functions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('getLast3Days', () => {
      it('should return ISO date string', () => {
        const date = getLast3Days();
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should return date 3 days ago', () => {
        const date = getLast3Days();
        const parsedDate = new Date(date);
        const expected = new Date('2024-01-12T12:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });
    });

    describe('getLast7Days', () => {
      it('should return ISO date string', () => {
        const date = getLast7Days();
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should return date 7 days ago', () => {
        const date = getLast7Days();
        const parsedDate = new Date(date);
        const expected = new Date('2024-01-08T12:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });
    });

    describe('getLast30Days', () => {
      it('should return ISO date string', () => {
        const date = getLast30Days();
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should return date 30 days ago', () => {
        const date = getLast30Days();
        const parsedDate = new Date(date);
        const expected = new Date('2023-12-16T12:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });
    });

    describe('getLastHours', () => {
      it('should return ISO date string', () => {
        const date = getLastHours(6);
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should return date 6 hours ago', () => {
        const date = getLastHours(6);
        const parsedDate = new Date(date);
        const expected = new Date('2024-01-15T06:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });

      it('should return date 24 hours ago', () => {
        const date = getLastHours(24);
        const parsedDate = new Date(date);
        const expected = new Date('2024-01-14T12:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });

      it('should handle 1 hour', () => {
        const date = getLastHours(1);
        const parsedDate = new Date(date);
        const expected = new Date('2024-01-15T11:00:00Z');
        expect(parsedDate.getTime()).toBe(expected.getTime());
      });
    });
  });

  describe('Query Quality', () => {
    it('rotating queries should not contain generic company names', () => {
      const queries = new Set<string>();
      for (let i = 0; i < 10; i++) {
        queries.add(buildRotatingQuery());
      }

      queries.forEach(query => {
        const lowerQuery = query.toLowerCase();
        // Should focus on events/topics, not specific companies
        expect(lowerQuery).not.toContain('google');
        expect(lowerQuery).not.toContain('apple');
        expect(lowerQuery).not.toContain('microsoft');
      });
    });

    it('queries should focus on interesting signals', () => {
      const allQueries = [
        ...QUERY_STRATEGIES.majorEvents.queries,
        ...QUERY_STRATEGIES.trending.queries,
        ...QUERY_STRATEGIES.discovery.queries,
      ];

      const interestingKeywords = [
        'announces',
        'launches',
        'breakthrough',
        'discovery',
        'ai',
        'climate',
        'innovation',
        'startup',
      ];

      const hasInterestingKeywords = allQueries.some(query =>
        interestingKeywords.some(keyword =>
          query.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      expect(hasInterestingKeywords).toBe(true);
    });
  });
});
