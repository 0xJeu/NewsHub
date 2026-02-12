/**
 * Article Scoring Algorithm
 *
 * Implements a 5-factor scoring system to rank articles by quality and interest.
 * Total score is 0-100 weighted from:
 * - Source Authority: 30%
 * - Recency: 25%
 * - Image Quality: 15%
 * - Title Quality: 20%
 * - Description Quality: 10%
 */

import { SourceConfig } from '@/lib/config/sources';

export interface ArticleScore {
  total: number;
  breakdown: {
    sourceAuthority: number;  // 0-100
    recency: number;          // 0-100
    imageQuality: number;     // 0-50
    titleQuality: number;     // 0-50
    descriptionQuality: number; // 0-30
  };
}

export interface RawArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: {
    id?: string;
    name?: string;
  };
  content?: string;
}

/**
 * Calculate overall article score
 */
export function scoreArticle(article: RawArticle, sourceConfig?: SourceConfig): ArticleScore {
  const sourceAuthority = calculateSourceAuthority(sourceConfig);
  const recency = calculateRecencyScore(article.publishedAt);
  const imageQuality = calculateImageQuality(article.urlToImage);
  const titleQuality = calculateTitleQuality(article.title);
  const descriptionQuality = calculateDescriptionQuality(article.description);

  // Weighted total (out of 100)
  const total =
    (sourceAuthority * 0.30) +
    (recency * 0.25) +
    (imageQuality * 0.15) +
    (titleQuality * 0.20) +
    (descriptionQuality * 0.10);

  return {
    total: Math.round(total * 10) / 10, // Round to 1 decimal
    breakdown: {
      sourceAuthority,
      recency,
      imageQuality,
      titleQuality,
      descriptionQuality
    }
  };
}

/**
 * Calculate source authority score (0-100)
 * Based on tier: Tier 1 = 100, Tier 2 = 80, Tier 3 = 60, Unknown = 40
 */
function calculateSourceAuthority(sourceConfig?: SourceConfig): number {
  if (!sourceConfig) return 40; // Unknown source gets baseline score
  return sourceConfig.authorityScore;
}

/**
 * Calculate recency score (0-100)
 * Time decay: Recent articles score higher
 * - Last 6 hours: 100
 * - Last 24 hours: 90
 * - Last 3 days: 70
 * - Last 7 days: 50
 * - Last 14 days: 30
 * - Older: 10
 */
function calculateRecencyScore(publishedAt: string): number {
  const now = new Date();
  const published = new Date(publishedAt);
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 6) return 100;
  if (hoursAgo < 24) return 90;
  if (hoursAgo < 72) return 70;    // 3 days
  if (hoursAgo < 168) return 50;   // 7 days
  if (hoursAgo < 336) return 30;   // 14 days
  return 10;
}

/**
 * Calculate image quality score (0-50)
 * - Has valid HTTPS image: 40
 * - Has HTTP image: 30
 * - No image: 0
 * Additional bonus for good domains
 */
function calculateImageQuality(urlToImage?: string): number {
  if (!urlToImage) return 0;

  let score = 0;

  // Check if HTTPS
  if (urlToImage.startsWith('https://')) {
    score = 40;
  } else if (urlToImage.startsWith('http://')) {
    score = 30;
  } else {
    return 0; // Invalid URL
  }

  // Bonus for known good image domains
  const goodImageDomains = [
    'cloudinary.com',
    'amazonaws.com',
    'cdn',
    'img',
    'images'
  ];

  if (goodImageDomains.some(domain => urlToImage.includes(domain))) {
    score += 10;
  }

  return Math.min(score, 50); // Cap at 50
}

/**
 * Calculate title quality score (0-50)
 * Factors:
 * - Ideal length (50-100 chars): +20
 * - Has interesting keywords: +10
 * - Clickbait patterns: -20
 * - Too short or too long: penalty
 */
function calculateTitleQuality(title: string): number {
  if (!title) return 0;

  let score = 20; // Base score

  const length = title.length;

  // Length scoring
  if (length >= 50 && length <= 100) {
    score += 20; // Ideal length
  } else if (length >= 30 && length < 50) {
    score += 15; // Acceptable
  } else if (length > 100 && length <= 150) {
    score += 10; // A bit long
  } else if (length < 30) {
    score += 5; // Too short
  } else {
    score += 0; // Too long
  }

  const titleLower = title.toLowerCase();

  // Interesting keywords (+10)
  const interestingKeywords = [
    'announces',
    'launches',
    'unveils',
    'reveals',
    'breakthrough',
    'discovery',
    'first',
    'new',
    'major',
    'historic',
    'unprecedented',
    'breaking'
  ];

  if (interestingKeywords.some(keyword => titleLower.includes(keyword))) {
    score += 10;
  }

  // Clickbait patterns (-20)
  const clickbaitPatterns = [
    "won't believe",
    "will shock you",
    "shocking",
    "you need to",
    "this is why",
    "the reason why",
    "what happens next",
    "number",
    "amazing",
    "incredible",
    "mind-blowing",
    "jaw-dropping"
  ];

  if (clickbaitPatterns.some(pattern => titleLower.includes(pattern))) {
    score -= 20;
  }

  // All caps penalty
  if (title === title.toUpperCase() && title.length > 10) {
    score -= 10;
  }

  return Math.max(0, Math.min(score, 50)); // Clamp between 0-50
}

/**
 * Calculate description quality score (0-30)
 * - Good length (100-300 chars): 30
 * - Acceptable length (50-100 chars): 20
 * - Short (20-50 chars): 10
 * - Too short or missing: 0
 */
function calculateDescriptionQuality(description?: string): number {
  if (!description) return 0;

  const length = description.length;

  if (length >= 100 && length <= 300) return 30; // Ideal
  if (length >= 50 && length < 100) return 20;   // Acceptable
  if (length >= 20 && length < 50) return 10;    // Short
  if (length > 300) return 20;                    // Too long, but better than nothing

  return 0; // Too short
}

/**
 * Determine if an article should be featured/highlighted
 * Based on total score threshold
 */
export function shouldFeatureArticle(score: ArticleScore): boolean {
  return score.total >= 80;
}

/**
 * Determine if an article should show "trending" badge
 */
export function isTrendingArticle(score: ArticleScore): boolean {
  // Trending = high score + high recency
  return score.total >= 75 && score.breakdown.recency >= 70;
}

/**
 * Get score tier for UI display
 */
export function getScoreTier(score: number): 'premium' | 'good' | 'standard' | 'low' {
  if (score >= 80) return 'premium';
  if (score >= 65) return 'good';
  if (score >= 50) return 'standard';
  return 'low';
}
