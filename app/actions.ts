"use server";

import { getCachedHomepageArticles, getCachedCategoryArticles, getCachedSearchArticles } from "@/lib/cache";
import { Article } from "@/types";

/**
 * Load more articles for homepage
 */
export async function loadMoreArticles(page: number, homepageQuery?: string): Promise<Article[]> {
  // Use cached homepage strategy with pagination
  const articles = await getCachedHomepageArticles(
    homepageQuery || 'latest news',
    page,
    12,
  );

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
  const articles = await getCachedCategoryArticles(categorySlug, page, 12);

  return articles;
}

/**
 * Load more search results
 */
export async function loadMoreSearchResults(
  query: string,
  page: number
): Promise<Article[]> {
  const articles = await getCachedSearchArticles(query, page, 12);

  return articles;
}
