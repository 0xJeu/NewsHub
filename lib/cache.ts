/**
 * Vercel-optimized cache layer using Next.js unstable_cache.
 *
 * On Vercel, unstable_cache stores results in the persistent Data Cache,
 * surviving across serverless function invocations and deployments.
 *
 * Cache observability:
 *   - The function body ONLY executes on a cache MISS.
 *   - A "CACHE MISS" log entry means the API was called.
 *   - Silence (no log) = cache HIT.
 *   - Check Vercel Function Logs or /api/cache-status for proof.
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
  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();
      logger.info('CACHE MISS — fetching homepage articles from API', {
        query: query.substring(0, 50),
        page,
        pageSize,
      }, 'CACHE');

      const articles = await fetchArticles('homepage', {
        homepageQuery: query,
        page,
        pageSize,
      });

      logger.info('CACHE MISS — homepage articles stored in cache', {
        articleCount: articles.length,
        duration: Date.now() - startTime,
      }, 'CACHE');

      return articles;
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
  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();
      logger.info('CACHE MISS — fetching category articles from API', {
        category: slug,
        page,
        pageSize,
      }, 'CACHE');

      const articles = await fetchArticlesByCategory(slug, { page, pageSize });

      logger.info('CACHE MISS — category articles stored in cache', {
        category: slug,
        articleCount: articles.length,
        duration: Date.now() - startTime,
      }, 'CACHE');

      return articles;
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
  return unstable_cache(
    async (): Promise<Article[]> => {
      const startTime = Date.now();
      logger.info('CACHE MISS — fetching search results from API', {
        query: query.substring(0, 50),
        page,
        pageSize,
      }, 'CACHE');

      const articles = await searchArticles(query, { page, pageSize });

      logger.info('CACHE MISS — search results stored in cache', {
        query: query.substring(0, 50),
        articleCount: articles.length,
        duration: Date.now() - startTime,
      }, 'CACHE');

      return articles;
    },
    ['articles', 'search', query, String(page), String(pageSize)],
    { revalidate: CACHE_TTL.search, tags: ['articles', 'search'] },
  )();
}
