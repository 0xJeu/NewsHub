import { Article, FetchStrategy, FetchOptions, FetchConfig, RawArticle, ScoredArticle } from "@/types";
import { getPlaceholderForSeed } from "./placeholders";
import { getAllDomains, findSourceConfig, getDomainsByCategories } from "./config/sources";
import { buildRotatingQuery, getLast3Days, getLast7Days, getLast30Days } from "./config/queries";
import { scoreArticle, RawArticle as ScorerRawArticle } from "./scoring/article-scorer";
import { deduplicateArticles } from "./scoring/deduplication";
import { assignCategory } from "./categorization/categorizer";
import { trackAPIRequest, canMakeRequest } from "./monitoring/api-tracker";

/**
 * Main article fetching function with strategy-based approach
 */
export async function fetchArticles(
  strategy: FetchStrategy = 'homepage',
  options?: FetchOptions
): Promise<Article[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not defined in environment variables");
  }

  // Check API limit
  if (!canMakeRequest()) {
    console.error('❌ API daily limit reached (500 requests)');
    return [];
  }

  // Build fetch configuration based on strategy
  const config = buildFetchConfig(strategy, options);

  // Fetch raw articles from NewsAPI
  const rawArticles = await fetchFromNewsAPI(config, apiKey);

  // Process articles through scoring and deduplication pipeline
  return processArticles(rawArticles, options);
}

/**
 * Build fetch configuration based on strategy
 */
function buildFetchConfig(strategy: FetchStrategy, options?: FetchOptions): FetchConfig {
  const allDomains = getAllDomains();

  switch (strategy) {
    case 'homepage':
      return {
        query: options?.homepageQuery || buildRotatingQuery(),  // Keep query stable for pagination when provided
        domains: allDomains,
        sortBy: 'popularity',  // Trending articles
        from: options?.fromDate || getLast3Days(),
        pageSize: options?.pageSize || 100,
        page: options?.page || 1,
        language: 'en'
      };

    case 'category':
      if (!options?.category) {
        throw new Error('Category is required for category strategy');
      }
      return {
        query: options.category.queries.join(' OR '),
        domains: options.category.preferredSources.join(','),
        sortBy: 'publishedAt',  // Recent articles for categories
        from: options?.fromDate || getLast7Days(),
        pageSize: options?.pageSize || 100,
        page: options?.page || 1,
        language: 'en'
      };

    case 'search':
      if (!options?.searchQuery) {
        throw new Error('Search query is required for search strategy');
      }
      return {
        query: options.searchQuery,
        domains: allDomains,
        sortBy: 'relevancy',  // Best matches for search
        from: options?.fromDate || getLast30Days(),
        pageSize: options?.pageSize || 100,
        page: options?.page || 1,
        language: 'en'
      };

    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
}

/**
 * Generate mock articles for development when API is rate-limited
 */
function generateMockArticles(count: number = 20): RawArticle[] {
  const categories = ['Technology', 'Science', 'Politics', 'Business', 'Entertainment', 'Sports', 'Health'];
  const sources = [
    { name: 'TechCrunch' },
    { name: 'The Verge' },
    { name: 'Reuters' },
    { name: 'BBC News' },
    { name: 'CNN' },
    { name: 'The New York Times' }
  ];

  // Use Unsplash placeholder images which are reliable
  const images = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',  // Technology
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=600&fit=crop',  // Science
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',  // Politics
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',  // Business
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop',  // Entertainment
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',  // Sports
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop'   // Health
  ];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const source = sources[i % sources.length];
    const now = new Date();
    const publishedAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString();

    return {
      source,
      title: `${category} News: Sample Article ${i + 1}`,
      description: `This is a sample article about ${category.toLowerCase()}. The API has been rate-limited, so this mock data is being shown for development purposes. This article contains interesting information about current events in the ${category.toLowerCase()} sector.`,
      url: `https://example.com/article-${i + 1}`,
      urlToImage: images[i % images.length],
      publishedAt,
      content: `Full content for article ${i + 1} would appear here...`
    };
  });
}

/**
 * Fetch articles from NewsAPI with given configuration
 */
