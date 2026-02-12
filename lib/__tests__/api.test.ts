/**
 * API Function Tests
 *
 * Tests the main API module that handles article fetching,
 * strategy-based configuration, and article processing pipeline.
 */

import { fetchArticles, fetchArticlesByCategory, searchArticles } from '../api';

// Mock the NewsAPI fetch
global.fetch = jest.fn();

describe('API Functions', () => {
  beforeAll(() => {
    // Ensure API key is set
    process.env.NEWS_API_KEY = 'test-api-key-12345';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const mockNewsAPIResponse = {
    status: 'ok',
    totalResults: 100,
    articles: [
      {
        title: 'AI breakthrough announced by tech company',
        description: 'Major advancement in artificial intelligence technology revealed today',
        url: 'https://techcrunch.com/ai-breakthrough',
        urlToImage: 'https://techcrunch.com/image.jpg',
        publishedAt: new Date().toISOString(),
        source: { id: 'techcrunch', name: 'TechCrunch' },
        content: 'Full article content...',
      },
      {
        title: 'Climate change breakthrough in renewable energy',
        description: 'Scientists discover new method for clean energy production',
        url: 'https://nature.com/climate-breakthrough',
        urlToImage: 'https://nature.com/image.jpg',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: { id: 'nature', name: 'Nature' },
        content: 'Full article content...',
      },
      {
        title: 'Apple announces new iPhone 15 with improved camera',
        description: 'Latest smartphone features advanced photography capabilities',
        url: 'https://theverge.com/iphone-15',
        urlToImage: 'https://theverge.com/image.jpg',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        source: { id: 'the-verge', name: 'The Verge' },
        content: 'Full article content...',
      },
      {
        title: 'Apple announces new iPhone 15 with improved camera',
        description: 'Apple unveils latest smartphone with enhanced features',
        url: 'https://cnet.com/iphone-15',
        urlToImage: 'https://cnet.com/image.jpg',
        publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 1 day ago
        source: { id: 'cnet', name: 'CNET' },
        content: 'Duplicate story...',
      },
    ],
  };

  describe('fetchArticles', () => {
    it('should fetch articles with homepage strategy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(articles).toBeDefined();
      expect(Array.isArray(articles)).toBe(true);
    });

    it('should use popularity sorting for homepage', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('sortBy=popularity');
    });

    it('should include domains parameter for homepage', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('domains=');
    });

    it('should score and process articles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      // Check that articles have scores
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach(article => {
        expect(article).toHaveProperty('score');
        expect(typeof article.score).toBe('number');
      });
    });

    it('should deduplicate similar articles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      // Should have 3 unique articles (2 iPhone stories deduplicated)
      const iphoneArticles = articles.filter(a =>
        a.title.toLowerCase().includes('iphone')
      );
      expect(iphoneArticles.length).toBe(1);
    });

    it('should sort articles by score (highest first)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      // Verify sorted by score descending
      for (let i = 0; i < articles.length - 1; i++) {
        if (articles[i].score && articles[i + 1].score) {
          expect(articles[i].score).toBeGreaterThanOrEqual(articles[i + 1].score!);
        }
      }
    });

    it('should categorize articles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      articles.forEach(article => {
        expect(article.category).toBeDefined();
        expect(typeof article.category).toBe('string');
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        text: async () => 'Error details',
      });

      await expect(fetchArticles('homepage')).rejects.toThrow();
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: [] }),
      });

      const articles = await fetchArticles('homepage');
      expect(articles).toEqual([]);
    });

    it('should filter out removed articles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          articles: [
            {
              title: '[Removed]',
              description: 'Valid description',
              url: 'https://example.com',
              publishedAt: new Date().toISOString(),
            },
            {
              title: 'Valid title',
              description: '[Removed]',
              url: 'https://example.com',
              publishedAt: new Date().toISOString(),
            },
            {
              title: 'Valid title',
              description: 'Valid description',
              url: 'https://example.com',
              publishedAt: new Date().toISOString(),
              source: { name: 'Test' },
            },
          ],
        }),
      });

      const articles = await fetchArticles('homepage');
      expect(articles.length).toBe(1);
    });

    it('should use custom page size when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage', { pageSize: 50 });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('pageSize=50');
    });

    it('should use custom page number when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage', { page: 2 });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('page=2');
    });
  });

  describe('fetchArticlesByCategory', () => {
    it('should fetch articles for a category', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticlesByCategory('technology');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(articles).toBeDefined();
      expect(Array.isArray(articles)).toBe(true);
    });

    it('should use publishedAt sorting for categories', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticlesByCategory('technology');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('sortBy=publishedAt');
    });

    it('should use category-specific domains', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticlesByCategory('technology');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('domains=');
      // Should include tech sources like techcrunch
      expect(fetchCall).toContain('techcrunch');
    });

    it('should use category-specific queries', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticlesByCategory('technology');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      // Should include tech-related query terms
      expect(fetchCall.toLowerCase()).toMatch(/technology|software|ai/);
    });

    it('should throw error for invalid category', async () => {
      await expect(
        fetchArticlesByCategory('invalid-category')
      ).rejects.toThrow('Category not found');
    });

    it('should assign category to all articles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticlesByCategory('technology');

      articles.forEach(article => {
        expect(article.category).toBe('Technology');
      });
    });
  });

  describe('searchArticles', () => {
    it('should search articles with query', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await searchArticles('artificial intelligence');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(articles).toBeDefined();
      expect(Array.isArray(articles)).toBe(true);
    });

    it('should use relevancy sorting for search', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await searchArticles('AI breakthrough');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('sortBy=relevancy');
    });

    it('should include search query in request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await searchArticles('machine learning');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('machine');
      expect(fetchCall).toContain('learning');
    });

    it('should return empty array for empty query', async () => {
      const articles = await searchArticles('');
      expect(articles).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const articles = await searchArticles('   ');
      expect(articles).toEqual([]);
    });

    it('should use all domains for search', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await searchArticles('test query');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('domains=');
    });
  });

  describe('API Request Tracking', () => {
    it('should track API requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      // Import tracker to check
      const { getCurrentUsage, resetUsage } = await import('../monitoring/api-tracker');

      resetUsage();
      const before = getCurrentUsage();

      await fetchArticles('homepage');

      const after = getCurrentUsage();
      expect(after.count).toBe(before.count + 1);
    });
  });

  describe('Article Processing Pipeline', () => {
    it('should execute full pipeline: fetch -> score -> deduplicate -> categorize', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      const articles = await fetchArticles('homepage');

      // Verify each step executed
      expect(articles.length).toBeGreaterThan(0);

      articles.forEach(article => {
        // Has ID (transformed)
        expect(article.id).toBeDefined();

        // Has score (scored)
        expect(article.score).toBeDefined();

        // Has category (categorized)
        expect(article.category).toBeDefined();

        // Has all required fields
        expect(article.title).toBeDefined();
        expect(article.url).toBeDefined();
        expect(article.publishedAt).toBeDefined();
      });

      // Verify deduplication occurred (should be < original count)
      expect(articles.length).toBeLessThan(mockNewsAPIResponse.articles.length);
    });
  });

  describe('Caching and Revalidation', () => {
    it('should include cache configuration in fetch options', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage');

      const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchOptions).toBeDefined();
      expect(fetchOptions.next).toBeDefined();
      expect(fetchOptions.next.revalidate).toBeDefined();
    });

    it('should use shorter cache for homepage (1h)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticles('homepage');

      const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchOptions.next.revalidate).toBe(3600); // 1 hour
    });

    it('should use longer cache for categories (2h)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsAPIResponse,
      });

      await fetchArticlesByCategory('technology');

      const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchOptions.next.revalidate).toBe(7200); // 2 hours
    });
  });
});
