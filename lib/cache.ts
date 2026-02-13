/**
 * Vercel-optimized cache layer using Next.js unstable_cache.
 *
 * On Vercel, unstable_cache stores results in the persistent Data Cache,
 * surviving across serverless function invocations and deployments.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LOGGING ARCHITECTURE — How to track cache performance
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Log Flow (example homepage request):
 *
 * 1. [PAGE] 📰 Homepage: requesting articles
 *    └─ Logged by: app/page.tsx
 *    └─ Shows: route, query, expected count
 *
 * 2. [CACHE] Cache lookup: homepage articles (DEBUG level)
 *    └─ Logged by: getCachedHomepageArticles wrapper
 *    └─ Shows: cache key, TTL, lookup parameters
 *    └─ Fires on EVERY request (HIT or MISS)
 *
 * 3a. CACHE HIT (fast path, <50ms):
 *     └─ No additional logs — unstable_cache returns cached data
 *     └─ Skips entirely to step 4
 *
 * 3b. CACHE MISS (slow path, 500ms-2s):
 *     ├─ [CACHE] ⚡ CACHE MISS — Homepage articles not in cache, fetching
 *     │  └─ Shows: strategy, query, page, cache key
 *     │
 *     ├─ [API] NewsAPI fetch initiated
 *     │  └─ Shows: URL (sanitized), query, sort, domains, date range
 *     │
 *     ├─ [API_TRACKER] 📊 API Usage tracked
 *     │  └─ Shows: calls today, remaining, % used, warning status
 *     │
 *     ├─ [API] 🌐 NewsAPI response received
 *     │  └─ Shows: status code, fetch duration, headers
 *     │
 *     ├─ [API] Articles fetched successfully from NewsAPI
 *     │  └─ Shows: raw count, valid count, removed count, timing breakdown
 *     │
 *     ├─ [PIPELINE] Pipeline stages (scoring, dedup, categorization)
 *     │  └─ Shows: input → output counts per stage
 *     │
 *     └─ [CACHE] ✅ CACHE MISS — Homepage articles fetched and cached
 *        └─ Shows: article count, total duration, cache expiry time
 *
 * 4. [PAGE] 📰 Homepage: articles received
 *    └─ Shows: article count, duration, cache status (likely-hit/miss)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * How to identify CACHE HITS vs MISSES in Vercel Logs:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CACHE HIT indicators:
 *   ✅ Page log duration <50ms
 *   ✅ No ⚡ "CACHE MISS" warnings between request and response
 *   ✅ No API or PIPELINE logs
 *   ✅ cacheStatus: "likely-hit" in page logs
 *
 * CACHE MISS indicators:
 *   ❌ Page log duration >500ms
 *   ❌ ⚡ "CACHE MISS" warning log present
 *   ❌ Full API + PIPELINE log chain visible
 *   ❌ cacheStatus: "likely-miss" in page logs
 *
 * ═══════════════════════════════════════════════════════════════════════
 * Filter suggestions for Vercel Logs:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * All cache misses:       context:CACHE level:warn
 * API calls:              context:API
 * Cache lookups:          context:CACHE level:debug
 * Page requests:          context:PAGE
 * Server actions:         context:ACTION
 * Performance issues:     duration>2000
 * API usage warnings:     context:API_TRACKER warning:true
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { unstable_cache } from 'next/cache';
import { Article } from '@/types';
import { fetchArticles, fetchArticlesByCategory, searchArticles } from './api';
import { logger } from './logger';

// Cache TTLs (seconds)
export const CACHE_TTL = {
  homepage: 3600,   // 1 hour
  category: 3600,   // 1 hour
  search: 300,      // 5 minutes — searches should return fresher results
} as const;

/**
 * Cached homepage articles.
 *
 * Cache key: ['articles', 'homepage', query, page, pageSize]
 * Tags: ['articles'] — invalidate with revalidateTag('articles')
 */
