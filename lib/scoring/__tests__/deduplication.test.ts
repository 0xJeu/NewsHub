import {
  deduplicateArticles,
  deduplicateArticlesAdvanced,
  getDuplicateGroups,
  getDeduplicationStats,
  ScoredArticle,
} from '../deduplication';
import { ArticleScore } from '../article-scorer';

describe('Article Deduplication', () => {
  const createMockScore = (total: number): ArticleScore => ({
    total,
    breakdown: {
      sourceAuthority: 80,
      recency: 90,
      imageQuality: 40,
      titleQuality: 40,
      descriptionQuality: 30,
    },
  });

  const createMockArticle = (
    title: string,
    score: number,
    source: string = 'Test Source'
  ): ScoredArticle => ({
    title,
    description: 'Test description',
    url: `https://example.com/${title.replace(/\s+/g, '-').toLowerCase()}`,
    urlToImage: 'https://example.com/image.jpg',
    publishedAt: new Date().toISOString(),
    source: { name: source },
    score: createMockScore(score),
  });

  describe('deduplicateArticles', () => {
    it('should remove exact duplicate titles', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15 with improved camera', 85, 'TechCrunch'),
        createMockArticle('Apple announces new iPhone 15 with improved camera', 75, 'The Verge'),
        createMockArticle('Different article about something else', 70, 'CNET'),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(2);
      expect(result[0].source?.name).toBe('TechCrunch'); // Higher score kept
    });

    it('should remove similar titles (first 8 words match)', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15 with improved camera and battery', 85, 'TechCrunch'),
        createMockArticle('Apple announces new iPhone 15 with improved camera system', 75, 'CNET'),
        createMockArticle('Microsoft releases Windows 12 update', 80, 'Reuters'),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(2);
    });

    it('should keep the highest-scored version', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Breaking news about major event', 60, 'Source A'),
        createMockArticle('Breaking news about major event', 90, 'Source B'),
        createMockArticle('Breaking news about major event', 75, 'Source C'),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
      expect(result[0].score.total).toBe(90);
      expect(result[0].source?.name).toBe('Source B');
    });

    it('should preserve unique articles', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new product', 85, 'TechCrunch'),
        createMockArticle('Google releases AI update', 80, 'The Verge'),
        createMockArticle('Microsoft improves Windows security', 75, 'CNET'),
        createMockArticle('Amazon expands cloud services', 70, 'Reuters'),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(4);
    });

    it('should handle empty array', () => {
      const result = deduplicateArticles([]);
      expect(result).toEqual([]);
    });

    it('should handle single article', () => {
      const articles = [createMockArticle('Single article', 80)];
      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Single article');
    });

    it('should sort results by score descending', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Article A', 60),
        createMockArticle('Article B', 90),
        createMockArticle('Article C', 75),
        createMockArticle('Article D', 85),
      ];

      const result = deduplicateArticles(articles);
      expect(result[0].score.total).toBe(90);
      expect(result[1].score.total).toBe(85);
      expect(result[2].score.total).toBe(75);
      expect(result[3].score.total).toBe(60);
    });

    it('should detect duplicates with different punctuation', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15!', 85),
        createMockArticle('Apple announces new iPhone 15.', 80),
        createMockArticle('Apple announces new iPhone 15', 75),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
    });

    it('should detect duplicates with different casing', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('APPLE ANNOUNCES NEW IPHONE 15', 85),
        createMockArticle('Apple Announces New iPhone 15', 80),
        createMockArticle('apple announces new iphone 15', 75),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
    });

    it('should handle articles with similar but distinct content', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces iPhone 15', 85),
        createMockArticle('Apple announces iPhone 16', 80),
        createMockArticle('Apple announces iPad Pro', 75),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(3); // All different
    });
  });

  describe('deduplicateArticlesAdvanced', () => {
    it('should use custom similarity threshold', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new product line today', 85),
        createMockArticle('Apple announces new product line yesterday', 80),
      ];

      // With high threshold (0.9), might not match
      const strictResult = deduplicateArticlesAdvanced(articles, {
        similarityThreshold: 0.9,
      });

      // With low threshold (0.5), should match
      const lenientResult = deduplicateArticlesAdvanced(articles, {
        similarityThreshold: 0.5,
      });

      expect(lenientResult.length).toBeLessThanOrEqual(strictResult.length);
    });

    it('should prefer preferred sources when scores are close', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Breaking news story', 75, 'Generic News'),
        createMockArticle('Breaking news story', 76, 'Reuters'),
      ];

      const result = deduplicateArticlesAdvanced(articles, {
        preferredSources: ['Reuters', 'AP News'],
      });

      expect(result.length).toBe(1);
      expect(result[0].source?.name).toBe('Reuters');
    });

    it('should use custom word count for comparison', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15 with camera', 85),
        createMockArticle('Apple announces new iPhone 15 with battery', 80),
      ];

      // With wordCount=4, should match (first 4 words identical)
      const shortResult = deduplicateArticlesAdvanced(articles, {
        wordCount: 4,
      });

      // With wordCount=8, might not match (different at word 6)
      const longResult = deduplicateArticlesAdvanced(articles, {
        wordCount: 8,
      });

      expect(shortResult.length).toBeLessThanOrEqual(longResult.length);
    });
  });

  describe('getDuplicateGroups', () => {
    it('should identify duplicate groups', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces iPhone 15', 85, 'TechCrunch'),
        createMockArticle('Apple announces iPhone 15', 80, 'The Verge'),
        createMockArticle('Apple announces iPhone 15', 75, 'CNET'),
        createMockArticle('Google releases AI update', 90, 'Reuters'),
        createMockArticle('Google releases AI update', 85, 'Bloomberg'),
      ];

      const groups = getDuplicateGroups(articles);
      expect(groups.length).toBe(2); // Two groups of duplicates
      expect(groups[0].length).toBe(3); // iPhone group
      expect(groups[1].length).toBe(2); // Google group
    });

    it('should return empty array when no duplicates', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Article A', 85),
        createMockArticle('Article B', 80),
        createMockArticle('Article C', 75),
      ];

      const groups = getDuplicateGroups(articles);
      expect(groups.length).toBe(0);
    });

    it('should group all variations of the same story', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15!', 90),
        createMockArticle('Apple Announces New iPhone 15', 85),
        createMockArticle('APPLE ANNOUNCES NEW IPHONE 15.', 80),
      ];

      const groups = getDuplicateGroups(articles);
      expect(groups.length).toBe(1);
      expect(groups[0].length).toBe(3);
    });
  });

  describe('getDeduplicationStats', () => {
    it('should calculate correct statistics', () => {
      const original: ScoredArticle[] = [
        createMockArticle('Story A', 85),
        createMockArticle('Story A', 80),
        createMockArticle('Story B', 90),
        createMockArticle('Story B', 85),
        createMockArticle('Story C', 75),
      ];

      const deduplicated: ScoredArticle[] = [
        createMockArticle('Story A', 85),
        createMockArticle('Story B', 90),
        createMockArticle('Story C', 75),
      ];

      const stats = getDeduplicationStats(original, deduplicated);

      expect(stats.originalCount).toBe(5);
      expect(stats.deduplicatedCount).toBe(3);
      expect(stats.removedCount).toBe(2);
      expect(stats.removalRate).toBe(40);
    });

    it('should handle no deduplication', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Article A', 85),
        createMockArticle('Article B', 80),
      ];

      const stats = getDeduplicationStats(articles, articles);

      expect(stats.originalCount).toBe(2);
      expect(stats.deduplicatedCount).toBe(2);
      expect(stats.removedCount).toBe(0);
      expect(stats.removalRate).toBe(0);
    });

    it('should handle complete deduplication', () => {
      const original: ScoredArticle[] = [
        createMockArticle('Same story', 85),
        createMockArticle('Same story', 80),
        createMockArticle('Same story', 75),
      ];

      const deduplicated: ScoredArticle[] = [
        createMockArticle('Same story', 85),
      ];

      const stats = getDeduplicationStats(original, deduplicated);

      expect(stats.originalCount).toBe(3);
      expect(stats.deduplicatedCount).toBe(1);
      expect(stats.removedCount).toBe(2);
      expect(stats.removalRate).toBeCloseTo(66.7, 1);
    });

    it('should handle empty arrays', () => {
      const stats = getDeduplicationStats([], []);

      expect(stats.originalCount).toBe(0);
      expect(stats.deduplicatedCount).toBe(0);
      expect(stats.removedCount).toBe(0);
      expect(stats.removalRate).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short titles', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('News', 85),
        createMockArticle('News', 80),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is an extremely long title that contains many words and goes on and on about various topics';
      const articles: ScoredArticle[] = [
        createMockArticle(longTitle, 85),
        createMockArticle(longTitle + ' continued', 80),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle titles with special characters', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('Apple announces new iPhone 15 Pro Max', 85),
        createMockArticle("Apple announces new iPhone 15 Pro Max!", 80),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
    });

    it('should handle titles with numbers', () => {
      const articles: ScoredArticle[] = [
        createMockArticle('iPhone 15 Pro Max released', 85),
        createMockArticle('iPhone 15 Pro Max released', 80),
      ];

      const result = deduplicateArticles(articles);
      expect(result.length).toBe(1);
    });
  });
});
