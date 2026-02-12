"use server";

import { fetchArticles, fetchArticlesByCategory, searchArticles } from "@/lib/api";
import { Article } from "@/types";

/**
 * Load more articles for homepage
 */
export async function loadMoreArticles(page: number): Promise<Article[]> {
  // Use homepage strategy with pagination
  const articles = await fetchArticles('homepage', {
    page,
    pageSize: 12
  });

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
  const articles = await fetchArticlesByCategory(categorySlug, {
    page,
    pageSize: 12
  });

  return articles;
}

/**
 * Load more search results
 */
export async function loadMoreSearchResults(
  query: string,
  page: number
): Promise<Article[]> {
  const articles = await searchArticles(query, {
    page,
    pageSize: 12
  });

  return articles;
}
