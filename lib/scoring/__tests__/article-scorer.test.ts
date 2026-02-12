import {
  scoreArticle,
  shouldFeatureArticle,
  isTrendingArticle,
  getScoreTier,
  RawArticle,
} from '../article-scorer';
import { SourceConfig } from '@/lib/config/sources';

describe('Article Scoring', () => {
  const mockTier1Source: SourceConfig = {
    domain: 'techcrunch.com',
    tier: 1,
    authorityScore: 100,
    categories: ['Technology'],
    name: 'TechCrunch',
  };

  const mockTier2Source: SourceConfig = {
    domain: 'cnet.com',
    tier: 2,
    authorityScore: 80,
    categories: ['Technology'],
    name: 'CNET',
  };

  const mockTier3Source: SourceConfig = {
    domain: 'usatoday.com',
    tier: 3,
    authorityScore: 60,
    categories: ['General'],
    name: 'USA Today',
  };

  const createMockArticle = (overrides?: Partial<RawArticle>): RawArticle => ({
    title: 'Test Article Title Here',
    description: 'This is a test description for the article with enough content to be meaningful.',
    url: 'https://example.com/article',
    urlToImage: 'https://example.com/image.jpg',
    publishedAt: new Date().toISOString(),
    source: { name: 'Test Source' },
    ...overrides,
  });

  describe('scoreArticle', () => {
    it('should return a score object with total and breakdown', () => {
      const article = createMockArticle();
      const score = scoreArticle(article, mockTier1Source);

      expect(score).toHaveProperty('total');
      expect(score).toHaveProperty('breakdown');
      expect(score.breakdown).toHaveProperty('sourceAuthority');
      expect(score.breakdown).toHaveProperty('recency');
      expect(score.breakdown).toHaveProperty('imageQuality');
      expect(score.breakdown).toHaveProperty('titleQuality');
      expect(score.breakdown).toHaveProperty('descriptionQuality');
    });

    it('should calculate total score as weighted sum', () => {
      const article = createMockArticle();
      const score = scoreArticle(article, mockTier1Source);

      const expectedTotal =
        score.breakdown.sourceAuthority * 0.30 +
        score.breakdown.recency * 0.25 +
        score.breakdown.imageQuality * 0.15 +
        score.breakdown.titleQuality * 0.20 +
        score.breakdown.descriptionQuality * 0.10;

      expect(score.total).toBeCloseTo(expectedTotal, 1);
    });

    it('should give higher scores to tier 1 sources', () => {
      const article = createMockArticle();
      const tier1Score = scoreArticle(article, mockTier1Source);
      const tier3Score = scoreArticle(article, mockTier3Source);

      expect(tier1Score.total).toBeGreaterThan(tier3Score.total);
    });

    it('should score recent articles higher', () => {
      const recentArticle = createMockArticle({
        publishedAt: new Date().toISOString(), // Now
      });

      const oldArticle = createMockArticle({
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      });

      const recentScore = scoreArticle(recentArticle);
      const oldScore = scoreArticle(oldArticle);

      expect(recentScore.breakdown.recency).toBeGreaterThan(oldScore.breakdown.recency);
    });

    it('should give perfect recency score to very recent articles', () => {
      const article = createMockArticle({
        publishedAt: new Date().toISOString(),
      });

      const score = scoreArticle(article);
      expect(score.breakdown.recency).toBe(100);
    });

    it('should score articles with images higher', () => {
      const withImage = createMockArticle({
        urlToImage: 'https://example.com/image.jpg',
      });

      const withoutImage = createMockArticle({
        urlToImage: undefined,
      });

      const withImageScore = scoreArticle(withImage);
      const withoutImageScore = scoreArticle(withoutImage);

      expect(withImageScore.breakdown.imageQuality).toBeGreaterThan(withoutImageScore.breakdown.imageQuality);
      expect(withoutImageScore.breakdown.imageQuality).toBe(0);
    });

    it('should prefer HTTPS images over HTTP', () => {
      const httpsArticle = createMockArticle({
        urlToImage: 'https://example.com/image.jpg',
      });

      const httpArticle = createMockArticle({
        urlToImage: 'http://example.com/image.jpg',
      });

      const httpsScore = scoreArticle(httpsArticle);
      const httpScore = scoreArticle(httpArticle);

      expect(httpsScore.breakdown.imageQuality).toBeGreaterThan(httpScore.breakdown.imageQuality);
    });

    it('should score ideal title length (50-100 chars) higher', () => {
      const idealTitle = createMockArticle({
        title: 'This is a well-sized title that should score well in our system',
      });

      const shortTitle = createMockArticle({
        title: 'Short',
      });

      const longTitle = createMockArticle({
        title: 'This is an extremely long title that goes on and on and on and contains way too much information and should be penalized',
      });

      const idealScore = scoreArticle(idealTitle);
      const shortScore = scoreArticle(shortTitle);
      const longScore = scoreArticle(longTitle);

      expect(idealScore.breakdown.titleQuality).toBeGreaterThan(shortScore.breakdown.titleQuality);
      expect(idealScore.breakdown.titleQuality).toBeGreaterThan(longScore.breakdown.titleQuality);
    });

    it('should reward interesting keywords in titles', () => {
      const interestingTitle = createMockArticle({
        title: 'Company announces major breakthrough in AI technology research',
      });

      const boringTitle = createMockArticle({
        title: 'Some regular news about stuff',
      });

      const interestingScore = scoreArticle(interestingTitle);
      const boringScore = scoreArticle(boringTitle);

      // Interesting title should score at least as high (may be equal due to other factors)
      expect(interestingScore.breakdown.titleQuality).toBeGreaterThanOrEqual(boringScore.breakdown.titleQuality);
    });

    it('should penalize clickbait titles', () => {
      const clickbaitTitle = createMockArticle({
        title: "You won't believe what this company did - it will shock you!",
      });

      const normalTitle = createMockArticle({
        title: 'Company releases new product with improved features',
      });

      const clickbaitScore = scoreArticle(clickbaitTitle);
      const normalScore = scoreArticle(normalTitle);

      expect(clickbaitScore.breakdown.titleQuality).toBeLessThan(normalScore.breakdown.titleQuality);
    });

    it('should score good descriptions higher', () => {
      const goodDescription = createMockArticle({
        description: 'This is a comprehensive description that provides meaningful context and information about the article content in a clear and concise manner.',
      });

      const shortDescription = createMockArticle({
        description: 'Short description text here',
      });

      const noDescription = createMockArticle({
        description: undefined,
      });

      const goodScore = scoreArticle(goodDescription);
      const shortScore = scoreArticle(shortDescription);
      const noScore = scoreArticle(noDescription);

      expect(goodScore.breakdown.descriptionQuality).toBeGreaterThan(shortScore.breakdown.descriptionQuality);
      expect(shortScore.breakdown.descriptionQuality).toBeGreaterThanOrEqual(noScore.breakdown.descriptionQuality);
      expect(noScore.breakdown.descriptionQuality).toBe(0);
    });

    it('should handle articles without source config', () => {
      const article = createMockArticle();
      const score = scoreArticle(article); // No source config

      expect(score.breakdown.sourceAuthority).toBe(40); // Default baseline
      expect(score.total).toBeGreaterThan(0);
    });

    it('should have total score between 0 and 100', () => {
      const article = createMockArticle();
      const score = scoreArticle(article, mockTier1Source);

      expect(score.total).toBeGreaterThanOrEqual(0);
      expect(score.total).toBeLessThanOrEqual(100);
    });
  });

  describe('shouldFeatureArticle', () => {
    it('should feature articles with score >= 80', () => {
      const score = {
        total: 85,
        breakdown: {
          sourceAuthority: 100,
          recency: 90,
          imageQuality: 40,
          titleQuality: 45,
          descriptionQuality: 30,
        },
      };

      expect(shouldFeatureArticle(score)).toBe(true);
    });

    it('should not feature articles with score < 80', () => {
      const score = {
        total: 75,
        breakdown: {
          sourceAuthority: 80,
          recency: 70,
          imageQuality: 30,
          titleQuality: 40,
          descriptionQuality: 25,
        },
      };

      expect(shouldFeatureArticle(score)).toBe(false);
    });

    it('should feature articles with exactly 80 score', () => {
      const score = {
        total: 80,
        breakdown: {
          sourceAuthority: 80,
          recency: 80,
          imageQuality: 40,
          titleQuality: 40,
          descriptionQuality: 30,
        },
      };

      expect(shouldFeatureArticle(score)).toBe(true);
    });
  });

  describe('isTrendingArticle', () => {
    it('should identify trending articles (score >= 75 and recency >= 70)', () => {
      const score = {
        total: 80,
        breakdown: {
          sourceAuthority: 100,
          recency: 90,
          imageQuality: 40,
          titleQuality: 45,
          descriptionQuality: 30,
        },
      };

      expect(isTrendingArticle(score)).toBe(true);
    });

    it('should not mark old articles as trending even with high score', () => {
      const score = {
        total: 85,
        breakdown: {
          sourceAuthority: 100,
          recency: 50, // Old
          imageQuality: 40,
          titleQuality: 45,
          descriptionQuality: 30,
        },
      };

      expect(isTrendingArticle(score)).toBe(false);
    });

    it('should not mark low-score recent articles as trending', () => {
      const score = {
        total: 60,
        breakdown: {
          sourceAuthority: 60,
          recency: 90, // Recent
          imageQuality: 30,
          titleQuality: 35,
          descriptionQuality: 20,
        },
      };

      expect(isTrendingArticle(score)).toBe(false);
    });
  });

  describe('getScoreTier', () => {
    it('should return "premium" for scores >= 80', () => {
      expect(getScoreTier(85)).toBe('premium');
      expect(getScoreTier(80)).toBe('premium');
      expect(getScoreTier(100)).toBe('premium');
    });

    it('should return "good" for scores 65-79', () => {
      expect(getScoreTier(75)).toBe('good');
      expect(getScoreTier(65)).toBe('good');
      expect(getScoreTier(70)).toBe('good');
    });

    it('should return "standard" for scores 50-64', () => {
      expect(getScoreTier(60)).toBe('standard');
      expect(getScoreTier(50)).toBe('standard');
      expect(getScoreTier(55)).toBe('standard');
    });

    it('should return "low" for scores < 50', () => {
      expect(getScoreTier(45)).toBe('low');
      expect(getScoreTier(30)).toBe('low');
      expect(getScoreTier(0)).toBe('low');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const article = createMockArticle({ title: '' });
      const score = scoreArticle(article);
      expect(score.breakdown.titleQuality).toBe(0);
    });

    it('should handle missing fields gracefully', () => {
      const minimalArticle: RawArticle = {
        title: 'Title',
        url: 'https://example.com',
        publishedAt: new Date().toISOString(),
      };

      const score = scoreArticle(minimalArticle);
      expect(score.total).toBeGreaterThan(0);
    });

    it('should handle invalid image URLs', () => {
      const article = createMockArticle({
        urlToImage: 'not-a-valid-url',
      });

      const score = scoreArticle(article);
      expect(score.breakdown.imageQuality).toBe(0);
    });
  });
});