export function getCachedHomepageArticles(
  query: string,
  page: number = 1,
  pageSize: number = 100,
): Promise<Article[]> {
  // Log cache lookup attempt (fires on both HIT and MISS)
  logger.debug('Cache lookup: homepage articles', {
    query: query.substring(0, 50),
    page,
    pageSize,
    cacheKey: ['articles', 'homepage', query, page, pageSize].join(':'),
    ttl: CACHE_TTL.homepage,
  }, 'CACHE');

  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();

      logger.warn('⚡ CACHE MISS — Homepage articles not in cache, fetching from NewsAPI', {
        strategy: 'homepage',
        query: query.substring(0, 100),
        page,
        pageSize,
        cacheKey: `homepage:${query.substring(0, 30)}:p${page}`,
      }, 'CACHE');

      try {
        const articles = await fetchArticles('homepage', {
          homepageQuery: query,
          page,
          pageSize,
        });

        const duration = Date.now() - startTime;

        logger.info('✅ CACHE MISS — Homepage articles fetched and cached', {
          strategy: 'homepage',
          articleCount: articles.length,
          page,
          duration,
          cachedUntil: new Date(Date.now() + CACHE_TTL.homepage * 1000).toISOString(),
          avgProcessingTime: Math.round(duration / Math.max(articles.length, 1)),
        }, 'CACHE');

        return articles;
      } catch (error) {
        logger.error('❌ CACHE MISS — Failed to fetch homepage articles', error, {
          strategy: 'homepage',
          query: query.substring(0, 100),
          page,
          pageSize,
          duration: Date.now() - startTime,
        }, 'CACHE');
        throw error;
      }
    },
    ['articles', 'homepage', query, String(page), String(pageSize)],
    { revalidate: CACHE_TTL.homepage, tags: ['articles'] },
  )();
}

/**
 * Cached category articles.
 *
 * Cache key: ['articles', 'category', slug, page, pageSize]
 * Tags: ['articles', 'category-{slug}'] — invalidate all or per-category
 */
export function getCachedCategoryArticles(
  slug: string,
  page: number = 1,
  pageSize: number = 100,
): Promise<Article[]> {
  // Log cache lookup attempt (fires on both HIT and MISS)
  logger.debug('Cache lookup: category articles', {
    category: slug,
    page,
    pageSize,
    cacheKey: ['articles', 'category', slug, page, pageSize].join(':'),
    ttl: CACHE_TTL.category,
    tags: ['articles', `category-${slug}`],
  }, 'CACHE');

  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();

      logger.warn('⚡ CACHE MISS — Category articles not in cache, fetching from NewsAPI', {
        strategy: 'category',
        category: slug,
        page,
        pageSize,
        cacheKey: `category:${slug}:p${page}`,
      }, 'CACHE');

      try {
        const articles = await fetchArticlesByCategory(slug, { page, pageSize });

        const duration = Date.now() - startTime;

        logger.info('✅ CACHE MISS — Category articles fetched and cached', {
          strategy: 'category',
          category: slug,
          articleCount: articles.length,
          page,
          duration,
          cachedUntil: new Date(Date.now() + CACHE_TTL.category * 1000).toISOString(),
          avgProcessingTime: Math.round(duration / Math.max(articles.length, 1)),
        }, 'CACHE');

        return articles;
      } catch (error) {
        logger.error('❌ CACHE MISS — Failed to fetch category articles', error, {
          strategy: 'category',
          category: slug,
          page,
          pageSize,
          duration: Date.now() - startTime,
        }, 'CACHE');
        throw error;
      }
    },
    ['articles', 'category', slug, String(page), String(pageSize)],
    { revalidate: CACHE_TTL.category, tags: ['articles', `category-${slug}`] },
  )();
}

/**
 * Cached search results.
 *
 * Cache key: ['articles', 'search', query, page, pageSize]
 * Tags: ['articles', 'search'] — invalidate with revalidateTag('search')
 */
export function getCachedSearchArticles(
  query: string,
  page: number = 1,
  pageSize: number = 100,
): Promise<Article[]> {
  // Log cache lookup attempt (fires on both HIT and MISS)
  logger.debug('Cache lookup: search results', {
    query: query.substring(0, 50),
    page,
    pageSize,
    cacheKey: ['articles', 'search', query, page, pageSize].join(':'),
    ttl: CACHE_TTL.search,
  }, 'CACHE');

  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();

      logger.warn('⚡ CACHE MISS — Search results not in cache, fetching from NewsAPI', {
        strategy: 'search',
        query: query.substring(0, 100),
        page,
        pageSize,
        cacheKey: `search:${query.substring(0, 30)}:p${page}`,
      }, 'CACHE');

      try {
        const articles = await searchArticles(query, { page, pageSize });

        const duration = Date.now() - startTime;

        logger.info('✅ CACHE MISS — Search results fetched and cached', {
          strategy: 'search',
          query: query.substring(0, 100),
          articleCount: articles.length,
          page,
          duration,
          cachedUntil: new Date(Date.now() + CACHE_TTL.search * 1000).toISOString(),
          avgProcessingTime: Math.round(duration / Math.max(articles.length, 1)),
        }, 'CACHE');

        return articles;
      } catch (error) {
        logger.error('❌ CACHE MISS — Failed to fetch search results', error, {
          strategy: 'search',
          query: query.substring(0, 100),
          page,
          pageSize,
          duration: Date.now() - startTime,
        }, 'CACHE');
        throw error;
      }
    },
    ['articles', 'search', query, String(page), String(pageSize)],
    { revalidate: CACHE_TTL.search, tags: ['articles', 'search'] },
  )();
}
