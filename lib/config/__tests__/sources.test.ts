import {
  QUALITY_SOURCES,
  getAllDomains,
  getDomainsByCategories,
  findSourceConfig,
  getSourcesByTier,
  SourceConfig,
} from '../sources';

describe('Source Configuration', () => {
  describe('QUALITY_SOURCES', () => {
    it('should have at least 40 sources', () => {
      expect(QUALITY_SOURCES.length).toBeGreaterThanOrEqual(40);
    });

    it('should have sources in all 3 tiers', () => {
      const tier1 = QUALITY_SOURCES.filter(s => s.tier === 1);
      const tier2 = QUALITY_SOURCES.filter(s => s.tier === 2);
      const tier3 = QUALITY_SOURCES.filter(s => s.tier === 3);

      expect(tier1.length).toBeGreaterThan(0);
      expect(tier2.length).toBeGreaterThan(0);
      expect(tier3.length).toBeGreaterThan(0);
    });

    it('should have correct authority scores for each tier', () => {
      const tier1 = QUALITY_SOURCES.filter(s => s.tier === 1);
      const tier2 = QUALITY_SOURCES.filter(s => s.tier === 2);
      const tier3 = QUALITY_SOURCES.filter(s => s.tier === 3);

      tier1.forEach(source => {
        expect(source.authorityScore).toBe(100);
      });

      tier2.forEach(source => {
        expect(source.authorityScore).toBe(80);
      });

      tier3.forEach(source => {
        expect(source.authorityScore).toBe(60);
      });
    });

    it('should have valid domain names', () => {
      QUALITY_SOURCES.forEach(source => {
        expect(source.domain).toBeTruthy();
        expect(source.domain).toMatch(/^[\w.-]+\.\w+$/);
      });
    });

    it('should have display names', () => {
      QUALITY_SOURCES.forEach(source => {
        expect(source.name).toBeTruthy();
        expect(source.name.length).toBeGreaterThan(0);
      });
    });

    it('should have at least one category per source', () => {
      QUALITY_SOURCES.forEach(source => {
        expect(source.categories).toBeDefined();
        expect(source.categories.length).toBeGreaterThan(0);
      });
    });

    it('should cover all 6 main categories', () => {
      const allCategories = new Set<string>();
      QUALITY_SOURCES.forEach(source => {
        source.categories.forEach(cat => allCategories.add(cat));
      });

      expect(allCategories.has('Politics')).toBe(true);
      expect(allCategories.has('Technology')).toBe(true);
      expect(allCategories.has('Science')).toBe(true);
      expect(allCategories.has('Entertainment')).toBe(true);
      expect(allCategories.has('Sports')).toBe(true);
      expect(allCategories.has('Health')).toBe(true);
    });

    it('should have premium tech sources', () => {
      const techSources = QUALITY_SOURCES.filter(s =>
        s.categories.includes('Technology') && s.tier === 1
      );

      const domains = techSources.map(s => s.domain);
      expect(domains).toContain('techcrunch.com');
      expect(domains).toContain('theverge.com');
      expect(domains).toContain('arstechnica.com');
    });

    it('should have premium news sources', () => {
      const newsSources = QUALITY_SOURCES.filter(s =>
        s.tier === 1 && (s.categories.includes('Politics') || s.categories.includes('General'))
      );

      const domains = newsSources.map(s => s.domain);
      expect(domains).toContain('reuters.com');
      expect(domains).toContain('apnews.com');
    });
  });

  describe('getAllDomains', () => {
    it('should return comma-separated string of all domains', () => {
      const domains = getAllDomains();
      expect(typeof domains).toBe('string');
      expect(domains.length).toBeGreaterThan(0);
      expect(domains.includes(',')).toBe(true);
    });

    it('should include all source domains', () => {
      const domains = getAllDomains();
      const domainArray = domains.split(',');
      expect(domainArray.length).toBe(QUALITY_SOURCES.length);
    });

    it('should include techcrunch.com', () => {
      const domains = getAllDomains();
      expect(domains).toContain('techcrunch.com');
    });
  });

  describe('getDomainsByCategories', () => {
    it('should return domains for Technology category', () => {
      const domains = getDomainsByCategories(['Technology']);
      expect(domains).toContain('techcrunch.com');
      expect(domains).toContain('theverge.com');
    });

    it('should return domains for Politics category', () => {
      const domains = getDomainsByCategories(['Politics']);
      expect(domains).toContain('politico.com');
      expect(domains).toContain('reuters.com');
    });

    it('should return combined domains for multiple categories', () => {
      const domains = getDomainsByCategories(['Technology', 'Science']);
      expect(domains).toContain('techcrunch.com');
      expect(domains).toContain('nature.com');
    });

    it('should return empty string for non-existent category', () => {
      const domains = getDomainsByCategories(['NonExistentCategory']);
      expect(domains).toBe('');
    });

    it('should handle empty array', () => {
      const domains = getDomainsByCategories([]);
      expect(domains).toBe('');
    });
  });

  describe('findSourceConfig', () => {
    it('should find source by exact domain match', () => {
      const source = findSourceConfig('techcrunch.com');
      expect(source).toBeDefined();
      expect(source?.domain).toBe('techcrunch.com');
    });

    it('should find source by name', () => {
      const source = findSourceConfig('TechCrunch');
      expect(source).toBeDefined();
      expect(source?.domain).toBe('techcrunch.com');
    });

    it('should find source by partial domain', () => {
      const source = findSourceConfig('techcrunch');
      expect(source).toBeDefined();
      expect(source?.domain).toBe('techcrunch.com');
    });

    it('should handle case-insensitive search', () => {
      const source = findSourceConfig('TECHCRUNCH');
      expect(source).toBeDefined();
      expect(source?.domain).toBe('techcrunch.com');
    });

    it('should return undefined for unknown source', () => {
      const source = findSourceConfig('unknown-source.com');
      expect(source).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const source = findSourceConfig('');
      expect(source).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const source = findSourceConfig(undefined);
      expect(source).toBeUndefined();
    });
  });

  describe('getSourcesByTier', () => {
    it('should return only tier 1 sources', () => {
      const sources = getSourcesByTier(1);
      expect(sources.length).toBeGreaterThan(0);
      sources.forEach(source => {
        expect(source.tier).toBe(1);
        expect(source.authorityScore).toBe(100);
      });
    });

    it('should return only tier 2 sources', () => {
      const sources = getSourcesByTier(2);
      expect(sources.length).toBeGreaterThan(0);
      sources.forEach(source => {
        expect(source.tier).toBe(2);
        expect(source.authorityScore).toBe(80);
      });
    });

    it('should return only tier 3 sources', () => {
      const sources = getSourcesByTier(3);
      expect(sources.length).toBeGreaterThan(0);
      sources.forEach(source => {
        expect(source.tier).toBe(3);
        expect(source.authorityScore).toBe(60);
      });
    });

    it('should have tier 1 as smallest group (premium sources)', () => {
      const tier1 = getSourcesByTier(1);
      const tier2 = getSourcesByTier(2);
      const tier3 = getSourcesByTier(3);

      // Tier 1 should be selective (premium)
      expect(tier1.length).toBeLessThan(tier2.length + tier3.length);
    });
  });

  describe('Source Quality Distribution', () => {
    it('should have balanced distribution across tiers', () => {
      const tier1 = getSourcesByTier(1).length;
      const tier2 = getSourcesByTier(2).length;
      const tier3 = getSourcesByTier(3).length;
      const total = tier1 + tier2 + tier3;

      // Each tier should have at least 15% of total sources
      expect(tier1 / total).toBeGreaterThan(0.15);
      expect(tier2 / total).toBeGreaterThan(0.15);
      expect(tier3 / total).toBeGreaterThan(0.15);
    });

    it('should have technology sources across tiers', () => {
      const tier1Tech = getSourcesByTier(1).filter(s => s.categories.includes('Technology'));
      const tier2Tech = getSourcesByTier(2).filter(s => s.categories.includes('Technology'));

      expect(tier1Tech.length).toBeGreaterThan(0);
      expect(tier2Tech.length).toBeGreaterThan(0);
      // Tier 3 may or may not have tech sources (mostly general/sports/entertainment)
    });
  });
});
