/**
 * Improved Article Categorization System
 *
 * Uses weighted keyword scoring and source hints to accurately
 * assign categories to articles. Replaces simple regex matching.
 */

import { CATEGORIES, CategoryConfig } from '@/lib/config/categories';
import { SourceConfig } from '@/lib/config/sources';

export interface CategorizationResult {
  category: string;
  confidence: number;  // 0-100
  scores: Array<{ category: string; score: number }>;
}

/**
 * Assign category to an article using weighted keyword scoring
 */
export function assignCategory(
  article: {
    title: string;
    description?: string;
    source?: { name?: string };
  },
  sourceConfig?: SourceConfig
): string {
  const result = assignCategoryWithConfidence(article, sourceConfig);
  return result.category;
}

/**
 * Assign category with confidence score and detailed breakdown
 */
export function assignCategoryWithConfidence(
  article: {
    title: string;
    description?: string;
    source?: { name?: string };
  },
  sourceConfig?: SourceConfig
): CategorizationResult {
  // Combine title and description for analysis
  const content = `${article.title} ${article.description || ''}`.toLowerCase();

  // 1. Source-based hint (if source is category-specific)
  const sourceHint = getSourceCategoryHint(sourceConfig);

  // 2. Calculate weighted scores for each category
  const scores = CATEGORIES.map(category => {
    let score = 0;

    // Source hint bonus (+5 points if source is known for this category)
    if (sourceHint && sourceHint.includes(category.name)) {
      score += 5;
    }

    // Strong keywords: +2 each
    category.keywords.strong.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (content.includes(keywordLower)) {
        score += 2;

        // Bonus if in title (+1 extra)
        if (article.title.toLowerCase().includes(keywordLower)) {
          score += 1;
        }
      }
    });

    // Weak keywords: +1 each
    category.keywords.weak.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    // Exclude keywords: -5 each (strong negative signal)
    category.keywords.exclude.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score -= 5;
      }
    });

    return { category: category.name, score };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Determine winning category
  const winner = scores[0];
  const minScore = 3; // Minimum score threshold to assign category

  if (winner.score >= minScore) {
    // Calculate confidence (0-100)
    const maxPossibleScore = 20; // Rough estimate
    const confidence = Math.min(100, (winner.score / maxPossibleScore) * 100);

    return {
      category: winner.category,
      confidence: Math.round(confidence),
      scores
    };
  }

  // Default to General if no strong category match
  return {
    category: 'General',
    confidence: 0,
    scores
  };
}

/**
 * Get category hint from source configuration
 * Returns category names that this source typically covers
 */
function getSourceCategoryHint(sourceConfig?: SourceConfig): string[] | null {
  if (!sourceConfig) return null;
  return sourceConfig.categories;
}

/**
 * Batch categorize multiple articles
 * More efficient than calling assignCategory repeatedly
 */
export function batchCategorize(
  articles: Array<{
    title: string;
    description?: string;
    source?: { name?: string };
  }>,
  sourceConfigs?: Map<string, SourceConfig>
): string[] {
  return articles.map((article, index) => {
    const sourceConfig = sourceConfigs?.get(article.source?.name || '');
    return assignCategory(article, sourceConfig);
  });
}

/**
 * Get all articles for a specific category from a list
 */
export function filterByCategory(
  articles: Array<{
    title: string;
    description?: string;
    source?: { name?: string };
    category?: string;
  }>,
  categoryName: string
): typeof articles {
  return articles.filter(article => {
    // If article already has category assigned, use it
    if (article.category) {
      return article.category === categoryName;
    }

    // Otherwise categorize on the fly
    const assigned = assignCategory(article);
    return assigned === categoryName;
  });
}

/**
 * Get category distribution statistics
 */
export function getCategoryDistribution(
  articles: Array<{
    title: string;
    description?: string;
    source?: { name?: string };
  }>
): Record<string, number> {
  const distribution: Record<string, number> = {};

  // Initialize all categories with 0
  CATEGORIES.forEach(cat => {
    distribution[cat.name] = 0;
  });
  distribution['General'] = 0;

  // Count articles per category
  articles.forEach(article => {
    const category = assignCategory(article);
    distribution[category] = (distribution[category] || 0) + 1;
  });

  return distribution;
}

/**
 * Validate if an article strongly belongs to a category
 * Useful for quality filtering in category pages
 */
export function validateCategoryMatch(
  article: {
    title: string;
    description?: string;
    source?: { name?: string };
  },
  expectedCategory: string,
  minConfidence: number = 40
): boolean {
  const result = assignCategoryWithConfidence(article);
  return result.category === expectedCategory && result.confidence >= minConfidence;
}

/**
 * Get suggested categories for an article (top 3)
 */
export function getSuggestedCategories(
  article: {
    title: string;
    description?: string;
    source?: { name?: string };
  },
  limit: number = 3
): Array<{ category: string; score: number }> {
  const result = assignCategoryWithConfidence(article);
  return result.scores
    .filter(s => s.score > 0)
    .slice(0, limit);
}
