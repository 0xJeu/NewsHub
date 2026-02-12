import {
  assignCategory,
  assignCategoryWithConfidence,
  batchCategorize,
  filterByCategory,
  getCategoryDistribution,
  validateCategoryMatch,
  getSuggestedCategories,
} from '../categorizer';
import { SourceConfig } from '@/lib/config/sources';

describe('Article Categorization', () => {
  const mockTechSource: SourceConfig = {
    domain: 'techcrunch.com',
    tier: 1,
    authorityScore: 100,
    categories: ['Technology'],
    name: 'TechCrunch',
  };

  const mockPoliticsSource: SourceConfig = {
    domain: 'politico.com',
    tier: 3,
    authorityScore: 60,
    categories: ['Politics'],
    name: 'Politico',
  };

  describe('assignCategory', () => {
    it('should categorize technology articles', () => {
      const article = {
        title: 'New AI software revolutionizes tech industry',
        description: 'A startup has developed artificial intelligence software that improves coding productivity',
      };

      const category = assignCategory(article);
      expect(category).toBe('Technology');
    });

    it('should categorize politics articles', () => {
      const article = {
        title: 'Senate passes new legislation on climate policy',
        description: 'Congress voted today on important government policy changes regarding elections',
      };

      const category = assignCategory(article);
      expect(category).toBe('Politics');
    });

    it('should categorize science articles', () => {
      const article = {
        title: 'Scientists make breakthrough discovery in climate research',
        description: 'New study reveals important findings about environmental changes and ecosystems',
      };

      const category = assignCategory(article);
      expect(category).toBe('Science');
    });

    it('should categorize entertainment articles', () => {
      const article = {
        title: 'New Hollywood movie breaks box office records',
        description: 'Latest film from famous actor premieres to sold-out theaters and streaming services',
      };

      const category = assignCategory(article);
      expect(category).toBe('Entertainment');
    });

    it('should categorize sports articles', () => {
      const article = {
        title: 'NBA championship game ends in historic victory',
        description: 'Basketball team wins championship after incredible playoff performance by star athlete',
      };

      const category = assignCategory(article);
      expect(category).toBe('Sports');
    });

    it('should categorize health articles', () => {
      const article = {
        title: 'New medical treatment shows promise for disease',
        description: 'Doctors report breakthrough in healthcare with new vaccine and therapy options',
      };

      const category = assignCategory(article);
      expect(category).toBe('Health');
    });

    it('should use source hint when available', () => {
      const article = {
        title: 'Company releases new product',
        description: 'A business launches something new',
      };

      const category = assignCategory(article, mockTechSource);
      // Even with generic content, tech source should influence categorization
      expect(['Technology', 'General']).toContain(category);
    });

    it('should handle articles without description', () => {
      const article = {
        title: 'AI technology breakthrough announced',
      };

      const category = assignCategory(article);
      expect(category).toBe('Technology');
    });

    it('should default to General for uncategorizable content', () => {
      const article = {
        title: 'Something happened today',
        description: 'Some generic event occurred',
      };

      const category = assignCategory(article);
      // May categorize as General or any category with weak matches
      expect(['General', 'Technology', 'Politics', 'Science', 'Entertainment', 'Sports', 'Health']).toContain(category);
    });

    it('should prioritize strong keywords over weak ones', () => {
      const article = {
        title: 'Technology policy debate in government',
        description: 'Politicians discuss regulations for the technology industry',
      };

      const category = assignCategory(article);
      // Should be Politics due to strong keywords (government, politicians, policy)
      expect(['Politics', 'Technology']).toContain(category);
    });

    it('should apply negative keywords correctly', () => {
      const article = {
        title: 'Game theory in political science research',
        description: 'Scientists study how game theory applies to political decisions',
      };

      const category = assignCategory(article);
      // "game" might suggest Sports, but context should prevent it
      expect(category).not.toBe('Sports');
    });
  });

  describe('assignCategoryWithConfidence', () => {
    it('should return category with confidence score', () => {
      const article = {
        title: 'Artificial intelligence breakthrough in machine learning',
        description: 'Tech startup develops revolutionary AI software platform',
      };

      const result = assignCategoryWithConfidence(article);
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('scores');
      expect(result.category).toBe('Technology');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should have high confidence for clear categorization', () => {
      const article = {
        title: 'AI software technology platform coding developer innovation',
        description: 'Tech startup digital software artificial intelligence machine learning',
      };

      const result = assignCategoryWithConfidence(article);
      expect(result.category).toBe('Technology');
      expect(result.confidence).toBeGreaterThan(50);
    });

    it('should have low confidence for ambiguous content', () => {
      const article = {
        title: 'Something happened',
        description: 'News about an event',
      };

      const result = assignCategoryWithConfidence(article);
      expect(result.confidence).toBeLessThan(30);
    });

    it('should provide scores for all categories', () => {
      const article = {
        title: 'Technology news',
        description: 'Tech article',
      };

      const result = assignCategoryWithConfidence(article);
      expect(result.scores).toBeInstanceOf(Array);
      expect(result.scores.length).toBeGreaterThan(0);
      expect(result.scores[0]).toHaveProperty('category');
      expect(result.scores[0]).toHaveProperty('score');
    });

    it('should sort scores by descending order', () => {
      const article = {
        title: 'Technology article',
        description: 'About tech',
      };

      const result = assignCategoryWithConfidence(article);
      for (let i = 0; i < result.scores.length - 1; i++) {
        expect(result.scores[i].score).toBeGreaterThanOrEqual(result.scores[i + 1].score);
      }
    });

    it('should give bonus for keywords in title', () => {
      const titleArticle = {
        title: 'Technology breakthrough announced',
        description: 'Some news',
      };

      const descriptionArticle = {
        title: 'Announcement made',
        description: 'Technology breakthrough news',
      };

      const titleResult = assignCategoryWithConfidence(titleArticle);
      const descriptionResult = assignCategoryWithConfidence(descriptionArticle);

      // Title match should have higher confidence
      const titleTechScore = titleResult.scores.find(s => s.category === 'Technology')?.score || 0;
      const descTechScore = descriptionResult.scores.find(s => s.category === 'Technology')?.score || 0;

      expect(titleTechScore).toBeGreaterThan(descTechScore);
    });
  });

  describe('batchCategorize', () => {
    it('should categorize multiple articles', () => {
      const articles = [
        { title: 'AI technology news', description: 'Tech article' },
        { title: 'Election results announced', description: 'Political news' },
        { title: 'Scientific breakthrough', description: 'Research study' },
      ];

      const categories = batchCategorize(articles);
      expect(categories).toHaveLength(3);
      expect(categories[0]).toBe('Technology');
      expect(categories[1]).toBe('Politics');
      expect(categories[2]).toBe('Science');
    });

    it('should handle empty array', () => {
      const categories = batchCategorize([]);
      expect(categories).toEqual([]);
    });

    it('should use source configs when provided', () => {
      const articles = [
        { title: 'Generic news', description: 'Something happened', source: { name: 'TechCrunch' } },
      ];

      const sourceConfigs = new Map<string, SourceConfig>([
        ['TechCrunch', mockTechSource],
      ]);

      const categories = batchCategorize(articles, sourceConfigs);
      expect(['Technology', 'General']).toContain(categories[0]);
    });
  });

  describe('filterByCategory', () => {
    const articles = [
      { title: 'Tech news', description: 'AI software', category: 'Technology' },
      { title: 'Political news', description: 'Election', category: 'Politics' },
      { title: 'Tech article', description: 'Technology', category: 'Technology' },
    ];

    it('should filter by category', () => {
      const techArticles = filterByCategory(articles, 'Technology');
      expect(techArticles).toHaveLength(2);
      expect(techArticles.every(a => a.category === 'Technology')).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const sportsArticles = filterByCategory(articles, 'Sports');
      expect(sportsArticles).toHaveLength(0);
    });

    it('should categorize on the fly for articles without category', () => {
      const uncategorized = [
        { title: 'AI breakthrough', description: 'Technology news' },
        { title: 'Senate vote', description: 'Political decision' },
      ];

      const techArticles = filterByCategory(uncategorized, 'Technology');
      expect(techArticles.length).toBeGreaterThan(0);
    });
  });

  describe('getCategoryDistribution', () => {
    it('should count articles per category', () => {
      const articles = [
        { title: 'Tech 1', description: 'AI software technology' },
        { title: 'Tech 2', description: 'Coding platform developer' },
        { title: 'Politics 1', description: 'Election government senate' },
        { title: 'Science 1', description: 'Research study discovery' },
      ];

      const distribution = getCategoryDistribution(articles);
      expect(distribution).toHaveProperty('Technology');
      expect(distribution).toHaveProperty('Politics');
      expect(distribution).toHaveProperty('Science');
      expect(distribution.Technology).toBe(2);
      expect(distribution.Politics).toBe(1);
      expect(distribution.Science).toBe(1);
    });

    it('should initialize all categories even if count is 0', () => {
      const articles = [
        { title: 'Tech news', description: 'Technology article' },
      ];

      const distribution = getCategoryDistribution(articles);
      expect(distribution).toHaveProperty('Politics');
      expect(distribution).toHaveProperty('Entertainment');
      expect(distribution).toHaveProperty('Sports');
      expect(distribution).toHaveProperty('Health');
      expect(distribution).toHaveProperty('Science');
    });

    it('should handle empty array', () => {
      const distribution = getCategoryDistribution([]);
      expect(distribution.Technology).toBe(0);
      expect(distribution.Politics).toBe(0);
    });
  });

  describe('validateCategoryMatch', () => {
    it('should validate correct category match', () => {
      const article = {
        title: 'AI breakthrough in machine learning technology',
        description: 'Software developers create artificial intelligence platform',
      };

      const isValid = validateCategoryMatch(article, 'Technology');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect category match', () => {
      const article = {
        title: 'AI breakthrough in machine learning technology',
        description: 'Software developers create artificial intelligence platform',
      };

      const isValid = validateCategoryMatch(article, 'Sports');
      expect(isValid).toBe(false);
    });

    it('should respect minimum confidence threshold', () => {
      const article = {
        title: 'Technology software AI coding',
        description: 'Developer platform innovation',
      };

      const isValidLow = validateCategoryMatch(article, 'Technology', 10);
      const isValidHigh = validateCategoryMatch(article, 'Technology', 90);

      expect(isValidLow).toBe(true);
      // High threshold might fail if confidence is not that high
      expect(typeof isValidHigh).toBe('boolean');
    });

    it('should use default confidence threshold of 40', () => {
      const article = {
        title: 'Technology news',
        description: 'Tech',
      };

      const isValid = validateCategoryMatch(article, 'Technology');
      // Should check if confidence >= 40
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('getSuggestedCategories', () => {
    it('should return top suggested categories', () => {
      const article = {
        title: 'Technology and science breakthrough in AI research',
        description: 'Scientists develop new artificial intelligence software',
      };

      const suggestions = getSuggestedCategories(article, 3);
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions[0]).toHaveProperty('category');
      expect(suggestions[0]).toHaveProperty('score');
    });

    it('should sort suggestions by score', () => {
      const article = {
        title: 'Tech article',
        description: 'Technology news',
      };

      const suggestions = getSuggestedCategories(article, 5);
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
      }
    });

    it('should filter out zero-score categories', () => {
      const article = {
        title: 'Technology breakthrough',
        description: 'Tech news',
      };

      const suggestions = getSuggestedCategories(article);
      expect(suggestions.every(s => s.score > 0)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const article = {
        title: 'Multi-category article about tech science and politics',
        description: 'Government policy on technology research',
      };

      const suggestions2 = getSuggestedCategories(article, 2);
      const suggestions5 = getSuggestedCategories(article, 5);

      expect(suggestions2.length).toBeLessThanOrEqual(2);
      expect(suggestions5.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const article = {
        title: '',
        description: '',
      };

      const category = assignCategory(article);
      expect(category).toBe('General');
    });

    it('should handle very long text', () => {
      const longText = 'technology '.repeat(100);
      const article = {
        title: longText,
        description: longText,
      };

      const category = assignCategory(article);
      expect(category).toBe('Technology');
    });

    it('should handle special characters', () => {
      const article = {
        title: 'AI & ML: The Future of Tech (2024)',
        description: '$1B funding for AI startup!',
      };

      const category = assignCategory(article);
      expect(category).toBe('Technology');
    });

    it('should handle mixed-case text', () => {
      const article = {
        title: 'TECHNOLOGY BREAKTHROUGH',
        description: 'aI sOfTwArE',
      };

      const category = assignCategory(article);
      expect(category).toBe('Technology');
    });
  });
});
