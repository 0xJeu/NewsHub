/**
 * Article Deduplication System
 *
 * Removes duplicate articles (same story from multiple sources)
 * by analyzing normalized titles and keeping the highest-scored version.
 */

import { ArticleScore } from './article-scorer';

export interface ScoredArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: {
    id?: string;
    name?: string;
  };
  score: ArticleScore;
  sourceConfig?: any;
}

/**
 * Normalize a title for deduplication matching
 * Removes punctuation, converts to lowercase, takes first N words
 */
function normalizeTitle(title: string, wordCount: number = 8): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .trim()
    .split(/\s+/)
    .slice(0, wordCount) // Take first N words
    .join(' ');
}

/**
 * Calculate similarity between two normalized titles (0-1)
 * Uses Jaccard similarity on word sets
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.split(/\s+/));
  const words2 = new Set(title2.split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Check if two articles are duplicates
 * Returns true if titles are similar enough
 */
function areDuplicates(article1: ScoredArticle, article2: ScoredArticle): boolean {
  const normalized1 = normalizeTitle(article1.title);
  const normalized2 = normalizeTitle(article2.title);

  // Exact match on first 8 words
  if (normalized1 === normalized2) return true;

  // High similarity match (80%+ word overlap)
  const similarity = calculateTitleSimilarity(normalized1, normalized2);
  if (similarity >= 0.8) return true;

  // Check if one title contains most of the other (for varying lengths)
  const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
  const longer = normalized1.length < normalized2.length ? normalized2 : normalized1;

  if (longer.includes(shorter) && shorter.split(/\s+/).length >= 5) {
    return true;
  }

  return false;
}

/**
 * Deduplicate articles by keeping highest-scored version of each story
 */
export function deduplicateArticles(articles: ScoredArticle[]): ScoredArticle[] {
  if (articles.length === 0) return [];

  const unique: ScoredArticle[] = [];
  const processed = new Set<number>();

  // Sort by score descending so we process highest-scored articles first
  const sorted = [...articles].sort((a, b) => b.score.total - a.score.total);

  for (let i = 0; i < sorted.length; i++) {
    if (processed.has(i)) continue;

    const current = sorted[i];
    let bestVersion = current;

    // Compare with remaining articles
    for (let j = i + 1; j < sorted.length; j++) {
      if (processed.has(j)) continue;

      const candidate = sorted[j];

      if (areDuplicates(current, candidate)) {
        processed.add(j); // Mark as duplicate

        // Keep the version with better score
        if (candidate.score.total > bestVersion.score.total) {
          bestVersion = candidate;
        }
      }
    }

    unique.push(bestVersion);
    processed.add(i);
  }

  // Re-sort by score after deduplication
  return unique.sort((a, b) => b.score.total - a.score.total);
}

/**
 * Deduplicate articles with advanced options
 */
export function deduplicateArticlesAdvanced(
  articles: ScoredArticle[],
  options: {
    similarityThreshold?: number;  // 0-1, default 0.8
    wordCount?: number;             // Words to compare, default 8
    preferredSources?: string[];    // Prefer these sources when scores are equal
  } = {}
): ScoredArticle[] {
  const {
    similarityThreshold = 0.8,
    wordCount = 8,
    preferredSources = []
  } = options;

  if (articles.length === 0) return [];

  const unique: ScoredArticle[] = [];
  const processed = new Set<number>();

  // Sort by score descending
  const sorted = [...articles].sort((a, b) => b.score.total - a.score.total);

  for (let i = 0; i < sorted.length; i++) {
    if (processed.has(i)) continue;

    const current = sorted[i];
    let bestVersion = current;

    for (let j = i + 1; j < sorted.length; j++) {
      if (processed.has(j)) continue;

      const candidate = sorted[j];

      // Check similarity with custom threshold
      const normalized1 = normalizeTitle(current.title, wordCount);
      const normalized2 = normalizeTitle(candidate.title, wordCount);
      const similarity = calculateTitleSimilarity(normalized1, normalized2);

      if (similarity >= similarityThreshold || normalized1 === normalized2) {
        processed.add(j);

        // Selection logic with source preference
        const scoreDiff = Math.abs(candidate.score.total - bestVersion.score.total);

        if (scoreDiff < 5) {
          // Scores are close, prefer preferred sources
          const candidateSourceName = candidate.source?.name?.toLowerCase() || '';
          const bestSourceName = bestVersion.source?.name?.toLowerCase() || '';

          const candidateIsPreferred = preferredSources.some(s =>
            candidateSourceName.includes(s.toLowerCase())
          );
          const bestIsPreferred = preferredSources.some(s =>
            bestSourceName.includes(s.toLowerCase())
          );

          if (candidateIsPreferred && !bestIsPreferred) {
            bestVersion = candidate;
          }
        } else if (candidate.score.total > bestVersion.score.total) {
          bestVersion = candidate;
        }
      }
    }

    unique.push(bestVersion);
    processed.add(i);
  }

  return unique.sort((a, b) => b.score.total - a.score.total);
}

/**
 * Get duplicate groups for analysis/debugging
 * Returns array of groups where each group contains duplicate articles
 */
export function getDuplicateGroups(articles: ScoredArticle[]): ScoredArticle[][] {
  const groups: ScoredArticle[][] = [];
  const processed = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (processed.has(i)) continue;

    const group: ScoredArticle[] = [articles[i]];
    processed.add(i);

    for (let j = i + 1; j < articles.length; j++) {
      if (processed.has(j)) continue;

      if (areDuplicates(articles[i], articles[j])) {
        group.push(articles[j]);
        processed.add(j);
      }
    }

    if (group.length > 1) {
      // Only include groups with actual duplicates
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Get deduplication statistics
 */
export function getDeduplicationStats(
  original: ScoredArticle[],
  deduplicated: ScoredArticle[]
): {
  originalCount: number;
  deduplicatedCount: number;
  removedCount: number;
  removalRate: number;
} {
  const originalCount = original.length;
  const deduplicatedCount = deduplicated.length;
  const removedCount = originalCount - deduplicatedCount;
  const removalRate = originalCount > 0 ? (removedCount / originalCount) * 100 : 0;

  return {
    originalCount,
    deduplicatedCount,
    removedCount,
    removalRate: Math.round(removalRate * 10) / 10
  };
}