async function fetchFromNewsAPI(config: FetchConfig, apiKey: string): Promise<RawArticle[]> {
  // Check if we should use mock data (for development)
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('🎭 Using mock data (USE_MOCK_DATA=true)');
    return generateMockArticles(config.pageSize);
  }

  const params = new URLSearchParams({
    q: config.query,
    apiKey,
    pageSize: config.pageSize.toString(),
    page: (config.page || 1).toString(),
    sortBy: config.sortBy,
    language: config.language || 'en'
  });

  if (config.domains) {
    params.append('domains', config.domains);
  }

  if (config.from) {
    params.append('from', config.from);
  }

  if (config.to) {
    params.append('to', config.to);
  }

  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  console.log(`🔍 Fetching articles with query: ${config.query.substring(0, 100)}...`);
  console.log(`📊 Sort by: ${config.sortBy} | Domains: ${config.domains ? 'filtered' : 'all'}`);

  // Track API usage
  trackAPIRequest('everything', {
    query: config.query,
    strategy: config.sortBy
  });

  try {
    const response = await fetch(url, {
      next: {
        revalidate: config.sortBy === 'popularity' ? 3600 : 7200, // 1h for homepage, 2h for others
        tags: ['articles']
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a rate limit error
      if (response.status === 429) {
        console.warn('⚠️ API Rate Limited - Using mock data for development');
        return generateMockArticles(config.pageSize);
      }
      
      console.error(`Failed to fetch articles: ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.articles) {
      return [];
    }

    console.log(`✅ Fetched ${data.articles.length} articles from NewsAPI`);

    // Filter out removed/invalid articles
    return data.articles.filter(
      (article: any) =>
        article.title &&
        article.description &&
        !article.title.includes("[Removed]") &&
        !article.description.includes("[Removed]") &&
        article.title !== "[Removed]" &&
        article.description !== "[Removed]"
    );
  } catch (error) {
    // If fetch fails completely, return mock data for development
    console.warn('⚠️ API request failed - Using mock data for development');
    console.error(error);
    return generateMockArticles(config.pageSize);
  }
}

/**
 * Process raw articles through scoring and deduplication pipeline
 */
function processArticles(rawArticles: RawArticle[], options?: FetchOptions): Article[] {
  // 1. Score each article
  const scored: ScoredArticle[] = rawArticles.map(article => {
    const sourceConfig = findSourceConfig(article.source?.name);
    const score = scoreArticle(article as ScorerRawArticle, sourceConfig);

    return {
      ...article,
      score,
      sourceConfig
    };
  });

  console.log(`📊 Scored ${scored.length} articles`);

  // 2. Deduplicate (remove same story from multiple sources)
  const deduplicated = deduplicateArticles(scored);

  console.log(`🔄 Deduplicated: ${scored.length} → ${deduplicated.length} articles`);

  // 3. Sort by score (highest first)
  deduplicated.sort((a, b) => b.score.total - a.score.total);

  // 4. Categorize and transform to Article type
  const articles: Article[] = deduplicated.map((article, index) => {
    const category = options?.category
      ? options.category.name
      : assignCategory(
          {
            title: article.title,
            description: article.description,
            source: article.source
          },
          article.sourceConfig
        );

    return {
      id: index + 1,
      title: article.title,
      description: article.description || "No description available",
      url: article.url,
      urlToImage:
        article.urlToImage ||
        getPlaceholderForSeed(
          `${article.url}|${article.title}|${article.publishedAt}`
        ),
      publishedAt: article.publishedAt,
      category,
      score: Math.round(article.score.total),
      sourceName: article.sourceConfig?.name || article.source?.name
    };
  });

  console.log(`✨ Processed ${articles.length} final articles`);

  return articles;
}

/**
 * Fetch articles for a specific category
 */
export async function fetchArticlesByCategory(categorySlug: string, options?: FetchOptions): Promise<Article[]> {
  const { getCategoryBySlug } = await import('./config/categories');
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    throw new Error(`Category not found: ${categorySlug}`);
  }

  return fetchArticles('category', { ...options, category });
}

/**
 * Search articles with a query
 */
export async function searchArticles(query: string, options?: FetchOptions): Promise<Article[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  return fetchArticles('search', { ...options, searchQuery: query });
}
