/**
 * Integration Tests
 *
 * End-to-end tests that verify the complete article processing pipeline
 * from fetch through scoring, deduplication, categorization, and transformation.
 */

import { fetchArticles, fetchArticlesByCategory, searchArticles } from '@/lib/api';
import { QUALITY_SOURCES } from '@/lib/config/sources';
import { CATEGORIES } from '@/lib/config/categories';
import { resetUsage } from '@/lib/monitoring/api-tracker';

// Mock fetch for integration tests
global.fetch = jest.fn();

describe('Integration Tests', () => {
  beforeAll(() => {
    // Ensure API key is set
    process.env.NEWS_API_KEY = 'test-api-key-12345';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetUsage();
  });

  const createMockArticles = (count: number) => {
    const articles = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      articles.push({
        title: `Article ${i}: AI breakthrough in machine learning technology`,
        description: `Detailed description about artificial intelligence and software development innovation ${i}`,
        url: `https://techcrunch.com/article-${i}`,
        urlToImage: `https://techcrunch.com/image-${i}.jpg`,
        publishedAt: new Date(now - i * 60 * 60 * 1000).toISOString(), // Each article 1 hour apart
        source: { id: 'techcrunch', name: 'TechCrunch' },
        content: `Full article content ${i}`,
      });
    }

    return articles;
  };

  describe('Complete Article Processing Pipeline', () => {
    it('should process articles through full pipeline: fetch -> filter -> score -> deduplicate -> categorize -> transform', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          ...createMockArticles(5),
          // Add some duplicates
          {
            title: 'Article 0: AI breakthrough in machine learning technology',
            description: 'Same story from different source',
            url: 'https://theverge.com/article-0',
            urlToImage: 'https://theverge.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { id: 'the-verge', name: 'The Verge' },
          },
          // Add an article with removed content
          {
            title: '[Removed]',
            description: 'This should be filtered',
            url: 'https://example.com/removed',
            publishedAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // 1. Filtering: Should remove [Removed] articles
      expect(articles.every(a => a.title !== '[Removed]')).toBe(true);

      // 2. Scoring: All articles should have scores
      expect(articles.every(a => typeof a.score === 'number')).toBe(true);
      expect(articles.every(a => a.score! >= 0 && a.score! <= 100)).toBe(true);

      // 3. Deduplication: Should have fewer articles than input
      expect(articles.length).toBeLessThan(mockResponse.articles.length);

      // 4. Categorization: All articles should have categories
      expect(articles.every(a => a.category)).toBe(true);
      expect(articles.every(a => typeof a.category === 'string')).toBe(true);

      // 5. Transformation: Should have sequential IDs
      expect(articles.every(a => typeof a.id === 'number')).toBe(true);

      // 6. Sorting: Should be sorted by score (highest first)
      for (let i = 0; i < articles.length - 1; i++) {
        expect(articles[i].score).toBeGreaterThanOrEqual(articles[i + 1].score!);
      }
    });

    it('should handle mixed content from multiple sources and categories', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          {
            title: 'Senate passes climate legislation',
            description: 'Congress votes on environmental policy',
            url: 'https://politico.com/climate',
            urlToImage: 'https://politico.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Politico' },
          },
          {
            title: 'Scientists discover breakthrough in cancer research',
            description: 'Medical researchers make important discovery',
            url: 'https://nature.com/cancer',
            urlToImage: 'https://nature.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Nature' },
          },
          {
            title: 'NBA playoffs: Team wins championship',
            description: 'Basketball team secures victory in final game',
            url: 'https://espn.com/nba',
            urlToImage: 'https://espn.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'ESPN' },
          },
          {
            title: 'New movie breaks box office records',
            description: 'Hollywood film premieres to massive audience',
            url: 'https://variety.com/movie',
            urlToImage: 'https://variety.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Variety' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // Should have diverse categories
      const categories = new Set(articles.map(a => a.category));
      expect(categories.size).toBeGreaterThan(1);

      // Check specific categorizations
      const politicsArticle = articles.find(a => a.title.includes('Senate'));
      expect(politicsArticle?.category).toBe('Politics');

      const sportsArticle = articles.find(a => a.title.includes('NBA'));
      expect(sportsArticle?.category).toBe('Sports');
    });

    it('should prioritize recent, high-quality sources in scoring', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          {
            title: 'Recent article from premium source',
            description: 'This is a comprehensive description with meaningful content about the breakthrough',
            url: 'https://techcrunch.com/recent',
            urlToImage: 'https://techcrunch.com/image.jpg',
            publishedAt: new Date().toISOString(), // Now
            source: { name: 'TechCrunch' }, // Tier 1
          },
          {
            title: 'Old article from lower tier',
            description: 'Short',
            url: 'https://usatoday.com/old',
            urlToImage: undefined, // No image
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            source: { name: 'USA Today' }, // Tier 3
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // Recent, premium article should score higher
      expect(articles[0].score).toBeGreaterThan(articles[1].score!);
    });
  });

  describe('Strategy-Based Fetching Integration', () => {
    it('should use correct configuration for homepage strategy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: createMockArticles(10) }),
      });

      await fetchArticles('homepage');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];

      // Should use popularity sorting
      expect(fetchUrl).toContain('sortBy=popularity');

      // Should include all domains
      expect(fetchUrl).toContain('domains=');

      // Should have proper language
      expect(fetchUrl).toContain('language=en');
    });

    it('should use correct configuration for category strategy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: createMockArticles(10) }),
      });

      await fetchArticlesByCategory('technology');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];

      // Should use publishedAt sorting for categories
      expect(fetchUrl).toContain('sortBy=publishedAt');

      // Should include category-specific domains
      expect(fetchUrl).toContain('techcrunch');

      // Should include category-specific query
      expect(fetchUrl.toLowerCase()).toMatch(/technology|software|ai/);
    });

    it('should use correct configuration for search strategy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: createMockArticles(10) }),
      });

      await searchArticles('artificial intelligence');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];

      // Should use relevancy sorting for search
      expect(fetchUrl).toContain('sortBy=relevancy');

      // Should include search query
      expect(fetchUrl).toContain('artificial');
      expect(fetchUrl).toContain('intelligence');
    });
  });

  describe('Source Quality Integration', () => {
    it('should only include articles from whitelisted sources', async () => {
      const mockResponse = {
        status: 'ok',
        articles: createMockArticles(20),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchArticles('homepage');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];

      // Should have domains parameter
      expect(fetchUrl).toContain('domains=');

      // Should include known quality sources
      const allDomains = QUALITY_SOURCES.map(s => s.domain).join(',');
      expect(fetchUrl).toContain(allDomains.split(',')[0]); // At least first domain
    });

    it('should apply correct authority scores based on source tier', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          {
            title: 'Article from tier 1 source',
            description: 'Content',
            url: 'https://techcrunch.com/article',
            publishedAt: new Date().toISOString(),
            source: { name: 'TechCrunch' },
          },
          {
            title: 'Article from tier 3 source',
            description: 'Content',
            url: 'https://usatoday.com/article',
            publishedAt: new Date().toISOString(),
            source: { name: 'USA Today' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // Tier 1 source should score higher (all else being equal)
      const tier1Article = articles.find(a => a.sourceName === 'TechCrunch');
      const tier3Article = articles.find(a => a.sourceName === 'USA Today');

      if (tier1Article && tier3Article) {
        expect(tier1Article.score).toBeGreaterThan(tier3Article.score!);
      }
    });
  });

  describe('Category System Integration', () => {
    it('should successfully categorize across all 6 categories', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          { title: 'AI technology breakthrough', description: 'Software innovation', url: 'https://tc.com/1', publishedAt: new Date().toISOString(), source: { name: 'TechCrunch' } },
          { title: 'Senate passes legislation', description: 'Political decision', url: 'https://pol.com/1', publishedAt: new Date().toISOString(), source: { name: 'Politico' } },
          { title: 'Scientists discover new species', description: 'Research study', url: 'https://nat.com/1', publishedAt: new Date().toISOString(), source: { name: 'Nature' } },
          { title: 'New movie premieres', description: 'Hollywood film', url: 'https://var.com/1', publishedAt: new Date().toISOString(), source: { name: 'Variety' } },
          { title: 'NBA championship game', description: 'Basketball tournament', url: 'https://espn.com/1', publishedAt: new Date().toISOString(), source: { name: 'ESPN' } },
          { title: 'New medical treatment', description: 'Healthcare breakthrough', url: 'https://med.com/1', publishedAt: new Date().toISOString(), source: { name: 'Medical News' } },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      const categories = new Set(articles.map(a => a.category));

      // Should have categorized into multiple categories
      expect(categories.size).toBeGreaterThanOrEqual(3);

      // Check that valid categories are used
      categories.forEach(cat => {
        const validCategories = [...CATEGORIES.map(c => c.name), 'General'];
        expect(validCategories).toContain(cat);
      });
    });

    it('should assign articles to category when fetching by category', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: createMockArticles(10) }),
      });

      const articles = await fetchArticlesByCategory('technology');

      // All articles should be categorized as Technology
      articles.forEach(article => {
        expect(article.category).toBe('Technology');
      });
    });
  });

  describe('Deduplication Integration', () => {
    it('should remove duplicate stories from different sources', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          {
            title: 'Apple announces iPhone 15 with new features',
            description: 'Apple unveils latest smartphone',
            url: 'https://techcrunch.com/iphone',
            publishedAt: new Date().toISOString(),
            source: { name: 'TechCrunch' },
          },
          {
            title: 'Apple announces iPhone 15 with new features',
            description: 'Apple reveals newest iPhone model',
            url: 'https://theverge.com/iphone',
            publishedAt: new Date().toISOString(),
            source: { name: 'The Verge' },
          },
          {
            title: 'Apple announces iPhone 15 with new features',
            description: 'Latest iPhone announced by Apple',
            url: 'https://cnet.com/iphone',
            publishedAt: new Date().toISOString(),
            source: { name: 'CNET' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // Should deduplicate to single article
      expect(articles.length).toBe(1);
      expect(articles[0].title).toContain('iPhone 15');
    });

    it('should keep the highest-scored version when deduplicating', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          {
            title: 'Breaking news story here',
            description: 'Full detailed description',
            url: 'https://reuters.com/story',
            urlToImage: 'https://reuters.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Reuters' }, // Tier 1
          },
          {
            title: 'Breaking news story here',
            description: 'Short',
            url: 'https://usatoday.com/story',
            publishedAt: new Date().toISOString(),
            source: { name: 'USA Today' }, // Tier 3
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // Should keep the Reuters version (higher authority)
      expect(articles.length).toBe(1);
      expect(articles[0].sourceName).toBe('Reuters');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Rate limit exceeded',
        text: async () => 'API rate limit error',
      });

      await expect(fetchArticles('homepage')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchArticles('homepage')).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      const articles = await fetchArticles('homepage');
      expect(articles).toEqual([]);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large article batches efficiently', async () => {
      const largeResponse = {
        status: 'ok',
        articles: createMockArticles(100),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => largeResponse,
      });

      const startTime = Date.now();
      const articles = await fetchArticles('homepage');
      const endTime = Date.now();

      // Should process 100 articles in reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should deduplicate efficiently with many similar articles', async () => {
      const duplicateResponse = {
        status: 'ok',
        articles: Array(50).fill(null).map((_, i) => ({
          title: 'Same story repeated multiple times',
          description: `Variation ${i}`,
          url: `https://source${i}.com/article`,
          publishedAt: new Date().toISOString(),
          source: { name: `Source ${i}` },
        })),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => duplicateResponse,
      });

      const articles = await fetchArticles('homepage');

      // Should deduplicate to single article
      expect(articles.length).toBe(1);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle mixed quality content appropriately', async () => {
      const mockResponse = {
        status: 'ok',
        articles: [
          // High quality
          {
            title: 'Scientists announce major breakthrough in climate research',
            description: 'Comprehensive description of the scientific discovery with detailed information about the research methodology and findings.',
            url: 'https://nature.com/climate',
            urlToImage: 'https://nature.com/image.jpg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Nature' },
          },
          // Low quality (clickbait)
          {
            title: 'You wont believe what happened next',
            description: 'Short',
            url: 'https://unknown.com/clickbait',
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            source: { name: 'Unknown Source' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const articles = await fetchArticles('homepage');

      // High quality article should be first
      expect(articles[0].title).toContain('Scientists');
      expect(articles[0].score).toBeGreaterThan(articles[1].score!);
    });
  });
});
