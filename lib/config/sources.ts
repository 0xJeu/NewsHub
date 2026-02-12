/**
 * Tiered Source Whitelist Configuration
 *
 * Defines authoritative news sources across all categories with quality tiers.
 * Higher tier sources receive better authority scores in article ranking.
 */

export interface SourceConfig {
  domain: string;
  tier: 1 | 2 | 3;
  authorityScore: number;
  categories: string[];  // Which categories this source is good for
  name: string;  // Display name
}

export const QUALITY_SOURCES: SourceConfig[] = [
  // ==================== TIER 1 - Premium Sources (Authority: 100) ====================

  // Tech - Premium
  { domain: 'techcrunch.com', tier: 1, authorityScore: 100, categories: ['Technology', 'Business'], name: 'TechCrunch' },
  { domain: 'theverge.com', tier: 1, authorityScore: 100, categories: ['Technology', 'Science'], name: 'The Verge' },
  { domain: 'arstechnica.com', tier: 1, authorityScore: 100, categories: ['Technology', 'Science'], name: 'Ars Technica' },
  { domain: 'wired.com', tier: 1, authorityScore: 100, categories: ['Technology', 'Science'], name: 'Wired' },
  { domain: 'engadget.com', tier: 1, authorityScore: 100, categories: ['Technology'], name: 'Engadget' },

  // News - Premium
  { domain: 'reuters.com', tier: 1, authorityScore: 100, categories: ['Politics', 'Business', 'General'], name: 'Reuters' },
  { domain: 'apnews.com', tier: 1, authorityScore: 100, categories: ['Politics', 'General'], name: 'Associated Press' },
  { domain: 'bloomberg.com', tier: 1, authorityScore: 100, categories: ['Business', 'Politics'], name: 'Bloomberg' },

  // Science - Premium
  { domain: 'nature.com', tier: 1, authorityScore: 100, categories: ['Science', 'Health'], name: 'Nature' },
  { domain: 'scientificamerican.com', tier: 1, authorityScore: 100, categories: ['Science', 'Health'], name: 'Scientific American' },
  { domain: 'newscientist.com', tier: 1, authorityScore: 100, categories: ['Science', 'Technology'], name: 'New Scientist' },

  // ==================== TIER 2 - Established Publications (Authority: 80) ====================

  // Tech - Established
  { domain: 'cnet.com', tier: 2, authorityScore: 80, categories: ['Technology'], name: 'CNET' },
  { domain: 'zdnet.com', tier: 2, authorityScore: 80, categories: ['Technology', 'Business'], name: 'ZDNet' },
  { domain: 'techradar.com', tier: 2, authorityScore: 80, categories: ['Technology'], name: 'TechRadar' },
  { domain: 'venturebeat.com', tier: 2, authorityScore: 80, categories: ['Technology', 'Business'], name: 'VentureBeat' },
  { domain: 'mashable.com', tier: 2, authorityScore: 80, categories: ['Technology', 'Entertainment'], name: 'Mashable' },

  // News - Established
  { domain: 'theguardian.com', tier: 2, authorityScore: 80, categories: ['Politics', 'General', 'Science'], name: 'The Guardian' },
  { domain: 'bbc.com', tier: 2, authorityScore: 80, categories: ['Politics', 'General', 'Science'], name: 'BBC' },
  { domain: 'bbc.co.uk', tier: 2, authorityScore: 80, categories: ['Politics', 'General', 'Science'], name: 'BBC' },
  { domain: 'washingtonpost.com', tier: 2, authorityScore: 80, categories: ['Politics', 'General'], name: 'Washington Post' },
  { domain: 'nytimes.com', tier: 2, authorityScore: 80, categories: ['Politics', 'General', 'Business'], name: 'New York Times' },

  // Business - Established
  { domain: 'wsj.com', tier: 2, authorityScore: 80, categories: ['Business', 'Politics'], name: 'Wall Street Journal' },
  { domain: 'ft.com', tier: 2, authorityScore: 80, categories: ['Business', 'Politics'], name: 'Financial Times' },
  { domain: 'cnbc.com', tier: 2, authorityScore: 80, categories: ['Business', 'Technology'], name: 'CNBC' },
  { domain: 'forbes.com', tier: 2, authorityScore: 80, categories: ['Business', 'Technology'], name: 'Forbes' },

  // Science/Health - Established
  { domain: 'science.org', tier: 2, authorityScore: 80, categories: ['Science'], name: 'Science Magazine' },
  { domain: 'smithsonianmag.com', tier: 2, authorityScore: 80, categories: ['Science', 'General'], name: 'Smithsonian Magazine' },
  { domain: 'nationalgeographic.com', tier: 2, authorityScore: 80, categories: ['Science', 'Health'], name: 'National Geographic' },

  // ==================== TIER 3 - Mainstream Sources (Authority: 60) ====================

  // General News
  { domain: 'usatoday.com', tier: 3, authorityScore: 60, categories: ['General', 'Politics'], name: 'USA Today' },
  { domain: 'cnn.com', tier: 3, authorityScore: 60, categories: ['General', 'Politics'], name: 'CNN' },
  { domain: 'abcnews.go.com', tier: 3, authorityScore: 60, categories: ['General', 'Politics'], name: 'ABC News' },
  { domain: 'nbcnews.com', tier: 3, authorityScore: 60, categories: ['General', 'Politics'], name: 'NBC News' },
  { domain: 'cbsnews.com', tier: 3, authorityScore: 60, categories: ['General', 'Politics'], name: 'CBS News' },

  // Politics - Specialized
  { domain: 'politico.com', tier: 3, authorityScore: 60, categories: ['Politics'], name: 'Politico' },
  { domain: 'thehill.com', tier: 3, authorityScore: 60, categories: ['Politics'], name: 'The Hill' },

  // Sports
  { domain: 'espn.com', tier: 3, authorityScore: 60, categories: ['Sports'], name: 'ESPN' },
  { domain: 'si.com', tier: 3, authorityScore: 60, categories: ['Sports'], name: 'Sports Illustrated' },
  { domain: 'bleacherreport.com', tier: 3, authorityScore: 60, categories: ['Sports'], name: 'Bleacher Report' },

  // Entertainment
  { domain: 'variety.com', tier: 3, authorityScore: 60, categories: ['Entertainment'], name: 'Variety' },
  { domain: 'hollywoodreporter.com', tier: 3, authorityScore: 60, categories: ['Entertainment'], name: 'Hollywood Reporter' },
  { domain: 'billboard.com', tier: 3, authorityScore: 60, categories: ['Entertainment'], name: 'Billboard' },
  { domain: 'rollingstone.com', tier: 3, authorityScore: 60, categories: ['Entertainment'], name: 'Rolling Stone' },

  // Health
  { domain: 'healthline.com', tier: 3, authorityScore: 60, categories: ['Health'], name: 'Healthline' },
  { domain: 'webmd.com', tier: 3, authorityScore: 60, categories: ['Health'], name: 'WebMD' },
  { domain: 'medicalnewstoday.com', tier: 3, authorityScore: 60, categories: ['Health', 'Science'], name: 'Medical News Today' },
];

/**
 * Get all domains as comma-separated string for NewsAPI
 */
export function getAllDomains(): string {
  return QUALITY_SOURCES.map(s => s.domain).join(',');
}

/**
 * Get domains for specific categories
 */
export function getDomainsByCategories(categories: string[]): string {
  const filtered = QUALITY_SOURCES.filter(source =>
    source.categories.some(cat => categories.includes(cat))
  );
  return filtered.map(s => s.domain).join(',');
}

/**
 * Find source config by domain or source name
 */
export function findSourceConfig(sourceIdentifier?: string): SourceConfig | undefined {
  if (!sourceIdentifier) return undefined;

  const normalized = sourceIdentifier.toLowerCase();

  return QUALITY_SOURCES.find(source =>
    source.domain.toLowerCase().includes(normalized) ||
    source.name.toLowerCase().includes(normalized) ||
    normalized.includes(source.domain.toLowerCase())
  );
}

/**
 * Get sources by tier
 */
export function getSourcesByTier(tier: 1 | 2 | 3): SourceConfig[] {
  return QUALITY_SOURCES.filter(s => s.tier === tier);
}
