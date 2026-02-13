"use server";

import { getCachedHomepageArticles, getCachedCategoryArticles, getCachedSearchArticles } from "@/lib/cache";
import { Article } from "@/types";
import { logger } from "@/lib/logger";

/**
 * Load more articles for homepage
 */
export async function loadMoreArticles(page: number, homepageQuery?: string): Promise<Article[]> {
  logger.info('🔄 Server Action: load more homepage articles', {
    action: 'loadMoreArticles',
    page,
    pageSize: 12,
    query: (homepageQuery || 'latest news').substring(0, 50),
  }, 'ACTION');

  const startTime = Date.now();

  // Use cached homepage strategy with pagination
  const articles = await getCachedHomepageArticles(
    homepageQuery || 'latest news',
    page,
    12,
  );

  logger.info('🔄 Server Action: homepage articles loaded', {
    action: 'loadMoreArticles',
    page,
    articleCount: articles.length,
    duration: Date.now() - startTime,
  }, 'ACTION');

  // Articles are already sorted by score
  return articles;
}

/**
 * Load more articles for a specific category
 */
export async function loadMoreCategoryArticles(
  categorySlug: string,
  page: number
): Promise<Article[]> {
  logger.info('🔄 Server Action: load more category articles', {
    action: 'loadMoreCategoryArticles',
    category: categorySlug,
    page,
    pageSize: 12,
  }, 'ACTION');

  const startTime = Date.now();
  const articles = await getCachedCategoryArticles(categorySlug, page, 12);

  logger.info('🔄 Server Action: category articles loaded', {
    action: 'loadMoreCategoryArticles',
    category: categorySlug,
    page,
    articleCount: articles.length,
    duration: Date.now() - startTime,
  }, 'ACTION');

  return articles;
}

/**
 * Load more search results
 */
export async function loadMoreSearchResults(
  query: string,
  page: number
): Promise<Article[]> {
  logger.info('🔄 Server Action: load more search results', {
    action: 'loadMoreSearchResults',
    query: query.substring(0, 100),
    page,
    pageSize: 12,
  }, 'ACTION');

  const startTime = Date.now();
  const articles = await getCachedSearchArticles(query, page, 12);

  logger.info('🔄 Server Action: search results loaded', {
    action: 'loadMoreSearchResults',
    query: query.substring(0, 100),
    page,
    resultCount: articles.length,
    duration: Date.now() - startTime,
  }, 'ACTION');

  return articles;
}
